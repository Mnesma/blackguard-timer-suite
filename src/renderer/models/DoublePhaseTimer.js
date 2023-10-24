import { SinglePhasTimer } from "./SinglePhaseTimer.js";

export class DoublePhaseTimer extends SinglePhasTimer {
  #currentPhase = 0;
  #phaseOptions = []

  constructor(phase1Options, phase2Options) {
    super({
      urgencyDuration: phase1Options.urgencyDuration,
      initialDuration: phase1Options.initialDuration,
      name: phase1Options.name,
      keyBindingInfo: phase1Options.keyBindingInfo
    });

    this.#phaseOptions = [
      phase1Options,
      phase2Options
    ];

    this.addEventListener("timerend", () => {
      this.#currentPhase = +!this.#currentPhase;
      this.#updateSettings()
    });
  }

  #updateSettings() {
    const {
      initialDuration,
      urgencyDuration,
      name,
      keyBindingInfo
    } = this.#phaseOptions[this.#currentPhase];
    this.setInitialDuration(initialDuration);
    this.setUrgencyDuration(urgencyDuration);
    this.setName(name);
    this.setKeyBindingInfo(keyBindingInfo);
    this.start();
  }
}