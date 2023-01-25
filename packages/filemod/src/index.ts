export * from "./types";

import { executeMainThread } from "./executeMainThread";

if (require.main === module) {
    executeMainThread()
        .then(() => {})
        .catch(error => {
            console.error(error)
        });
}

