import { buildDeclarativeFilemod } from '@intuita/filemod/';
import assert from 'node:assert';
import path from 'node:path';

describe('declarativeFilemodWorker', function () {
	it('should build a DeclarativeFilemod', async function () {
		const declarativeCodemod = await buildDeclarativeFilemod(
			path.join(__dirname, './transform.yml'),
		);

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
					replaceDir: ['pages', 'app'],
				},
				{
					appendDir: [
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
});
