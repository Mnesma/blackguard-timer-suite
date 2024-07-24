import { ipcMain } from "electron";
import { EventName } from "../shared/event-name";
import { State } from "./state";

export class KeyBindingsManager {
    constructor() {
        ipcMain.on(EventName.GET_KEY_BINDINGS, async ({ sender }) => {
            const [senderInstance] = State.getInstance(sender.id);

            if (!senderInstance) {
                return {};
            }

            const keyBindings = State.getKeyBinding(senderInstance.timerType);

            if (keyBindings) {
                return keyBindings;
            }

            return {};
        });

        ipcMain.on(
            EventName.SAVE_KEY_BINDINGS,
            async ({ sender }, newKeyBindings) => {
                const [senderInstance] = State.getInstance(sender.id);

                if (!senderInstance) {
                    return;
                }

                await State.setKeyBinding(
                    senderInstance.timerType,
                    JSON.parse(JSON.stringify(newKeyBindings))
                );
            }
        );
    }
}
