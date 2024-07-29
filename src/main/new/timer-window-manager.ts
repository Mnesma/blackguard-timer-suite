import { TimerWindow } from "./timer-window";

export class TimerWindowManager {
    private windows = new Map<number, TimerWindow>();

    constructor() {
        const testWindow = new TimerWindow({ title: "Test Timer" });

        this.windows.set(testWindow.id, testWindow);
    }

    public get(id: number): TimerWindow | undefined {
        return this.windows.get(id);
    }
}
