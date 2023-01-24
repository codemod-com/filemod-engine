import type { API, Command, Transform } from "@intuita/filemod/transform";

export default async function transform(
    rootDirectoryPath: string,
    api: API,
): Promise<ReadonlyArray<Command>> {
    return [];
}

transform satisfies Transform;
