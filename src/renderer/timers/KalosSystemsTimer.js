import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { 
  Minute,
  Second,
  TimerStatus,
  WidgetLocation
} from "../constants.js";
import { TextWidget } from "../models/TextWidget.js";

export class KalosSystemsTimer extends SinglePhasTimer {
  #systemsCountWidget = new TextWidget({
    text: "0",
    position: WidgetLocation.TopRight
  });
  #systemsCount = 0;

  constructor(keyBindingInfo = this.getDefaultKeyBindingInfo()) {
    super({
      initialDuration: Minute,
      urgencyDuration: Second * 10,
      name: "Kalos Systems",
      keyBindingInfo
    });
  }

  getDefaultKeyBindingInfo() {
    return [
      { key: "F12", actionName: "Start/Add System" },
      { key: "F11", actionName: "Remove System" },
      { key: "F10", actionName: "Stop and Reset" },
    ];
  }

  getActions() {
    return {
      "Start/Add System": () => {
        if (this.#systemsCount > 0) {
          this.#addSystem();
        } else {
          this.#systemsCount = 1;
          this.#systemsCountWidget.setText(this.#systemsCount);
          this.start();
          this.addEventListener("timerend", this.#addSystemAndRestart);
        }
      },
      "Remove System": () => {
        if (this.#systemsCount > 0) {
          this.#systemsCount = Math.max(this.#systemsCount - 1, 0);
          this.#systemsCountWidget.setText(this.#systemsCount);
          if (this.#systemsCount === 3) {
            this.start();
          }
        }
      },
      "Stop and Reset": () => {
        this.#systemsCount = 0;
        this.#systemsCountWidget.setText(this.#systemsCount);
        this.removeEventListener("timerend", this.#addSystemAndRestart);
        this.stop();
      }
    }
  }

  #addSystemAndRestart() {
    this.#addSystem();
    this.start();
  }

  #addSystem() {
    if (this.#systemsCount < 4) {
      this.#systemsCount++;
      this.#systemsCountWidget.setText(this.#systemsCount);
    }
  }

  getWidgets() {
    return [
      this.#systemsCountWidget
    ];
  }
}
