import glob from 'glob';
import { promisify } from 'node:util';
import { TransformApi } from './types';

const promisifiedGlob = promisify(glob);

export const buildTransformApi = (
	rootDirectoryPath: string,
	fs?: typeof import('fs'),
): TransformApi => {
	const getFilePaths = (
		includePattern: string,
		excludePatterns: ReadonlyArray<string>,
	) =>
		promisifiedGlob(includePattern, {
			absolute: true,
			cwd: rootDirectoryPath,
			fs,
			ignore: excludePatterns,
		});

	return {
		getFilePaths,
	};
};
