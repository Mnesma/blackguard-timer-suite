export const Second = 1000;
export const Minute = Second * 60;
export const Hour = Minute * 60;

export enum CountdownAPI {
    Start = "start",
    Pause = "pause",
    Resume = "resume",
    Stop = "stop",
    AddTime = "addTime",
    RemoveTime = "removeTime",
    SetTime = "setTime",
    SetDuration = "setDuration"
}

export enum ListAPI {
    Next = "next",
    Previous = "previous",
    At = "at"
}

export enum VariableAPI {
    Set = "set",
    Get = "get"
}
