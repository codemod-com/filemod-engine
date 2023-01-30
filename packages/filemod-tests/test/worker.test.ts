import { buildTransformApi, buildTransform } from '@intuita/filemod/';
import assert from 'node:assert';
import path from 'node:path';

describe('worker', function () {
	it('a', async function () {
		const filePath = path.join(__dirname, './transform.ts');

		const transform = buildTransform(filePath);

		if (!transform) {
			throw new Error('no transform function');
		}

		assert.notStrictEqual(transform, null);

		const rootDirectoryPath = '/gppd/intuita/terraform-website';

		const api = buildTransformApi(rootDirectoryPath);

		const commands = await transform(rootDirectoryPath, api);

		console.log(commands);
	});
});
