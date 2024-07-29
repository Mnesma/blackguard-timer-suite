/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/electron-squirrel-startup/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/index.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var path = __webpack_require__(/*! path */ "path");
var spawn = (__webpack_require__(/*! child_process */ "child_process").spawn);
var debug = __webpack_require__(/*! debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js")('electron-squirrel-startup');
var app = (__webpack_require__(/*! electron */ "electron").app);

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = function() {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check();


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js ***!
  \**********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js ***!
  \********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js");
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js ***!
  \*******************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/ms/index.js ***!
  \*************************************************************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "./node_modules/node-global-key-listener/build/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/index.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalKeyboardListener = void 0;
const os_1 = __importDefault(__webpack_require__(/*! os */ "os"));
const MacKeyServer_1 = __webpack_require__(/*! ./ts/MacKeyServer */ "./node_modules/node-global-key-listener/build/ts/MacKeyServer.js");
const WinKeyServer_1 = __webpack_require__(/*! ./ts/WinKeyServer */ "./node_modules/node-global-key-listener/build/ts/WinKeyServer.js");
const X11KeyServer_1 = __webpack_require__(/*! ./ts/X11KeyServer */ "./node_modules/node-global-key-listener/build/ts/X11KeyServer.js");
__exportStar(__webpack_require__(/*! ./ts/_types/IGlobalKeyListener */ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyListener.js"), exports);
__exportStar(__webpack_require__(/*! ./ts/_types/IGlobalKeyEvent */ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyEvent.js"), exports);
__exportStar(__webpack_require__(/*! ./ts/_types/IGlobalKey */ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKey.js"), exports);
__exportStar(__webpack_require__(/*! ./ts/_types/IGlobalKeyDownMap */ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyDownMap.js"), exports);
__exportStar(__webpack_require__(/*! ./ts/_types/IWindowsConfig */ "./node_modules/node-global-key-listener/build/ts/_types/IWindowsConfig.js"), exports);
__exportStar(__webpack_require__(/*! ./ts/_types/IConfig */ "./node_modules/node-global-key-listener/build/ts/_types/IConfig.js"), exports);
/**
 * A cross-platform global keyboard listener. Ideal for setting up global keyboard shortcuts
 * and key-loggers (usually for automation).
 * This keyserver uses low-level hooks on Windows OS and Event Taps on Mac OS, which allows
 * event propagation to be halted to the rest of the operating system as well as allowing
 * any key to be used for shortcuts.
 */
class GlobalKeyboardListener {
    /**
     * Creates a new keyboard listener
     * @param config The optional configuration for the key listener
     */
    constructor(config = {}) {
        /** Whether the server is currently running */
        this.isRunning = false;
        this.stopTimeoutID = 0;
        /** The following listener is used to monitor which keys are being held down */
        this.baseListener = event => {
            if (event.name) {
                switch (event.state) {
                    case "DOWN":
                        this.isDown[event.name] = true;
                        break;
                    case "UP":
                        this.isDown[event.name] = false;
                        break;
                }
            }
            let stopPropagation = false;
            for (let onKey of this.listeners) {
                //Forward event
                try {
                    const res = onKey(event, this.isDown);
                    //Handle catch data
                    if (res instanceof Object) {
                        if (res.stopPropagation)
                            stopPropagation = true;
                        if (res.stopImmediatePropagation)
                            break;
                    }
                    else if (res) {
                        stopPropagation = true;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            return stopPropagation;
        };
        this.listeners = [];
        this.isDown = {};
        this.config = config;
        switch (os_1.default.platform()) {
            case "win32":
                this.keyServer = new WinKeyServer_1.WinKeyServer(this.baseListener, config.windows);
                break;
            case "darwin":
                this.keyServer = new MacKeyServer_1.MacKeyServer(this.baseListener, config.mac);
                break;
            case "linux":
                this.keyServer = new X11KeyServer_1.X11KeyServer(this.baseListener, config.x11);
                break;
            default:
                throw Error("This OS is not supported");
        }
    }
    /**
     * Add a global keyboard listener to the global keyboard listener server.
     * @param listener The listener to add to the global keyboard listener
     * @throws An exception if the process could not be started
     */
    async addListener(listener) {
        this.listeners.push(listener);
        if (this.listeners.length == 1) {
            clearTimeout(this.stopTimeoutID);
            await this.start();
        }
    }
    /**
     * Remove a global keyboard listener from the global keyboard listener server.
     * @param listener The listener to remove from the global keyboard listener
     */
    removeListener(listener) {
        var _a;
        const index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
            if (this.listeners.length == 0) {
                if (this.config.disposeDelay == -1)
                    this.stop();
                else
                    this.stopTimeoutID = setTimeout(() => this.stop(), (_a = this.config.disposeDelay) !== null && _a !== void 0 ? _a : 100);
            }
        }
    }
    /** Removes all listeners and destroys the key server */
    kill() {
        this.listeners = [];
        this.stop();
    }
    /** Start the key server */
    start() {
        let promise = Promise.resolve();
        if (!this.isRunning)
            promise = this.keyServer.start();
        this.isRunning = true;
        return promise;
    }
    /** Stop the key server */
    stop() {
        if (this.isRunning)
            this.keyServer.stop();
        this.isRunning = false;
    }
}
exports.GlobalKeyboardListener = GlobalKeyboardListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFvQjtBQUNwQixvREFBK0M7QUFDL0Msb0RBQStDO0FBQy9DLG9EQUErQztBQU8vQyxpRUFBK0M7QUFDL0MsOERBQTRDO0FBQzVDLHlEQUF1QztBQUN2QyxnRUFBOEM7QUFDOUMsNkRBQTJDO0FBQzNDLHNEQUFvQztBQUVwQzs7Ozs7O0dBTUc7QUFDSCxNQUFhLHNCQUFzQjtJQWEvQjs7O09BR0c7SUFDSCxZQUFtQixTQUFrQixFQUFFO1FBWHZDLDhDQUE4QztRQUNwQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBZ0Y1QiwrRUFBK0U7UUFDdkUsaUJBQVksR0FBMEIsS0FBSyxDQUFDLEVBQUU7WUFDbEQsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUNaLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRTtvQkFDakIsS0FBSyxNQUFNO3dCQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDL0IsTUFBTTtvQkFDVixLQUFLLElBQUk7d0JBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUNoQyxNQUFNO2lCQUNiO2FBQ0o7WUFFRCxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDNUIsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUM5QixlQUFlO2dCQUNmLElBQUk7b0JBQ0EsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRXRDLG1CQUFtQjtvQkFDbkIsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO3dCQUN2QixJQUFJ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

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/MacKeyServer.js":
/*!************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/MacKeyServer.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MacKeyServer = void 0;
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const MacGlobalKeyLookup_1 = __webpack_require__(/*! ./_data/MacGlobalKeyLookup */ "./node_modules/node-global-key-listener/build/ts/_data/MacGlobalKeyLookup.js");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const sudo_prompt_1 = __importDefault(__webpack_require__(/*! sudo-prompt */ "./node_modules/sudo-prompt/index.js"));
const isSpawnEventSupported_1 = __webpack_require__(/*! ./isSpawnEventSupported */ "./node_modules/node-global-key-listener/build/ts/isSpawnEventSupported.js");
const sPath = "../../bin/MacKeyServer";
/** Use this class to listen to key events on Mac OS */
class MacKeyServer {
    /**
     * Creates a new key server for mac
     * @param listener The callback to report key events to
     * @param config Additional optional configuration for the server
     */
    constructor(listener, config = {}) {
        this.running = false;
        this.restarting = false;
        this.listener = listener;
        this.config = config;
    }
    /**
     * Start the Key server and listen for keypresses
     * @param skipPerms Whether to skip attempting to add permissions
     */
    start(skipPerms) {
        this.running = true;
        const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
        this.proc = child_process_1.execFile(serverPath);
        if (this.config.onInfo)
            this.proc.stderr.on("data", data => { var _a, _b; return (_b = (_a = this.config).onInfo) === null || _b === void 0 ? void 0 : _b.call(_a, data.toString()); });
        const onError = this.config.onError;
        if (onError)
            this.proc.on("close", code => {
                if (!this.restarting && this.running)
                    onError(code);
            });
        this.proc.stdout.on("data", data => {
            const events = this._getEventData(data);
            for (let { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                this.proc.stdin.write(`${stopPropagation ? "1" : "0"},${eventId}\n`);
            }
        });
        return this.handleStartup(skipPerms !== null && skipPerms !== void 0 ? skipPerms : false);
    }
    /**
     * Deals with the startup process of the server, possibly adding perms if required and restarting
     * @param skipPerms Whether to skip attempting to add permissions
     */
    handleStartup(skipPerms) {
        return new Promise((res, rej) => {
            let errored = false;
            const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
            // If setup fails, try adding permissions
            this.proc.on("error", async (err) => {
                errored = true;
                if (skipPerms) {
                    rej(err);
                }
                else {
                    try {
                        this.restarting = true;
                        this.proc.kill();
                        await this.addPerms(serverPath);
                        // If the server was stopped in between, just act as if it was started successfully
                        if (!this.running) {
                            res();
                            return;
                        }
                        res(this.start(true));
                    }
                    catch (e) {
                        rej(e);
                    }
                    finally {
                        this.restarting = false;
                    }
                }
            });
            if (isSpawnEventSupported_1.isSpawnEventSupported())
                this.proc.on("spawn", res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(() => {
                    if (!errored)
                        res();
                }, 200);
        });
    }
    /**
     * Makes sure that the given path is executable
     * @param path The path to add the perms to
     */
    addPerms(path) {
        const options = {
            name: "Global key listener",
        };
        return new Promise((res, err) => {
            sudo_prompt_1.default.exec(`chmod +x "${path}"`, options, (error, stdout, stderr) => {
                if (error) {
                    err(error);
                    return;
                }
                if (stderr) {
                    err(stderr);
                    return;
                }
                res();
            });
        });
    }
    /** Stop the Key server */
    stop() {
        this.running = false;
        this.proc.stdout.pause();
        this.proc.kill();
    }
    /**
     * Obtains a IGlobalKeyEvent from stdout buffer data
     * @param data Data from stdout
     * @returns The standardized key event data
     */
    _getEventData(data) {
        const sData = data.toString();
        const lines = sData.trim().split(/\n/);
        return lines.map(line => {
            const lineData = line.replace(/\s+/, "");
            const [mouseKeyboard, downUp, sKeyCode, sLocationX, sLocationY, eventId,] = lineData.split(",");
            const isMouse = mouseKeyboard === 'MOUSE';
            const isDown = downUp === 'DOWN';
            const keyCode = Number.parseInt(sKeyCode, 10);
            const locationX = Number.parseFloat(sLocationX);
            const locationY = Number.parseFloat(sLocationY);
            const key = MacGlobalKeyLookup_1.MacGlobalKeyLookup[isMouse ? (0xFFFF0000 + keyCode) : keyCode];
            return {
                event: {
                    vKey: keyCode,
                    rawKey: key,
                    name: key === null || key === void 0 ? void 0 : key.standardName,
                    state: isDown ? "DOWN" : "UP",
                    scanCode: keyCode,
                    location: [locationX, locationY],
                    _raw: sData,
                },
                eventId,
            };
        });
    }
}
exports.MacKeyServer = MacKeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFjS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL01hY0tleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxpREFBcUQ7QUFHckQsbUVBQThEO0FBQzlELGdEQUF3QjtBQUV4Qiw4REFBK0I7QUFDL0IsbUVBQThEO0FBQzlELE1BQU0sS0FBSyxHQUFHLHdCQUF3QixDQUFDO0FBRXZDLHVEQUF1RDtBQUN2RCxNQUFhLFlBQVk7SUFRckI7Ozs7T0FJRztJQUNILFlBQVksUUFBK0IsRUFBRSxTQUFxQixFQUFFO1FBUjVELFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLFNBQW1CO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxJQUFJLEdBQUcsd0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLGVBQUMsT0FBQSxNQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sRUFBQyxNQUFNLG1EQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBLEVBQUEsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxD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

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/WinKeyServer.js":
/*!************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/WinKeyServer.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WinKeyServer = void 0;
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const WinGlobalKeyLookup_1 = __webpack_require__(/*! ./_data/WinGlobalKeyLookup */ "./node_modules/node-global-key-listener/build/ts/_data/WinGlobalKeyLookup.js");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const isSpawnEventSupported_1 = __webpack_require__(/*! ./isSpawnEventSupported */ "./node_modules/node-global-key-listener/build/ts/isSpawnEventSupported.js");
const sPath = "../../bin/WinKeyServer.exe";
/** Use this class to listen to key events on Windows OS */
class WinKeyServer {
    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    constructor(listener, config = {}) {
        this.listener = listener;
        this.config = config;
    }
    /** Start the Key server and listen for keypresses */
    async start() {
        var _a, _b;
        const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
        this.proc = child_process_1.execFile(serverPath, { maxBuffer: Infinity });
        if (this.config.onInfo)
            (_a = this.proc.stderr) === null || _a === void 0 ? void 0 : _a.on("data", data => { var _a, _b; return (_b = (_a = this.config).onInfo) === null || _b === void 0 ? void 0 : _b.call(_a, data.toString()); });
        if (this.config.onError)
            this.proc.on("close", this.config.onError);
        (_b = this.proc.stdout) === null || _b === void 0 ? void 0 : _b.on("data", data => {
            var _a;
            const events = this._getEventData(data);
            for (let { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                (_a = this.proc.stdin) === null || _a === void 0 ? void 0 : _a.write(`${stopPropagation ? "1" : "0"},${eventId}\n`);
            }
        });
        return new Promise((res, err) => {
            this.proc.on("error", err);
            if (isSpawnEventSupported_1.isSpawnEventSupported())
                this.proc.on("spawn", res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(res, 200);
        });
    }
    /** Stop the Key server */
    stop() {
        var _a;
        (_a = this.proc.stdout) === null || _a === void 0 ? void 0 : _a.pause();
        this.proc.kill();
    }
    /**
     * Obtains a IGlobalKeyEvent from stdout buffer data
     * @param data Data from stdout
     * @returns The standardized key event data
     */
    _getEventData(data) {
        const sData = data.toString();
        const lines = sData.trim().split(/\n/);
        return lines.map(line => {
            const lineData = line.replace(/\s+/, "");
            const [_mouseKeyboard, downUp, sKeyCode, sScanCode, sLocationX, sLocationY, eventId,] = lineData.split(",");
            const isDown = downUp === 'DOWN';
            const keyCode = Number.parseInt(sKeyCode, 10);
            const scanCode = Number.parseInt(sScanCode, 10);
            const locationX = Number.parseFloat(sLocationX);
            const locationY = Number.parseFloat(sLocationY);
            const key = WinGlobalKeyLookup_1.WinGlobalKeyLookup[keyCode];
            return {
                event: {
                    vKey: keyCode,
                    rawKey: key,
                    name: key === null || key === void 0 ? void 0 : key.standardName,
                    state: isDown ? "DOWN" : "UP",
                    scanCode: scanCode,
                    location: [locationX, locationY],
                    _raw: sData,
                },
                eventId,
            };
        });
    }
}
exports.WinKeyServer = WinKeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2luS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1dpbktleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxpREFBcUQ7QUFHckQsbUVBQThEO0FBQzlELGdEQUF3QjtBQUV4QixtRUFBOEQ7QUFDOUQsTUFBTSxLQUFLLEdBQUcsNEJBQTRCLENBQUM7QUFFM0MsMkRBQTJEO0FBQzNELE1BQWEsWUFBWTtJQU1yQjs7OztPQUlHO0lBQ0gsWUFBbUIsUUFBK0IsRUFBRSxTQUF5QixFQUFFO1FBQzNFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxxREFBcUQ7SUFDOUMsS0FBSyxDQUFDLEtBQUs7O1FBQ2QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ2xCLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLDBDQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsZUFBQyxPQUFBLE1BQUEsTUFBQSxJQUFJLENBQUMsTUFBTSxFQUFDLE1BQU0sbURBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7UUFDaEYsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwRSxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSwwQ0FBRSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFOztZQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLEtBQUssSUFBSSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsSUFBSSxNQUFNLEVBQUU7Z0JBQ2pDLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUUvQyxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSywwQ0FBRSxLQUFLLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUM7YUFDekU7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRTNCLElBQUksNkNBQXFCLEVBQUU7Z0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hELHVEQUF1RDs7Z0JBQ2xELFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsMEJBQTBCO0lBQ25CLElBQUk7O1FBQ1AsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sMENBQUUsS0FBSyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLGFBQWEsQ0FBQyxJQUFTO1FBQzdCLE1BQU0sS0FBSyxHQUFXLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV6QyxNQUFNLENBQ0YsY0FBYyxFQUNkLE1BQU0sRUFDTixRQUFRLEVBQ1IsU0FBUyxFQUNULFVBQVUsRUFDVixVQUFVLEVBQ1YsT0FBTyxFQUNWLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV4QixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssTUFBTSxDQUFDO1lBRWpDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVoRCxNQUFNLEdBQUcsR0FBRyx1Q0FBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4QyxPQUFPO2dCQUNILEtBQUssRUFBRTtvQkFDSCxJQUFJLEVBQUUsT0FBTztvQkFDYixNQUFNLEVBQUUsR0FBRztvQkFDWCxJQUFJLEVBQUUsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLFlBQVk7b0JBQ3ZCLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDN0IsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFFBQVEsRUFBRSxDQUFFLFNBQVMsRUFBRSxTQUFTLENBQUU7b0JBQ2xDLElBQUksRUFBRSxLQUFLO2lCQUNkO2dCQUNELE9BQU87YUFDVixDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE3RkQsb0NBNkZDIn0=

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/X11KeyServer.js":
/*!************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/X11KeyServer.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.X11KeyServer = void 0;
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const X11GlobalKeyLookup_1 = __webpack_require__(/*! ./_data/X11GlobalKeyLookup */ "./node_modules/node-global-key-listener/build/ts/_data/X11GlobalKeyLookup.js");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const sudo_prompt_1 = __importDefault(__webpack_require__(/*! sudo-prompt */ "./node_modules/sudo-prompt/index.js"));
const isSpawnEventSupported_1 = __webpack_require__(/*! ./isSpawnEventSupported */ "./node_modules/node-global-key-listener/build/ts/isSpawnEventSupported.js");
const sPath = "../../bin/X11KeyServer";
/** Use this class to listen to key events on X11 */
class X11KeyServer {
    /**
     * Creates a new key server for x11
     * @param listener The callback to report key events to
     * @param config Additional optional configuration for the server
     */
    constructor(listener, config = {}) {
        this.running = false;
        this.restarting = false;
        this.listener = listener;
        this.config = config;
    }
    /**
     * Start the Key server and listen for keypresses
     * @param skipPerms Whether to skip attempting to add permissions
     */
    start(skipPerms) {
        this.running = true;
        const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
        this.proc = child_process_1.execFile(serverPath);
        if (this.config.onInfo)
            this.proc.stderr.on("data", data => { var _a, _b; return (_b = (_a = this.config).onInfo) === null || _b === void 0 ? void 0 : _b.call(_a, data.toString()); });
        const onError = this.config.onError;
        if (onError)
            this.proc.on("close", code => {
                if (!this.restarting && this.running)
                    onError(code);
            });
        this.proc.stdout.on("data", data => {
            const events = this._getEventData(data);
            for (let { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                this.proc.stdin.write(`${stopPropagation ? "1" : "0"},${eventId}\n`);
            }
        });
        return this.handleStartup(skipPerms !== null && skipPerms !== void 0 ? skipPerms : false);
    }
    /**
     * Deals with the startup process of the server, possibly adding perms if required and restarting
     * @param skipPerms Whether to skip attempting to add permissions
     */
    handleStartup(skipPerms) {
        return new Promise((res, rej) => {
            let errored = false;
            const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
            // If setup fails, try adding permissions
            this.proc.on("error", async (err) => {
                errored = true;
                if (skipPerms) {
                    rej(err);
                }
                else {
                    try {
                        this.restarting = true;
                        this.proc.kill();
                        await this.addPerms(serverPath);
                        // If the server was stopped in between, just act as if it was started successfully
                        if (!this.running) {
                            res();
                            return;
                        }
                        res(this.start(true));
                    }
                    catch (e) {
                        rej(e);
                    }
                    finally {
                        this.restarting = false;
                    }
                }
            });
            if (isSpawnEventSupported_1.isSpawnEventSupported())
                this.proc.on("spawn", res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(() => {
                    if (!errored)
                        res();
                }, 200);
        });
    }
    /**
     * Makes sure that the given path is executable
     * @param path The path to add the perms to
     */
    addPerms(path) {
        const options = {
            name: "Global key listener",
        };
        return new Promise((res, err) => {
            sudo_prompt_1.default.exec(`chmod +x "${path}"`, options, (error, stdout, stderr) => {
                if (error) {
                    err(error);
                    return;
                }
                if (stderr) {
                    err(stderr);
                    return;
                }
                res();
            });
        });
    }
    /** Stop the Key server */
    stop() {
        this.running = false;
        this.proc.stdout.pause();
        this.proc.kill();
    }
    /**
     * Obtains a IGlobalKeyEvent from stdout buffer data
     * @param data Data from stdout
     * @returns The standardized key event data
     */
    _getEventData(data) {
        const sData = data.toString();
        const lines = sData.trim().split(/\n/);
        return lines.map(line => {
            const lineData = line.replace(/\s+/, "");
            const [mouseKeyboard, downUp, sKeyCode, sLocationX, sLocationY, eventId,] = lineData.split(",");
            const isMouse = mouseKeyboard === 'MOUSE';
            const isDown = downUp === 'DOWN';
            const keyCode = Number.parseInt(sKeyCode, 10);
            const locationX = Number.parseFloat(sLocationX);
            const locationY = Number.parseFloat(sLocationY);
            const key = X11GlobalKeyLookup_1.X11GlobalKeyLookup[isMouse ? (0xFFFF0000 + keyCode) : (keyCode - 8)];
            return {
                event: {
                    vKey: keyCode,
                    rawKey: key,
                    name: key === null || key === void 0 ? void 0 : key.standardName,
                    state: isDown ? "DOWN" : "UP",
                    scanCode: keyCode,
                    location: [locationX, locationY],
                    _raw: sData,
                },
                eventId,
            };
        });
    }
}
exports.X11KeyServer = X11KeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWDExS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1gxMUtleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxpREFBcUQ7QUFHckQsbUVBQThEO0FBQzlELGdEQUF3QjtBQUV4Qiw4REFBK0I7QUFDL0IsbUVBQThEO0FBQzlELE1BQU0sS0FBSyxHQUFHLHdCQUF3QixDQUFDO0FBRXZDLG9EQUFvRDtBQUNwRCxNQUFhLFlBQVk7SUFRckI7Ozs7T0FJRztJQUNILFlBQVksUUFBK0IsRUFBRSxTQUFxQixFQUFFO1FBUjVELFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQVF2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLFNBQW1CO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpFLElBQUksQ0FBQyxJQUFJLEdBQUcsd0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLGVBQUMsT0FBQSxNQUFBLE1BQUEsSUFBSSxDQUFDLE1BQU0sRUFBQyxNQUFNLG1EQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBLEVBQUEsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxD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

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_data/MacGlobalKeyLookup.js":
/*!************************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_data/MacGlobalKeyLookup.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MacGlobalKeyLookup = void 0;
/*
 *    Mac Virtual keycodes
 *    These constants are the virtual keycodes defined originally in
 *    Inside Mac Volume V, pg. V-191. They identify physical keys on a
 *    keyboard. Those constants with "ANSI" in the name are labeled
 *    according to the key position on an ANSI-standard US keyboard.
 *    For example, kVK_ANSI_A indicates the virtual keycode for the key
 *    with the letter 'A' in the US keyboard layout. Other keyboard
 *    layouts may have the 'A' key label on a different physical key;
 *    in this case, pressing 'A' will generate a different virtual
 *    keycode.
 */
exports.MacGlobalKeyLookup = {
    /* keycodes for keys that are dependent of keyboard layout*/
    0x00: { _nameRaw: "kVK_ANSI_A", name: "A", standardName: "A" },
    0x0B: { _nameRaw: "kVK_ANSI_B", name: "B", standardName: "B" },
    0x08: { _nameRaw: "kVK_ANSI_C", name: "C", standardName: "C" },
    0x02: { _nameRaw: "kVK_ANSI_D", name: "D", standardName: "D" },
    0x0E: { _nameRaw: "kVK_ANSI_E", name: "E", standardName: "E" },
    0x03: { _nameRaw: "kVK_ANSI_F", name: "F", standardName: "F" },
    0x05: { _nameRaw: "kVK_ANSI_G", name: "G", standardName: "G" },
    0x04: { _nameRaw: "kVK_ANSI_H", name: "H", standardName: "H" },
    0x22: { _nameRaw: "kVK_ANSI_I", name: "I", standardName: "I" },
    0x26: { _nameRaw: "kVK_ANSI_J", name: "J", standardName: "J" },
    0x28: { _nameRaw: "kVK_ANSI_K", name: "K", standardName: "K" },
    0x25: { _nameRaw: "kVK_ANSI_L", name: "L", standardName: "L" },
    0x2E: { _nameRaw: "kVK_ANSI_M", name: "M", standardName: "M" },
    0x2D: { _nameRaw: "kVK_ANSI_N", name: "N", standardName: "N" },
    0x1F: { _nameRaw: "kVK_ANSI_O", name: "O", standardName: "O" },
    0x23: { _nameRaw: "kVK_ANSI_P", name: "P", standardName: "P" },
    0x0C: { _nameRaw: "kVK_ANSI_Q", name: "Q", standardName: "Q" },
    0x0F: { _nameRaw: "kVK_ANSI_R", name: "R", standardName: "R" },
    0x01: { _nameRaw: "kVK_ANSI_S", name: "S", standardName: "S" },
    0x11: { _nameRaw: "kVK_ANSI_T", name: "T", standardName: "T" },
    0x20: { _nameRaw: "kVK_ANSI_U", name: "U", standardName: "U" },
    0x09: { _nameRaw: "kVK_ANSI_V", name: "V", standardName: "V" },
    0x0D: { _nameRaw: "kVK_ANSI_W", name: "W", standardName: "W" },
    0x07: { _nameRaw: "kVK_ANSI_X", name: "X", standardName: "X" },
    0x10: { _nameRaw: "kVK_ANSI_Y", name: "Y", standardName: "Y" },
    0x06: { _nameRaw: "kVK_ANSI_Z", name: "Z", standardName: "Z" },
    0x1D: { _nameRaw: "kVK_ANSI_0", name: "0", standardName: "0" },
    0x12: { _nameRaw: "kVK_ANSI_1", name: "1", standardName: "1" },
    0x13: { _nameRaw: "kVK_ANSI_2", name: "2", standardName: "2" },
    0x14: { _nameRaw: "kVK_ANSI_3", name: "3", standardName: "3" },
    0x15: { _nameRaw: "kVK_ANSI_4", name: "4", standardName: "4" },
    0x17: { _nameRaw: "kVK_ANSI_5", name: "5", standardName: "5" },
    0x16: { _nameRaw: "kVK_ANSI_6", name: "6", standardName: "6" },
    0x1A: { _nameRaw: "kVK_ANSI_7", name: "7", standardName: "7" },
    0x1C: { _nameRaw: "kVK_ANSI_8", name: "8", standardName: "8" },
    0x19: { _nameRaw: "kVK_ANSI_9", name: "9", standardName: "9" },
    0x18: { _nameRaw: "kVK_ANSI_Equal", name: "Equal", standardName: "EQUALS" },
    0x1B: { _nameRaw: "kVK_ANSI_Minus", name: "Minus", standardName: "MINUS" },
    0x1E: { _nameRaw: "kVK_ANSI_RightBracket", name: "RightBracket", standardName: "SQUARE BRACKET OPEN" },
    0x21: { _nameRaw: "kVK_ANSI_LeftBracket", name: "LeftBracket", standardName: "SQUARE BRACKET CLOSE" },
    0x27: { _nameRaw: "kVK_ANSI_Quote", name: "Quote", standardName: "QUOTE" },
    0x29: { _nameRaw: "kVK_ANSI_Semicolon", name: "Semicolon", standardName: "SEMICOLON" },
    0x2A: { _nameRaw: "kVK_ANSI_Backslash", name: "Backslash", standardName: "BACKSLASH" },
    0x2B: { _nameRaw: "kVK_ANSI_Comma", name: "Comma", standardName: "COMMA" },
    0x2C: { _nameRaw: "kVK_ANSI_Slash", name: "Slash", standardName: "FORWARD SLASH" },
    0x2F: { _nameRaw: "kVK_ANSI_Period", name: "Period", standardName: "DOT" },
    0x32: { _nameRaw: "kVK_ANSI_Grave", name: "Grave", standardName: "BACKTICK" },
    0x41: { _nameRaw: "kVK_ANSI_KeypadDecimal", name: "KeypadDecimal", standardName: "NUMPAD DOT" },
    0x43: { _nameRaw: "kVK_ANSI_KeypadMultiply", name: "KeypadMultiply", standardName: "NUMPAD MULTIPLY" },
    0x45: { _nameRaw: "kVK_ANSI_KeypadPlus", name: "KeypadPlus", standardName: "NUMPAD PLUS" },
    0x47: { _nameRaw: "kVK_ANSI_KeypadClear", name: "KeypadClear", standardName: "NUMPAD CLEAR" },
    0x4B: { _nameRaw: "kVK_ANSI_KeypadDivide", name: "KeypadDivide", standardName: "NUMPAD DIVIDE" },
    0x4C: { _nameRaw: "kVK_ANSI_KeypadEnter", name: "KeypadEnter", standardName: "NUMPAD RETURN" },
    0x4E: { _nameRaw: "kVK_ANSI_KeypadMinus", name: "KeypadMinus", standardName: "NUMPAD MINUS" },
    0x51: { _nameRaw: "kVK_ANSI_KeypadEquals", name: "KeypadEquals", standardName: "NUMPAD EQUALS" },
    0x52: { _nameRaw: "kVK_ANSI_Keypad0", name: "Keypad0", standardName: "NUMPAD 0" },
    0x53: { _nameRaw: "kVK_ANSI_Keypad1", name: "Keypad1", standardName: "NUMPAD 1" },
    0x54: { _nameRaw: "kVK_ANSI_Keypad2", name: "Keypad2", standardName: "NUMPAD 2" },
    0x55: { _nameRaw: "kVK_ANSI_Keypad3", name: "Keypad3", standardName: "NUMPAD 3" },
    0x56: { _nameRaw: "kVK_ANSI_Keypad4", name: "Keypad4", standardName: "NUMPAD 4" },
    0x57: { _nameRaw: "kVK_ANSI_Keypad5", name: "Keypad5", standardName: "NUMPAD 5" },
    0x58: { _nameRaw: "kVK_ANSI_Keypad6", name: "Keypad6", standardName: "NUMPAD 6" },
    0x59: { _nameRaw: "kVK_ANSI_Keypad7", name: "Keypad7", standardName: "NUMPAD 7" },
    0x5B: { _nameRaw: "kVK_ANSI_Keypad8", name: "Keypad8", standardName: "NUMPAD 8" },
    0x5C: { _nameRaw: "kVK_ANSI_Keypad9", name: "Keypad9", standardName: "NUMPAD 9" },
    0x0A: { _nameRaw: "kVK_ANSI_SECTION", name: "SECTION", standardName: "SECTION" },
    /* keycodes for keys that are independent of keyboard layout*/
    0x24: { _nameRaw: "kVK_Return", name: "Return", standardName: "RETURN" },
    0x30: { _nameRaw: "kVK_Tab", name: "Tab", standardName: "TAB" },
    0x31: { _nameRaw: "kVK_Space", name: "Space", standardName: "SPACE" },
    0x33: { _nameRaw: "kVK_Delete", name: "Delete", standardName: "BACKSPACE" },
    0x75: { _nameRaw: "kVK_ForwardDelete", name: "ForwardDelete", standardName: "DELETE" },
    0x35: { _nameRaw: "kVK_Escape", name: "Escape", standardName: "ESCAPE" },
    0x37: { _nameRaw: "kVK_Command", name: "Command", standardName: "LEFT META" },
    0x38: { _nameRaw: "kVK_Shift", name: "Shift", standardName: "LEFT SHIFT" },
    0x39: { _nameRaw: "kVK_CapsLock", name: "CapsLock", standardName: "CAPS LOCK" },
    0x3A: { _nameRaw: "kVK_Option", name: "Option", standardName: "LEFT ALT" },
    0x3B: { _nameRaw: "kVK_Control", name: "Control", standardName: "LEFT CTRL" },
    0x36: { _nameRaw: "kVK_RightCommand", name: "RightCommand", standardName: "RIGHT META" },
    0x3C: { _nameRaw: "kVK_RightShift", name: "RightShift", standardName: "RIGHT SHIFT" },
    0x3D: { _nameRaw: "kVK_RightOption", name: "RightOption", standardName: "RIGHT ALT" },
    0x3E: { _nameRaw: "kVK_RightControl", name: "RightControl", standardName: "RIGHT CTRL" },
    0x3F: { _nameRaw: "kVK_Function", name: "Function", standardName: "FN" },
    0x48: { _nameRaw: "kVK_VolumeUp", name: "VolumeUp", standardName: "" },
    0x49: { _nameRaw: "kVK_VolumeDown", name: "VolumeDown", standardName: "" },
    0x4A: { _nameRaw: "kVK_Mute", name: "Mute", standardName: "" },
    0x7A: { _nameRaw: "kVK_F1", name: "F1", standardName: "F1" },
    0x78: { _nameRaw: "kVK_F2", name: "F2", standardName: "F2" },
    0x63: { _nameRaw: "kVK_F3", name: "F3", standardName: "F3" },
    0x76: { _nameRaw: "kVK_F4", name: "F4", standardName: "F4" },
    0x60: { _nameRaw: "kVK_F5", name: "F5", standardName: "F5" },
    0x61: { _nameRaw: "kVK_F6", name: "F6", standardName: "F6" },
    0x62: { _nameRaw: "kVK_F7", name: "F7", standardName: "F7" },
    0x64: { _nameRaw: "kVK_F8", name: "F8", standardName: "F8" },
    0x65: { _nameRaw: "kVK_F9", name: "F9", standardName: "F9" },
    0x6D: { _nameRaw: "kVK_F10", name: "F10", standardName: "F10" },
    0x67: { _nameRaw: "kVK_F11", name: "F11", standardName: "F11" },
    0x6F: { _nameRaw: "kVK_F12", name: "F12", standardName: "F12" },
    0x69: { _nameRaw: "kVK_F13", name: "F13", standardName: "F13" },
    0x6B: { _nameRaw: "kVK_F14", name: "F14", standardName: "F14" },
    0x71: { _nameRaw: "kVK_F15", name: "F15", standardName: "F15" },
    0x6A: { _nameRaw: "kVK_F16", name: "F16", standardName: "F16" },
    0x40: { _nameRaw: "kVK_F17", name: "F17", standardName: "F17" },
    0x4F: { _nameRaw: "kVK_F18", name: "F18", standardName: "F18" },
    0x50: { _nameRaw: "kVK_F19", name: "F19", standardName: "F19" },
    0x5A: { _nameRaw: "kVK_F20", name: "F20", standardName: "F20" },
    0x72: { _nameRaw: "kVK_Help", name: "Help", standardName: "" },
    0x73: { _nameRaw: "kVK_Home", name: "Home", standardName: "HOME" },
    0x77: { _nameRaw: "kVK_End", name: "End", standardName: "END" },
    0x74: { _nameRaw: "kVK_PageUp", name: "PageUp", standardName: "PAGE UP" },
    0x79: { _nameRaw: "kVK_PageDown", name: "PageDown", standardName: "PAGE DOWN" },
    0x7B: { _nameRaw: "kVK_LeftArrow", name: "LeftArrow", standardName: "LEFT ARROW" },
    0x7C: { _nameRaw: "kVK_RightArrow", name: "RightArrow", standardName: "RIGHT ARROW" },
    0x7D: { _nameRaw: "kVK_DownArrow", name: "DownArrow", standardName: "DOWN ARROW" },
    0x7E: { _nameRaw: "kVK_UpArrow", name: "UpArrow", standardName: "UP ARROW" },
    0x91: { _nameRaw: "kVK_BrightnessDown", name: "BrightnessDown", standardName: "" },
    0x90: { _nameRaw: "kVK_BrightnessUp", name: "BrightnessUp", standardName: "" },
    0xA0: { _nameRaw: "kVK_WindowOverview", name: "WindowOverview", standardName: "" },
    0xB3: { _nameRaw: "kVK_AppOverview", name: "AppOverview", standardName: "" },
    // Mouse button codes are artificially offset by 0xFFFF0000 in `MacKeyServer`.
    // Original mouse button codes: https://developer.apple.com/documentation/coregraphics/cgmousebutton
    0xFFFF0000: { _nameRaw: "CGMouseButton.left", name: "left", standardName: "MOUSE LEFT" },
    0xFFFF0001: { _nameRaw: "CGMouseButton.right", name: "right", standardName: "MOUSE RIGHT" },
    0xFFFF0002: { _nameRaw: "CGMouseButton.center", name: "center", standardName: "MOUSE MIDDLE" },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFjR2xvYmFsS2V5TG9va3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL19kYXRhL01hY0dsb2JhbEtleUxvb2t1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7Ozs7Ozs7Ozs7R0FXRztBQUNVLFFBQUEsa0JBQWtCLEdBQXFCO0lBQ2hELDREQUE0RDtJQUM1RCxJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFnQixJQUFJLEVBQUUsR0FBRyxFQUFnQixZQUFZLEVBQUUsR0FBRyxFQUFDO0lBQ3ZGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxZQUFZLEVBQWdCLElBQUksRUFBRSxHQUFHLEVBQWdCLFlBQVksRUFBRSxHQUFHLEVBQUM7SUFDdkYsSUFBSSxFQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBZ0IsSUFBSSxFQUFFLEdBQUcsRUFBZ0IsWUFBWSxFQUFFLEdBQUcsRUFBQztJQUN2RixJQUFJ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VUFBVSxFQUFZLElBQUksRUFBRSxNQUFNLEVBQWEsWUFBWSxFQUFFLEVBQUUsRUFBQztJQUNoRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBQztJQUNsRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBQztJQUNsRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBQztJQUNsRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFjLElBQUksRUFBRSxJQUFJLEVBQWUsWUFBWSxFQUFFLElBQUksRUFBRTtJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFZLElBQUksRUFBRSxNQUFNLEVBQWEsWUFBWSxFQUFFLEVBQUUsRUFBQztJQUNoRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFZLElBQUksRUFBRSxNQUFNLEVBQWEsWUFBWSxFQUFFLE1BQU0sRUFBQztJQUNwRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFhLElBQUksRUFBRSxLQUFLLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBQztJQUNuRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFVLElBQUksRUFBRSxRQUFRLEVBQVcsWUFBWSxFQUFFLFNBQVMsRUFBQztJQUN2RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsY0FBYyxFQUFRLElBQUksRUFBRSxVQUFVLEVBQVMsWUFBWSxFQUFFLFdBQVcsRUFBQztJQUN6RixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFPLElBQUksRUFBRSxXQUFXLEVBQVEsWUFBWSxFQUFFLFlBQVksRUFBQztJQUMxRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQU0sSUFBSSxFQUFFLFlBQVksRUFBTyxZQUFZLEVBQUUsYUFBYSxFQUFDO0lBQzNGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQU8sSUFBSSxFQUFFLFdBQVcsRUFBUSxZQUFZLEVBQUUsWUFBWSxFQUFDO0lBQzFGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQVMsSUFBSSxFQUFFLFNBQVMsRUFBVSxZQUFZLEVBQUUsVUFBVSxFQUFDO0lBQ3hGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUcsWUFBWSxFQUFFLEVBQUUsRUFBQztJQUNoRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUksSUFBSSxFQUFFLGNBQWMsRUFBSyxZQUFZLEVBQUUsRUFBRSxFQUFDO0lBQ2hGLElBQUksRUFBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUcsWUFBWSxFQUFFLEVBQUUsRUFBQztJQUNoRixJQUFJLEVBQUMsRUFBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUssSUFBSSxFQUFFLGFBQWEsRUFBTSxZQUFZLEVBQUUsRUFBRSxFQUFDO0lBRWhGLDhFQUE4RTtJQUM5RSxvR0FBb0c7SUFDcEcsVUFBVSxFQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsWUFBWSxFQUFFLFlBQVksRUFBQztJQUN2RixVQUFVLEVBQUMsRUFBQyxRQUFRLEVBQUUscUJBQXFCLEVBQUcsSUFBSSxFQUFFLE9BQU8sRUFBRyxZQUFZLEVBQUUsYUFBYSxFQUFDO0lBQzFGLFVBQVUsRUFBQyxFQUFDLFFBQVEsRUFBRSxzQkFBc0IsRUFBRyxJQUFJLEVBQUUsUUFBUSxFQUFHLFlBQVksRUFBRSxjQUFjLEVBQUM7Q0FDaEcsQ0FBQyJ9

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_data/WinGlobalKeyLookup.js":
/*!************************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_data/WinGlobalKeyLookup.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WinGlobalKeyLookup = void 0;
/**
 * Windows OS [Virtual Key Codes](https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes)
 */
exports.WinGlobalKeyLookup = {
    0x30: { _nameRaw: "VK_0", name: "0", standardName: "0" },
    0x31: { _nameRaw: "VK_1", name: "1", standardName: "1" },
    0x32: { _nameRaw: "VK_2", name: "2", standardName: "2" },
    0x33: { _nameRaw: "VK_3", name: "3", standardName: "3" },
    0x34: { _nameRaw: "VK_4", name: "4", standardName: "4" },
    0x35: { _nameRaw: "VK_5", name: "5", standardName: "5" },
    0x36: { _nameRaw: "VK_6", name: "6", standardName: "6" },
    0x37: { _nameRaw: "VK_7", name: "7", standardName: "7" },
    0x38: { _nameRaw: "VK_8", name: "8", standardName: "8" },
    0x39: { _nameRaw: "VK_9", name: "9", standardName: "9" },
    0x41: { _nameRaw: "VK_A", name: "A", standardName: "A" },
    0x42: { _nameRaw: "VK_B", name: "B", standardName: "B" },
    0x43: { _nameRaw: "VK_C", name: "C", standardName: "C" },
    0x44: { _nameRaw: "VK_D", name: "D", standardName: "D" },
    0x45: { _nameRaw: "VK_E", name: "E", standardName: "E" },
    0x46: { _nameRaw: "VK_F", name: "F", standardName: "F" },
    0x47: { _nameRaw: "VK_G", name: "G", standardName: "G" },
    0x48: { _nameRaw: "VK_H", name: "H", standardName: "H" },
    0x49: { _nameRaw: "VK_I", name: "I", standardName: "I" },
    0x4A: { _nameRaw: "VK_J", name: "J", standardName: "J" },
    0x4B: { _nameRaw: "VK_K", name: "K", standardName: "K" },
    0x4C: { _nameRaw: "VK_L", name: "L", standardName: "L" },
    0x4D: { _nameRaw: "VK_M", name: "M", standardName: "M" },
    0x4E: { _nameRaw: "VK_N", name: "N", standardName: "N" },
    0x4F: { _nameRaw: "VK_O", name: "O", standardName: "O" },
    0x50: { _nameRaw: "VK_P", name: "P", standardName: "P" },
    0x51: { _nameRaw: "VK_Q", name: "Q", standardName: "Q" },
    0x52: { _nameRaw: "VK_R", name: "R", standardName: "R" },
    0x53: { _nameRaw: "VK_S", name: "S", standardName: "S" },
    0x54: { _nameRaw: "VK_T", name: "T", standardName: "T" },
    0x55: { _nameRaw: "VK_U", name: "U", standardName: "U" },
    0x56: { _nameRaw: "VK_V", name: "V", standardName: "V" },
    0x57: { _nameRaw: "VK_W", name: "W", standardName: "W" },
    0x58: { _nameRaw: "VK_X", name: "X", standardName: "X" },
    0x59: { _nameRaw: "VK_Y", name: "Y", standardName: "Y" },
    0x5A: { _nameRaw: "VK_Z", name: "Z", standardName: "Z" },
    0x01: { _nameRaw: "VK_LBUTTON", name: "LBUTTON", standardName: "MOUSE LEFT" },
    0x02: { _nameRaw: "VK_RBUTTON", name: "RBUTTON", standardName: "MOUSE RIGHT" },
    0x03: { _nameRaw: "VK_CANCEL", name: "CANCEL", standardName: "" },
    0x04: { _nameRaw: "VK_MBUTTON", name: "MBUTTON", standardName: "MOUSE MIDDLE" },
    0x05: { _nameRaw: "VK_XBUTTON1", name: "XBUTTON1", standardName: "MOUSE X1" },
    0x06: { _nameRaw: "VK_XBUTTON2", name: "XBUTTON2", standardName: "MOUSE X2" },
    0x08: { _nameRaw: "VK_BACK", name: "BACK", standardName: "BACKSPACE" },
    0x09: { _nameRaw: "VK_TAB", name: "TAB", standardName: "TAB" },
    0x0D: { _nameRaw: "VK_RETURN", name: "RETURN", standardName: "RETURN" },
    0x10: { _nameRaw: "VK_SHIFT", name: "SHIFT", standardName: "" },
    0x11: { _nameRaw: "VK_CONTROL", name: "CONTROL", standardName: "" },
    0x12: { _nameRaw: "VK_MENU", name: "MENU", standardName: "" },
    0x13: { _nameRaw: "VK_PAUSE", name: "PAUSE", standardName: "" },
    0x14: { _nameRaw: "VK_CAPITAL", name: "CAPSLOCK", standardName: "CAPS LOCK" },
    0x15: { _nameRaw: "VK_KANA", name: "KANA", standardName: "" },
    0x16: { _nameRaw: "VK_IME_ON", name: "IME_ON", standardName: "" },
    0x17: { _nameRaw: "VK_JUNJA", name: "JUNJA", standardName: "" },
    0x18: { _nameRaw: "VK_FINAL", name: "FINAL", standardName: "" },
    0x19: { _nameRaw: "VK_HANJA", name: "HANJA", standardName: "" },
    0x1A: { _nameRaw: "VK_IME_OFF", name: "IME_OFF", standardName: "" },
    0x1B: { _nameRaw: "VK_ESCAPE", name: "ESCAPE", standardName: "ESCAPE" },
    0x1C: { _nameRaw: "VK_CONVERT", name: "CONVERT", standardName: "" },
    0x1D: { _nameRaw: "VK_NONCONVERT", name: "NONCONVERT", standardName: "" },
    0x1E: { _nameRaw: "VK_ACCEPT", name: "ACCEPT", standardName: "" },
    0x1F: { _nameRaw: "VK_MODECHANGE", name: "MODECHANGE", standardName: "" },
    0x20: { _nameRaw: "VK_SPACE", name: "SPACE", standardName: "SPACE" },
    0x21: { _nameRaw: "VK_PRIOR", name: "PRIOR", standardName: "PAGE UP" },
    0x22: { _nameRaw: "VK_NEXT", name: "NEXT", standardName: "PAGE DOWN" },
    0x23: { _nameRaw: "VK_END", name: "END", standardName: "END" },
    0x24: { _nameRaw: "VK_HOME", name: "HOME", standardName: "HOME" },
    0x25: { _nameRaw: "VK_LEFT", name: "LEFT", standardName: "LEFT ARROW" },
    0x26: { _nameRaw: "VK_UP", name: "UP", standardName: "UP ARROW" },
    0x27: { _nameRaw: "VK_RIGHT", name: "RIGHT", standardName: "RIGHT ARROW" },
    0x28: { _nameRaw: "VK_DOWN", name: "DOWN", standardName: "DOWN ARROW" },
    0x29: { _nameRaw: "VK_SELECT", name: "SELECT", standardName: "" },
    0x2A: { _nameRaw: "VK_PRINT", name: "PRINT", standardName: "" },
    0x2B: { _nameRaw: "VK_EXECUTE", name: "EXECUTE", standardName: "" },
    0x2C: { _nameRaw: "VK_SNAPSHOT", name: "SNAPSHOT", standardName: "PRINT SCREEN" },
    0x2D: { _nameRaw: "VK_INSERT", name: "INSERT", standardName: "INS" },
    0x2E: { _nameRaw: "VK_DELETE", name: "DELETE", standardName: "DELETE" },
    0x2F: { _nameRaw: "VK_HELP", name: "HELP", standardName: "" },
    0x5B: { _nameRaw: "VK_LWIN", name: "LWIN", standardName: "LEFT META" },
    0x5C: { _nameRaw: "VK_RWIN", name: "RWIN", standardName: "RIGHT META" },
    0x5D: { _nameRaw: "VK_APPS", name: "APPS", standardName: "" },
    0x5F: { _nameRaw: "VK_SLEEP", name: "SLEEP", standardName: "" },
    0x60: { _nameRaw: "VK_NUMPAD0", name: "NUMPAD0", standardName: "NUMPAD 0" },
    0x61: { _nameRaw: "VK_NUMPAD1", name: "NUMPAD1", standardName: "NUMPAD 1" },
    0x62: { _nameRaw: "VK_NUMPAD2", name: "NUMPAD2", standardName: "NUMPAD 2" },
    0x63: { _nameRaw: "VK_NUMPAD3", name: "NUMPAD3", standardName: "NUMPAD 3" },
    0x64: { _nameRaw: "VK_NUMPAD4", name: "NUMPAD4", standardName: "NUMPAD 4" },
    0x65: { _nameRaw: "VK_NUMPAD5", name: "NUMPAD5", standardName: "NUMPAD 5" },
    0x66: { _nameRaw: "VK_NUMPAD6", name: "NUMPAD6", standardName: "NUMPAD 6" },
    0x67: { _nameRaw: "VK_NUMPAD7", name: "NUMPAD7", standardName: "NUMPAD 7" },
    0x68: { _nameRaw: "VK_NUMPAD8", name: "NUMPAD8", standardName: "NUMPAD 8" },
    0x69: { _nameRaw: "VK_NUMPAD9", name: "NUMPAD9", standardName: "NUMPAD 9" },
    0x6A: { _nameRaw: "VK_MULTIPLY", name: "MULTIPLY", standardName: "NUMPAD MULTIPLY" },
    0x6B: { _nameRaw: "VK_ADD", name: "ADD", standardName: "NUMPAD PLUS" },
    0x0C: { _nameRaw: "VK_CLEAR", name: "CLEAR", standardName: "NUMPAD CLEAR" },
    0x6D: { _nameRaw: "VK_SUBTRACT", name: "SUBTRACT", standardName: "NUMPAD MINUS" },
    0x6E: { _nameRaw: "VK_DECIMAL", name: "DECIMAL", standardName: "NUMPAD DOT" },
    0x6F: { _nameRaw: "VK_DIVIDE", name: "DIVIDE", standardName: "NUMPAD DIVIDE" },
    0x6C: { _nameRaw: "VK_SEPARATOR", name: "SEPARATOR", standardName: "" },
    0x70: { _nameRaw: "VK_F1", name: "F1", standardName: "F1" },
    0x71: { _nameRaw: "VK_F2", name: "F2", standardName: "F2" },
    0x72: { _nameRaw: "VK_F3", name: "F3", standardName: "F3" },
    0x73: { _nameRaw: "VK_F4", name: "F4", standardName: "F4" },
    0x74: { _nameRaw: "VK_F5", name: "F5", standardName: "F5" },
    0x75: { _nameRaw: "VK_F6", name: "F6", standardName: "F6" },
    0x76: { _nameRaw: "VK_F7", name: "F7", standardName: "F7" },
    0x77: { _nameRaw: "VK_F8", name: "F8", standardName: "F8" },
    0x78: { _nameRaw: "VK_F9", name: "F9", standardName: "F9" },
    0x79: { _nameRaw: "VK_F10", name: "F10", standardName: "F10" },
    0x7A: { _nameRaw: "VK_F11", name: "F11", standardName: "F11" },
    0x7B: { _nameRaw: "VK_F12", name: "F12", standardName: "F12" },
    0x7C: { _nameRaw: "VK_F13", name: "F13", standardName: "F13" },
    0x7D: { _nameRaw: "VK_F14", name: "F14", standardName: "F14" },
    0x7E: { _nameRaw: "VK_F15", name: "F15", standardName: "F15" },
    0x7F: { _nameRaw: "VK_F16", name: "F16", standardName: "F16" },
    0x80: { _nameRaw: "VK_F17", name: "F17", standardName: "F17" },
    0x81: { _nameRaw: "VK_F18", name: "F18", standardName: "F18" },
    0x82: { _nameRaw: "VK_F19", name: "F19", standardName: "F19" },
    0x83: { _nameRaw: "VK_F20", name: "F20", standardName: "F20" },
    0x84: { _nameRaw: "VK_F21", name: "F21", standardName: "F21" },
    0x85: { _nameRaw: "VK_F22", name: "F22", standardName: "F22" },
    0x86: { _nameRaw: "VK_F23", name: "F23", standardName: "F23" },
    0x87: { _nameRaw: "VK_F24", name: "F24", standardName: "F24" },
    0x90: { _nameRaw: "VK_NUMLOCK", name: "NUMLOCK", standardName: "NUM LOCK" },
    0x91: { _nameRaw: "VK_SCROLL", name: "SCROLL", standardName: "SCROLL LOCK" },
    0xA0: { _nameRaw: "VK_LSHIFT", name: "LSHIFT", standardName: "LEFT SHIFT" },
    0xA1: { _nameRaw: "VK_RSHIFT", name: "RSHIFT", standardName: "RIGHT SHIFT" },
    0xA2: { _nameRaw: "VK_LCONTROL", name: "LCONTROL", standardName: "LEFT CTRL" },
    0xA3: { _nameRaw: "VK_RCONTROL", name: "RCONTROL", standardName: "RIGHT CTRL" },
    0xA4: { _nameRaw: "VK_LMENU", name: "LALT", standardName: "LEFT ALT" },
    0xA5: { _nameRaw: "VK_RMENU", name: "RALT", standardName: "RIGHT ALT" },
    0xA6: { _nameRaw: "VK_BROWSER_BACK", name: "BROWSER_BACK", standardName: "" },
    0xA7: { _nameRaw: "VK_BROWSER_FORWARD", name: "BROWSER_FORWARD", standardName: "" },
    0xA8: { _nameRaw: "VK_BROWSER_REFRESH", name: "BROWSER_REFRESH", standardName: "" },
    0xA9: { _nameRaw: "VK_BROWSER_STOP", name: "BROWSER_STOP", standardName: "" },
    0xAA: { _nameRaw: "VK_BROWSER_SEARCH", name: "BROWSER_SEARCH", standardName: "" },
    0xAB: { _nameRaw: "VK_BROWSER_FAVORITES", name: "BROWSER_FAVORITES", standardName: "" },
    0xAC: { _nameRaw: "VK_BROWSER_HOME", name: "BROWSER_HOME", standardName: "" },
    0xAD: { _nameRaw: "VK_VOLUME_MUTE", name: "VOLUME_MUTE", standardName: "" },
    0xAE: { _nameRaw: "VK_VOLUME_DOWN", name: "VOLUME_DOWN", standardName: "" },
    0xAF: { _nameRaw: "VK_VOLUME_UP", name: "VOLUME_UP", standardName: "" },
    0xB0: { _nameRaw: "VK_MEDIA_NEXT_TRACK", name: "MEDIA_NEXT_TRACK", standardName: "" },
    0xB1: { _nameRaw: "VK_MEDIA_PREV_TRACK", name: "MEDIA_PREV_TRACK", standardName: "" },
    0xB2: { _nameRaw: "VK_MEDIA_STOP", name: "MEDIA_STOP", standardName: "" },
    0xB3: { _nameRaw: "VK_MEDIA_PLAY_PAUSE", name: "MEDIA_PLAY_PAUSE", standardName: "" },
    0xB4: { _nameRaw: "VK_LAUNCH_MAIL", name: "LAUNCH_MAIL", standardName: "" },
    0xB5: { _nameRaw: "VK_LAUNCH_MEDIA_SELECT", name: "LAUNCH_MEDIA_SELECT", standardName: "" },
    0xB6: { _nameRaw: "VK_LAUNCH_APP1", name: "LAUNCH_APP1", standardName: "" },
    0xB7: { _nameRaw: "VK_LAUNCH_APP2", name: "LAUNCH_APP2", standardName: "" },
    0xBA: { _nameRaw: "VK_OEM_1", name: "OEM_1", standardName: "SEMICOLON" },
    0xBB: { _nameRaw: "VK_OEM_PLUS", name: "OEM_PLUS", standardName: "EQUALS" },
    0xBC: { _nameRaw: "VK_OEM_COMMA", name: "OEM_COMMA", standardName: "COMMA" },
    0xBD: { _nameRaw: "VK_OEM_MINUS", name: "OEM_MINUS", standardName: "MINUS" },
    0xBE: { _nameRaw: "VK_OEM_PERIOD", name: "OEM_PERIOD", standardName: "DOT" },
    0xBF: { _nameRaw: "VK_OEM_2", name: "OEM_2", standardName: "FORWARD SLASH" },
    0xC0: { _nameRaw: "VK_OEM_3", name: "OEM_3", standardName: "SECTION" },
    0xDB: { _nameRaw: "VK_OEM_4", name: "OEM_4", standardName: "SQUARE BRACKET OPEN" },
    0xDC: { _nameRaw: "VK_OEM_5", name: "OEM_5", standardName: "BACKSLASH" },
    0xDD: { _nameRaw: "VK_OEM_6", name: "OEM_6", standardName: "SQUARE BRACKET CLOSE" },
    0xDE: { _nameRaw: "VK_OEM_7", name: "OEM_7", standardName: "QUOTE" },
    0xDF: { _nameRaw: "VK_OEM_8", name: "OEM_8", standardName: "" },
    0xE2: { _nameRaw: "VK_OEM_102", name: "OEM_102", standardName: "BACKTICK" },
    0xE5: { _nameRaw: "VK_PROCESSKEY", name: "PROCESSKEY", standardName: "" },
    0xE7: { _nameRaw: "VK_PACKET", name: "PACKET", standardName: "" },
    0xF6: { _nameRaw: "VK_ATTN", name: "ATTN", standardName: "" },
    0xF7: { _nameRaw: "VK_CRSEL", name: "CRSEL", standardName: "" },
    0xF8: { _nameRaw: "VK_EXSEL", name: "EXSEL", standardName: "" },
    0xF9: { _nameRaw: "VK_EREOF", name: "EREOF", standardName: "" },
    0xFA: { _nameRaw: "VK_PLAY", name: "PLAY", standardName: "" },
    0xFB: { _nameRaw: "VK_ZOOM", name: "ZOOM", standardName: "" },
    0xFC: { _nameRaw: "VK_NONAME", name: "NONAME", standardName: "" },
    0xFD: { _nameRaw: "VK_PA1", name: "PA1", standardName: "" },
    0xFE: { _nameRaw: "VK_OEM_CLEAR", name: "OEM_CLEAR", standardName: "" }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2luR2xvYmFsS2V5TG9va3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL19kYXRhL1dpbkdsb2JhbEtleUxvb2t1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTs7R0FFRztBQUNVLFFBQUEsa0JBQWtCLEdBQXFCO0lBQ2xELElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLElBQUksRUFBRSxHQUFHLEVBQXFCLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDOUYsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsSUFBSSxFQUFFLEdBQUcsRUFBcUIsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUM5RixJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixJQUFJLEVBQUUsR0FBRyxFQUFxQixZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQzlGLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxN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SSxFQUFFO0lBQy9GLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQW1CLElBQUksRUFBRSxLQUFLLEVBQW1CLFlBQVksRUFBRSxLQUFLLEVBQUU7SUFDaEcsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBbUIsSUFBSSxFQUFFLEtBQUssRUFBbUIsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUNoRyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFtQixJQUFJLEVBQUUsS0FBSyxFQUFtQixZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQ2hHLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQW1CLElBQUksRUFBRSxLQUFLLEVBQW1CLFlBQVksRUFBRSxLQUFLLEVBQUU7SUFDaEcsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBbUIsSUFBSSxFQUFFLEtBQUssRUFBbUIsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUNoRyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFtQixJQUFJLEVBQUUsS0FBSyxFQUFtQixZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQ2hHLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQW1CLElBQUksRUFBRSxLQUFLLEVBQW1CLFlBQVksRUFBRSxLQUFLLEVBQUU7SUFDaEcsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBbUIsSUFBSSxFQUFFLEtBQUssRUFBbUIsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUNoRyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFtQixJQUFJLEVBQUUsS0FBSyxFQUFtQixZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQ2hHLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQW1CLElBQUksRUFBRSxLQUFLLEVBQW1CLFlBQVksRUFBRSxLQUFLLEVBQUU7SUFDaEcsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBbUIsSUFBSSxFQUFFLEtBQUssRUFBbUIs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

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_data/X11GlobalKeyLookup.js":
/*!************************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_data/X11GlobalKeyLookup.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.X11GlobalKeyLookup = void 0;
/*
 * Linux keycodes from `linux/input-event-codes.h`.[^1]
 * X11 keycodes equal linux + 8.[^2]
 *
 * [^1]: https://github.com/torvalds/linux/blob/13bc32bad7059d6c5671e9d037e6e3ed001cc0f4/include/uapi/linux/input-event-codes.h#L75-L262
 * [^2]: https://github.com/freedesktop/xorg-xf86-input-evdev/blob/469a30f158edceda99fe8a086abbeefffa010e02/src/evdev.c#L280
 */
exports.X11GlobalKeyLookup = {
    0: { _nameRaw: "KEY_RESERVED", name: "RESERVED", standardName: "" },
    1: { _nameRaw: "KEY_ESC", name: "ESCAPE", standardName: "ESCAPE" },
    2: { _nameRaw: "KEY_1", name: "1", standardName: "1" },
    3: { _nameRaw: "KEY_2", name: "2", standardName: "2" },
    4: { _nameRaw: "KEY_3", name: "3", standardName: "3" },
    5: { _nameRaw: "KEY_4", name: "4", standardName: "4" },
    6: { _nameRaw: "KEY_5", name: "5", standardName: "5" },
    7: { _nameRaw: "KEY_6", name: "6", standardName: "6" },
    8: { _nameRaw: "KEY_7", name: "7", standardName: "7" },
    9: { _nameRaw: "KEY_8", name: "8", standardName: "8" },
    10: { _nameRaw: "KEY_9", name: "9", standardName: "9" },
    11: { _nameRaw: "KEY_0", name: "0", standardName: "0" },
    12: { _nameRaw: "KEY_MINUS", name: "MINUS", standardName: "MINUS" },
    13: { _nameRaw: "KEY_EQUAL", name: "EQUALS", standardName: "EQUALS" },
    14: { _nameRaw: "KEY_BACKSPACE", name: "BACKSPACE", standardName: "BACKSPACE" },
    15: { _nameRaw: "KEY_TAB", name: "TAB", standardName: "TAB" },
    16: { _nameRaw: "KEY_Q", name: "Q", standardName: "Q" },
    17: { _nameRaw: "KEY_W", name: "W", standardName: "W" },
    18: { _nameRaw: "KEY_E", name: "E", standardName: "E" },
    19: { _nameRaw: "KEY_R", name: "R", standardName: "R" },
    20: { _nameRaw: "KEY_T", name: "T", standardName: "T" },
    21: { _nameRaw: "KEY_Y", name: "Y", standardName: "Y" },
    22: { _nameRaw: "KEY_U", name: "U", standardName: "U" },
    23: { _nameRaw: "KEY_I", name: "I", standardName: "I" },
    24: { _nameRaw: "KEY_O", name: "O", standardName: "O" },
    25: { _nameRaw: "KEY_P", name: "P", standardName: "P" },
    26: { _nameRaw: "KEY_LEFTBRACE", name: "LEFTBRACE", standardName: "SQUARE BRACKET OPEN" },
    27: { _nameRaw: "KEY_RIGHTBRACE", name: "RIGHTBRACE", standardName: "SQUARE BRACKET CLOSE" },
    28: { _nameRaw: "KEY_ENTER", name: "ENTER", standardName: "RETURN" },
    29: { _nameRaw: "KEY_LEFTCTRL", name: "LEFTCTRL", standardName: "LEFT CTRL" },
    30: { _nameRaw: "KEY_A", name: "A", standardName: "A" },
    31: { _nameRaw: "KEY_S", name: "S", standardName: "S" },
    32: { _nameRaw: "KEY_D", name: "D", standardName: "D" },
    33: { _nameRaw: "KEY_F", name: "F", standardName: "F" },
    34: { _nameRaw: "KEY_G", name: "G", standardName: "G" },
    35: { _nameRaw: "KEY_H", name: "H", standardName: "H" },
    36: { _nameRaw: "KEY_J", name: "J", standardName: "J" },
    37: { _nameRaw: "KEY_K", name: "K", standardName: "K" },
    38: { _nameRaw: "KEY_L", name: "L", standardName: "L" },
    39: { _nameRaw: "KEY_SEMICOLON", name: "SEMICOLON", standardName: "SEMICOLON" },
    40: { _nameRaw: "KEY_APOSTROPHE", name: "APOSTROPHE", standardName: "QUOTE" },
    41: { _nameRaw: "KEY_GRAVE", name: "GRAVE", standardName: "BACKTICK" },
    42: { _nameRaw: "KEY_LEFTSHIFT", name: "LEFTSHIFT", standardName: "LEFT SHIFT" },
    43: { _nameRaw: "KEY_BACKSLASH", name: "BACKSLASH", standardName: "BACKSLASH" },
    44: { _nameRaw: "KEY_Z", name: "Z", standardName: "Z" },
    45: { _nameRaw: "KEY_X", name: "X", standardName: "X" },
    46: { _nameRaw: "KEY_C", name: "C", standardName: "C" },
    47: { _nameRaw: "KEY_V", name: "V", standardName: "V" },
    48: { _nameRaw: "KEY_B", name: "B", standardName: "B" },
    49: { _nameRaw: "KEY_N", name: "N", standardName: "N" },
    50: { _nameRaw: "KEY_M", name: "M", standardName: "M" },
    51: { _nameRaw: "KEY_COMMA", name: "COMMA", standardName: "COMMA" },
    52: { _nameRaw: "KEY_DOT", name: "DOT", standardName: "DOT" },
    53: { _nameRaw: "KEY_SLASH", name: "SLASH", standardName: "FORWARD SLASH" },
    54: { _nameRaw: "KEY_RIGHTSHIFT", name: "RIGHTSHIFT", standardName: "RIGHT SHIFT" },
    55: { _nameRaw: "KEY_KPASTERISK", name: "KPASTERISK", standardName: "NUMPAD MULTIPLY" },
    56: { _nameRaw: "KEY_LEFTALT", name: "LEFTALT", standardName: "LEFT ALT" },
    57: { _nameRaw: "KEY_SPACE", name: "SPACE", standardName: "SPACE" },
    58: { _nameRaw: "KEY_CAPSLOCK", name: "CAPSLOCK", standardName: "CAPS LOCK" },
    59: { _nameRaw: "KEY_F1", name: "F1", standardName: "F1" },
    60: { _nameRaw: "KEY_F2", name: "F2", standardName: "F2" },
    61: { _nameRaw: "KEY_F3", name: "F3", standardName: "F3" },
    62: { _nameRaw: "KEY_F4", name: "F4", standardName: "F4" },
    63: { _nameRaw: "KEY_F5", name: "F5", standardName: "F5" },
    64: { _nameRaw: "KEY_F6", name: "F6", standardName: "F6" },
    65: { _nameRaw: "KEY_F7", name: "F7", standardName: "F7" },
    66: { _nameRaw: "KEY_F8", name: "F8", standardName: "F8" },
    67: { _nameRaw: "KEY_F9", name: "F9", standardName: "F9" },
    68: { _nameRaw: "KEY_F10", name: "F10", standardName: "F10" },
    69: { _nameRaw: "KEY_NUMLOCK", name: "NUMLOCK", standardName: "NUM LOCK" },
    70: { _nameRaw: "KEY_SCROLLLOCK", name: "SCROLLLOCK", standardName: "SCROLL LOCK" },
    71: { _nameRaw: "KEY_KP7", name: "KP7", standardName: "NUMPAD 7" },
    72: { _nameRaw: "KEY_KP8", name: "KP8", standardName: "NUMPAD 8" },
    73: { _nameRaw: "KEY_KP9", name: "KP9", standardName: "NUMPAD 9" },
    74: { _nameRaw: "KEY_KPMINUS", name: "KPMINUS", standardName: "NUMPAD MINUS" },
    75: { _nameRaw: "KEY_KP4", name: "KP4", standardName: "NUMPAD 4" },
    76: { _nameRaw: "KEY_KP5", name: "KP5", standardName: "NUMPAD 5" },
    77: { _nameRaw: "KEY_KP6", name: "KP6", standardName: "NUMPAD 6" },
    78: { _nameRaw: "KEY_KPPLUS", name: "KPPLUS", standardName: "NUMPAD PLUS" },
    79: { _nameRaw: "KEY_KP1", name: "KP1", standardName: "NUMPAD 1" },
    80: { _nameRaw: "KEY_KP2", name: "KP2", standardName: "NUMPAD 2" },
    81: { _nameRaw: "KEY_KP3", name: "KP3", standardName: "NUMPAD 3" },
    82: { _nameRaw: "KEY_KP0", name: "KP0", standardName: "NUMPAD 0" },
    83: { _nameRaw: "KEY_KPDOT", name: "KPDOT", standardName: "NUMPAD DOT" },
    85: { _nameRaw: "KEY_ZENKAKUHANKAKU", name: "ZENKAKUHANKAKU", standardName: "" },
    86: { _nameRaw: "KEY_102ND", name: "102ND", standardName: "" },
    87: { _nameRaw: "KEY_F11", name: "F11", standardName: "F11" },
    88: { _nameRaw: "KEY_F12", name: "F12", standardName: "F12" },
    89: { _nameRaw: "KEY_RO", name: "RO", standardName: "" },
    90: { _nameRaw: "KEY_KATAKANA", name: "KATAKANA", standardName: "" },
    91: { _nameRaw: "KEY_HIRAGANA", name: "HIRAGANA", standardName: "" },
    92: { _nameRaw: "KEY_HENKAN", name: "HENKAN", standardName: "" },
    93: { _nameRaw: "KEY_KATAKANAHIRAGANA", name: "KATAKANAHIRAGANA", standardName: "" },
    94: { _nameRaw: "KEY_MUHENKAN", name: "MUHENKAN", standardName: "" },
    95: { _nameRaw: "KEY_KPJPCOMMA", name: "KPJPCOMMA", standardName: "" },
    96: { _nameRaw: "KEY_KPENTER", name: "KPENTER", standardName: "NUMPAD RETURN" },
    97: { _nameRaw: "KEY_RIGHTCTRL", name: "RIGHTCTRL", standardName: "RIGHT CTRL" },
    98: { _nameRaw: "KEY_KPSLASH", name: "KPSLASH", standardName: "" },
    99: { _nameRaw: "KEY_SYSRQ", name: "SYSRQ", standardName: "" },
    100: { _nameRaw: "KEY_RIGHTALT", name: "RIGHTALT", standardName: "RIGHT ALT" },
    101: { _nameRaw: "KEY_LINEFEED", name: "LINEFEED", standardName: "" },
    102: { _nameRaw: "KEY_HOME", name: "HOME", standardName: "HOME" },
    103: { _nameRaw: "KEY_UP", name: "UP", standardName: "UP ARROW" },
    104: { _nameRaw: "KEY_PAGEUP", name: "PAGEUP", standardName: "PAGE UP" },
    105: { _nameRaw: "KEY_LEFT", name: "LEFT", standardName: "LEFT ARROW" },
    106: { _nameRaw: "KEY_RIGHT", name: "RIGHT", standardName: "RIGHT ARROW" },
    107: { _nameRaw: "KEY_END", name: "END", standardName: "END" },
    108: { _nameRaw: "KEY_DOWN", name: "DOWN", standardName: "DOWN ARROW" },
    109: { _nameRaw: "KEY_PAGEDOWN", name: "PAGEDOWN", standardName: "PAGE DOWN" },
    110: { _nameRaw: "KEY_INSERT", name: "INSERT", standardName: "INS" },
    111: { _nameRaw: "KEY_DELETE", name: "DELETE", standardName: "DELETE" },
    112: { _nameRaw: "KEY_MACRO", name: "MACRO", standardName: "" },
    113: { _nameRaw: "KEY_MUTE", name: "MUTE", standardName: "" },
    114: { _nameRaw: "KEY_VOLUMEDOWN", name: "VOLUMEDOWN", standardName: "" },
    115: { _nameRaw: "KEY_VOLUMEUP", name: "VOLUMEUP", standardName: "" },
    116: { _nameRaw: "KEY_POWER", name: "POWER", standardName: "" },
    117: { _nameRaw: "KEY_KPEQUAL", name: "KPEQUAL", standardName: "NUMPAD EQUALS" },
    118: { _nameRaw: "KEY_KPPLUSMINUS", name: "KPPLUSMINUS", standardName: "" },
    119: { _nameRaw: "KEY_PAUSE", name: "PAUSE", standardName: "" },
    120: { _nameRaw: "KEY_SCALE", name: "SCALE", standardName: "" },
    121: { _nameRaw: "KEY_KPCOMMA", name: "KPCOMMA", standardName: "" },
    122: { _nameRaw: "KEY_HANGEUL", name: "HANGEUL", standardName: "" },
    123: { _nameRaw: "KEY_HANJA", name: "HANJA", standardName: "" },
    124: { _nameRaw: "KEY_YEN", name: "YEN", standardName: "" },
    125: { _nameRaw: "KEY_LEFTMETA", name: "LEFTMETA", standardName: "LEFT META" },
    126: { _nameRaw: "KEY_RIGHTMETA", name: "RIGHTMETA", standardName: "RIGHT META" },
    127: { _nameRaw: "KEY_COMPOSE", name: "COMPOSE", standardName: "" },
    // Mouse button codes are artificially offset by 0xFFFF0000 in `X11KeyServer`.
    0xFFFF0001: { _nameRaw: "1", name: "Button1", standardName: "MOUSE LEFT" },
    0xFFFF0002: { _nameRaw: "2", name: "Button2", standardName: "MOUSE MIDDLE" },
    0xFFFF0003: { _nameRaw: "3", name: "Button3", standardName: "MOUSE RIGHT" },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWDExR2xvYmFsS2V5TG9va3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL19kYXRhL1gxMUdsb2JhbEtleUxvb2t1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7Ozs7O0dBTUc7QUFDVSxRQUFBLGtCQUFrQixHQUFxQjtJQUNoRCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUNuRSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtJQUNsRSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN0RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRTtJQUNuRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtJQUNyRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRTtJQUMvRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUM3RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLHFCQUFxQixFQUFFO0lBQ3pGLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxzQkFBc0IsRUFBRTtJQUM1RixFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtJQUNwRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRTtJQUM3RSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRTtJQUMvRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFO0lBQzdFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFO0lBQ3RFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFO0lBQ2hGLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFO0lBQy9FLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBQ3ZELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFO0lBQ25FLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQzdELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFO0lBQzNFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUU7SUFDbkYsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFO0lBQ3ZGLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFO0lBQzFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFO0lBQ25FLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFO0lBQzdFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFO0lBQzFELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQzdELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFO0lBQzFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUU7SUFDbkYsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUU7SUFDOUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUU7SUFDM0UsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7SUFDbEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUU7SUFFeEUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ2hGLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQzlELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQzdELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQzdELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ3hELEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ3BFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ3BFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ2hFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUNwRixFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUNwRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUN0RSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRTtJQUMvRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRTtJQUNoRixFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUNsRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUM5RCxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRTtJQUM5RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUNyRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRTtJQUNqRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRTtJQUNqRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRTtJQUN4RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRTtJQUN2RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRTtJQUMxRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUM5RCxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRTtJQUN2RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRTtJQUM5RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtJQUNwRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRTtJQUN2RSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUMvRCxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRTtJQUM3RCxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ3pFLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQ3JFLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFO0lBQy9ELEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFO0lBQ2hGLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDM0UsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDL0QsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFFL0QsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDbkUsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDbkUsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDL0QsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFDM0QsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUU7SUFDOUUsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUU7SUFDakYsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUU7SUFFbkUsOEVBQThFO0lBQzlFLFVBQVUsRUFBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRyxZQUFZLEVBQUUsWUFBWSxFQUFDO0lBQ3pFLFVBQVUsRUFBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRyxZQUFZLEVBQUUsY0FBYyxFQUFDO0lBQzNFLFVBQVUsRUFBQyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRyxZQUFZLEVBQUUsYUFBYSxFQUFDO0NBQzdFLENBQUMifQ==

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IConfig.js":
/*!**************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IConfig.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9fdHlwZXMvSUNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIn0=

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKey.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IGlobalKey.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUdsb2JhbEtleS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9fdHlwZXMvSUdsb2JhbEtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIn0=

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyDownMap.js":
/*!************************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyDownMap.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUdsb2JhbEtleURvd25NYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvX3R5cGVzL0lHbG9iYWxLZXlEb3duTWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIifQ==

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyEvent.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyEvent.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUdsb2JhbEtleUV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL190eXBlcy9JR2xvYmFsS2V5RXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyListener.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IGlobalKeyListener.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUdsb2JhbEtleUxpc3RlbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL190eXBlcy9JR2xvYmFsS2V5TGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/_types/IWindowsConfig.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/_types/IWindowsConfig.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVdpbmRvd3NDb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvX3R5cGVzL0lXaW5kb3dzQ29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIifQ==

/***/ }),

/***/ "./node_modules/node-global-key-listener/build/ts/isSpawnEventSupported.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/node-global-key-listener/build/ts/isSpawnEventSupported.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isSpawnEventSupported = void 0;
/**
 * Checks whether the spawn event of a process is supported (requires node version 15.1+)
 * @returns Whether spawn is supported
 */
function isSpawnEventSupported() {
    const nodeVersion = process.versions.node;
    const nums = nodeVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!nums)
        return false;
    const major = Number(nums[1]);
    const minor = Number(nums[2]);
    const spawnEventSupported = major > 15 || (major == 15 && minor >= 1);
    return spawnEventSupported;
}
exports.isSpawnEventSupported = isSpawnEventSupported;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNTcGF3bkV2ZW50U3VwcG9ydGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL2lzU3Bhd25FdmVudFN1cHBvcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7O0dBR0c7QUFDSCxTQUFnQixxQkFBcUI7SUFDakMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDMUMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RELElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFFeEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QixNQUFNLG1CQUFtQixHQUFHLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RSxPQUFPLG1CQUFtQixDQUFDO0FBQy9CLENBQUM7QUFURCxzREFTQyJ9

/***/ }),

/***/ "./node_modules/sudo-prompt/index.js":
/*!*******************************************!*\
  !*** ./node_modules/sudo-prompt/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Node = {
  child: __webpack_require__(/*! child_process */ "child_process"),
  crypto: __webpack_require__(/*! crypto */ "crypto"),
  fs: __webpack_require__(/*! fs */ "fs"),
  os: __webpack_require__(/*! os */ "os"),
  path: __webpack_require__(/*! path */ "path"),
  process: process,
  util: __webpack_require__(/*! util */ "util")
};

function Attempt(instance, end) {
  var platform = Node.process.platform;
  if (platform === 'darwin') return Mac(instance, end);
  if (platform === 'linux') return Linux(instance, end);
  if (platform === 'win32') return Windows(instance, end);
  end(new Error('Platform not yet supported.'));
}

function EscapeDoubleQuotes(string) {
  if (typeof string !== 'string') throw new Error('Expected a string.');
  return string.replace(/"/g, '\\"');
}

function Exec() {
  if (arguments.length < 1 || arguments.length > 3) {
    throw new Error('Wrong number of arguments.');
  }
  var command = arguments[0];
  var options = {};
  var end = function() {};
  if (typeof command !== 'string') {
    throw new Error('Command should be a string.');
  }
  if (arguments.length === 2) {
    if (Node.util.isObject(arguments[1])) {
      options = arguments[1];
    } else if (Node.util.isFunction(arguments[1])) {
      end = arguments[1];
    } else {
      throw new Error('Expected options or callback.');
    }
  } else if (arguments.length === 3) {
    if (Node.util.isObject(arguments[1])) {
      options = arguments[1];
    } else {
      throw new Error('Expected options to be an object.');
    }
    if (Node.util.isFunction(arguments[2])) {
      end = arguments[2];
    } else {
      throw new Error('Expected callback to be a function.');
    }
  }
  if (/^sudo/i.test(command)) {
    return end(new Error('Command should not be prefixed with "sudo".'));
  }
  if (typeof options.name === 'undefined') {
    var title = Node.process.title;
    if (ValidName(title)) {
      options.name = title;
    } else {
      return end(new Error('process.title cannot be used as a valid name.'));
    }
  } else if (!ValidName(options.name)) {
    var error = '';
    error += 'options.name must be alphanumeric only ';
    error += '(spaces are allowed) and <= 70 characters.';
    return end(new Error(error));
  }
  if (typeof options.icns !== 'undefined') {
    if (typeof options.icns !== 'string') {
      return end(new Error('options.icns must be a string if provided.'));
    } else if (options.icns.trim().length === 0) {
      return end(new Error('options.icns must not be empty if provided.'));
    }
  }
  if (typeof options.env !== 'undefined') {
    if (typeof options.env !== 'object') {
      return end(new Error('options.env must be an object if provided.'));
    } else if (Object.keys(options.env).length === 0) {
      return end(new Error('options.env must not be empty if provided.'));
    } else {
      for (var key in options.env) {
        var value = options.env[key];
        if (typeof key !== 'string' || typeof value !== 'string') {
          return end(
            new Error('options.env environment variables must be strings.')
          );
        }
        // "Environment variable names used by the utilities in the Shell and
        // Utilities volume of IEEE Std 1003.1-2001 consist solely of uppercase
        // letters, digits, and the '_' (underscore) from the characters defined
        // in Portable Character Set and do not begin with a digit. Other
        // characters may be permitted by an implementation; applications shall
        // tolerate the presence of such names."
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          return end(
            new Error(
              'options.env has an invalid environment variable name: ' +
              JSON.stringify(key)
            )
          );
        }
        if (/[\r\n]/.test(value)) {
          return end(
            new Error(
              'options.env has an invalid environment variable value: ' +
              JSON.stringify(value)
            )
          );
        }
      }
    }
  }
  var platform = Node.process.platform;
  if (platform !== 'darwin' && platform !== 'linux' && platform !== 'win32') {
    return end(new Error('Platform not yet supported.'));
  }
  var instance = {
    command: command,
    options: options,
    uuid: undefined,
    path: undefined
  };
  Attempt(instance, end);
}

function Linux(instance, end) {
  LinuxBinary(instance,
    function(error, binary) {
      if (error) return end(error);
      var command = [];
      // Preserve current working directory:
      command.push('cd "' + EscapeDoubleQuotes(Node.process.cwd()) + '";');
      // Export environment variables:
      for (var key in instance.options.env) {
        var value = instance.options.env[key];
        command.push('export ' + key + '="' + EscapeDoubleQuotes(value) + '";');
      }
      command.push('"' + EscapeDoubleQuotes(binary) + '"');
      if (/kdesudo/i.test(binary)) {
        command.push(
          '--comment',
          '"' + instance.options.name + ' wants to make changes. ' +
          'Enter your password to allow this."'
        );
        command.push('-d'); // Do not show the command to be run in the dialog.
        command.push('--');
      } else if (/pkexec/i.test(binary)) {
        command.push('--disable-internal-agent');
      }
      var magic = 'SUDOPROMPT\n';
      command.push(
        '/bin/bash -c "echo ' + EscapeDoubleQuotes(magic.trim()) + '; ' +
        EscapeDoubleQuotes(instance.command) +
        '"'
      );
      command = command.join(' ');
      Node.child.exec(command, { encoding: 'utf-8', maxBuffer: MAX_BUFFER },
        function(error, stdout, stderr) {
          // ISSUE 88:
          // We must distinguish between elevation errors and command errors.
          //
          // KDESUDO:
          // kdesudo provides no way to do this. We add a magic marker to know
          // if elevation succeeded. Any error thereafter is a command error.
          //
          // PKEXEC:
          // "Upon successful completion, the return value is the return value of
          // PROGRAM. If the calling process is not authorized or an
          // authorization could not be obtained through authentication or an
          // error occured, pkexec exits with a return value of 127. If the
          // authorization could not be obtained because the user dismissed the
          // authentication dialog, pkexec exits with a return value of 126."
          //
          // However, we do not rely on pkexec's return of 127 since our magic
          // marker is more reliable, and we already use it for kdesudo.
          var elevated = stdout && stdout.slice(0, magic.length) === magic;
          if (elevated) stdout = stdout.slice(magic.length);
          // Only normalize the error if it is definitely not a command error:
          // In other words, if we know that the command was never elevated.
          // We do not inspect error messages beyond NO_POLKIT_AGENT.
          // We cannot rely on English errors because of internationalization.
          if (error && !elevated) {
            if (/No authentication agent found/.test(stderr)) {
              error.message = NO_POLKIT_AGENT;
            } else {
              error.message = PERMISSION_DENIED;
            }
          }
          end(error, stdout, stderr);
        }
      );
    }
  );
}

function LinuxBinary(instance, end) {
  var index = 0;
  // We used to prefer gksudo over pkexec since it enabled a better prompt.
  // However, gksudo cannot run multiple commands concurrently.
  var paths = ['/usr/bin/kdesudo', '/usr/bin/pkexec'];
  function test() {
    if (index === paths.length) {
      return end(new Error('Unable to find pkexec or kdesudo.'));
    }
    var path = paths[index++];
    Node.fs.stat(path,
      function(error) {
        if (error) {
          if (error.code === 'ENOTDIR') return test();
          if (error.code === 'ENOENT') return test();
          end(error);
        } else {
          end(undefined, path);
        }
      }
    );
  }
  test();
}

function Mac(instance, callback) {
  var temp = Node.os.tmpdir();
  if (!temp) return callback(new Error('os.tmpdir() not defined.'));
  var user = Node.process.env.USER; // Applet shell scripts require $USER.
  if (!user) return callback(new Error('env[\'USER\'] not defined.'));
  UUID(instance,
    function(error, uuid) {
      if (error) return callback(error);
      instance.uuid = uuid;
      instance.path = Node.path.join(
        temp,
        instance.uuid,
        instance.options.name + '.app'
      );
      function end(error, stdout, stderr) {
        Remove(Node.path.dirname(instance.path),
          function(errorRemove) {
            if (error) return callback(error);
            if (errorRemove) return callback(errorRemove);
            callback(undefined, stdout, stderr);
          }
        );
      }
      MacApplet(instance,
        function(error, stdout, stderr) {
          if (error) return end(error, stdout, stderr);
          MacIcon(instance,
            function(error) {
              if (error) return end(error);
              MacPropertyList(instance,
                function(error, stdout, stderr) {
                  if (error) return end(error, stdout, stderr);
                  MacCommand(instance,
                    function(error) {
                      if (error) return end(error);
                      MacOpen(instance,
                        function(error, stdout, stderr) {
                          if (error) return end(error, stdout, stderr);
                          MacResult(instance, end);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

function MacApplet(instance, end) {
  var parent = Node.path.dirname(instance.path);
  Node.fs.mkdir(parent,
    function(error) {
      if (error) return end(error);
      var zip = Node.path.join(parent, 'sudo-prompt-applet.zip');
      Node.fs.writeFile(zip, APPLET, 'base64',
        function(error) {
          if (error) return end(error);
          var command = [];
          command.push('/usr/bin/unzip');
          command.push('-o'); // Overwrite any existing applet.
          command.push('"' + EscapeDoubleQuotes(zip) + '"');
          command.push('-d "' + EscapeDoubleQuotes(instance.path) + '"');
          command = command.join(' ');
          Node.child.exec(command, { encoding: 'utf-8' }, end);
        }
      );
    }
  );
}

function MacCommand(instance, end) {
  var path = Node.path.join(
    instance.path,
    'Contents',
    'MacOS',
    'sudo-prompt-command'
  );
  var script = [];
  // Preserve current working directory:
  // We do this for commands that rely on relative paths.
  // This runs in a subshell and will not change the cwd of sudo-prompt-script.
  script.push('cd "' + EscapeDoubleQuotes(Node.process.cwd()) + '"');
  // Export environment variables:
  for (var key in instance.options.env) {
    var value = instance.options.env[key];
    script.push('export ' + key + '="' + EscapeDoubleQuotes(value) + '"');
  }
  script.push(instance.command);
  script = script.join('\n');
  Node.fs.writeFile(path, script, 'utf-8', end);
}

function MacIcon(instance, end) {
  if (!instance.options.icns) return end();
  Node.fs.readFile(instance.options.icns,
    function(error, buffer) {
      if (error) return end(error);
      var icns = Node.path.join(
        instance.path,
        'Contents',
        'Resources',
        'applet.icns'
      );
      Node.fs.writeFile(icns, buffer, end);
    }
  );
}

function MacOpen(instance, end) {
  // We must run the binary directly so that the cwd will apply.
  var binary = Node.path.join(instance.path, 'Contents', 'MacOS', 'applet');
  // We must set the cwd so that the AppleScript can find the shell scripts.
  var options = {
    cwd: Node.path.dirname(binary),
    encoding: 'utf-8'
  };
  // We use the relative path rather than the absolute path. The instance.path
  // may contain spaces which the cwd can handle, but which exec() cannot.
  Node.child.exec('./' + Node.path.basename(binary), options, end);
}

function MacPropertyList(instance, end) {
  // Value must be in single quotes (not double quotes) according to man entry.
  // e.g. defaults write com.companyname.appname "Default Color" '(255, 0, 0)'
  // The defaults command will be changed in an upcoming major release to only
  // operate on preferences domains. General plist manipulation utilities will
  // be folded into a different command-line program.
  var plist = Node.path.join(instance.path, 'Contents', 'Info.plist');
  var path = EscapeDoubleQuotes(plist);
  var key = EscapeDoubleQuotes('CFBundleName');
  var value = instance.options.name + ' Password Prompt';
  if (/'/.test(value)) {
    return end(new Error('Value should not contain single quotes.'));
  }
  var command = [];
  command.push('/usr/bin/defaults');
  command.push('write');
  command.push('"' + path + '"');
  command.push('"' + key + '"');
  command.push("'" + value + "'"); // We must use single quotes for value.
  command = command.join(' ');
  Node.child.exec(command, { encoding: 'utf-8' }, end);
}

function MacResult(instance, end) {
  var cwd = Node.path.join(instance.path, 'Contents', 'MacOS');
  Node.fs.readFile(Node.path.join(cwd, 'code'), 'utf-8',
    function(error, code) {
      if (error) {
        if (error.code === 'ENOENT') return end(new Error(PERMISSION_DENIED));
        end(error);
      } else {
        Node.fs.readFile(Node.path.join(cwd, 'stdout'), 'utf-8',
          function(error, stdout) {
            if (error) return end(error);
            Node.fs.readFile(Node.path.join(cwd, 'stderr'), 'utf-8',
              function(error, stderr) {
                if (error) return end(error);
                code = parseInt(code.trim(), 10); // Includes trailing newline.
                if (code === 0) {
                  end(undefined, stdout, stderr);
                } else {
                  error = new Error(
                    'Command failed: ' + instance.command + '\n' + stderr
                  );
                  error.code = code;
                  end(error, stdout, stderr);
                }
              }
            );
          }
        );
      }
    }
  );
}

function Remove(path, end) {
  if (typeof path !== 'string' || !path.trim()) {
    return end(new Error('Argument path not defined.'));
  }
  var command = [];
  if (Node.process.platform === 'win32') {
    if (/"/.test(path)) {
      return end(new Error('Argument path cannot contain double-quotes.'));
    }
    command.push('rmdir /s /q "' + path + '"');
  } else {
    command.push('/bin/rm');
    command.push('-rf');
    command.push('"' + EscapeDoubleQuotes(Node.path.normalize(path)) + '"');
  }
  command = command.join(' ');
  Node.child.exec(command, { encoding: 'utf-8' }, end);
}

function UUID(instance, end) {
  Node.crypto.randomBytes(256,
    function(error, random) {
      if (error) random = Date.now() + '' + Math.random();
      var hash = Node.crypto.createHash('SHA256');
      hash.update('sudo-prompt-3');
      hash.update(instance.options.name);
      hash.update(instance.command);
      hash.update(random);
      var uuid = hash.digest('hex').slice(-32);
      if (!uuid || typeof uuid !== 'string' || uuid.length !== 32) {
        // This is critical to ensure we don't remove the wrong temp directory.
        return end(new Error('Expected a valid UUID.'));
      }
      end(undefined, uuid);
    }
  );
}

function ValidName(string) {
  // We use 70 characters as a limit to side-step any issues with Unicode
  // normalization form causing a 255 character string to exceed the fs limit.
  if (!/^[a-z0-9 ]+$/i.test(string)) return false;
  if (string.trim().length === 0) return false;
  if (string.length > 70) return false;
  return true;
}

function Windows(instance, callback) {
  var temp = Node.os.tmpdir();
  if (!temp) return callback(new Error('os.tmpdir() not defined.'));
  UUID(instance,
    function(error, uuid) {
      if (error) return callback(error);
      instance.uuid = uuid;
      instance.path = Node.path.join(temp, instance.uuid);
      if (/"/.test(instance.path)) {
        // We expect double quotes to be reserved on Windows.
        // Even so, we test for this and abort if they are present.
        return callback(
          new Error('instance.path cannot contain double-quotes.')
        );
      }
      instance.pathElevate = Node.path.join(instance.path, 'elevate.vbs');
      instance.pathExecute = Node.path.join(instance.path, 'execute.bat');
      instance.pathCommand = Node.path.join(instance.path, 'command.bat');
      instance.pathStdout = Node.path.join(instance.path, 'stdout');
      instance.pathStderr = Node.path.join(instance.path, 'stderr');
      instance.pathStatus = Node.path.join(instance.path, 'status');
      Node.fs.mkdir(instance.path,
        function(error) {
          if (error) return callback(error);
          function end(error, stdout, stderr) {
            Remove(instance.path,
              function(errorRemove) {
                if (error) return callback(error);
                if (errorRemove) return callback(errorRemove);
                callback(undefined, stdout, stderr);
              }
            );
          }
          WindowsWriteExecuteScript(instance,
            function(error) {
              if (error) return end(error);
              WindowsWriteCommandScript(instance,
                function(error) {
                  if (error) return end(error);
                  WindowsElevate(instance,
                    function(error, stdout, stderr) {
                      if (error) return end(error, stdout, stderr);
                      WindowsWaitForStatus(instance,
                        function(error) {
                          if (error) return end(error);
                          WindowsResult(instance, end);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

function WindowsElevate(instance, end) {
  // We used to use this for executing elevate.vbs:
  // var command = 'cscript.exe //NoLogo "' + instance.pathElevate + '"';
  var command = [];
  command.push('powershell.exe');
  command.push('Start-Process');
  command.push('-FilePath');
  // Escape characters for cmd using double quotes:
  // Escape characters for PowerShell using single quotes:
  // Escape single quotes for PowerShell using backtick:
  // See: https://ss64.com/ps/syntax-esc.html
  command.push('"\'' + instance.pathExecute.replace(/'/g, "`'") + '\'"');
  command.push('-WindowStyle hidden');
  command.push('-Verb runAs');
  command = command.join(' ');
  var child = Node.child.exec(command, { encoding: 'utf-8' },
    function(error, stdout, stderr) {
      // We used to return PERMISSION_DENIED only for error messages containing
      // the string 'canceled by the user'. However, Windows internationalizes
      // error messages (issue 96) so now we must assume all errors here are
      // permission errors. This seems reasonable, given that we already run the
      // user's command in a subshell.
      if (error) return end(new Error(PERMISSION_DENIED), stdout, stderr);
      end();
    }
  );
  child.stdin.end(); // Otherwise PowerShell waits indefinitely on Windows 7.
}

function WindowsResult(instance, end) {
  Node.fs.readFile(instance.pathStatus, 'utf-8',
    function(error, code) {
      if (error) return end(error);
      Node.fs.readFile(instance.pathStdout, 'utf-8',
        function(error, stdout) {
          if (error) return end(error);
          Node.fs.readFile(instance.pathStderr, 'utf-8',
            function(error, stderr) {
              if (error) return end(error);
              code = parseInt(code.trim(), 10);
              if (code === 0) {
                end(undefined, stdout, stderr);
              } else {
                error = new Error(
                  'Command failed: ' + instance.command + '\r\n' + stderr
                );
                error.code = code;
                end(error, stdout, stderr);
              }
            }
          );
        }
      );
    }
  );
}

function WindowsWaitForStatus(instance, end) {
  // VBScript cannot wait for the elevated process to finish so we have to poll.
  // VBScript cannot return error code if user does not grant permission.
  // PowerShell can be used to elevate and wait on Windows 10.
  // PowerShell can be used to elevate on Windows 7 but it cannot wait.
  // powershell.exe Start-Process cmd.exe -Verb runAs -Wait
  Node.fs.stat(instance.pathStatus,
    function(error, stats) {
      if ((error && error.code === 'ENOENT') || stats.size < 2) {
        // Retry if file does not exist or is not finished writing.
        // We expect a file size of 2. That should cover at least "0\r".
        // We use a 1 second timeout to keep a light footprint for long-lived
        // sudo-prompt processes.
        setTimeout(
          function() {
            // If administrator has no password and user clicks Yes, then
            // PowerShell returns no error and execute (and command) never runs.
            // We check that command output has been redirected to stdout file:
            Node.fs.stat(instance.pathStdout,
              function(error) {
                if (error) return end(new Error(PERMISSION_DENIED));
                WindowsWaitForStatus(instance, end);
              }
            );
          },
          1000
        );
      } else if (error) {
        end(error);
      } else {
        end();
      }
    }
  );
}

function WindowsWriteCommandScript(instance, end) {
  var cwd = Node.process.cwd();
  if (/"/.test(cwd)) {
    // We expect double quotes to be reserved on Windows.
    // Even so, we test for this and abort if they are present.
    return end(new Error('process.cwd() cannot contain double-quotes.'));
  }
  var script = [];
  script.push('@echo off');
  // Set code page to UTF-8:
  script.push('chcp 65001>nul');
  // Preserve current working directory:
  // We pass /d as an option in case the cwd is on another drive (issue 70).
  script.push('cd /d "' + cwd + '"');
  // Export environment variables:
  for (var key in instance.options.env) {
    // "The characters <, >, |, &, ^ are special command shell characters, and
    // they must be preceded by the escape character (^) or enclosed in
    // quotation marks. If you use quotation marks to enclose a string that
    // contains one of the special characters, the quotation marks are set as
    // part of the environment variable value."
    // In other words, Windows assigns everything that follows the equals sign
    // to the value of the variable, whereas Unix systems ignore double quotes.
    var value = instance.options.env[key];
    script.push('set ' + key + '=' + value.replace(/([<>\\|&^])/g, '^$1'));
  }
  script.push(instance.command);
  script = script.join('\r\n');
  Node.fs.writeFile(instance.pathCommand, script, 'utf-8', end);
}

function WindowsWriteElevateScript(instance, end) {
  // We do not use VBScript to elevate since it does not return an error if
  // the user does not grant permission. This is here for reference.
  // var script = [];
  // script.push('Set objShell = CreateObject("Shell.Application")');
  // script.push(
  // 'objShell.ShellExecute "' + instance.pathExecute + '", "", "", "runas", 0'
  // );
  // script = script.join('\r\n');
  // Node.fs.writeFile(instance.pathElevate, script, 'utf-8', end);
}

function WindowsWriteExecuteScript(instance, end) {
  var script = [];
  script.push('@echo off');
  script.push(
    'call "' + instance.pathCommand + '"' +
    ' > "' + instance.pathStdout + '" 2> "' + instance.pathStderr + '"'
  );
  script.push('(echo %ERRORLEVEL%) > "' + instance.pathStatus + '"');
  script = script.join('\r\n');
  Node.fs.writeFile(instance.pathExecute, script, 'utf-8', end);
}

module.exports.exec = Exec;

// We used to expect that applet.app would be included with this module.
// This could not be copied when sudo-prompt was packaged within an asar file.
// We now store applet.app as a zip file in base64 within index.js instead.
// To recreate: "zip -r ../applet.zip Contents" (with applet.app as CWD).
// The zip file must not include applet.app as the root directory so that we
// can extract it directly to the target app directory.
var APPLET = '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';

var PERMISSION_DENIED = 'User did not grant permission.';
var NO_POLKIT_AGENT = 'No polkit authentication agent found.';

// See issue 66:
var MAX_BUFFER = 134217728;


/***/ }),

/***/ "./src/main/new/context-menu-manager.ts":
/*!**********************************************!*\
  !*** ./src/main/new/context-menu-manager.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContextMenuManager = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const constants_1 = __webpack_require__(/*! ../../shared/new/constants */ "./src/shared/new/constants.ts");
class ContextMenuManager {
    timerWindowManager;
    constructor({ timerWindowManager }) {
        this.timerWindowManager = timerWindowManager;
        electron_1.ipcMain.on(constants_1.EventName.SHOW_CONTEXT_MENU, this.createContextMenu);
    }
    createContextMenu = ({ sender }) => {
        const { id } = sender;
        const timerWindow = this.timerWindowManager.get(id);
        if (!timerWindow) {
            return;
        }
        const menuTemplate = [];
        menuTemplate.push({ role: "close" });
        const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
        menu.popup({ window: timerWindow.browserWindow });
    };
}
exports.ContextMenuManager = ContextMenuManager;


/***/ }),

/***/ "./src/main/new/index.ts":
/*!*******************************!*\
  !*** ./src/main/new/index.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const electron_1 = __webpack_require__(/*! electron */ "electron");
const electron_squirrel_startup_1 = __importDefault(__webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js"));
const context_menu_manager_1 = __webpack_require__(/*! ./context-menu-manager */ "./src/main/new/context-menu-manager.ts");
const security_manager_1 = __webpack_require__(/*! ./security-manager */ "./src/main/new/security-manager.ts");
const timer_window_manager_1 = __webpack_require__(/*! ./timer-window-manager */ "./src/main/new/timer-window-manager.ts");
if (electron_squirrel_startup_1.default) {
    electron_1.app.quit();
    process.exit(0);
}
const main = async () => {
    await electron_1.app.whenReady();
    new security_manager_1.SecurityManager();
    const timerWindowManager = new timer_window_manager_1.TimerWindowManager();
    new context_menu_manager_1.ContextMenuManager({
        timerWindowManager
    });
    // // await State.initialize();
    // new ContextMenuManager();
    // new KeyBindingsManager();
    // State.setInstance(new Instance());
};
main();


/***/ }),

/***/ "./src/main/new/security-manager.ts":
/*!******************************************!*\
  !*** ./src/main/new/security-manager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SecurityManager = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
class SecurityManager {
    constructor() {
        this.applyHeaders();
    }
    applyHeaders() {
        electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    "Content-Security-Policy": ["default-src 'self'"]
                }
            });
        });
    }
}
exports.SecurityManager = SecurityManager;


/***/ }),

/***/ "./src/main/new/timer-window-manager.ts":
/*!**********************************************!*\
  !*** ./src/main/new/timer-window-manager.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerWindowManager = void 0;
const timer_window_1 = __webpack_require__(/*! ./timer-window */ "./src/main/new/timer-window.ts");
class TimerWindowManager {
    windows = new Map();
    constructor() {
        const testWindow = new timer_window_1.TimerWindow({ title: "Test Timer" });
        this.windows.set(testWindow.id, testWindow);
    }
    get(id) {
        return this.windows.get(id);
    }
}
exports.TimerWindowManager = TimerWindowManager;


/***/ }),

/***/ "./src/main/new/timer-window.ts":
/*!**************************************!*\
  !*** ./src/main/new/timer-window.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerWindow = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const node_global_key_listener_1 = __webpack_require__(/*! node-global-key-listener */ "./node_modules/node-global-key-listener/build/index.js");
const node_path_1 = __importDefault(__webpack_require__(/*! node:path */ "node:path"));
const application_1 = __webpack_require__(/*! ../../shared/new/application */ "./src/shared/new/application.ts");
const constants_1 = __webpack_require__(/*! ../../shared/new/constants */ "./src/shared/new/constants.ts");
class TimerWindow {
    static WM_MOUSEMOVE = 0x0200;
    static WM_LBUTTONUP = 0x0202;
    static MK_LBUTTON = 0x0001;
    static GlobalKeyboardListener = new node_global_key_listener_1.GlobalKeyboardListener();
    browserWindow;
    loaded = false;
    resizeable = false;
    dragPosition = {
        x: 0,
        y: 0,
        height: 0,
        width: 0
    };
    constructor({ title }) {
        this.browserWindow = new electron_1.BrowserWindow({
            height: 200,
            width: 200,
            transparent: true,
            frame: false,
            icon: node_path_1.default.join(__dirname, "../renderer/icon.png"),
            alwaysOnTop: true,
            maximizable: false,
            fullscreenable: false,
            title,
            webPreferences: {
                devTools: true,
                nodeIntegration: true,
                preload: node_path_1.default.join(__dirname, "../renderer/aaaaaaaaa.js")
            }
        });
        if (application_1.Application) {
            this.browserWindow.webContents.openDevTools({
                mode: "detach",
                title: `${title} Debugger`
            });
        }
        this.browserWindow.setAspectRatio(1);
        this.browserWindow.loadFile("./dist/renderer/index.html");
        this.browserWindow.webContents.once("did-finish-load", () => {
            this.loaded = true;
        });
        this.browserWindow.on("will-resize", this.conditionalPreventResize);
        this.makeDraggable();
        TimerWindow.GlobalKeyboardListener.addListener(this.forwardGlobalKeyPress);
    }
    get id() {
        return this.browserWindow.webContents.id;
    }
    conditionalPreventResize = (event) => {
        if (!this.resizeable) {
            event.preventDefault();
        }
    };
    makeDraggable() {
        let dragging = false;
        this.browserWindow.hookWindowMessage(TimerWindow.WM_LBUTTONUP, () => {
            dragging = false;
        });
        this.browserWindow.hookWindowMessage(TimerWindow.WM_MOUSEMOVE, (wParam, lParam) => {
            if (!this.browserWindow) {
                return;
            }
            const wParamNumber = wParam.readInt16LE(0);
            const leftMousePressed = wParamNumber & TimerWindow.MK_LBUTTON;
            if (!leftMousePressed) {
                return;
            }
            const x = lParam.readInt16LE(0);
            const y = lParam.readInt16LE(2);
            const bounds = this.browserWindow.getBounds();
            if (!dragging) {
                dragging = true;
                this.dragPosition.x = x;
                this.dragPosition.y = y;
                this.dragPosition.height = bounds.height;
                this.dragPosition.width = bounds.width;
                return;
            }
            const currentPosition = this.browserWindow.getPosition();
            this.browserWindow.setBounds({
                x: x + currentPosition[0] - this.dragPosition.x,
                y: y + currentPosition[1] - this.dragPosition.y,
                height: this.dragPosition.height,
                width: this.dragPosition.width
            });
        });
    }
    forwardGlobalKeyPress = ({ name, state }) => {
        if (!this.loaded) {
            return;
        }
        this.browserWindow.webContents.send(constants_1.EventName.KEY_PRESS, {
            key: name,
            state
        });
    };
}
exports.TimerWindow = TimerWindow;


/***/ }),

/***/ "./src/shared/new/application.ts":
/*!***************************************!*\
  !*** ./src/shared/new/application.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Application = void 0;
class Application {
    static debug = process.argv.includes("--with-dev-tools");
}
exports.Application = Application;


/***/ }),

/***/ "./src/shared/new/constants.ts":
/*!*************************************!*\
  !*** ./src/shared/new/constants.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventName = void 0;
var EventName;
(function (EventName) {
    EventName["KEY_PRESS"] = "keypress";
    EventName["SHOW_CONTEXT_MENU"] = "showcontextmenu";
})(EventName || (exports.EventName = EventName = {}));


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!***************************!*\
  !*** ./src/main/index.ts ***!
  \***************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
// delete later
__webpack_require__(/*! ./new */ "./src/main/new/index.ts");

})();

/******/ })()
;
//# sourceMappingURL=index.js.map