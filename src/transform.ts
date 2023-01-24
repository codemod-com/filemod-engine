type Command = {
    kind: 'delete',
    path: string,
} | {
    kind: 'move',
    fromPath: string,
    toPath: string,
}

type API = {

}

export type Transform = (rootDirectoryPath: string, api: API) => Promise<ReadonlyArray<Command>>;

// export default async function transform(
//     rootDirectoryPath: string,
//     api: API,
// ): Promise<ReadonlyArray<Command>> {
//     return [];
// }
