import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { 
  Minute,
  Second,
  TimerStatus,
  WidgetLocation
} from "../constants.js";
import { IndicatorWidget } from "../models/IndicatorWidet.js";
import { CountdownTimerWidget } from "../models/CountdownTimerWidget.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" },
  { key: "F11", actionName: "Add Bind Time" },
  { key: "F10", actionName: "Pause For Test" },
];

export class KalosFMATimer extends SinglePhasTimer {
  #testIndicatorWidget = new IndicatorWidget({
    position: WidgetLocation.TopRight
  });

  #testTimerWidget = new CountdownTimerWidget({
    duration: Second * 50,
    position: WidgetLocation.TopRight,
  });

  constructor(keyBindingInfo = DefaultKeyBindings) {
    super({
      initialDuration: Minute * 2.5,
      urgencyDuration: Second * 10,
      name: "Kalos FMA",
      keyBindingInfo
    });

    this.#testTimerWidget.addEventListener("timerend", this.#stopTest);
    this.#testTimerWidget.classList.add("kalos-test-timer-text");
    this.#testTimerWidget.hide();
  }

  getDefaultKeyBindingInfo() {
    return DefaultKeyBindings;
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
        this.#stopTest();
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
    this.#testTimerWidget.show();
    this.#testTimerWidget.start();
  }

  #stopTest = () => {
    this.#testIndicatorWidget.off();
    this.resume();
    this.#testTimerWidget.hide();
    this.#testTimerWidget.stop();
  };

  getWidgets() {
    return [
      this.#testIndicatorWidget,
      this.#testTimerWidget
    ];
  }
}
