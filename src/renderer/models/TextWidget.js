import { Widget } from "./Widget.js";

export class TextWidget extends Widget {
  constructor({ text, position }) {
    super({ position });
    this.setText(text);
    this.classList.add("text-widget");
  }

  setText(newText) {
    this.textContent = newText;
  }
}
