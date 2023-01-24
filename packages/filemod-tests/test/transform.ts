import type { API, Command } from "@intuita/filemod/transform";

export default async function transform(
    rootDirectoryPath: string,
    api: API,
): Promise<ReadonlyArray<Command>> {
    console.log(rootDirectoryPath, api);

    return [];
}

// transform satisfies Transform;
