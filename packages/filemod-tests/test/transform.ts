import type { API, Command, Transform } from "@intuita/filemod/transform";
import { basename, extname, join } from "node:path";

const regexp = /\/pages\/([\w.\/\[\]-]+)$/;

export default async function transform(
    rootDirectoryPath: string,
    api: API,
): Promise<ReadonlyArray<Command>> {
    rootDirectoryPath;

    const patterns = [
        "**/pages/**/*.js",
        "**/pages/**/*.jsx",
        "**/pages/**/*.ts",
        "**/pages/**/*.tsx",
        "!**/node_modules",
    ];

    const filePaths = await api.getFilePaths(patterns);

    const commands: Command[] = [];

    for (const filePath of filePaths) {
        

        const regExpMatchArray = filePath.match(regexp);

        if (!regExpMatchArray || !regExpMatchArray[1]) {
            continue;
        }

        const base = basename(filePath);
        const ext = extname(filePath);

        const baseWithNoExt = base.slice(0, base.length - ext.length);

        if (baseWithNoExt === '_app' || baseWithNoExt === '_document' || baseWithNoExt === '_error') {
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
                regExpMatchArray[1].slice(0, regExpMatchArray[1].length - ext.length),
                `page${ext}`,
            ),
        })
    }

    return commands;
}

transform satisfies Transform;
