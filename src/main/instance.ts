import { BrowserWindow, Event } from "electron";
import { IGlobalKeyEvent } from "node-global-key-listener";
import path from "node:path";
import { EventName } from "../shared/event-name";
import { GlobalState } from "../shared/global-state";
import { State } from "./state";

class Rect {
    constructor(
        public width = 0,
        public height = 0,
        public x = 0,
        public y = 0
    ) {}
}

enum InstanceState {
    TIMER = "TIMER"
}

const InstanceDimensions = {
    [InstanceState.TIMER]: new Rect(200, 200)
};

export class Instance {
    private static readonly WM_MOUSEMOVE = 0x0200;
    private static readonly WM_LBUTTONUP = 0x0202;
    private static readonly MK_LBUTTON = 0x0001;

    private state = InstanceState.TIMER;
    private resizeable = false;
    private dragPosition = new Rect();
    private loaded = false;

    public readonly id: number;
    public readonly window: BrowserWindow;
    public timerType!: string;

    constructor() {
        const dimensions = InstanceDimensions[this.state];

        this.window = new BrowserWindow({
            height: dimensions.height,
            width: dimensions.width,
            transparent: true,
            frame: false,
            icon: path.join(__dirname, "../renderer/icon.png"),
            alwaysOnTop: true,
            maximizable: false,
            fullscreenable: false,
            webPreferences: {
                devTools: true,
                preload: path.join(__dirname, "../renderer/preload.js")
            }
        });

        this.window.setAspectRatio(1);

        this.id = this.window.id;

        if (GlobalState.debug) {
            this.window.webContents.openDevTools();
        }

        this.window.loadFile("src/renderer/index.html");

        this.window.webContents.once("did-finish-load", () => {
            this.loaded = true;
        });

        this.window.on("will-resize", this.conditionalPreventResize);

        this.makeWindowFullyDraggable();

        State.GlobalKeyboardListener.addListener(this.forwardGlobalKeyPress);
    }

    public hasLoaded(): boolean {
        return this.loaded;
    }

    public send(eventName: EventName, payload: unknown) {
        this.window.webContents.send(eventName, payload);
    }

    public destroy(): void {
        this.window.unhookAllWindowMessages();
        this.window.off("will-resize", this.conditionalPreventResize);
        State.GlobalKeyboardListener.removeListener(this.forwardGlobalKeyPress);
    }

    private conditionalPreventResize = (event: Event): void => {
        if (!this.resizeable) {
            event.preventDefault();
        }
    };

    private makeWindowFullyDraggable(): void {
        let dragging = false;

        this.window.hookWindowMessage(Instance.WM_LBUTTONUP, () => {
            dragging = false;
        });

        this.window.hookWindowMessage(
            Instance.WM_MOUSEMOVE,
            (wParam, lParam) => {
                if (!this.window) {
                    return;
                }

                const wParamNumber = wParam.readInt16LE(0);
                const leftMousePressed = wParamNumber & Instance.MK_LBUTTON;

                if (!leftMousePressed) {
                    return;
                }

                const x = lParam.readInt16LE(0);
                const y = lParam.readInt16LE(2);

                const bounds = this.window.getBounds();

                if (!dragging) {
                    dragging = true;
                    this.dragPosition.x = x;
                    this.dragPosition.y = y;
                    this.dragPosition.height = bounds.height;
                    this.dragPosition.width = bounds.width;
                    return;
                }

                const currentPosition = this.window.getPosition();

                this.window.setBounds({
                    x: x + currentPosition[0] - this.dragPosition.x,
                    y: y + currentPosition[1] - this.dragPosition.y,
                    height: this.dragPosition.height,
                    width: this.dragPosition.width
                });
            }
        );
    }

    private forwardGlobalKeyPress = (
        { name, state }: IGlobalKeyEvent
    ): void => {
        if (!this.hasLoaded()) {
            return;
        }

        this.send(EventName.KEYPRESS, {
            key: name,
            state
        });
    };
}
