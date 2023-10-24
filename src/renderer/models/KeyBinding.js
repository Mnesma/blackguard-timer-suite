import { Second } from "../constants.js";

export class KeyBinding {
  static cooldown = Second;
  key;
  #action;
  #removeListener;
  #offCooldown = true;

  constructor({
    key,
    action
  }) {
    this.key = key;
    this.#action = action;

    this.#removeListener = Electron.onKeypress(this.callback);
  }

  removeListener() {
    this.#removeListener();
  }

  callback = (_, { name, state: keyState }) => {
    if (keyState !== "DOWN") {
      return;
    }

    if (name === this.key && this.#offCooldown) {
      this.#offCooldown = false;

      this.#action();

      setTimeout(() => { 
        this.#offCooldown = true; 
      }, KeyBinding.cooldown);
    }
  }
}
