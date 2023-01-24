import { PathLike } from "node:fs";

export type Command = {
    kind: 'delete',
    path: PathLike,
} | {
    kind: 'move',
    fromPath: PathLike,
    toPath: PathLike,
} | {
    kind: 'create',
    path: PathLike,
}

export type API = Readonly<{
    getFilePaths: (patterns: ReadonlyArray<string>) => Promise<ReadonlyArray<string>>,
}>;

export type Transform = (rootDirectoryPath: string, api: API) => Promise<ReadonlyArray<Command>>;

