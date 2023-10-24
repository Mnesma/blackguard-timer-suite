export class Action {
  constructor({
    name,
    description,
    callback
  }) {
    this.name = name;
    this.description = description;
    this.callback = callback;
  }
}
