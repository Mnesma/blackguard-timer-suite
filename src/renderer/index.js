import { View, views, TimerName, WindowType, lockIndicator } from "./constants.js";
import { FarmingTimer } from "./timers/FarmingTimer.js";
import { KalosBreathTimer } from "./timers/KalosBreathTimer.js";
import { KalosFMATimer } from "./timers/KalosFMATimer.js";
import { KeyBindingInput } from "./models/KeyBindingInput.js";
import { ButtonContainer } from "./models/ButtonContainer.js";
import { KalosSystemsTimer } from "./timers/KalosSystemsTimer.js";
import { KalosLaserSystemTimer } from "./timers/KalosLaserSystemTimer.js";
import { KalosArrowSystemTimer } from "./timers/KalosArrowSystemTimer.js";
import { ErdaShowerTimer } from "./timers/ErdaShowerTimer.js";

let currentTimer = null;

let keyBindingInputs = [];

const timers = {
  [TimerName.Farming]: FarmingTimer,
  [TimerName.KalosBreath]: KalosBreathTimer,
  [TimerName.KalosFMA]: KalosFMATimer,
  [TimerName.KalosSystems]: KalosSystemsTimer,
  [TimerName.KalosLaserSystem]: KalosLaserSystemTimer,
  [TimerName.KalosArrowSystem]: KalosArrowSystemTimer,
  [TimerName.ErdaShower]: ErdaShowerTimer
};

const setLockIndicator = (locked) => {
  if (locked) {
    lockIndicator.classList.remove("hidden");
  } else {
    lockIndicator.classList.add("hidden");
  }
};

const listenForContextMenu = () => {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    Electron.showContextMenu();
  });
};

const listenForSetTransparency = () => {
  Electron.onSetTransparency((_, isTransparent) => {
    if (isTransparent) {
      views[View.Timer].classList.remove("opaque");
      views[View.Timer].classList.add("transparent");
    } else {
      views[View.Timer].classList.remove("transparent");
      views[View.Timer].classList.add("opaque");
    }
  });
};

const listenForLockPermissionRequests = () => {
  Electron.onRequestLockPermission(() => {
    Electron.setWindowType(WindowType.RequestLockPermission);
    setView(View.RequestLockPermission);
  });
};

const listenForUnlock = () => {
  Electron.onUnlock(() => {
    setLockIndicator(false);
  });
};


const updateKeyBindingsView = () => {
  const keyBindingInfo = currentTimer.getKeyBindingInfo();
  views[View.KeyBindings].innerHTML = "";
  
  const container = document.createElement("div");
  container.classList.add("input-container");
  keyBindingInputs = keyBindingInfo.map(({ key, actionName }) => (
    new KeyBindingInput({ key, actionName, container })
  ));

  views[View.KeyBindings].appendChild(container);

  views[View.KeyBindings].appendChild(
    new ButtonContainer({
      saveClick: () => {
        const bindingInfo = keyBindingInputs.map((input) => {
          input.removeEventListeners();
          const { value: key, actionName } = input;
          return {
            key, 
            actionName
          };
        });
        keyBindingInputs = [];
        setView(View.Timer);
        currentTimer.setKeyBindingInfo(bindingInfo);
        Electron.saveKeyBindings(bindingInfo);
        Electron.setWindowType(WindowType.Timer);
      },
      cancelClick: () => {
        keyBindingInputs.forEach((input) => {
          input.removeEventListeners();
        });
        keyBindingInputs = [];
        setView(View.Timer);
        Electron.setWindowType(WindowType.Timer);
      }
    })
  );
};

const listenForSetKeyBindings = () => {
  Electron.onSetKeyBindings(() => {
    setView(View.KeyBindings);
  });
};

const listenForSetTimerType = () => {
  Electron.onSetTimerType(async (_, timerType) => {
    if (timers[timerType]) {
      const keyBindings = await Electron.getKeyBindings();
      setTimer(timerType, keyBindings);
    }
  });
}

const setView = (view) => {
  switch (view) {
    case View.Timer: {
      views[View.Timer].classList.remove("hidden");
      views[View.Edit].classList.add("hidden");
      views[View.KeyBindings].classList.add("hidden");
      views[View.RequestLockPermission].classList.add("hidden");
      break;
    }
    case View.Edit: {
      views[View.Timer].classList.add("hidden");
      currentTimer.stop();
      views[View.Edit].classList.remove("hidden");
      views[View.KeyBindings].classList.add("hidden");
      views[View.RequestLockPermission].classList.add("hidden");
      break;
    }
    case View.KeyBindings: {
      views[View.Timer].classList.add("hidden");
      currentTimer.stop();
      views[View.Edit].classList.add("hidden");
      views[View.KeyBindings].classList.remove("hidden");
      views[View.RequestLockPermission].classList.add("hidden");
      updateKeyBindingsView();
      break;
    }
    case View.RequestLockPermission: {
      views[View.Timer].classList.add("hidden");
      currentTimer.stop();
      views[View.Edit].classList.add("hidden");
      views[View.KeyBindings].classList.add("hidden");
      views[View.RequestLockPermission].classList.remove("hidden");
    }
  }
}

const initializeLockPermissionRequestsView = () => {
  const view = views[View.RequestLockPermission];
  const cancelButton = view.querySelector(".negative-button");
  const lockButton = view.querySelector(".positive-button");

  lockButton.addEventListener("click", () => {
    setView(View.Timer);
    setLockIndicator(true);
    Electron.setWindowType(WindowType.Timer);
    Electron.approveLockRequest();
  });

  cancelButton.addEventListener("click", () => {
    setView(View.Timer);
    Electron.setWindowType(WindowType.Timer);
  });
}

const listenForHighlightSelf = () => {
  let flashTimeout = null;
  Electron.onHighlightSelf(() => {
    document.body.classList.add("flash");
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
      document.body.classList.remove("flash");
    }, 6400);
  });
};

const setTimer = (timerType, keyBindings) => {
  if (timers[timerType]) {
    currentTimer?.stop();
    currentTimer?.remove();
    currentTimer = new timers[timerType](keyBindings);
    document.title = `${currentTimer.name} Timer`;
  }
};

const main = async () => {
  listenForContextMenu();
  listenForSetTransparency();
  listenForSetKeyBindings();
  listenForSetTimerType();
  listenForLockPermissionRequests();
  listenForUnlock();
  initializeLockPermissionRequestsView();
  listenForHighlightSelf();
  const timerType = await Electron.getTimerType();
  const keyBindings = await Electron.getKeyBindings();
  setTimer(timerType, keyBindings);
};

main();
