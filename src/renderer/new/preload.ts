import { contextBridge, ipcRenderer } from "electron";
import { EventName } from "../../shared/new/constants";

process.once("loaded", () => {
    contextBridge.exposeInMainWorld("api", PreloadApi);
});

export class PreloadApi {
    public static showContextMenu() {
        ipcRenderer.send(EventName.SHOW_CONTEXT_MENU);
    }
}
