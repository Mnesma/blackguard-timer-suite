// const { contextBridge, ipcRenderer } = require("electron");

// process.once("loaded", () => {
//   contextBridge.exposeInMainWorld("Electron", {
//     setWindowType(type) {
//       ipcRenderer.send("set-window-type", type);
//     },
//     showContextMenu() {
//       ipcRenderer.send("show-context-menu");
//     },
//     approveLockRequest() {
//       ipcRenderer.send("approve-lock-request");
//     },
//     async getTimerType() {
//       return ipcRenderer.invoke("get-timer-type");
//     },
//     async getKeyBindings() {
//       return ipcRenderer.invoke("get-key-bindings");
//     },
//     saveKeyBindings(newBindings) {
//       ipcRenderer.send("save-key-bindings", newBindings);
//     },
//     onKeypress(callback) {
//       ipcRenderer.on("keypress", callback);
//       return () => {
//         ipcRenderer.removeListener("keypress", callback);
//       };
//     },
//     onSetTransparency(callback) {
//       ipcRenderer.on("set-transparency", callback);
//     },
//     onSetTimerType(callback) {
//       ipcRenderer.on("set-timer-type", callback);
//     },
//     onSetKeyBindings(callback) {
//       ipcRenderer.on("set-key-bindings", callback)
//     },
//     onRequestLockPermission(callback) {
//       ipcRenderer.on("request-lock-permission", callback);
//     },
//     onUnlock(callback) {
//       ipcRenderer.on("unlock", callback);
//     },
//     onHighlightSelf(callback) {
//       ipcRenderer.on("highlight-self", callback);
//     }
//   });
// });
