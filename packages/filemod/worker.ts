import { register } from 'ts-node';
import { API, Command, Transform } from './transform';

register({
    transpileOnly: true,
    typeCheck: false,
});

export const buildTransform = (filePath: string): Transform | null => {
    const result = require(filePath);

    if (!result ||
        !('default' in result) ||
        typeof result.default !== 'function' ||
        !('length' in result.default) ||
        result.default.length < 2
    ) {
        return null;
    }

    return result.default;
}

export const executeTransform = async (
    transform: Transform,
    rootDirectoryPath: string,
    api: API,
): ReturnType<Transform> => {
    return transform(rootDirectoryPath, api);
}

export const executeCommand = (command: Command) => {
    
}
