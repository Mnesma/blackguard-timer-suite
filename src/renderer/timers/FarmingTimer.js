import { DoublePhaseTimer } from "../models/DoublePhaseTimer.js";
import { 
  HalfMinute,
  Minute,
  TimerStatus
} from "../constants.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" },
  { key: "F11", actionName: "Pause/Resume" }
];

export class FarmingTimer extends DoublePhaseTimer {
  constructor(keyBindingInfo = DefaultKeyBindings) {
    super({
      initialDuration: Minute + HalfMinute,
      urgencyDuration: 0,
      name: "Farm",
      keyBindingInfo
    }, {
      initialDuration: HalfMinute,
      urgencyDuration: HalfMinute,
      name: "Loot",
      keyBindingInfo
    });

    this.addEventListener("timerend", () => {
      this.start();
    });
  }

  getDefaultKeyBindingInfo() {
    return DefaultKeyBindings;
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
      },
      "Pause/Resume": () => {
        if (this.status === TimerStatus.Paused) {
          this.resume();
        } else if (this.status === TimerStatus.Active) {
          this.pause();
        }
      }
    }
  }
}
