import { VariableAPI } from "../shared/constants";
import { BgscriptPrimitive } from "../shared/types";
import { List, ListEvent } from "./list";

export enum VariableEvent {
    Change = "variablechange"
}

export type SerializedVariable = {
    name: string;
    value: BgscriptPrimitive;
};

export class Variable extends EventTarget {
    public name: string;
    private currentValue: BgscriptPrimitive;

    constructor({ name, value }: SerializedVariable) {
        super();

        this.name = name;
        this.currentValue = value;
    }

    public [VariableAPI.Set](newValue: BgscriptPrimitive) {
        if (this.currentValue === newValue) {
            return;
        }

        if (this.currentValue instanceof List) {
            this.currentValue.removeEventListener(
                ListEvent.Change,
                this.dispatchChangeEvent
            );
        }

        if (newValue instanceof List) {
            newValue.addEventListener(
                ListEvent.Change,
                this.dispatchChangeEvent
            );
        }

        this.currentValue = newValue;
        this.dispatchChangeEvent();
    }

    public [VariableAPI.Get](): BgscriptPrimitive {
        return this.currentValue;
    }

    private dispatchChangeEvent(): void {
        this.dispatchEvent(
            new CustomEvent(VariableEvent.Change, { detail: this.currentValue })
        );
    }
}
