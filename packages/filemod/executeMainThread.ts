import yargs from 'yargs';
import { hideBin } from "yargs/helpers";
import { buildApi, buildTransform, executeTransform } from './worker';

export const executeMainThread = async () => {
    yargs(hideBin(process.argv))
        .command(
            'transform [transformFilePath] [rootDirectoryPath]',
            'transforms a directory using a transform file',
            (y) => {
                return y.positional(
                    'transformFilePath',
                    {
                        type: 'string',
                        array: false,
                        demandOption: true,
                    }
                ).positional(
                    'rootDirectoryPath',
                    {
                        type: 'string',
                        array: false,
                        demandOption: true,
                    }
                )
            },
            async ({ transformFilePath, rootDirectoryPath }) => {
                const transform = buildTransform(transformFilePath);

                if (!transform) {
                    return;
                }

                const api = buildApi(rootDirectoryPath);

                const commands = await executeTransform(transform, rootDirectoryPath, api);

                
            }
        )
        .help()
        .alias('help', 'h')
        .parse();
            
}
