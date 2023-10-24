const TimerName = {
  "Farming": "farming",
  "KalosBreath": "kalosbreath",
  "KalosFMA": "kalosFMA",
  "KalosSystems": "kalosSystems",
  "KalosLaserSystem": "kalosLaserSystem",
  "KalosArrowSystem": "kalosArrowSystem",
  "ErdaShower": "erdaShower"
};

const timerNames = [
  ...Object.values(TimerName)
];

const TimerLabel = {
  [TimerName.Farming]: "Farming",
  [TimerName.KalosBreath]: "Kalos Breath",
  [TimerName.KalosFMA]: "Kalos FMA",
  [TimerName.KalosSystems]: "Kalos Systems",
  [TimerName.KalosLaserSystem]: "Kalos Laser System",
  [TimerName.KalosArrowSystem]: "Kalos Arrow System",
  [TimerName.ErdaShower]: "Erda Shower"
};

const WindowType = {
  "SinglePhaseEdit": "singlePhaseEdit",
  "DoublePhaseEdit": "doublePhaseEdit",
  "KeyBindingConfig": "keyBindingConfig",
  "RequestLockPermission": "requestLockPermission",
  "Timer": "timer"
};

module.exports = {
  timerNames,
  TimerName,
  TimerLabel,
  WindowType
};
