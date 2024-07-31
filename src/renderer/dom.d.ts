import { IGlobalKey } from "node-global-key-listener";
import { EventName } from "../shared/constants";

interface CustomEventMap {
    [EventName.KEY_PRESS]: CustomEvent<
        { key?: IGlobalKey; state: "DOWN" | "UP"; }
    >;
}

declare global {
    interface EventTarget {
        addEventListener<K extends keyof CustomEventMap>(
            type: K,
            listener: (this: Document, ev: CustomEventMap[K]) => void
        ): void;
        dispatchEvent<K extends keyof CustomEventMap>(
            ev: CustomEventMap[K]
        ): void;
    }
}
