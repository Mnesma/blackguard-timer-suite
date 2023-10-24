import { View, views } from "../constants.js";

export class KeyBindingInput {
  #input;
  value;
  actionName;

  constructor({ key, actionName, container }) {
    this.value = key;
    this.actionName = actionName;
    const wrapper = document.createElement("div");
    const inputId = `binding-${Math.random()}`;
    const label = document.createElement("label");
    label.classList.add("key-binding-label");
    label.textContent = this.actionName;
    label.setAttribute("for", inputId);
    this.#input = document.createElement("input");
    this.#input.classList.add("key-binding-input");
    this.#input.setAttribute("type", "text");
    this.#input.setAttribute("id", inputId);
    this.#input.setAttribute("readonly", "");
    this.#updateValueText();
    this.#input.addEventListener("click", this.#waitForKeyPress);
    this.#input.addEventListener("contextmenu", this.#unsetKey);
    document.addEventListener("click", this.#resetOnFocus);
    wrapper.appendChild(label);
    wrapper.appendChild(this.#input);
    container.appendChild(wrapper);
  }

  removeEventListeners() {
    document.removeEventListener("click", this.#resetOnFocus);
    this.#input.removeEventListener("click", this.#waitForKeyPress);
    this.#input.removeEventListener("contextmenu", this.#unsetKey);
  }

  #updateValueText() {
    this.#input.setAttribute("value", this.value ?? "unset");

    if (this.value === null) {
      this.#input.classList.add("unset");
    } else {
      this.#input.classList.remove("unset");
    }
  }

  #unsetKey = (event) => {
    event.stopPropagation();
    this.value = null;
    this.#stopWaitingForKeyPress();
  }

  #waitForKeyPress = () => {
    this.#input.setAttribute("value", "Press any key");
    this.#input.classList.add("listening");
    document.addEventListener("keydown", this.#updateValue);
  }

  #updateValue = (event) => {
    const { key, code } = event;

    if (key === "ScrollLock" || key === "Pause") {
      return;
    }

    if (key !== "Escape") {
      const newValue = KeyBindingInput.CodeToStandardKey(code);
      this.value = newValue;
    }
    
    this.#stopWaitingForKeyPress();
  }

  #stopWaitingForKeyPress() {
    this.#updateValueText();
    this.#input.classList.remove("listening");
    document.removeEventListener("keydown", this.#updateValue);
  };

  #resetOnFocus = (event) => {
    if (event.target !== this.#input) {
      this.#stopWaitingForKeyPress();
    }
  }

  static CodeToStandardKey(code) {
    switch (code) {
      case "ControlLeft":
        return "LEFT CTRL";
      case "ControlRight":
        return "RIGHT CTRL";
      case "ShiftLeft":
      case "AltLeft":
      case "ArrowLeft":
      case "MetaLeft":
        return `LEFT ${code.replace("Left", "")}`.toUpperCase();
      case "ShiftRight": 
      case "AltRight":
      case "ArrowRight":
      case "MetaRight":
        return `RIGHT ${code.replace("Right", "")}`.toUpperCase();
      case "Enter":
        return "RETURN";
      case "ArrowUp":
        return "UP ARROW";
      case "ArrowDown":
        return "DOWN ARROW";
      case "Backquote":
        return "SECTION";
      case "Insert":
        return "INS";
      case "PageUp":
        return "PAGE UP";
      case "PageDown":
        return "PAGE DOWN";
      default:
        if (code.startsWith("Key")) {
          return code.replace("Key", "");
        }

        if (code.startsWith("Digit")) {
          return code.replace("Digit", "");
        }

        return code.toUpperCase();
    }
  }
}