import { app } from "electron";
import shouldQuit from "electron-squirrel-startup";
import { ContextMenuManager } from "./context-menu-manager";
import { SecurityManager } from "./security-manager";
import { TimerWindowManager } from "./timer-window-manager";

if (shouldQuit) {
    app.quit();
    process.exit(0);
}

const main = async () => {
    await app.whenReady();

    new SecurityManager();

    const timerWindowManager = new TimerWindowManager();

    new ContextMenuManager({
        timerWindowManager
    });

    // // await State.initialize();

    // new ContextMenuManager();

    // new KeyBindingsManager();

    // State.setInstance(new Instance());
};

main();
