export class SaveButton {  
  constructor(click) {
    const button = document.createElement("button");
    button.classList.add("positive-button", "button");
    button.textContent = "Save";
    button.addEventListener("click", click, { once: true });
    return button;
  }
}