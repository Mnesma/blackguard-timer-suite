import { WidgetsContainer } from "../constants.js";

export class Widget extends EventTarget {
    #widget;

    constructor({ position }) {
        super();
        this.#widget = document.createElement("div");
        this.classList.add(position);
        WidgetsContainer.appendChild(this.#widget);
    }

    get classList() {
        return this.#widget.classList;
    }

    get textContent() {
        return this.#widget.textContent;
    }

    set textContent(newTextContent) {
        this.#widget.textContent = newTextContent;
    }

    hide() {
        this.classList.add("hidden");
    }

    show() {
        this.classList.remove("hidden");
    }

    remove() {
        this.#widget.remove();
    }
}
