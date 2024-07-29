import { BgscriptPrimitive } from "../shared/types";
import { Countdown } from "./countdown";
import { SerializedVariable, Variable } from "./variable";

export type SerializedCountdown = {
    name: string;
    actions: SerializedCountdownAction[];
};

export type SerializedCountdownAction = {
    time: number | string;
    method: string;
    params: Array<BgscriptPrimitive>;
};

class Timer {
    private variables = new Map<string, Variable>();
    private countdowns: Countdown[] = [];

    public createVariable(serializedVariable: SerializedVariable): void {
        const { name } = serializedVariable;
        this.variables.set(name, new Variable(serializedVariable));
    }

    public createCountdown({ name, actions }: SerializedCountdown): void {
        // const duration = actions.reduce((highestTime, action) => {
        //     if (action.time > highestTime) {
        //         return action.time;
        //     }

        //     return highestTime;
        // }, 0);
    }
}
