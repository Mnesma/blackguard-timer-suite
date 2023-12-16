const { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage } = require("electron");

if (require("electron-squirrel-startup")) app.quit();

const { GlobalKeyboardListener } = require("node-global-key-listener");
const path = require("path");
const { timerNames, TimerName, TimerLabel, WindowType } = require("./constants");
const { readFile, writeFile } = require("fs/promises");

const debug = process.argv.includes("--with-dev-tools");
const globalKeyboardListener = new GlobalKeyboardListener();
const WM_MOUSEMOVE = 0x0200;
const WM_LBUTTONUP = 0x0202;
const MK_LBUTTON = 0x0001;

const allTimers = new Map();

const makeWindowFullyDraggable = (browserWindow) => {
  const initialPos = {
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  };

  let dragging = false;

  browserWindow.hookWindowMessage(WM_LBUTTONUP, () => {
    dragging = false;
  });

  browserWindow.hookWindowMessage(WM_MOUSEMOVE, (wParam, lParam) => {
    if (!browserWindow) {
      return;
    }

    const wParamNumber = wParam.readInt16LE(0);
    const leftMousePressed = wParamNumber & MK_LBUTTON

    if (!leftMousePressed) {
        return;
    }

    const x = lParam.readInt16LE(0);
    const y = lParam.readInt16LE(2);

    if (!dragging) {
      dragging = true;
      initialPos.x = x;
      initialPos.y = y;
      initialPos.height = browserWindow.getBounds().height;
      initialPos.width = browserWindow.getBounds().width;
      return;
    }

    browserWindow.setBounds({
      x: x + browserWindow.getPosition()[0] - initialPos.x,
      y: y + browserWindow.getPosition()[1] - initialPos.y,
      height: initialPos.height,
      width: initialPos.width,
    });
  });
};

const listenForWillResize = (window) => {
  window.on("will-resize", (event) => {
    const timer = allTimers.get(window.webContents.id);

    if (!timer.resizeable) {
      event.preventDefault();
    }
  });
};

const getInitialWindowType = (timerName) => {
  switch (timerName) {
    case TimerName.SinglePhase:
      return WindowType.SinglePhaseEdit;
    case TimerName.DoublePhase:
      return WindowType.DoublePhaseEdit;
    default:
      return WindowType.Timer;
  }
};

const getWindowSize = (windowType) => {
  switch (windowType) {
    case WindowType.SinglePhaseEdit:
      return { width: 400, height: 400 };
    case WindowType.RequestLockPermission:
      return { width: 400, height: 327 };
    case WindowType.KeyBindingConfig:
    case WindowType.DoublePhaseEdit:
      return { width: 400, height: 338 };
    default:
      return { width: 200, height: 200 };
  }
}

const setWindowType = (timerId, newWindowType) => {
  const timer = allTimers.get(timerId);
  if (newWindowType !== timer.type) {
    if (timer.type === WindowType.Timer) {
      timer.size = timer.window.getContentSize();
    }

    timer.type = newWindowType;

    if (newWindowType === WindowType.Timer && timer.size !== null) {
      timer.window.setSize(...timer.size);
      timer.size = null;
    } else {
      const { width, height } = getWindowSize(newWindowType);
      timer.window.setSize(width, height);
    }
  }
}

const createWindow = (timerName = TimerName.Farming) => {
  const windowType = getInitialWindowType(timerName);

  const newWindow = new BrowserWindow({
    height: 200,
    width: 200,
    transparent: true,
    frame: false,
    icon: path.join(__dirname, "../renderer/icon.png"),
    alwaysOnTop: true,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "../renderer/preload.js")
    }
  });

  if (debug) {
    newWindow.webContents.openDevTools();
  }
  
  newWindow.setAspectRatio(1);

  const { id } = newWindow.webContents;

  allTimers.set(id, {
    id,
    window: newWindow,
    loaded: false,
    name: timerName,
    transparent: true,
    resizeable: false,
    size: null
  });

  setWindowType(id, windowType);

  newWindow.loadFile("src/renderer/index.html");
  
  newWindow.webContents.once("did-finish-load", () => {
    const senderId = newWindow.webContents.id;
    const timer = allTimers.get(senderId);
    timer.loaded = true;
  });

  listenForWillResize(newWindow);
  makeWindowFullyDraggable(newWindow);
};

const createGlobalKeyboardListener = () => {
  globalKeyboardListener.addListener(({ name, state }) => {
    allTimers.forEach(({ loaded, window }) => {
      if (loaded) {
        window.webContents.send("keypress", {
          name,
          state
        });
      }
    });
  });  
};

const createTrayMenu = (timerId) => {
  const timer = allTimers.get(timerId);
  const icon = nativeImage.createFromPath(path.join(__dirname, "../../icon.ico"));
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Unlock", click: () => {
      tray.destroy(); 
      setLocked(timerId, false);
    }},
    { label: "Find Window", click: () => {
      highlightWindow(timerId);
    }},
    { role: "close", click: () => { 
      tray.destroy(); 
      timer.window.close();
    }}
  ]);

  tray.setToolTip(TimerLabel[timer.name]);
  tray.setContextMenu(contextMenu);
}

const highlightWindow = (timerId) => {
  const timer = allTimers.get(timerId);
  timer.window.webContents.send("highlight-self");
};

const setTimerName = (timerId, newName) => {
  const timer = allTimers.get(timerId);
  timer.name = newName;
  timer.window.webContents.send(
    "set-timer-type",
    timer.name
  );
  setDefaultTimerName(newName);
};

const getConfig = async () => {
  const userDataPath = app.getPath("userData");
  const configPath = path.join(userDataPath, "/config.json");

  try {
    const existingConfig = await readFile(configPath, { encoding: "utf8" });
    return JSON.parse(existingConfig);
  } catch {
    return {};
  }
};

