const TimerName = {
  "Farming": "farming",
  "KalosBreath": "kalosbreath",
  "KalosFMA": "kalosFMA",
  "KalosSystems": "kalosSystems",
  "KalosLaserSystem": "kalosLaserSystem",
  "KalosArrowSystem": "kalosArrowSystem",
  "SixtySeconds": "sixtySeconds",
  "FiftySeconds": "fiftySeconds",
  "FortySeconds": "fortySeconds",
  "ThirtySeconds": "thirtySeconds",
  "TwentySeconds": "twentySeconds",
  "TenSeconds": "tenSeconds",
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
  [TimerName.SixtySeconds]: "60 Seconds",
  [TimerName.FiftySeconds]: "50 Seconds",
  [TimerName.FortySeconds]: "40 Seconds",
  [TimerName.ThirtySeconds]: "30 Seconds",
  [TimerName.TwentySeconds]: "20 Seconds",
  [TimerName.TenSeconds]: "10 Seconds"
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
