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

			// TODO this is the first run of this concept
			// map rules into a command list and then execute over a command list

			declarativeFilemod.replaceRules?.forEach((replaceRule) => {
				if ('replaceDir' in replaceRule) {
					replaceRule.replaceDir;

					dirs = dirs.map((dirName) => {
						if (dirName !== replaceRule.replaceDir[0]) {
							return dirName;
						}

						return replaceRule.replaceDir[1];
					});
				}

				if ('appendDir' in replaceRule) {
					const [dirName, condition] = replaceRule.appendDir;

					if (
						'fileRootNot' in condition &&
						fileRoot !== condition.fileRootNot
					) {
						dirs.push(dirName === '@fileRoot' ? fileRoot : dirName);
					}
				}

				if ('replaceFileRoot' in replaceRule) {
					fileRoot = replaceRule.replaceFileRoot;
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
