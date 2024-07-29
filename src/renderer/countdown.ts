import { Second } from "../shared/constants";
import { CountdownAPI } from "../shared/constants";

export enum CountdownEvent {
    Tick = "countdowntick",
    End = "countdownend"
}

export class Countdown extends EventTarget {
    private static TickRate = Second / 5;
    private timeout?: NodeJS.Timeout;
    private elapsedTime = 0;
    private duration = 0;
    private paused = false;
    private finished = false;

    constructor(duration: number) {
        super();

        this.setDuration(duration);
    }

    public [CountdownAPI.Start](): void {
        this.stop();
        this.finished = false;
        this.tick();
    }

    public [CountdownAPI.Pause](): void {
        this.paused = true;
    }

    public [CountdownAPI.Resume](): void {
        this.paused = false;
    }

    public [CountdownAPI.Stop](): void {
        this.setTime(0);
        this.resume();
        clearTimeout(this.timeout);
    }

    public [CountdownAPI.AddTime](amount: number): void {
        this.elapsedTime += amount;
    }

    public [CountdownAPI.RemoveTime](amount: number): void {
        this.elapsedTime -= amount;
    }

    public [CountdownAPI.SetTime](amount: number): void {
        this.elapsedTime = amount;
    }

    public [CountdownAPI.SetDuration](newDuration: number): void {
        this.duration = newDuration;
    }

    private tick() {
        const before = Date.now();

        this.timeout = setTimeout(() => {
            if (!this.paused) {
                const after = Date.now();
                const delta = after - before;
                this.addTime(delta);
                this.emitTickEvent();
            }

            if (
                this.elapsedTime >= this.duration
                && !this.finished
            ) {
                this.emitTimerEnd();
                this.finished = true;
            }

            this.tick();
        }, Countdown.TickRate);
    }

    private emitTickEvent(): void {
        this.dispatchEvent(
            new CustomEvent(CountdownEvent.Tick, {
                detail: { elapsedTime: this.elapsedTime }
            })
        );
    }

    private emitTimerEnd(): void {
        this.dispatchEvent(
            new CustomEvent(CountdownEvent.End)
        );
    }
}
