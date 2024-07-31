import { app } from "electron";
import shouldQuit from "electron-squirrel-startup";
import { ContextMenuManager } from "./context-menu-manager";
import { FileManager } from "./file-manager";
import { SecurityManager } from "./security-manager";
import { TimerManager } from "./timer-manager";
import { TimerWindowManager } from "./timer-window-manager";

if (shouldQuit) {
    app.quit();
    process.exit(0);
}

const main = async () => {
    await app.whenReady();

    new SecurityManager();

    const fileManager = new FileManager();

    const timerWindowManager = new TimerWindowManager();

    new ContextMenuManager({
        timerWindowManager
    });

    const timerManager = new TimerManager({
        fileManager
    });

    await timerManager.init();

    // // await State.initialize();

    // new ContextMenuManager();

    // new KeyBindingsManager();

    // State.setInstance(new Instance());
};

main();
