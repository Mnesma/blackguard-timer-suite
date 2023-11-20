import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { Second } from "../constants.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" }
];

export class KalosLaserSystemTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = DefaultKeyBindings) {
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
    return DefaultKeyBindings;
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
      }
    }
  }
}
