import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { Second } from "../constants.js";

export class KalosLaserSystemTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = this.getDefaultKeyBindingInfo()) {
    super({
      initialDuration: Second * 15,
      urgencyDuration: Second * 3,
      name: "Kalos Laser System",
      keyBindingInfo
    });

    this.addEventListener("timerend", () => {
      this.start();
    });
  }

  getDefaultKeyBindingInfo() {
    return [
      { key: "F12", actionName: "Start/Restart" }
    ];
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
      }
    }
  }
}
