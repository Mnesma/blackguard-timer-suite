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

/***/ "./src/main/bgscript-parser.ts":
/*!*************************************!*\
  !*** ./src/main/bgscript-parser.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bgscript = void 0;
const constants_1 = __webpack_require__(/*! ../shared/constants */ "./src/shared/constants.ts");
const parser_combinators_1 = __webpack_require__(/*! ./parser-combinators */ "./src/main/parser-combinators.ts");
const titleTag = Symbol("title");
const keyBindingTag = Symbol("keyBinding");
const countdownTag = Symbol("countdown");
const timeTag = Symbol("time");
class Primitive {
    static Text = (0, parser_combinators_1.literal)(/^[^\s(),:]+/);
    static Name = (0, parser_combinators_1.literal)(/^([^\s(),]|( |\t))+/);
    static Spacing = (0, parser_combinators_1.literal)(/^( |\t)+/);
    static Indent = (0, parser_combinators_1.literal)(/^( ){4}|\t/).dispose();
    static Time = (0, parser_combinators_1.sequence)((0, parser_combinators_1.literal)(/^[0-9]{1,2}/).map(parser_combinators_1.toNumber), (0, parser_combinators_1.join)("", (0, parser_combinators_1.literal)(":").dispose(), (0, parser_combinators_1.literal)(/^[0-9]{2}/)).map(parser_combinators_1.toNumber))
        .map(([minutes, seconds]) => (minutes * constants_1.minute + seconds * constants_1.second))
        .map((0, parser_combinators_1.tag)(timeTag));
}
const GenericAction = (0, parser_combinators_1.compact)(Primitive.Text.onFail("An action must have a valid method"), (0, parser_combinators_1.maybe)((0, parser_combinators_1.sequence)(Primitive.Spacing.dispose().onFail("Expected spacing between method and parameters"), (0, parser_combinators_1.seperated)(Primitive.Text, Primitive.Spacing))), (0, parser_combinators_1.maybe)(Primitive.Spacing).dispose(), (0, parser_combinators_1.choice)(parser_combinators_1.lineBreaks.dispose(), parser_combinators_1.end).onFail("Expected line break or end of file"))
    .map(([method, params]) => ({
    method,
    params
}));
class KeyBinding {
    static Operator = (0, parser_combinators_1.literal)("#").dispose();
    static Definition = (0, parser_combinators_1.compact)(Primitive.Spacing.dispose().onFail("Expected spacing operator and key code"), Primitive.Text.onFail("Invalid key code"), Primitive.Spacing.dispose().onFail("Expected spacing between key code and binding name"), (0, parser_combinators_1.trim)(Primitive.Name).onFail("Invalid key binding name"), (0, parser_combinators_1.maybe)(Primitive.Spacing).dispose(), parser_combinators_1.lineBreaks.dispose().onFail("Expected line break"))
        .map(([key, name]) => ({
        key,
        name
    }));
    static Parser = (0, parser_combinators_1.flatten)((0, parser_combinators_1.compact)(KeyBinding.Operator, (0, parser_combinators_1.required)((0, parser_combinators_1.sequence)(KeyBinding.Definition, (0, parser_combinators_1.some)((0, parser_combinators_1.branch)(Primitive.Indent, (0, parser_combinators_1.required)(GenericAction))).onFail("Could not find key binding actions")))))
        .map(([definition, actions]) => ({ definition, actions }))
        .map((0, parser_combinators_1.tag)(keyBindingTag));
}
class Countdown {
    static Operator = (0, parser_combinators_1.literal)(">").dispose();
    static ActionOperator = (0, parser_combinators_1.literal)("@");
    static Definition = (0, parser_combinators_1.compact)(Primitive.Spacing.dispose().onFail("Expected spacing between operator and countdown name"), Primitive.Text.onFail("Invalid countdown name"), (0, parser_combinators_1.maybe)(Primitive.Spacing).dispose(), parser_combinators_1.lineBreaks.dispose().onFail("Expected line break"))
        .map(([name]) => ({ name }));
    static Action = (0, parser_combinators_1.compact)(Primitive.Spacing.dispose().onFail("Expected spacing between operator and time"), (0, parser_combinators_1.choice)(Primitive.Time, Primitive.Text).onFail("Invalid time value"), Primitive.Spacing.dispose().onFail("Expected spacing between time and method"), Primitive.Text.onFail("An action must have a valid method"), (0, parser_combinators_1.maybe)(Primitive.Spacing).dispose(), (0, parser_combinators_1.seperated)(Primitive.Text, Primitive.Spacing), (0, parser_combinators_1.maybe)(Primitive.Spacing).dispose(), (0, parser_combinators_1.choice)(parser_combinators_1.lineBreaks.dispose(), parser_combinators_1.end).onFail("Expected line break or end of file"))
        .map(([method, time, params]) => ({
        method,
        time,
        params
    }));
    static Parser = (0, parser_combinators_1.flatten)((0, parser_combinators_1.compact)(Countdown.Operator, (0, parser_combinators_1.required)((0, parser_combinators_1.sequence)(Countdown.Definition, (0, parser_combinators_1.some)((0, parser_combinators_1.branch)((0, parser_combinators_1.sequence)(Primitive.Indent, Countdown.ActionOperator), (0, parser_combinators_1.required)(Countdown.Action))).onFail("Could not find countdown actions")))))
        .map(([definition, actions]) => ({ definition, actions }))
        .map((0, parser_combinators_1.tag)(countdownTag));
}
class Bgscript {
    static Parser = (0, parser_combinators_1.compact)((0, parser_combinators_1.maybe)(parser_combinators_1.whiteSpaces).dispose(), (0, parser_combinators_1.trim)(Primitive.Name).map((0, parser_combinators_1.tag)(titleTag)).onFail("A valid title is required"), (0, parser_combinators_1.maybe)(parser_combinators_1.whiteSpaces).dispose(), (0, parser_combinators_1.seperated)((0, parser_combinators_1.choice)(KeyBinding.Parser, Countdown.Parser), (0, parser_combinators_1.maybe)(parser_combinators_1.whiteSpaces)))
        .map(([title, body]) => {
        const parsedScript = {
            title,
            countdowns: [],
            keyBindings: []
        };
        for (const block of body) {
            switch (block.tag) {
                case countdownTag:
                    parsedScript.countdowns.push(block.value);
                    break;
                case keyBindingTag:
                    parsedScript.keyBindings.push(block.value);
                    break;
            }
        }
        return parsedScript;
    });
}
exports.Bgscript = Bgscript;


