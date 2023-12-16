import { Widget } from "./Widget.js";

export class TextWidget extends Widget {
  #text = "";

  constructor({ text, position }) {
    super({ position });
    this.setText(text);
    this.classList.add("text-widget");
  }

  getText() {
    return this.#text;
  }

  setText(newText) {
    this.#text = newText;
    this.textContent = newText;
  }
}
