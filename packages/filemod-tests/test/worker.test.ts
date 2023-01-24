import { executeTsFile } from "@intuita/filemod/worker";
import path from "node:path";

describe('worker', function () {
    it('a', function() {
        const filePath = path.join(__dirname, './transform.ts');

        executeTsFile(filePath);
    });
});