/***/ }),

/***/ "./src/main/context-menu-manager.ts":
/*!******************************************!*\
  !*** ./src/main/context-menu-manager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContextMenuManager = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const constants_1 = __webpack_require__(/*! ../shared/constants */ "./src/shared/constants.ts");
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

/***/ "./src/main/file-manager.ts":
/*!**********************************!*\
  !*** ./src/main/file-manager.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileManager = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const promises_1 = __importDefault(__webpack_require__(/*! node:fs/promises */ "node:fs/promises"));
const node_path_1 = __importDefault(__webpack_require__(/*! node:path */ "node:path"));
class FileManager {
    static userDataPath = electron_1.app.getPath("userData");
    static myDocumentsPath = electron_1.app.getPath("documents");
    async saveJson(filePath, json) {
        try {
            await this.saveFile(filePath, JSON.stringify(json));
        }
        catch (error) {
            console.error(`Failed to save json at: ${filePath}`, error);
        }
    }
    async saveFile(filePath, contents) {
        try {
            await promises_1.default.writeFile(filePath, contents);
        }
        catch (error) {
            console.error(`Failed to save file at: ${filePath}`, error);
        }
    }
    async loadJson(filePath) {
        const loadedFile = await this.loadFile(filePath);
        if (loadedFile.contents !== null) {
            try {
                const loadedJson = {
                    ...loadedFile,
                    contents: JSON.parse(loadedFile.contents)
                };
                return loadedJson;
            }
            catch (error) {
                console.error(`Failed to load json at: ${filePath}`, error);
            }
        }
        return loadedFile;
    }
    async loadFile(filePath) {
        const file = {
            contents: null,
            createTime: null,
            lastUpdateTime: null
        };
        try {
            const stats = await promises_1.default.stat(filePath);
            const fileContents = await promises_1.default.readFile(filePath, {
                encoding: "utf8"
            });
            file.contents = fileContents;
            file.createTime = stats.birthtimeMs;
            file.lastUpdateTime = stats.mtimeMs;
        }
        catch (error) {
            console.error(`Failed to load file at: ${filePath}`, error);
        }
        return file;
    }
    async loadFiles(dirPath) {
        const loadedFiles = [];
        try {
            const fileNames = await promises_1.default.readdir(dirPath);
            for (const fileName of fileNames) {
                const filePath = node_path_1.default.join(dirPath, fileName);
                loadedFiles.push(this.loadFile(filePath));
            }
        }
        catch (error) {
            console.error(`Failed to load all files from: ${dirPath}`, error);
        }
        return Promise.all(loadedFiles);
    }
}
exports.FileManager = FileManager;


