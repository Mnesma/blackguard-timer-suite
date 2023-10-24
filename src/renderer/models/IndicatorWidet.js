import { IndicatorWidgetStatus, WidgetsContainer } from "../constants.js";

export class IndicatorWidget {
  #widget;
  #status;

  constructor({ position }) {
    this.#widget = document.createElement("div");
    this.#widget.classList.add("indicator-widget", position);
    this.off();
    WidgetsContainer.appendChild(this.#widget);
  }

  on() {
    this.#widget.classList.remove("indicator-off");
    this.#widget.classList.add("indicator-on");
    this.#status = IndicatorWidgetStatus.On;
  }

  off() {
    this.#widget.classList.add("indicator-off");
    this.#widget.classList.remove("indicator-on");
    this.#status = IndicatorWidgetStatus.Off;
  }

  toggle() {
    if (this.isOn) {
      this.off();
    } else {
      this.on();
    }
  }
  
  remove() {
    this.#widget.remove();
  }

  get isOn() {
    return this.#status === IndicatorWidgetStatus.On;
  }

  get isOff() {
    return !this.isOn();
  }

}