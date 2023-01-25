import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
	buildTransformApi,
	buildCommandApi,
	buildTransform,
	executeCommand,
	registerTsNode,
} from './worker';

export const executeMainThread = async () => {
	yargs(hideBin(process.argv))
		.command(
			'transform [transformFilePath] [rootDirectoryPath]',
			'transforms a directory using a transform file',
			(y) => {
				return y
					.positional('transformFilePath', {
						type: 'string',
						array: false,
						demandOption: true,
					})
					.positional('rootDirectoryPath', {
						type: 'string',
						array: false,
						demandOption: true,
					})
					.option('dryRun', {
						alias: 'd',
						describe: 'Whether to execute commands or not',
						array: false,
						type: 'boolean',
						default: false,
					});
			},
			async ({ transformFilePath, rootDirectoryPath, dryRun }) => {
				registerTsNode();

				const transform = buildTransform(transformFilePath);

				if (!transform) {
					return;
				}

				const api = buildTransformApi(rootDirectoryPath);

				const commands = await transform(rootDirectoryPath, api);

				if (dryRun) {
					console.log(commands);
					return;
				}

				const commandApi = buildCommandApi();

				for (const command of commands) {
					await executeCommand(command, commandApi);
				}
			},
		)
		.help()
		.alias('help', 'h')
		.parse();
};
