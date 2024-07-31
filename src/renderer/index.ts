import "./index.css";
import { Api } from "../shared/api";

declare const api: Api;

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    api.showContextMenu();
});

api.onKeyPress((event) => {
    console.log(event);
});
