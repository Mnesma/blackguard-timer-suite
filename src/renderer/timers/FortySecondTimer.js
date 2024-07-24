import { 
  Second,
  TimerStatus,
} from "../constants.js";
import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" },
  { key: "F11", actionName: "Pause/Resume" }
];

export class FortySecondTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = DefaultKeyBindings) {
    super({
      initialDuration: Second * 40,
      urgencyDuration: Second * 5,
      name: "40s Timer",
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
