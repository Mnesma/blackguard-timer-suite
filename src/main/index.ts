import { app } from "electron";
import shouldQuit from "electron-squirrel-startup";

if (shouldQuit) {
    app.quit();
    process.exit(0);
}

import { ContextMenuManager } from "./context-menu-manager";
import { Instance } from "./instance";
import { KeyBindingsManager } from "./key-bindings-manager";
import { State } from "./state";
import "./timer";

const main = async () => {
    await app.whenReady();

    // // await State.initialize();

    // new ContextMenuManager();

    // new KeyBindingsManager();

    // State.setInstance(new Instance());
};

main();
