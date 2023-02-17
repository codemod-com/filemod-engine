import path from 'node:path';
import { DeclarativeFilemod, DeclarativeRule } from './buildDeclarativeFilemod';
import { Command, Transform } from './types';

type DeleteRule = {
	kind: 'fileRootEqual';
	value: string;
};

type Rule =
	| {
			kind: 'replaceDirName';
			fromValue: string;
			toValue: string;
	  }
	| {
			kind: 'appendDirName';
			condition: {
				kind: 'fileRootNotEqual';
				value: string;
			};
			replacement:
				| {
						kind: 'value';
						value: string;
				  }
				| {
						kind: '@fileRoot';
				  };
	  }
	| {
			kind: 'replaceFileRoot';
			value: string;
	  };

export const buildDeclarativeTransform = (
	declarativeFilemod: DeclarativeFilemod,
): Transform => {
	if (declarativeFilemod.version !== 1) {
		throw new Error(
			'This filemod engine supports only version 1 of filemods',
		);
	}

	if (!declarativeFilemod.posix) {
		throw new Error(
			'This filemod engine supports only POSIX-compatible operating systems',
		);
	}

	const deleteRules: DeleteRule[] = [];

	if (declarativeFilemod.deleteRules) {
		if ('fileRoot' in declarativeFilemod.deleteRules) {
			declarativeFilemod.deleteRules.fileRoot?.forEach(
				(fileRootValue) => {
					deleteRules.push({
						kind: 'fileRootEqual',
						value: fileRootValue,
					});
				},
			);
		}
	}

	const handleDeclarativeRule = (
		rule: DeclarativeRule,
	): ReadonlyArray<Rule> => {
		const rules: Rule[] = [];

		if ('replaceDirectoryName' in rule) {
			rules.push({
				kind: 'replaceDirName',
				fromValue: rule.replaceDirectoryName[0],
				toValue: rule.replaceDirectoryName[1],
			});
		}

		if ('appendDirectoryName' in rule) {
			const [dirName, condition] = rule.appendDirectoryName;

			if (condition.fileRootNot) {
				rules.push({
					kind: 'appendDirName',
					condition: {
						kind: 'fileRootNotEqual',
						value: condition.fileRootNot,
					},
					replacement:
						dirName === '@fileRoot'
							? {
									kind: '@fileRoot',
							  }
							: {
									kind: 'value',
									value: dirName,
							  },
				});
			}
		}

		if ('replaceFileRoot' in rule) {
			rules.push({
				kind: 'replaceFileRoot',
				value: rule.replaceFileRoot,
			});
		}

		return rules;
	};

	const replaceRules: Rule[] =
		declarativeFilemod.replaceRules?.flatMap((replaceRule) =>
			handleDeclarativeRule(replaceRule),
		) ?? [];

	const pathPlatform = path.posix;

	return async (_, transformApi) => {
		const filePaths = await transformApi.getFilePaths(
			declarativeFilemod.includePattern,
			declarativeFilemod.excludePatterns,
		);

		const commands: Command[] = [];

		filePaths.forEach((filePath) => {
			const { root, base, dir, ext } = pathPlatform.parse(filePath);

			let fileRoot = base.slice(0, base.length - ext.length);

			const doDelete = deleteRules.some((deleteRule) => {
				if (deleteRule.kind === 'fileRootEqual') {
					return deleteRule.value === fileRoot;
				}

				return false;
			});

			if (doDelete) {
				commands.push({
					kind: 'delete',
					path: filePath,
				});

				return;
			}

			let dirs = dir.split(path.sep);

			replaceRules.forEach((replaceRule) => {
				if (replaceRule.kind === 'replaceDirName') {
					dirs = dirs.map((dirName) => {
						if (dirName !== replaceRule.fromValue) {
							return dirName;
						}

						return replaceRule.toValue;
					});
				}

				if (replaceRule.kind === 'appendDirName') {
					if (
						replaceRule.condition.kind === 'fileRootNotEqual' &&
						replaceRule.condition.value !== fileRoot
					) {
						if (replaceRule.replacement.kind === '@fileRoot') {
							dirs.push(fileRoot);
						}

						if (replaceRule.replacement.kind === 'value') {
							dirs.push(replaceRule.replacement.value);
						}
					}
				}

				if (replaceRule.kind === 'replaceFileRoot') {
					fileRoot = replaceRule.value;
				}
			});

			commands.push({
				kind: 'move',
				fromPath: filePath,
				toPath: path.join(root, ...dirs, `${fileRoot}${ext}`),
			});
		});

		return commands;
	};
};
