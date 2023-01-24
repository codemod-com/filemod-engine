import { PathLike } from "node:fs";

export type Command = {
    kind: 'delete',
    path: PathLike,
} | {
    kind: 'move',
    fromPath: string,
    toPath: string,
}

export type API = {

}

export type Transform = (rootDirectoryPath: string, api: API) => Promise<ReadonlyArray<Command>>;

// export default async function transform(
//     rootDirectoryPath: string,
//     api: API,
// ): Promise<ReadonlyArray<Command>> {
//     return [];
// }
