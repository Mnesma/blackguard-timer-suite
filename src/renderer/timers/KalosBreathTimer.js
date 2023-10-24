import { SinglePhasTimer } from "../models/SinglePhaseTimer.js";
import { 
  HalfMinute,
  Minute,
  Second,
  WidgetLocation
} from "../constants.js";
import { TextWidget } from "../models/TextWidget.js";

export class KalosBreathTimer extends SinglePhasTimer {
  #cooldowns = [
    Minute,
    Second * 45,
    HalfMinute
  ];
  #currentCooldownCount = 0;
  #currentCooldownIndicatorWidget = new TextWidget({
    text: this.currentCooldown / Second,
    position: WidgetLocation.TopRight
  })

  constructor(keyBindingInfo = this.getDefaultKeyBindingInfo()) {
    super({
      initialDuration: Minute + HalfMinute,
      urgencyDuration: Second * 5,
      name: "Kalos Breath",
      keyBindingInfo
    });
  }

  get currentCooldown() {
    return this.#cooldowns[this.#currentCooldownCount % this.#cooldowns.length];
  }

  getDefaultKeyBindingInfo() {
    return [
      { key: "F12", actionName: "Start/Restart" },
      { key: "F11", actionName: "Cycle Cooldowns" },
      { key: "F10", actionName: "Reset" },
    ];
  }

  getActions() {
    return {
      "Start/Restart": () => {
        this.start();
      },
      "Cycle Cooldowns": () => {
        this.#currentCooldownCount++;
        this.#updateCooldown();
        this.setInitialDuration(this.currentCooldown);
      },
      "Reset": () => {
        this.#currentCooldownCount = 0;
        this.#updateCooldown();
        this.stop();
      }
    }
  }

  #updateCooldown() {
    this.setInitialDuration(this.currentCooldown);
    this.#currentCooldownIndicatorWidget.setText(this.currentCooldown / Second);
  }

  getWidgets() {
    return [
      this.#currentCooldownIndicatorWidget
    ];
  }
}
