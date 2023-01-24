import type { API, Command, Transform } from "@intuita/filemod/transform";

export default async function transform(
    rootDirectoryPath: string,
    api: API,
): Promise<ReadonlyArray<Command>> {
    const patterns = [
        "**/*.js",
        "**/*.jsx",
        "**/*.ts",
        "**/*.tsx",
        "!**/node_modules",
    ];

    const filePaths = await api.getFilePaths(patterns);

    console.log(rootDirectoryPath);

    for (const filePath of filePaths) {
        console.log(filePath);
    }

    return [];
}

transform satisfies Transform;
