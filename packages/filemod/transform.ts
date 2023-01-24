import { PathLike } from "node:fs";

export type Command = {
    kind: 'delete',
    path: PathLike,
} | {
    kind: 'move',
    fromPath: string,
    toPath: string,
}

export type API = Readonly<{
    getFilePaths: (patterns: ReadonlyArray<string>) => Promise<ReadonlyArray<string>>,
}>;

export type Transform = (rootDirectoryPath: string, api: API) => Promise<ReadonlyArray<Command>>;