/***/ }),

/***/ "./src/main/index.ts":
/*!***************************!*\
  !*** ./src/main/index.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const electron_1 = __webpack_require__(/*! electron */ "electron");
const electron_squirrel_startup_1 = __importDefault(__webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js"));
const context_menu_manager_1 = __webpack_require__(/*! ./context-menu-manager */ "./src/main/context-menu-manager.ts");
const file_manager_1 = __webpack_require__(/*! ./file-manager */ "./src/main/file-manager.ts");
const security_manager_1 = __webpack_require__(/*! ./security-manager */ "./src/main/security-manager.ts");
const timer_manager_1 = __webpack_require__(/*! ./timer-manager */ "./src/main/timer-manager.ts");
const timer_window_manager_1 = __webpack_require__(/*! ./timer-window-manager */ "./src/main/timer-window-manager.ts");
if (electron_squirrel_startup_1.default) {
    electron_1.app.quit();
    process.exit(0);
}
const main = async () => {
    await electron_1.app.whenReady();
    new security_manager_1.SecurityManager();
    const fileManager = new file_manager_1.FileManager();
    const timerWindowManager = new timer_window_manager_1.TimerWindowManager();
    new context_menu_manager_1.ContextMenuManager({
        timerWindowManager
    });
    const timerManager = new timer_manager_1.TimerManager({
        fileManager
    });
    await timerManager.init();
    // // await State.initialize();
    // new ContextMenuManager();
    // new KeyBindingsManager();
    // State.setInstance(new Instance());
};
main();


/***/ }),