const setDefaultTimerName = async (timerName) => {
  const userDataPath = app.getPath("userData");
  const configPath = path.join(userDataPath, "/config.json");
  const newConfig = {
    ...await getConfig(),
    defaultTimerName: timerName
  };

  try {
    await writeFile(configPath, JSON.stringify(newConfig));
  } catch(error) {
    console.error(`Failed to save config.json at: ${configPath}`, error);
  }
}

const toggleTransparency = (timerId) => {
  const timer = allTimers.get(timerId);
  timer.transparent = !timer.transparent;
  timer.window.webContents.send(
    "set-transparency",
    timer.transparent
  );
};

const toggleResizeable = (timerId) => {
  const timer = allTimers.get(timerId);
  timer.resizeable = !timer.resizeable;
};

const requestPermissionToLock = (timerId) => {
  const timer = allTimers.get(timerId);
  timer.window.webContents.send("request-lock-permission");
  timer.size = timer.window.getContentSize();
}

const setLocked = (timerId, locked) => {
  const timer = allTimers.get(timerId);

  if (locked) {
    createTrayMenu(timerId);
    timer.window.setSkipTaskbar(true);
    timer.window.setIgnoreMouseEvents(true);
  } else {
    timer.window.setSkipTaskbar(false);
    timer.window.setIgnoreMouseEvents(false);
    timer.window.webContents.send("unlock");
  } 
};

const setKeyBindings = (timerId) => {
  const timer = allTimers.get(timerId);
  timer.window.webContents.send("set-key-bindings");
  setWindowType(timerId, WindowType.KeyBindingConfig);
};

const listenForContextMenu = () => {
  ipcMain.on("show-context-menu", ({ sender }) => {
    const { id } = sender;
    const timer = allTimers.get(id);

    const menuTemplate = [];

    if (timer.type === WindowType.Timer) {
      menuTemplate.push(
        { 
          label: "Open",
          submenu: [
            ...timerNames.map((timerName) => ({
              label: TimerLabel[timerName], 
              type: "checkbox", 
              checked: timerName === timer.name,
              click: () => {
                if (timerName !== timer.name) {
                  setTimerName(id, timerName);
                }
              }
            }))
          ]
        },
        { 
          label: "New",
          submenu: [
            ...timerNames.map((timerName) => ({
              label: TimerLabel[timerName],
              click: () => {
                createWindow(timerName);
              }
            }))
          ]
        },
        { 
          label: "Window",
          submenu: [
            {
              label: "Transparent",
              type: "checkbox", 
              checked: timer.transparent,
              click: () => {
                toggleTransparency(id);
              }
            },
            {
              label: "Resizeable",
              type: "checkbox", 
              checked: timer.resizeable,
              click: () => {
                toggleResizeable(id);
              }
            },
            {
              label: "Lock",
              click: () => {
                requestPermissionToLock(id);
              }
            }
          ]
        },
        { 
          label: "Key bindings",
          click: () => {
            setKeyBindings(id);
          }
        },
        { type: "separator" }
      );
    }

    menuTemplate.push({ role: "close" });
    
    const menu = Menu.buildFromTemplate(menuTemplate)
    menu.popup({ window: BrowserWindow.fromWebContents(sender) });
  });
};

const getKeyBindingsConfig = async () => {
  const userDataPath = app.getPath("userData");
  const keyBindingsPath = `${userDataPath}/key-bindings.json`;
  try {
    const existingKeybindings = await readFile(keyBindingsPath, { encoding: "utf8" });
    return JSON.parse(existingKeybindings);
  } catch {
    return {};
  }
};

const saveKeyBindingsConfig = async (newKeyBindingsConfig) => {
  const userDataPath = app.getPath("userData");
  const keyBindingsPath = path.join(userDataPath, "/key-bindings.json");
  try {
    await writeFile(keyBindingsPath, JSON.stringify(newKeyBindingsConfig));
  } catch(error) {
    console.error(`Failed to save key-bindings.json at: ${keyBindingsPath}`, error);
  }
};

const listenForSaveKeyBindings = () => {
  ipcMain.on("save-key-bindings", async ({ sender }, newKeyBindings) => {
    const { id } = sender;
    const timer = allTimers.get(id);
    const keyBindings = await getKeyBindingsConfig();
    keyBindings[timer.name] = JSON.parse(JSON.stringify(newKeyBindings));
    await saveKeyBindingsConfig(keyBindings);
  });
};

const listenForGetKeyBindings = () => {
  ipcMain.handle("get-key-bindings", async ({ sender }) => {
    const { id } = sender;
    const timer = allTimers.get(id);
    const keyBindings = await getKeyBindingsConfig();
    return keyBindings[timer.name];
  });
};

const listenForGetTimerType = () => {
  ipcMain.handle("get-timer-type", ({ sender }) => {
    const { id } = sender;
    const timer = allTimers.get(id);
    return timer.name;
  });
};

const listenForLockRequestApproval = () => {
  ipcMain.on("approve-lock-request", ({ sender }) => {
    setLocked(sender.id, true);
    setWindowType(sender.id, WindowType.Timer);
  });
};

const listenForSetWindowType = () => {
  ipcMain.on("set-window-type", ({ sender }, type) => {
    setWindowType(sender.id, type);
  });
};

app.whenReady()
  .then(() => {
    return getConfig();
  })
  .then(({ defaultTimerName }) => {
    createWindow(defaultTimerName);
    createGlobalKeyboardListener();
    listenForContextMenu();
    listenForGetKeyBindings();
    listenForSaveKeyBindings();
    listenForGetTimerType();
    listenForSetWindowType();
    listenForLockRequestApproval();
  });