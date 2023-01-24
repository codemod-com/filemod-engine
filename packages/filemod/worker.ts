import { unlink, writeFile } from 'fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { register } from 'ts-node';
import { API, Command, Transform } from './transform';
import { pipeline } from 'node:stream';
import fastGlob from 'fast-glob';

register({
    transpileOnly: true,
    typeCheck: false,
});

export const buildTransform = (filePath: string): Transform | null => {
    const result = require(filePath);

    if (!result ||
        !('default' in result) ||
        typeof result.default !== 'function' ||
        !('length' in result.default) ||
        result.default.length < 2
    ) {
        return null;
    }

    return result.default;
}

export const buildApi = (rootDirectoryPath: string): API => {
    const getFilePaths = (patterns: ReadonlyArray<string>) =>
        fastGlob(
            patterns.slice(),
            {
                absolute: true,
                cwd: rootDirectoryPath,
            },
        );

    return {
        getFilePaths,
    }
}

export const executeTransform = async (
    transform: Transform,
    rootDirectoryPath: string,
    api: API,
): ReturnType<Transform> => {
    return transform(rootDirectoryPath, api);
}

export const executeCommand = async (command: Command): Promise<void> => {
    switch (command.kind) {
        case 'delete': {
            await unlink(command.path);
            return;
        }

        case 'move': {
            await new Promise<void>((resolve, reject) => {
                pipeline(
                    createReadStream(command.fromPath),
                    createWriteStream(command.toPath),
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    }
                );
            });

            await unlink(command.fromPath);

            return;
        }

        case 'create': {
            await writeFile(command.path, '');
            return;
        }
    }
}