/***/ "./src/main/parser-combinators.ts":
/*!****************************************!*\
  !*** ./src/main/parser-combinators.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tag = exports.toNumber = exports.end = exports.whiteSpaces = exports.lineBreaks = exports.digits = exports.digit = exports.letters = exports.letter = exports.branch = exports.required = exports.compact = exports.flatten = exports.join = exports.trim = exports.seperated = exports.choice = exports.some = exports.maybe = exports.sequence = exports.has = exports.literal = exports.Parser = exports.StateStatus = void 0;
var StateStatus;
(function (StateStatus) {
    StateStatus["Good"] = "good";
    StateStatus["Bad"] = "bad";
    StateStatus["Fatal"] = "fatal";
})(StateStatus || (exports.StateStatus = StateStatus = {}));
class ParseError extends Error {
    description;
    state;
    constructor(description, state) {
        super();
        this.description = description;
        this.state = state;
    }
    get message() {
        const { offset, source } = this.state;
        const { targetLine, lineNumber, lineOffset } = this.getTargetLine(source, offset);
        const lineNumberSeperatorSpacing = 3;
        return this.description + "\n"
            + `${lineNumber} | ${targetLine}` + "\n"
            + "^".padStart(lineOffset + `${lineNumber}`.length
                + lineNumberSeperatorSpacing + 1);
    }
    getTargetLine(source, offset) {
        const lines = source.split(/(\r\n|\r|\n)/);
        let currentOffset = 0;
        let lineNumber = 0;
        let targetLine = null;
        for (const line of lines) {
            currentOffset += line.length;
            if (currentOffset >= offset) {
                targetLine = line;
                break;
            }
            lineNumber++;
        }
        if (targetLine === null) {
            throw new Error("Failed to find invalid line");
        }
        return {
            targetLine,
            lineNumber,
            lineOffset: targetLine.length - (currentOffset - offset)
        };
    }
}
class Parser {
    transforms = [];
    onFailTransformer = null;
    constructor(transformer, onFail) {
        if (Array.isArray(transformer)) {
            this.transforms.push(...transformer);
        }
        else {
            this.transforms.push(transformer);
        }
        if (onFail) {
            this.onFailTransformer = onFail;
        }
    }
    parse(sourceOrState) {
        if (typeof sourceOrState === "string") {
            return this.parseWithState({
                offset: 0,
                result: null,
                source: sourceOrState,
                status: StateStatus.Good,
                error: null
            });
        }
        return this.parseWithState(sourceOrState);
    }
    map(callback) {
        return new Parser([
            ...this.transforms,
            (initialState) => {
                if (initialState.status !== StateStatus.Good) {
                    return initialState;
                }
                return {
                    ...initialState,
                    result: callback(initialState.result)
                };
            }
        ]);
    }
    dispose() {
        return this.map(() => null);
    }
    onFail(newErrorMessage) {
        return new Parser(this.transforms, (state) => {
            if (state.error === null || state.status === StateStatus.Good) {
                return state;
            }
            if (typeof newErrorMessage === "string") {
                state.error.description = newErrorMessage;
            }
            else {
                state.error.description = newErrorMessage(state);
            }
            return state;
        });
    }
    parseWithState(state) {
        let nextState = state;
        for (const transform of this.transforms) {
            nextState = transform(nextState);
        }
        if (this.onFailTransformer) {
            nextState = this.onFailTransformer(nextState);
        }
        if (nextState.status === StateStatus.Fatal) {
            throw nextState.error;
        }
        return nextState;
    }
}
exports.Parser = Parser;
const literal = (literal) => new Parser((initialState) => {
    const { offset, source } = initialState;
    const target = source.slice(offset);
    if (typeof literal === "string") {
        if (target.startsWith(literal)) {
            return {
                ...initialState,
                offset: offset + literal.length,
                result: literal,
                status: StateStatus.Good,
                error: null
            };
        }
        else {
            return {
                ...initialState,
                result: null,
                status: StateStatus.Bad,
                error: new ParseError(`Could not find pattern: "${literal}"`, initialState)
            };
        }
    }
    const matches = target.match(literal);
    if (matches) {
        const result = matches[0];
        return {
            ...initialState,
            offset: offset + result.length,
            result,
            status: StateStatus.Good,
            error: null
        };
    }
    return {
        ...initialState,
        status: StateStatus.Bad,
        result: null,
        error: new ParseError(`Could not find pattern: "${literal}"`, initialState)
    };
});
exports.literal = literal;
const has = (literal) => new Parser((initialState) => {
    const { offset, source } = initialState;
    const target = source.slice(offset);
    if (typeof literal === "string") {
        if (target.startsWith(literal)) {
            return {
                ...initialState,
                result: literal,
                status: StateStatus.Good,
                error: null
            };
        }
        else {
            return {
                ...initialState,
                result: null,
                status: StateStatus.Bad,
                error: new ParseError(`Could not find pattern: "${literal}"`, initialState)
            };
        }
    }
    const matches = target.match(literal);
    if (matches) {
        const result = matches[0];
        return {
            ...initialState,
            result,
            status: StateStatus.Good,
            error: null
        };
    }
    return {
        ...initialState,
        status: StateStatus.Bad,
        result: null,
        error: new ParseError(`Could not find pattern: "${literal}"`, initialState)
    };
});
exports.has = has;
const sequence = (...parsers) => new Parser((initialState) => {
    const result = [];
    let nextState = initialState;
    for (const parser of parsers) {
        nextState = parser.parse(nextState);
        if (nextState.status === StateStatus.Good) {
            result.push(nextState.result);
        }
        else {
            return nextState;
        }
    }
    return {
        ...nextState,
        result,
        status: StateStatus.Good,
        error: null
    };
});
exports.sequence = sequence;
const maybe = (parser) => new Parser((initialState) => {
    const nextState = parser.parse(initialState);
    return {
        ...nextState,
        status: StateStatus.Good,
        error: null
    };
});
exports.maybe = maybe;
const some = (parser) => new Parser((initialState) => {
    let nextState = initialState;
    const result = [];
    while (true) {
        nextState = parser.parse(nextState);
        if (nextState.status === StateStatus.Good) {
            result.push(nextState.result);
        }
        else {
            break;
        }
    }
    if (result.length === 0) {
        return {
            ...nextState,
            result: null,
            status: StateStatus.Bad,
            error: new ParseError(`Could not find some ${parser}`, nextState)
        };
    }
    return {
        ...nextState,
        result,
        status: StateStatus.Good,
        error: null
    };
});
exports.some = some;
const choice = (...parsers) => new Parser((initialState) => {
    for (const parser of parsers) {
        const newState = parser.parse(initialState);
        if (newState.status === StateStatus.Good) {
            return newState;
        }
    }
    return {
        ...initialState,
        result: null,
        status: StateStatus.Bad,
        error: new ParseError("No valid choice provided", initialState)
    };
});
exports.choice = choice;
const seperated = (tokenParser, seperatorParser) => new Parser((initialState) => {
    const result = [];
    let nextState = initialState;
    while (true) {
        nextState = tokenParser.parse(nextState);
        if (nextState.status === StateStatus.Good) {
            result.push(nextState.result);
        }
        else {
            break;
        }
        nextState = seperatorParser.parse(nextState);
        if (nextState.status === StateStatus.Bad) {
            break;
        }
    }
    return {
        ...nextState,
        result,
        status: StateStatus.Good,
        error: null
    };
});
exports.seperated = seperated;
const trim = (parser) => new Parser((initialState) => {
    const newState = parser.parse(initialState);
    if (newState.status === StateStatus.Good
        && typeof newState.result === "string") {
        newState.result = newState.result.trim();
    }
    return newState;
});
exports.trim = trim;
const join = (seperator, ...parsers) => new Parser((initialState) => {
    const newState = (0, exports.sequence)(...parsers).parse(initialState);
    if (newState.status === StateStatus.Good
        && Array.isArray(newState.result)) {
        newState.result = newState.result.join(seperator);
    }
    return newState;
});
exports.join = join;
const flatten = (parser) => new Parser((initialState) => {
    const newState = parser.parse(initialState);
    if (newState.status === StateStatus.Good) {
        newState.result = [newState.result].flat(Infinity);
    }
    return newState;
});
exports.flatten = flatten;
const compact = (...parsers) => new Parser((initialState) => {
    const newState = (0, exports.sequence)(...parsers).parse(initialState);
    const results = [];
    if (newState.status === StateStatus.Good
        && Array.isArray(newState.result)) {
        for (const result of newState.result) {
            if (!!result) {
                results.push(result);
            }
        }
    }
    else {
        return newState;
    }
    return {
        ...newState,
        result: results
    };
});
exports.compact = compact;
const required = (parser) => new Parser((initialState) => {
    const newState = parser.parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            status: StateStatus.Fatal
        };
    }
    return newState;
});
exports.required = required;
const branch = (condition, trueBranch, falseBranch) => new Parser((initialState) => {
    let nextState = condition.parse(initialState);
    const passes = nextState.status === StateStatus.Good;
    if (passes) {
        return trueBranch.parse(nextState);
    }
    else if (falseBranch) {
        return falseBranch.parse(initialState);
    }
    return {
        ...initialState,
        result: null,
        status: StateStatus.Bad,
        error: new ParseError("No false branch provided", initialState)
    };
});
exports.branch = branch;
const letterRegex = /^[a-zA-Z]{1}/;
exports.letter = new Parser((initialState) => {
    try {
        return (0, exports.literal)(letterRegex).parse(initialState);
    }
    catch {
        throw new ParseError("Invalid letter", initialState);
    }
});
const lettersRegex = /^[a-zA-Z]+/;
exports.letters = new Parser((initialState) => {
    const newState = (0, exports.literal)(lettersRegex).parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid letters", initialState)
        };
    }
    return newState;
});
const digitRegex = /^[0-9]{1}/;
exports.digit = new Parser((initialState) => {
    const newState = (0, exports.literal)(digitRegex).parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid digit", initialState)
        };
    }
    return newState;
});
const digitsRegex = /^[0-9]+/;
exports.digits = new Parser((initialState) => {
    const newState = (0, exports.literal)(digitsRegex).parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid digits", initialState)
        };
    }
    return newState;
});
const lineBreaksRegex = /^(\r\n|\r|\n)+/;
exports.lineBreaks = new Parser((initialState) => {
    const newState = (0, exports.literal)(lineBreaksRegex).parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid line breaks", initialState)
        };
    }
    return newState;
});
const whiteSpacesRegex = /^\s+/;
exports.whiteSpaces = new Parser((initialState) => {
    const newState = (0, exports.literal)(whiteSpacesRegex).parse(initialState);
    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid white spaces", initialState)
        };
    }
    return newState;
});
exports.end = new Parser((initialState) => {
    const { offset, source } = initialState;
    const target = source.slice(offset);
    if (target === "") {
        return {
            ...initialState,
            result: null,
            error: null,
            status: StateStatus.Good
        };
    }
    return {
        ...initialState,
        result: null,
        error: new ParseError("Expected end of input", initialState),
        status: StateStatus.Bad
    };
});
const toNumber = (result) => Number(result);
exports.toNumber = toNumber;
const tag = (tag) => (result) => ({
    tag,
    value: result
});
exports.tag = tag;


/***/ }),

