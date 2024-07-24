import { GlobalState } from "./global-state";

export class Logger {
    static info(message: string) {
        if (GlobalState.debug) {
            console.log(message);
        }
    }
}
