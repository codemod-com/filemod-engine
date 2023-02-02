// the worker for declarative filemods
import * as S from '@fp-ts/schema';
import { readFile } from 'node:fs';
import { promisify } from 'node:util';
import jsYaml from 'js-yaml';

const promisifiedReadFile = promisify(readFile);

const declarativeFilemodSchema = S.struct({
	version: S.number,
	posix: S.boolean,
	includePattern: S.string,
	excludePatterns: S.array(S.string),
	deleteRules: S.optional(
		S.struct({
			fileRoot: S.optional(S.array(S.string)),
		}),
	),
	replaceRules: S.optional(
		S.array(
			S.union(
				S.struct({
					replaceDir: S.array(S.string),
				}),
				S.struct({
					appendDir: S.tuple(
						S.string,
						S.struct({
							fileRootNot: S.optional(S.string),
						}),
					),
				}),
				S.struct({
					replaceFileRoot: S.string,
				}),
			),
		),
	),
});

export type DeclarativeFilemod = S.Infer<typeof declarativeFilemodSchema>;

export const buildDeclarativeFilemod = async (
	path: string,
): Promise<DeclarativeFilemod> => {
	const str = await promisifiedReadFile(path, { encoding: 'utf8' });

	const yml = jsYaml.load(str, { filename: path });

	return S.decodeOrThrow(declarativeFilemodSchema)(yml, {
		isUnexpectedAllowed: true,
	});
};
