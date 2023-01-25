export type Command = Readonly<{
    kind: 'delete',
    path: string,
} | {
    kind: 'move',
    fromPath: string,
    toPath: string,
} | {
    kind: 'create',
    path: string,
}>;

export type API = Readonly<{
    getFilePaths: (patterns: ReadonlyArray<string>) => Promise<ReadonlyArray<string>>,
}>;

export type Transform = (rootDirectoryPath: string, api: API) => Promise<ReadonlyArray<Command>>;
