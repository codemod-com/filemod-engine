import { mkdir, unlink, writeFile } from 'fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { register } from 'ts-node';
import { TransformApi, Command, CommandApi, Transform } from './types';
import { pipeline } from 'node:stream';
import fastGlob from 'fast-glob';
import { dirname } from 'path';

export const buildRegisterTsNodeOnce = () => {
	let registered = false;

	return () => {
		if (registered) {
			return;
		}

		register({
			transpileOnly: true,
			typeCheck: false,
		});

		registered = true;
	};
};

export const registerTsNode = buildRegisterTsNodeOnce();

export const buildTransform = (filePath: string): Transform | null => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const result = require(filePath);

	if (
		!result ||
		!('default' in result) ||
		typeof result.default !== 'function' ||
		!('length' in result.default) ||
		result.default.length < 2
	) {
		return null;
	}

	return result.default;
};

export const buildTransformApi = (rootDirectoryPath: string): TransformApi => {
	const getFilePaths = (patterns: ReadonlyArray<string>) =>
		fastGlob(patterns.slice(), {
			absolute: true,
			cwd: rootDirectoryPath,
		});

	return {
		getFilePaths,
	};
};

export const buildCommandApi = (): CommandApi => {
	return {
		unlink: (path) => unlink(path),
		dirname: (path) => dirname(path),
		mkdir: async (path) => { await mkdir(path, { recursive: true }) },
		createReadStream: (path) => createReadStream(path),
		createWriteStream: (path) => createWriteStream(path, { flags: 'w+' }),
		writeFile: (path, data) => writeFile(path, data),
	}
}

export const executeCommand = async (command: Command, api: CommandApi): Promise<void> => {
	switch (command.kind) {
		case 'delete': {
			await api.unlink(command.path);
			return;
		}

		case 'move': {
			const dir = api.dirname(command.toPath);

			await api.mkdir(dir);

			await new Promise<void>((resolve, reject) => {
				pipeline(
					api.createReadStream(command.fromPath),
					api.createWriteStream(command.toPath),
					(err) => {
						if (err) {
							reject(err);
							return;
						}

						resolve();
					},
				);
			});

			await api.unlink(command.fromPath);

			return;
		}

		case 'create': {
			await api.writeFile(command.path, '');
			return;
		}
	}
};
