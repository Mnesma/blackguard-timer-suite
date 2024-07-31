import {
    ipcMain,
    IpcMainEvent,
    Menu,
    MenuItem,
    MenuItemConstructorOptions
} from "electron";
import { EventName } from "../shared/constants";
import { TimerWindowManager } from "./timer-window-manager";

export type ContextMenuManagerOptions = {
    timerWindowManager: TimerWindowManager;
};

export class ContextMenuManager {
    private timerWindowManager: TimerWindowManager;

    constructor({ timerWindowManager }: ContextMenuManagerOptions) {
        this.timerWindowManager = timerWindowManager;

        ipcMain.on(EventName.SHOW_CONTEXT_MENU, this.createContextMenu);
    }

    private createContextMenu = ({ sender }: IpcMainEvent) => {
        const { id } = sender;
        const timerWindow = this.timerWindowManager.get(id);

        if (!timerWindow) {
            return;
        }

        const menuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [];

        menuTemplate.push({ role: "close" });

        const menu = Menu.buildFromTemplate(menuTemplate);
        menu.popup({ window: timerWindow.browserWindow });
    };
}
