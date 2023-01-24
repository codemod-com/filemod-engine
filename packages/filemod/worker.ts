import { register } from 'ts-node';

// export const buildWorker = (
//     filePath: string,
//     rootDirectoryPath: string,
// ) => {
    
// }

export const executeTsFile = (filePath: string) => {
    register({
        transpileOnly: true,
        typeCheck: false,
    });

    const result = require(filePath);

    console.log(result);
}
