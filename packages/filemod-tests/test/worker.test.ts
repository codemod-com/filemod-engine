import { buildTransform, TransformApi } from '@intuita/filemod/';
import assert from 'node:assert';
import path from 'node:path';
import { Volume } from 'memfs';
import glob from 'glob';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';
import * as S from '@fp-ts/schema';

const promisifiedGlob = promisify(glob);

describe('worker', function () {
	it('s', () => {
		const parsedPath = path.parse('/opt/project/pages/[slug]/about.tsx');

		console.log(parsedPath);

		const dirs = parsedPath.dir.split(path.sep);

		console.log(dirs);
	});

	it('should report correct paths', async function () {
		const rootDirectoryPath = '/opt/project/';

		const fs = Volume.fromJSON({
			'/opt/project/pages/index.js': '',
			'/opt/project/pages/_app.tsx': 'aaa',
			'/opt/project/pages/_document.jsx': '',
			'/opt/project/pages/_error.tsx': '',
			'/opt/project/pages/[slug]/about.tsx': '',
			'/opt/project/pages/api/index.ts': '',
			'/opt/project/node_modules/lib/pages/a/index.ts': '',
		});

		const filePaths = await promisifiedGlob(
			'**/pages/**/*.{js,jsx,ts,tsx}',
			{
				absolute: true,
				cwd: rootDirectoryPath,
				ignore: ['**/node_modules/**', '**/pages/api/**'],
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				fs: fs as any,
			},
		);

		assert.deepEqual(filePaths, [
			'/opt/project/pages/_app.tsx',
			'/opt/project/pages/_document.jsx',
			'/opt/project/pages/_error.tsx',
			'/opt/project/pages/[slug]/about.tsx',
			'/opt/project/pages/index.js',
		]);
	});

	it('should produce correct commands', async function () {
		const filePath = path.join(__dirname, './transform.ts');

		const transform = buildTransform(filePath);

		if (!transform) {
			throw new Error('no transform function');
		}

		assert.notStrictEqual(transform, null);

		const rootDirectoryPath = '/opt/project/';

		const api: TransformApi = {
			async getFilePaths() {
				return [
					'/opt/project/pages/index.tsx',
					'/opt/project/pages/_app.tsx',
					'/opt/project/pages/_document.tsx',
					'/opt/project/pages/_error.tsx',
					'/opt/project/pages/[slug]/about.tsx',
				];
			},
		};

		const commands = await transform(rootDirectoryPath, api);

		assert.deepEqual(commands, [
			{
				kind: 'move',
				fromPath: '/opt/project/pages/index.tsx',
				toPath: '/opt/project/app/page.tsx',
			},
			{ kind: 'delete', path: '/opt/project/pages/_app.tsx' },
			{ kind: 'delete', path: '/opt/project/pages/_document.tsx' },
			{ kind: 'delete', path: '/opt/project/pages/_error.tsx' },
			{
				fromPath: '/opt/project/pages/[slug]/about.tsx',
				kind: 'move',
				toPath: '/opt/project/app/[slug]/about/page.tsx',
			},
		]);
	});

	it.only('transform.yml', async function () {
		const str = readFileSync(path.join(__dirname, './transform.yml'), {
			encoding: 'utf8',
		});

		const yml = jsYaml.load(str);

		console.log(yml);

		const filemodSchema = S.struct({
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

		type Filemod = S.Infer<typeof filemodSchema>;

		const parseResult = S.decode(filemodSchema)(yml, {
			isUnexpectedAllowed: true,
		});

		console.log(parseResult);
	});
});
