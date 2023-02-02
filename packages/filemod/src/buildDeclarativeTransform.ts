import path from 'node:path';
import { DeclarativeFilemod } from './declarativeFilemodWorker';
import { Command, Transform } from './types';

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

	const pathPlatform = path.posix;

	return async (rootDirectoryPath, transformApi) => {
		const filePaths = await transformApi.getFilePaths(
			declarativeFilemod.includePattern,
			declarativeFilemod.excludePatterns,
		);

		const commands: Command[] = [];

		filePaths.forEach((filePath) => {
			const { root, base, dir, ext } = pathPlatform.parse(filePath);

			const fileRoot = base.slice(0, base.length - ext.length);

			const dirs = dir.split(path.sep);

			const doDelete =
				declarativeFilemod.deleteRules?.fileRoot?.some(
					(ruleFileRoot) => ruleFileRoot === fileRoot,
				) ?? false;

			if (doDelete) {
				commands.push({
					kind: 'delete',
					path: filePath,
				});

				return;
			}

            
		});

		return [];
	};
};
