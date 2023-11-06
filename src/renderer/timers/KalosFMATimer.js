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
      initialDuration: Minute * 2.5,
      urgencyDuration: Second * 10,
      name: "Kalos FMA",
      keyBindingInfo
    });
  }

  getDefaultKeyBindingInfo() {
    return [
      { key: "F12", actionName: "Start/Restart" },
      { key: "F11", actionName: "Add Bind Time" },
      { key: "F10", actionName: "Pause For Test" },
    ];
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
        this.#testIndicatorWidget.off();
      },
      "Add Bind Time": () => {
        if (this.status !== TimerStatus.Inactive) {
          this.adjustDuration(Second * 10);
        }
      },
      "Pause For Test": () => {
        if (this.status !== TimerStatus.Inactive) {
        
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
    this.pause();
    this.#testIndicatorTurnOffTimer = setTimeout(() => {
      this.#stopTest();
    }, Second * 50);
  }

  #stopTest() {
    this.#testIndicatorWidget.off();
    this.resume();
    clearTimeout(this.#testIndicatorTurnOffTimer);
  }

  getWidgets() {
    return [
      this.#testIndicatorWidget
    ];
  }
}
