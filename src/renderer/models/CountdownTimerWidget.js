import { Second, TickRate, TimerStatus } from "../constants.js";
import { Widget } from "./Widget.js";

export class CountdownTimerWidget extends Widget {
  #duration;
  #elapsedTime = 0;
  #status = TimerStatus.Inactive;
  #timer = null;

  constructor({ duration, position }) {
    super({ position });
    this.#duration = duration;
    this.#draw(0);
    this.classList.add("timer-widget");
  }

  start() {
    clearTimeout(this.#timer);
    this.#elapsedTime = 0;
    this.#status = TimerStatus.Active;
    this.#tick();
  }

  stop() {
    clearTimeout(this.#timer);
    this.#status = TimerStatus.Inactive;
    this.#elapsedTime = 0;
    this.#draw(0);
  }

  pause() {
    this.#status = TimerStatus.Paused;
  }

  resume() {
    this.#status = TimerStatus.Active;
  }

  #tick() {
    const before = Date.now();
    this.#timer = setTimeout(() => {
      if (this.#status === TimerStatus.Active) {
        const after = Date.now();
        const delta = after - before;
        this.#elapsedTime = Math.max(this.#elapsedTime + delta, 0);
        this.#draw(this.#elapsedTime);
      }

      if (this.#elapsedTime >= this.#duration && this.#status !== TimerStatus.Inactive) {
        this.#status = TimerStatus.Inactive;
        this.#emitTimerEnd();
      } else if (this.#status !== TimerStatus.Inactive) {
        this.#tick();
      }
    }, TickRate);
  }

  #draw(time) {
    this.textContent = Math.max(Math.round((this.#duration - time) / Second), 0);
  }

  #emitTimerEnd() {
    this.dispatchEvent(
      new CustomEvent("timerend")
    );
  }
  
  remove() {
    super.remove();
    this.stop();
  }
}
