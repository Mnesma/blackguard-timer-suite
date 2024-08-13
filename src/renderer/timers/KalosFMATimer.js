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
  { key: "F11", actionName: "Add 10s Bind Time" },
  { key: "F13", actionName: "Add 15s Bind Time" },
  { key: "F10", actionName: "Add Test Time" },
  { key: "F9", actionName: "Remove Test Time" },
];

export class KalosFMATimer extends SinglePhasTimer {
  #testIndicatorWidget = new IndicatorWidget({
    position: WidgetLocation.TopRight
  });

  #testTimerWidget = new CountdownTimerWidget({
    duration: Second * 50,
    position: WidgetLocation.TopRight,
  });

  #testTimer;

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
      "Add 10s Bind Time": () => {
        if (this.status !== TimerStatus.Inactive) {
          this.adjustDuration(Second * 10);
        } else {
          this.setElapsedTime(Second * 10)
        }
      },
      "Add 15s Bind Time": () => {
        if (this.status !== TimerStatus.Inactive) {
          this.adjustDuration(Second * 15);
        } else {
          this.setElapsedTime(Second * 15)
        }
      },
      "Add Test Time": () => {
        if (this.status !== TimerStatus.Inactive) {
          this.adjustDuration(Second * 50);
        } else {
          this.setElapsedTime(Second * 50);
        }
        this.#startTest();
      },
      "Remove Test Time": () => {
        if (this.#testIndicatorWidget.isOff) {
          return;
        }

        this.adjustDuration(-Second * 50);
        this.#stopTest();
      }
    }
  }

  #startTest() {
    this.#testIndicatorWidget.on();
    this.#testTimerWidget.show();
    this.#testTimerWidget.start();
    clearTimeout(this.#testTimer);
    this.#testTimer = setTimeout(() => {
      this.#stopTest();
    }, Second * 50)
  }

  #stopTest = () => {
    this.#testIndicatorWidget.off();
    this.#testTimerWidget.hide();
    this.#testTimerWidget.stop();
    clearTimeout(this.#testTimer);
  };

  getWidgets() {
    return [
      this.#testIndicatorWidget,
      this.#testTimerWidget
    ];
  }
}
