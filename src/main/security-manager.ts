import { session } from "electron";

export class SecurityManager {
    constructor() {
        this.applyHeaders();
    }

    private applyHeaders(): void {
        session.defaultSession.webRequest.onHeadersReceived(
            (details, callback) => {
                callback({
                    responseHeaders: {
                        ...details.responseHeaders,
                        "Content-Security-Policy": ["default-src 'self'"]
                    }
                });
            }
        );
    }
}
