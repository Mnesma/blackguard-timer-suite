import { ListAPI } from "../shared/constants";

export enum ListEvent {
    Change = "listchange"
}

export class List extends EventTarget {
    private index = 0;

    constructor(private values: string[] | number[]) {
        super();
    }

    public current() {
        return this.values[this.currentIndex];
    }

    public [ListAPI.Next](): string | number {
        this.index++;
        this.dispatchChangeEvent();
        return this.current();
    }

    public [ListAPI.Previous](): string | number {
        this.index--;
        this.dispatchChangeEvent();
        return this.current();
    }

    public [ListAPI.At](newIndex: number): string | number {
        this.index = newIndex;
        this.dispatchChangeEvent();
        return this.current();
    }

    private get currentIndex(): number {
        return Math.abs(this.index % this.values.length);
    }

    private dispatchChangeEvent(): void {
        this.dispatchEvent(
            new CustomEvent(ListEvent.Change, { detail: this.values })
        );
    }
}
