import path from 'node:path';
import { DeclarativeFilemod } from './declarativeFilemodWorker';
import { Command, Transform } from './types';

type DeleteRule = {
	kind: 'fileRootEqual';
	value: string;
};

type ReplaceRule =
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

	const replaceRules: ReplaceRule[] = [];

	declarativeFilemod.replaceRules?.forEach((replaceRule) => {
		if ('replaceDir' in replaceRule) {
			replaceRule.replaceDir;

			replaceRules.push({
				kind: 'replaceDirName',
				fromValue: replaceRule.replaceDir[0],
				toValue: replaceRule.replaceDir[1],
			});
		}

		if ('appendDir' in replaceRule) {
			const [dirName, condition] = replaceRule.appendDir;

			if (condition.fileRootNot) {
				replaceRules.push({
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

		if ('replaceFileRoot' in replaceRule) {
			replaceRules.push({
				kind: 'replaceFileRoot',
				value: replaceRule.replaceFileRoot,
			});
		}
	});

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
