export class Style {
  #styles;

  constructor(...styles) {
    this.#styles = styles;
  }

  toString() {
    const stylesString = this.#styles
      .map(rule => rule.join(": "))
      .join(";");

    return `{${stylesString};}`;
  }
}
