import yargs from 'yargs';
import { hideBin } from "yargs/helpers";
import { buildApi, buildTransform, executeCommand, executeTransform } from './worker';

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
                .option(
                    'dryRun',
                    {
                        alias: 'd',
                        describe: 'Whether to execute commands or not',
                        array: false,
                        type: 'boolean',
                        default: false,
                    },
                )
            },
            async ({ transformFilePath, rootDirectoryPath, dryRun }) => {
                const transform = buildTransform(transformFilePath);

                if (!transform) {
                    return;
                }

                const api = buildApi(rootDirectoryPath);

                const commands = await executeTransform(transform, rootDirectoryPath, api);

                if (dryRun) {
                    console.log(commands);
                    return;
                }

                for (const command of commands) {
                    await executeCommand(command);
                }
            }
        )
        .help()
        .alias('help', 'h')
        .parse();
            
}
