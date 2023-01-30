import { buildTransform, TransformApi } from '@intuita/filemod/';
import assert from 'node:assert';
import path from 'node:path';

describe('worker', function () {
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
				toPath: '/opt/project/app/index/page.tsx',
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
});
