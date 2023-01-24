import { buildApi, buildTransform, executeTransform } from "@intuita/filemod/worker";
import assert from "node:assert";
import path from "node:path";

describe('worker', function () {
    it('a', async function() {
        const filePath = path.join(__dirname, './transform.ts');

        const transform = buildTransform(filePath);

        assert.notStrictEqual(transform, null);

        const rootDirectoryPath = '/gppd/intuita/terraform-website';

        const api = buildApi(rootDirectoryPath);

        const commands = await executeTransform(transform!, rootDirectoryPath, api);

        console.log(commands);
    });
});
