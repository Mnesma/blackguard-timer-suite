import { WidgetsContainer } from "../constants.js";

export class TextWidget {
  #widget;

  constructor({ text, position }) {
    this.#widget = document.createElement("div");
    this.setText(text);
    this.#widget.classList.add("text-widget", position);
    WidgetsContainer.appendChild(this.#widget);
  }

  setText(newText) {
    this.#widget.textContent = newText;
  }
  
  remove() {
    this.#widget.remove();
  }
}
