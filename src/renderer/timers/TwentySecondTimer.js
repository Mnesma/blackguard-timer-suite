import { 
  Second,
  TimerStatus,
} from "../constants.js";
import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" },
  { key: "F11", actionName: "Pause/Resume" }
];

export class TwentySecondTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = DefaultKeyBindings) {
    super({
      initialDuration: Second * 20,
      urgencyDuration: Second * 5,
      name: "20s Timer",
      keyBindingInfo
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
