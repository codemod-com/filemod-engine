import type { TransformApi, Command, Transform } from '@intuita/filemod';
import { basename, dirname, extname, join } from 'node:path';

const regexp = /\/pages\/([\w./[\]-]+)$/;

export default async function transform(
	rootDirectoryPath: string,
	api: TransformApi,
): Promise<ReadonlyArray<Command>> {
	const patterns = [
		'**/pages/**/*.js',
		'**/pages/**/*.jsx',
		'**/pages/**/*.ts',
		'**/pages/**/*.tsx',
		'!**/node_modules',
	];

	const filePaths = await api.getFilePaths(patterns);

	const commands: Command[] = [];

	for (const filePath of filePaths) {
		const regExpMatchArray = filePath.match(regexp);

		if (!regExpMatchArray || !regExpMatchArray[1]) {
			continue;
		}

		const match = regExpMatchArray[1];

		const dir = dirname(match);

		if (dir.startsWith('api')) {
			continue;
		}

		const base = basename(match);
		const ext = extname(match);

		const baseWithNoExt = base.slice(0, base.length - ext.length);

		if (
			baseWithNoExt === '_app' ||
			baseWithNoExt === '_document' ||
			baseWithNoExt === '_error'
		) {
			commands.push({
				kind: 'delete',
				path: filePath,
			});

			continue;
		}

		commands.push({
			kind: 'move',
			fromPath: filePath,
			toPath: join(
				rootDirectoryPath,
				'app',
				dir,
				baseWithNoExt,
				`page${ext}`,
			),
		});
	}

	return commands;
}

transform satisfies Transform;
