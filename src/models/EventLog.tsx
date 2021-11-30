export enum LogLevel {
    Info = "INFO",
    Error = "ERROR"
}

export class EventLog {
    constructor(public id: number, public level: LogLevel = LogLevel.Info, public message: string) {}
}