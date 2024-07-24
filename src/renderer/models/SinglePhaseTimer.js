import { KeyBinding } from "../models/KeyBinding.js";
import { Second, TickRate, TimerStatus } from "../constants.js";

export class SinglePhasTimer extends EventTarget {
  name;

  static #RemainingTimeLabelElement = document.querySelector(".time-remaining-label");
  static #NameLabelElement = document.querySelector(".name-label");
  static #RemainingTimeIndicatorElement = document.querySelector(".time-remaining-indicator");

  #initialDuration;
  #urgencyDuration;

  #status = TimerStatus.Inactive;
  #elapsedTime = 0;
  #duration = 0;
  #timeout;
  #keyBindings = [];
  #keyBindingInfo;

  constructor({
    initialDuration,
    urgencyDuration,
    name,
    keyBindingInfo
  }) {
    super();
    this.setInitialDuration(initialDuration);
    this.setUrgencyDuration(urgencyDuration);
    this.setName(name);
    this.setKeyBindingInfo(keyBindingInfo);
    this.#draw();
  }

  start() {
    clearTimeout(this.#timeout);
    this.#elapsedTime = 0;
    this.#duration = this.#initialDuration;
    this.#status = TimerStatus.Active;
    this.#tick();
  }

  stop() {
    clearTimeout(this.#timeout);
    this.#status = TimerStatus.Inactive;
    this.#elapsedTime = 0;
    this.#duration = 0;
    this.#draw();
  }

  pause() {
    this.#status = TimerStatus.Paused;
  }

  resume() {
    this.#status = TimerStatus.Active;
  }

  remove() {
    this.removeListeners();
    
    this.getWidgets()?.forEach((widget) => {
      widget.remove();
    });
  }

  removeListeners() {
    this.#keyBindings.forEach((binding) => {
      binding.removeListener();
    });
  }

  adjustElapsedTime(adjustmentAmount) {
    this.#elapsedTime = this.#elapsedTime + adjustmentAmount;
    this.#draw();
  }

  adjustDuration(adjustmentAmount) {
    this.#duration = this.#duration + adjustmentAmount;
    this.#draw();
  }

  setDuration(time) {
    this.#duration = time;
    this.#draw();
  }

  setInitialDuration(newInitialDuration) {
    this.#initialDuration = newInitialDuration;
  }

  setUrgencyDuration(newUrgencyDuration) {
    this.#urgencyDuration = newUrgencyDuration;
  }

  setName(newName) {
    this.name = newName;
    SinglePhasTimer.#NameLabelElement.textContent = this.name;
  }

  setKeyBindingInfo(providedKeyBindingInfo) {
    const defaultKeyBindings = this.getDefaultKeyBindingInfo();
    const newKeyBindingInfo = defaultKeyBindings.map((defaultKeyBinding) => {
      const providedKeyBinding = providedKeyBindingInfo.find(binding => binding.actionName === defaultKeyBinding.actionName);
      if (providedKeyBinding) {
        return {
          ...defaultKeyBinding,
          key: providedKeyBinding.key
        };
      }

      return defaultKeyBinding;
    });
    
    this.#keyBindingInfo = newKeyBindingInfo;
    this.#initializeKeyBindings();
  }

  getDefaultKeyBindingInfo() {
    return [];
  }

  getActions() {
    return {};
  }

  getWidgets() {
    return [];
  }

  getKeyBindingInfo() {
    return this.#keyBindingInfo;
  }

  get status() {
    return this.#status;
  }

  get timeRemaining() {
    return this.#duration - this.#elapsedTime;
  }

  #initializeKeyBindings() {
    const keyBindingInfo = this.getKeyBindingInfo();
    const actions = this.getActions();
    this.removeListeners();
    this.#keyBindings = keyBindingInfo.map(({ key, actionName }) => (
      new KeyBinding({
        key,
        action: actions[actionName]
      })
    ));
  }

  #tick() {
    const before = Date.now();
    this.#timeout = setTimeout(() => {
      if (this.status !== TimerStatus.Paused) {
        const after = Date.now();
        const delta = after - before;
        this.adjustElapsedTime(delta);
        this.#emitTickEvent();
      }

      if (this.timeRemaining <= this.#urgencyDuration) {
        document.body.classList.add("urgent");
      } else {
        document.body.classList.remove("urgent");
      }

      if (this.#elapsedTime >= this.#duration && this.#status !== TimerStatus.Inactive) {
        this.#status = TimerStatus.Inactive;
        this.#emitTimerEnd();
      }

      this.#tick();
    }, TickRate);
  }

  #draw() {
    const progressPercent = this.#elapsedTime * 100 / this.#duration || 0;
    const circumference = 508.68;
    const secondsRemaining = Math.round(this.timeRemaining / Second);
    SinglePhasTimer.#RemainingTimeIndicatorElement.setAttribute("stroke-dashoffset", `${Math.max((100 - progressPercent) * circumference / 100, 0)}px`);
    SinglePhasTimer.#RemainingTimeLabelElement.textContent = secondsRemaining;
  }

  #emitTickEvent() {
    this.dispatchEvent(
      new CustomEvent("tick")
    );
  }

  #emitTimerEnd() {
    this.dispatchEvent(
      new CustomEvent("timerend")
    );
  }
}
 