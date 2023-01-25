export * from "./types";
export * from "./worker";

import { executeMainThread } from "./executeMainThread";

if (require.main === module) {
    executeMainThread()
        .catch(error => {
            console.error(error)
        });
}

export { executeMainThread };
