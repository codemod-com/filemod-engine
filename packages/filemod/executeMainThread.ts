import yargs from 'yargs';
import { hideBin } from "yargs/helpers";

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
                    }
                ).positional(
                    'rootDirectoryPath',
                    {
                        type: 'string',
                        array: false,
                    }
                )
            },
            ({ transformFilePath, rootDirectoryPath }) => {

            }
        )
        .help()
        .alias('help', 'h')
        .parse();
            
}
