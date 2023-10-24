import { CancelButton } from "./CancelButton.js";
import { SaveButton } from "./SaveButton.js";

export class ButtonContainer {
  constructor({
    saveClick,
    cancelClick
  }) {
    const container = document.createElement("div");
    container.classList.add("button-container");

    if (saveClick) {
      container.appendChild(new SaveButton(saveClick));
    }

    if (cancelClick) {
      container.appendChild(new CancelButton(cancelClick));
    }

    return container;
  }
}