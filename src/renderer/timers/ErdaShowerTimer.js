import { 
  Second,
  Minute,
} from "../constants.js";
import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";

export class ErdaShowerTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = this.getDefaultKeyBindingInfo()) {
    super({
      initialDuration: Minute,
      urgencyDuration: Second * 5,
      name: "Erda Shower",
      keyBindingInfo
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
      },
    }
  }
}
