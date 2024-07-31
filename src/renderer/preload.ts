import { contextBridge, ipcRenderer } from "electron";
import { Api } from "../shared/api";
import { EventName } from "../shared/constants";

const api: Api = {
    showContextMenu: (): void => {
        ipcRenderer.send(EventName.SHOW_CONTEXT_MENU);
    },
    onKeyPress: (callback): void => {
        ipcRenderer.on(EventName.KEY_PRESS, (_, detail) => {
            callback(detail);
        });
    }
};

process.once("loaded", () => {
    contextBridge.exposeInMainWorld("api", api);
});
