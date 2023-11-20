import { IndicatorWidgetStatus } from "../constants.js";
import { Widget } from "./Widget.js";

export class IndicatorWidget extends Widget {
  #status;

  constructor({ position }) {
    super({ position });
    this.classList.add("indicator-widget");
    this.off();
  }

  on() {
    this.classList.remove("indicator-off");
    this.classList.add("indicator-on");
    this.#status = IndicatorWidgetStatus.On;
  }

  off() {
    this.classList.add("indicator-off");
    this.classList.remove("indicator-on");
    this.#status = IndicatorWidgetStatus.Off;
  }

  toggle() {
    if (this.isOn) {
      this.off();
    } else {
      this.on();
    }
  }
  
  get isOn() {
    return this.#status === IndicatorWidgetStatus.On;
  }

  get isOff() {
    return !this.isOn();
  }

}