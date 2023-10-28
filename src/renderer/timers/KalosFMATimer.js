import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { 
  Minute,
  Second,
  TimerStatus,
  WidgetLocation
} from "../constants.js";
import { IndicatorWidget } from "../models/IndicatorWidet.js";

export class KalosFMATimer extends SinglePhasTimer {
  #testIndicatorWidget = new IndicatorWidget({
    position: WidgetLocation.TopRight
  });

  #testIndicatorTurnOffTimer = null;

  constructor(keyBindingInfo = this.getDefaultKeyBindingInfo()) {
    super({
      initialDuration: Minute * 0.5,
      urgencyDuration: Second * 10,
      name: "Kalos FMA",
      keyBindingInfo
    });
  }

  getDefaultKeyBindingInfo() {
    return [
      { key: "F12", actionName: "Start/Restart" },
      { key: "F11", actionName: "Add Bind Time" },
      { key: "F10", actionName: "Toggle Test Padding" },
    ];
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
        this.#testIndicatorWidget.off();
      },
      "Add Bind Time": () => {
        if (this.status === TimerStatus.Active) {
          this.adjustDuration(Second * 10);
        }
      },
      "Toggle Test Padding": () => {
        if (this.status === TimerStatus.Active) {
        
          if (this.#testIndicatorWidget.isOn) {
            this.#stopTest();
          } else {
            this.#startTest();
          }
        }
      }
    }
  }

  #startTest() {
    this.#testIndicatorWidget.on();
    this.adjustDuration(Second * 50);
    this.#testIndicatorTurnOffTimer = setTimeout(() => {
      this.#testIndicatorWidget.off();
    }, Second * 50);
  }

  #stopTest() {
    this.#testIndicatorWidget.off();
    this.adjustDuration(Second * -50);
    clearTimeout(this.#testIndicatorTurnOffTimer);
  }

  getWidgets() {
    return [
      this.#testIndicatorWidget
    ];
  }
}
