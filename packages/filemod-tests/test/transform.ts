import type { API, Command, Transform } from "@intuita/filemod/transform";

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

    const regexp = /\/pages\/([\w.\/\[\]-]+)$/;

    for (const filePath of filePaths) {
        console.log(filePath);

        const regExpMatchArray = filePath.match(regexp);

        if (!regExpMatchArray) {
            continue;
        }

        if(regExpMatchArray[1]) {

            console.log(regExpMatchArray[1]);
        }
    }

    return [];
}

transform satisfies Transform;
