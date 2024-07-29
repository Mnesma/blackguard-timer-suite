import "./index.css";
import { Api } from "./preload-api-type";

declare const api: Api;

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    api.showContextMenu();
});
