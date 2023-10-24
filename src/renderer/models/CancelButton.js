export class CancelButton {
  constructor(click) {
    const button = document.createElement("button");
    button.classList.add("negative-button", "button");
    button.textContent = "Cancel";
    button.addEventListener("click", click, { once: true });
    return button;
  }
}