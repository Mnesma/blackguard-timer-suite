import path from "node:path";
import { Bgscript, ParsedBgscript } from "./bgscript-parser";
import { FileManager } from "./file-manager";
import { StateStatus } from "./parser-combinators";

type TimerManagerOptions = {
    fileManager: FileManager;
};

export class TimerManager {
    static cachePath = path.join(FileManager.userDataPath, "/timer-cache.json");
    static timersPath = path.join(__dirname, "../../timers");

    private fileManager: FileManager;

    public timers: ParsedBgscript[] = [];

    constructor({ fileManager }: TimerManagerOptions) {
        this.fileManager = fileManager;
    }

    public async init() {
    }

    private async getTimerCache(): Promise<void> {
    }

    private async getTimerSource(): Promise<void> {
        const timerSources = await this.fileManager.loadFiles(
            TimerManager.timersPath
        );

        for (const source of timerSources) {
            if (source.contents === null) {
                continue;
            }

            const parsedTimer = Bgscript.Parser.parse(source.contents);

            if (parsedTimer.status === StateStatus.Fatal) {
                throw parsedTimer.error;
            }

            if (
                typeof parsedTimer.result !== "object"
                || parsedTimer.result === null
            ) {
                throw new Error(
                    `Expected parser result to be an object. Instead recieved: ${
                        JSON.stringify(parsedTimer.result)
                    }`
                );
            }

            this.timers.push(parsedTimer.result);
        }
    }
}
