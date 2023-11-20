import { 
  Second,
  Minute,
} from "../constants.js";
import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";

const DefaultKeyBindings = [
  { key: "F12", actionName: "Start/Restart" }
];

export class ErdaShowerTimer extends SinglePhasTimer {
  constructor(keyBindingInfo = DefaultKeyBindings) {
    super({
      initialDuration: Minute,
      urgencyDuration: Second * 5,
      name: "Erda Shower",
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
    }
  }
}
