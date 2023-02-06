import {
	buildDeclarativeFilemod,
	buildDeclarativeTransform,
	buildFilePathTransformApi,
	TransformApi,
} from '@intuita-inc/filemod-engine/';
import assert from 'node:assert';
import path from 'node:path';

describe('declarativeFilemodWorker', function () {
	it('should build a DeclarativeFilemod', async function () {
		const declarativeCodemod = await buildDeclarativeFilemod({
			filePath: path.join(__dirname, './transform.yml'),
		});

		assert.deepEqual(declarativeCodemod, {
			version: 1,
			posix: true,
			includePattern: '**/pages/**/*.{js,jsx,ts,tsx}',
			excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
			deleteRules: {
				fileRoot: ['_app', '_document', '_error'],
			},
			replaceRules: [
				{
					replaceDirectoryName: ['pages', 'app'],
				},
				{
					appendDirectoryName: [
						'@fileRoot',
						{
							fileRootNot: 'index',
						},
					],
				},
				{
					replaceFileRoot: 'page',
				},
			],
		});
	});

	it('should execute the declarative codemod correctly', async function () {
		const declarativeCodemod = await buildDeclarativeFilemod({
			filePath: path.join(__dirname, './transform.yml'),
		});

		const declarativeTransform =
			buildDeclarativeTransform(declarativeCodemod);

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

		const commands = await declarativeTransform(rootDirectoryPath, api);

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

	it('buildFilePathTransformApi', async function () {
		const declarativeCodemod = await buildDeclarativeFilemod({
			filePath: path.join(__dirname, './transform.yml'),
		});

		const declarativeTransform =
			buildDeclarativeTransform(declarativeCodemod);

		const rootDirectoryPath = '/opt/project/';

		const transformApi = buildFilePathTransformApi(
			rootDirectoryPath,
			'/opt/project/pages/[slug]/about.tsx',
		);

		const commands = await declarativeTransform(
			rootDirectoryPath,
			transformApi,
		);

		assert.deepEqual(commands, [
			{
				fromPath: '/opt/project/pages/[slug]/about.tsx',
				kind: 'move',
				toPath: '/opt/project/app/[slug]/about/page.tsx',
			},
		]);
	});
});