/***/ "./src/main/security-manager.ts":
/*!**************************************!*\
  !*** ./src/main/security-manager.ts ***!
  \**************************************/
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

/***/ "./src/main/timer-manager.ts":
/*!***********************************!*\
  !*** ./src/main/timer-manager.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerManager = void 0;
const node_path_1 = __importDefault(__webpack_require__(/*! node:path */ "node:path"));
const bgscript_parser_1 = __webpack_require__(/*! ./bgscript-parser */ "./src/main/bgscript-parser.ts");
const file_manager_1 = __webpack_require__(/*! ./file-manager */ "./src/main/file-manager.ts");
const parser_combinators_1 = __webpack_require__(/*! ./parser-combinators */ "./src/main/parser-combinators.ts");
class TimerManager {
    static cachePath = node_path_1.default.join(file_manager_1.FileManager.userDataPath, "/timer-cache.json");
    static timersPath = node_path_1.default.join(__dirname, "../../timers");
    fileManager;
    timers = [];
    constructor({ fileManager }) {
        this.fileManager = fileManager;
    }
    async init() {
    }
    async getTimerCache() {
    }
    async getTimerSource() {
        const timerSources = await this.fileManager.loadFiles(TimerManager.timersPath);
        for (const source of timerSources) {
            if (source.contents === null) {
                continue;
            }
            const parsedTimer = bgscript_parser_1.Bgscript.Parser.parse(source.contents);
            if (parsedTimer.status === parser_combinators_1.StateStatus.Fatal) {
                throw parsedTimer.error;
            }
            if (typeof parsedTimer.result !== "object"
                || parsedTimer.result === null) {
                throw new Error(`Expected parser result to be an object. Instead recieved: ${JSON.stringify(parsedTimer.result)}`);
            }
            this.timers.push(parsedTimer.result);
        }
    }
}
exports.TimerManager = TimerManager;


