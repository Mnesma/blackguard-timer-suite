import {
    ipcMain,
    IpcMainEvent,
    Menu,
    MenuItemConstructorOptions
} from "electron";
import { EventName } from "../shared/event-name";
import { State } from "./state";

export class ContextMenuManager {
    constructor() {
        ipcMain.on(EventName.SHOW_CONTEXT_MENU, this.show);
    }

    private show = ({ sender }: IpcMainEvent) => {
        const [senderInstance] = State.getInstance(sender.id);

        if (!senderInstance) {
            return;
        }

        const menuTemplate: MenuItemConstructorOptions[] = [];

        menuTemplate.push({ role: "close" });

        const menu = Menu.buildFromTemplate(menuTemplate);
        menu.popup({ window: senderInstance.window });
    };
}
