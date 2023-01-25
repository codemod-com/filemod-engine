import { executeMainThread } from "./executeMainThread";



executeMainThread()
    .then(() => {})
    .catch(error => {
        console.error(error)
    });