/***/ }),

/***/ "./src/main/timer-window-manager.ts":
/*!******************************************!*\
  !*** ./src/main/timer-window-manager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerWindowManager = void 0;
const timer_window_1 = __webpack_require__(/*! ./timer-window */ "./src/main/timer-window.ts");
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

/***/ "./src/main/timer-window.ts":
/*!**********************************!*\
  !*** ./src/main/timer-window.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimerWindow = void 0;
const electron_1 = __webpack_require__(/*! electron */ "electron");
const node_global_key_listener_1 = __webpack_require__(/*! node-global-key-listener */ "node-global-key-listener");
const node_path_1 = __importDefault(__webpack_require__(/*! node:path */ "node:path"));
const application_1 = __webpack_require__(/*! ../shared/application */ "./src/shared/application.ts");
const constants_1 = __webpack_require__(/*! ../shared/constants */ "./src/shared/constants.ts");
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
                preload: node_path_1.default.join(__dirname, "../renderer/preload.js")
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

/***/ "./src/shared/application.ts":
/*!***********************************!*\
  !*** ./src/shared/application.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Application = void 0;
class Application {
    static debug = process.argv.includes("--with-dev-tools");
}
exports.Application = Application;


/***/ }),

/***/ "./src/shared/constants.ts":
/*!*********************************!*\
  !*** ./src/shared/constants.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventName = exports.minute = exports.second = void 0;
exports.second = 1000;
exports.minute = exports.second * 60;
var EventName;
(function (EventName) {
    EventName["KEY_PRESS"] = "keypress";
    EventName["SHOW_CONTEXT_MENU"] = "showcontextmenu";
})(EventName || (exports.EventName = EventName = {}));


/***/ }),

/***/ "node-global-key-listener":
/*!*******************************************!*\
  !*** external "node-global-key-listener" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node-global-key-listener");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

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

/***/ "node:fs/promises":
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs/promises");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map