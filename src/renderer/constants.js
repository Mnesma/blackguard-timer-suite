const Second = 1000;
const Minute = Second * 60;
const HalfMinute = Minute / 2;
const Hour = Minute * 60;
const HalfHour = Hour / 2;
const Day = Hour * 24;

const TickRate = Second / 5;

const TimerStatus = {
  "Paused": 0,
  "Active": 1,
  "Inactive": 2
};

const WidgetsContainer = document.querySelector(".widgets");

const WidgetLocation = {
  "TopLeft": "top-left",
  "TopRight": "top-right",
  "BottomLeft": "bottom-left",
  "BottomRight": "bottom-right"
}

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

const View = {
  "Timer": "timer",
  "Edit": "edit",
  "KeyBindings": "keyBindings",
  "RequestLockPermission": "requestLockPermission"
}

const views = {
  [View.Timer]: document.querySelector(".timer-view"),
  [View.Edit]: document.querySelector(".edit-view"),
  [View.KeyBindings]: document.querySelector(".key-bindings-view"),
  [View.RequestLockPermission]: document.querySelector(".request-lock-permission-view")
}

const lockIndicator = document.querySelector(".lock-indicator");

const WindowType = {
  "SinglePhaseEdit": "singlePhaseEdit",
  "DoublePhaseEdit": "doublePhaseEdit",
  "KeyBindingConfig": "keyBindingConfig",
  "RequestLockPermission": "requestLockPermission",
  "Timer": "timer"
};

const IndicatorWidgetStatus = {
  "On": "on",
  "Off": "off"
};

export {
  Second,
  Minute,
  HalfMinute,
  Hour,
  HalfHour,
  Day,
  TickRate,
  TimerStatus,
  WidgetsContainer,
  WidgetLocation,
  WindowType,
  TimerName,
  View,
  views,
  IndicatorWidgetStatus,
  lockIndicator
};