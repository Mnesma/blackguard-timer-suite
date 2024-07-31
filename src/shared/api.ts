import { IGlobalKeyEvent } from "node-global-key-listener";

type KeyPressEvent = {
    key: IGlobalKeyEvent["name"];
    state: IGlobalKeyEvent["state"];
};

export type Api = {
    showContextMenu: () => void;
    onKeyPress: (callback: (event: KeyPressEvent) => void) => void;
};
