import { BrowserWindow, Event as ElectronEvent } from "electron";
import {
    GlobalKeyboardListener,
    IGlobalKeyEvent
} from "node-global-key-listener";
import path from "node:path";
import { Application } from "../shared/application";
import { EventName } from "../shared/constants";

export type TimerWindowOptions = {
    title: string;
};

export class TimerWindow {
    private static readonly WM_MOUSEMOVE = 0x0200;
    private static readonly WM_LBUTTONUP = 0x0202;
    private static readonly MK_LBUTTON = 0x0001;
    private static readonly GlobalKeyboardListener =
        new GlobalKeyboardListener();

    public readonly browserWindow: BrowserWindow;

    private loaded = false;
    private resizeable = false;
    private dragPosition = {
        x: 0,
        y: 0,
        height: 0,
        width: 0
    };

    constructor({ title }: TimerWindowOptions) {
        this.browserWindow = new BrowserWindow({
            height: 200,
            width: 200,
            transparent: true,
            frame: false,
            icon: path.join(__dirname, "../renderer/icon.png"),
            alwaysOnTop: true,
            maximizable: false,
            fullscreenable: false,
            title,
            webPreferences: {
                devTools: true,
                preload: path.join(__dirname, "../renderer/preload.js")
            }
        });

        if (Application) {
            this.browserWindow.webContents.openDevTools({
                mode: "detach",
                title: `${title} Debugger`
            });
        }

        this.browserWindow.setAspectRatio(1);

        this.browserWindow.loadFile("./dist/renderer/index.html");

        this.browserWindow.webContents.once("did-finish-load", () => {
            this.loaded = true;
        });

        this.browserWindow.on("will-resize", this.conditionalPreventResize);

        this.makeDraggable();

        TimerWindow.GlobalKeyboardListener.addListener(
            this.forwardGlobalKeyPress
        );
    }

    public get id(): number {
        return this.browserWindow.webContents.id;
    }

    private conditionalPreventResize = (event: ElectronEvent): void => {
        if (!this.resizeable) {
            event.preventDefault();
        }
    };

    private makeDraggable(): void {
        let dragging = false;

        this.browserWindow.hookWindowMessage(TimerWindow.WM_LBUTTONUP, () => {
            dragging = false;
        });

        this.browserWindow.hookWindowMessage(
            TimerWindow.WM_MOUSEMOVE,
            (wParam, lParam) => {
                if (!this.browserWindow) {
                    return;
                }

                const wParamNumber = wParam.readInt16LE(0);
                const leftMousePressed = wParamNumber & TimerWindow.MK_LBUTTON;

                if (!leftMousePressed) {
                    return;
                }

                const x = lParam.readInt16LE(0);
                const y = lParam.readInt16LE(2);

                const bounds = this.browserWindow.getBounds();

                if (!dragging) {
                    dragging = true;
                    this.dragPosition.x = x;
                    this.dragPosition.y = y;
                    this.dragPosition.height = bounds.height;
                    this.dragPosition.width = bounds.width;
                    return;
                }

                const currentPosition = this.browserWindow.getPosition();

                this.browserWindow.setBounds({
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
        if (!this.loaded) {
            return;
        }

        this.browserWindow.webContents.send(EventName.KEY_PRESS, {
            key: name,
            state
        });
    };
}
