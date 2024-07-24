import { app } from "electron";
import { GlobalKeyboardListener } from "node-global-key-listener";
import fs from "node:fs/promises";
import path from "node:path";
import { Maybe } from "../shared/maybe";
import { Instance } from "./instance";

type Config = {};

type KeyBindings = {};

export class State {
    public static config: Config = {};
    public static GlobalKeyboardListener = new GlobalKeyboardListener();

    private static keyBindings = new Map<string, KeyBindings>();
    private static instances = new Map<number, Instance>();
    private static userDataPath = app.getPath("userData");
    private static settingsPath = path.join(State.userDataPath, "/config.json");
    private static keyBindingsPath = path.join(
        State.userDataPath,
        "/config.json"
    );

    public static async initialize(): Promise<void> {
        // const myDocumentsPath = app.getPath("documents");
        // const customTimersPath = path.join(
        //     myDocumentsPath,
        //     "/blackguard-timer-suite/custom-timers"
        // );

        const [existingSettingsFile] = await State
            .getJSON<Config>(this.settingsPath);

        if (existingSettingsFile) {
            this.config = existingSettingsFile;
        }

        const [existingKeyBindingsFile] = await State
            .getJSON<[string, KeyBindings][]>(this.keyBindingsPath);

        if (existingKeyBindingsFile) {
            existingKeyBindingsFile.forEach(([timerType, bindings]) => {
                this.keyBindings.set(timerType, bindings);
            });
        }
    }

    public static getKeyBinding(timerType: string): KeyBindings {
        return this.keyBindings.get(timerType) || {};
    }

    public static async setKeyBinding(
        timerType: string,
        bindings: KeyBindings
    ): Promise<void> {
        this.keyBindings.set(timerType, bindings);

        const serializedBindings = JSON.stringify(
            Array.from(this.keyBindings.entries())
        );

        this.saveJSON(this.keyBindingsPath, serializedBindings);
    }

    public static getInstance(id: number): Maybe<Instance> {
        const instance = this.instances.get(id);

        if (!instance) {
            return [null, new Error(`Instance with id: ${id} does not exist`)];
        }

        return [instance, null];
    }

    public static setInstance(instance: Instance): void {
        this.instances.set(instance.id, instance);
    }

    private static async getJSON<T>(jsonPath: string): Promise<Maybe<T>> {
        try {
            const file = await fs.readFile(jsonPath, { encoding: "utf8" });

            return [JSON.parse(file), null];
        } catch (error) {
            console.error(`Failed to get json at: ${jsonPath}`, error);
            return [null, new Error("Could not fetch or parse json")];
        }
    }

    private static async saveJSON(
        jsonPath: string,
        json: string
    ): Promise<void> {
        try {
            await fs.writeFile(jsonPath, json);
        } catch (error) {
            console.error(`Failed to save json at: ${jsonPath}`, error);
        }
    }
}
