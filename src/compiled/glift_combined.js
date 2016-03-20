/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * @version 1.1.0
 * --------------------------------------
 */

// Define some closure primitives for compatibility with dev mode. Closure
// compiler works off of regular expressions, so this shouldn't be an issue.
// This allows us to use goog.require and goog.provides in dev mode.
if (!window['goog']) {
  window['goog'] = {}
  window['goog']['provide'] = function(){};
  window['goog']['require'] = function(){};
  window['goog']['scope'] = function(fn) { fn() };
}

goog.provide('glift');

(function(w) {
var glift = w.glift || {};
if (w) {
  // expose Glift as a global.
  w.glift = glift;
}
})(window);

goog.provide('glift.global');

/**
 * Useful global variables related to all glift instances on the page.
 */
glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently on stable.
   */
  version: '1.1.0',

  /** Indicates whether or not to store debug data. */
  // TODO(kashomon): Remove this hack.
  debugMode: false,

  /**
   * Options for performanceDebugLevel: NONE, INFO
   */
  performanceDebugLevel: 'NONE',

  /**
   * Map of performance timestamps. Not normally used unless
   * performanceDebugLevel is set.
   */
  perf: {
    /** @type {?Date} */
    first: null,
    /** @type {?Date} */
    last: null,
    /** @type {?Date} */
    lastMajor: null,
  },

  /**
   * The registry.  Used to determine who has 'ownership' of key-presses.
   * The problem is that key presses have to be captured in a global scope (or
   * at least at the <body> level.
   */
  instanceRegistry: {
    // Map of manager ID (some-div-id-glift-1) to object instance.
  },

  /**
   * Id of the active Glift. instance.
   */
  activeInstanceId: null,

  /** Used to mark whether the zoom has been disabled (for mobile). */
  disabledZoom: false,

  /** Added CSS classes (we only want to do this once). */
  addedCssClasses: false
};

/**
 * Initialization function to be run on glift-ui creation.  Things performed:
 *  - (Compatibility) Whether or not the page supports Glift (SVG)
 *  - (Mobile-Zoom) Disable zoom for mobile, if option specified.
 */
glift.init = function(disableZoomForMobile, divId) {
  // Compatibility.
  if (!glift.platform.supportsSvg()) {
    var text = 'Your browser does not support Glift, this Go viewer, ' +
        'due to lack of SVG support. ' +
        'Please upgrade or try one of ' +
        '<a href="http://browsehappy.com/">these</a>';
    glift.dom.elem(divId).html(text);
    // Don't perform any other action and error out.
    throw new Error(text);
  }

  // Disable Zoom for Mobile (should only happens once)
  if (!glift.global.disabledZoom &&
      disableZoomForMobile &&
      glift.platform.isMobile()) {
    var metas = document.getElementsByTagName('meta');
    var noZoomContent = 'width=device-width, ' +
        'maximum-scale=1.0, minimum-scale=1.0, user-scalable=no'
    for (var i = 0, len = metas.length; i < len; i++){
      var name = metas[i] ? metas[i].getAttribute('name') : null;
      if (name && name.toLowerCase() === 'viewport'){
        glift.dom.elem(metas[i]).remove();
      }
    }
    var head = document.head;
    if (head == null) {
      throw new Error('document.head was null, ' +
          'but it must not be null for disable zoom to work.');
    }
    head = glift.dom.elem(/** @type {!HTMLHeadElement} */ (head));
    var newMeta = glift.dom.elem(document.createElement('meta'))
        .setAttr('name', 'viewport')
        .setAttr('content', noZoomContent);
    head.prepend(newMeta);
    glift.global.disabledZoom = true; // prevent from being called again.
  }

  if (!glift.global.addedCssClasses) {
    // Add any CSS classes that we need
    var style = document.createElement('style');
    style.type = 'text/css';
    // TODO(kashomon): Make these constants or something.
    style.innerHTML = [
        // Disable scrolling.  This appears to only work for desktops.
        '.glift-fullscreen-no-scroll { overflow: hidden; }',
        // Comment box class is used primarily as an identifier, but it's
        // defined here as aglobal indicator.
        '.glift-comment-box {}'].join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
    glift.global.addedCssClasses = true;
  }
};

goog.provide('glift.util');

glift.util = {
  /**
   * @param{T|undefined|null} param
   * @param{string=} opt_msg
   * @return {!T}
   *
   * @template T
   */
  assertDef: function(param, opt_msg) {
    var msg = opt_msg || '';
    if (param === undefined || param === null) {
      throw new Error('Param not defined! ' + msg);
    } else {
      // TODO(kashomon): Currently, this doesn't work the way I'd want to.
      return param;
    }
  },

  /**
   * Log a message. Allows the for the possibility of overwriting for tests.
   */
  logz: function(msg) {
    console.log(msg);
    return null; // default value to return.
  },

  /**
   * Via Crockford / StackOverflow: Determine the type of a value in robust way.
   */
  typeOf: function(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (value instanceof Array) {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  },

  /**
   * Checks to make sure a number is inbounds.  In other words, whether a number
   * is between 0 (inclusive) and bounds (exclusive).
   */
  inBounds: function(num, bounds) {
    return ((num < bounds) && (num >= 0));
  },

  // Checks to make sure a number is out-of-bounds
  // returns true if a number is outside a bounds (inclusive) or negative
  outBounds: function(num, bounds) {
    return ((num >= bounds) || (num < 0));
  },

  intersection: function(set1, set2) {
    var out = {};
    for (var key in set1) {
      if (set2[key] !== undefined) {
        out[key] = 1;
      }
    }
    return out;
  },

  // Init a key if the obj is undefined at the key with the given value.
  // Return the value
  getKeyWithDefault: function(obj, key, value) {
    if (obj[key] === undefined) {
      obj[key] = value;
    }
    return obj[key];
  },

  /*
   * Get the size of an object
   */
  sizeOf: function(obj) {
    var size = 0;
    for (var key in obj) {
      size += 1;
    }
    return size;
  },

  /**
   * Set methods in the base object.  Usually used in conjunction with beget.
   */
  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
  },

  /**
   * A utility method -- for prototypal inheritence.
   */
  beget: function (o) {
    /** @constructor */
    var F = function () {};
    F.prototype = o;
    return new F();
  },

  /**
   * Simple Clone creates copies for all string, number, boolean, date and array
   * types.  It does not copy functions (which it leaves alone), nor does it
   * address problems with recursive objects.
   *
   * Taken from stack overflow, with some modification to handle functions and
   * to take advantage of util.typeOf above.  Note: This does not handle
   * recursive objects gracefully.
   *
   * Reference:
   * http://stackoverflow.com/questions/728360/
   * most-elegant-way-to-clone-a-javascript-object
   */
  simpleClone: function(obj) {
    // Handle immutable types (null, Boolean, Number, String) and functions.
    if (glift.util.typeOf(obj) !== 'array' &&
        glift.util.typeOf(obj) !== 'object') return obj;
    if (obj instanceof Date) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (glift.util.typeOf(obj) === 'array') {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = glift.util.simpleClone(obj[i]);
      }
      return copy;
    }
    if (glift.util.typeOf(obj) === 'object') {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] =
            glift.util.simpleClone(obj[attr]);
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
};

// A better logging solution.
glift.util.debugl = function(msg) {
  if (glift.debugOn) {
    glift.util.log(msg);
  }
};

// A better logging solution.
glift.util.log = function(msg) {
  var modmsg = msg;
  if (glift.util.typeOf(msg) === "array" ||
      glift.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  if (console !== undefined && console.log !== undefined) {
    console.log(msg);
  }
};

/**
 * Collection of utility methods for arrays
 */
glift.array = {
  remove: function(arr, elem) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  },

  replace: function(arr, elem, elemRep) {
    var index = arr.indexOf(elem);
    if (index > -1) {
      arr[index] = elemRep;
    }
    return arr;
  }
};

goog.provide('glift.util.colors');

glift.util.colors = {
  isLegalColor: function(color) {
    return color === glift.enums.states.BLACK ||
        color === glift.enums.states.WHITE ||
        color === glift.enums.states.EMPTY;
  },

  oppositeColor: function(color) {
    if (color === glift.enums.states.BLACK) return glift.enums.states.WHITE;
    if (color === glift.enums.states.WHITE) return glift.enums.states.BLACK;
    else return color;
  }
};

goog.provide('glift.enums');

/**
 * Various constants used throughout glift.
 */
glift.enums = {
  /**
   * Camel cases an enum. Can be useful for things that have functions or
   * packages named from enum names.
   *
   * @param {string} input The enum to input
   * @return {string} transformed enum name.
   */
  toCamelCase: function(input) {
    return input.toLowerCase().replace(/_(.)?/g, function(match, group1) {
      return group1 ? group1.toUpperCase() : '';
    });
  },
};

/**
 * Also sometimes referred to as colors.
 * @enum{string}
 */
glift.enums.states = {
  BLACK: 'BLACK',
  WHITE: 'WHITE',
  EMPTY: 'EMPTY'
};

/**
 * @enum{string}
 */
glift.enums.boardAlignments = {
  TOP: "TOP",
  RIGHT: "RIGHT",
  CENTER: "CENTER"
};


/**
 * List of directions. Used for a variety of tasks.
 * @enum{string}
 */
glift.enums.directions = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM'
};

/**
 * List of board regions. Usually used for cropping.
 * @enum{string}
 */
glift.enums.boardRegions = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  TOP_LEFT: 'TOP_LEFT',
  TOP_RIGHT: 'TOP_RIGHT',
  BOTTOM_LEFT: 'BOTTOM_LEFT',
  BOTTOM_RIGHT: 'BOTTOM_RIGHT',
  ALL: 'ALL',
  // Automatically determine the board region.
  AUTO: 'AUTO',
  // Minimal cropbox, modulo some heuristics. To do this, you usually need a
  // movetree, and usually, you need next-path information.
  MINIMAL: 'MINIMAL'
};

/**
 * Controller messages.
 * @enum {string}
 */
// TODO(kashomon): Delete this
glift.enums.controllerMessages = {
  CONTINUE: 'CONTINUE',
  DONE: 'DONE',
  FAILURE: 'FAILURE'
};

/**
 * @enum {string}
 */
glift.enums.marks = {
  CIRCLE: 'CIRCLE',
  SQUARE: 'SQUARE',
  TRIANGLE: 'TRIANGLE',
  XMARK: 'XMARK',
  // STONE_MARKER marks the last played stone
  STONE_MARKER: 'STONE_MARKER',
  LABEL: 'LABEL',

  // These last few 'marks' are variations on the LABEL mark type.
  // TODO(kashomon): Consolidate these somehow.
  //
  // Neither LABEL_ALPHA nor LABEL_NUMERIC are used for rendering, but they
  // are extremly convenient to have this distinction when passing information
  // from the display to the controller
  LABEL_ALPHA: 'LABEL_ALPHA',
  LABEL_NUMERIC: 'LABEL_NUMERIC',

  // There last two are variations on the LABEL mark. VARIATION_MARKER is used
  // so we can color labels differently for variations.
  VARIATION_MARKER: 'VARIATION_MARKER',

  // We color 'correct' variations differently in problems,
  CORRECT_VARIATION: 'CORRECT_VARIATION'
};

/**
 * Enum to indicate how a move for a problem was resolved.
 * @enum {string}
 */
glift.enums.problemResults = {
  CORRECT: 'CORRECT',
  INCORRECT: 'INCORRECT',
  INDETERMINATE: 'INDETERMINATE',
  FAILURE: 'FAILURE' // i.e., none of these (couldn't place stone).
};

/**
 * How data from glift.intersections should be displayed.
 * @enum {string}
 */
// TODO(kashomon): Delete when we migrate to flattener.
glift.enums.displayDataTypes = {
  PARTIAL: 'PARTIAL',
  FULL: 'FULL'
};

/**
 * Used to create svg element Ids.  The enum values are slightly modified to
 * be compatible with being class / id names.
 * @enum{string}
 */
glift.enums.svgElements = {
  SVG: 'svg',
  BOARD: 'board',
  BOARD_COORD_LABELS: 'board_coord_labels',
  INTERSECTIONS_CONTAINER: 'intersections',
  BOARD_LINE: 'board_line',
  BOARD_LINE_CONTAINER: 'board_line_container',
  BUTTON: 'button',
  BUTTON_CONTAINER: 'button_container',
  FULL_BOARD_BUTTON: 'full_board_button',
  MARK: 'mark',
  TEMP_MARK_GROUP: 'temp_mark_group',
  MARK_CONTAINER: 'mark_container',
  GLIFT_ELEMENT: 'glift_element',
  STARPOINT: 'starpoint',
  STARPOINT_CONTAINER: 'starpoint_container',
  STONE: 'stone',
  STONE_CONTAINER: 'stone_container',
  STONE_SHADOW: 'stone_shadow',
  STONE_SHADOW_CONTAINER: 'stone_shadow_container',
  GUIDE_LINE: 'guide_line',

  // Icon-bar specific glift.enums
  ICON: 'icon',
  ICON_CONTAINER: 'icon_container',
  TEMP_ICON: 'temp_icon',
  TEMP_TEXT: 'temp_text',
  TEMP_ICON_CONTAINER: 'temp_icon_container'
};

/**
 * Whether or not to show variations in the UI.
 * @enum {string}
 */
glift.enums.showVariations = {
  ALWAYS: 'ALWAYS',
  NEVER: 'NEVER',
  MORE_THAN_ONE: 'MORE_THAN_ONE'
};

/**
 * The types of widgets users can create. Used to link Controllers and Options.
 * @enum {string}
 */
glift.enums.widgetTypes = {
  CORRECT_VARIATIONS_PROBLEM: 'CORRECT_VARIATIONS_PROBLEM',
  EXAMPLE: 'EXAMPLE',
  GAME_FIGURE: 'GAME_FIGURE',
  GAME_VIEWER: 'GAME_VIEWER',
  REDUCED_GAME_VIEWER: 'REDUCED_GAME_VIEWER',
  STANDARD_PROBLEM: 'STANDARD_PROBLEM',
  BOARD_EDITOR: 'BOARD_EDITOR'
};

/**
 * The types of components that exist in the Glift UI.
 * @enum {string}
 */
glift.enums.boardComponents = {
  BOARD: 'BOARD',
  COMMENT_BOX: 'COMMENT_BOX',
  EXTRA_ICONBAR: 'EXTRA_ICONBAR',
  ICONBAR: 'ICONBAR',
  STATUS_BAR: 'STATUS_BAR'
};

/**
 * @enum {string}
 */
glift.enums.dubug = {
  NONE: 'NONE',
  INFO: 'INFO'
};

/**
 * Rotations we can apply to Go Boards. Doesn't rotate the fundamental data (the
 * SGF points), but rotates at the time the board is drawn.
 * @enum {string}
 */
glift.enums.rotations = {
  NO_ROTATION: 'NO_ROTATION',
  CLOCKWISE_90: 'CLOCKWISE_90',
  CLOCKWISE_180: 'CLOCKWISE_180',
  CLOCKWISE_270: 'CLOCKWISE_270'
};

(function() {
glift.errors = {};

glift.errors.ParseError = function(message) {
  this.name = "ParseError";
  this.message = message || "";
};
glift.errors.ParseError.prototype = new Error();

})();

goog.provide('glift.util.IdGenerator_');
goog.provide('glift.util.idGenerator');

/**
 * @private
 * @constructor @final @struct
 */
glift.util.IdGenerator_ = function(seed) {
  this.seed  = seed || 0;
};

glift.util.IdGenerator_.prototype = {
  /**
   * @return {string} Return the next ID as a string.
   */
  next: function() {
    var out = this.seed + "";
    this.seed += 1
    return out;
  }
};

glift.util.idGenerator = new glift.util.IdGenerator_(0);

glift.keyMappings = {
  /**
   * Some keys must be bound with 'keydown' rather than key code
   * mappings.
   */
  specialChars: {
    BACKSPACE: 8,
    ESCAPE: 27,
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_DOWN:40
  },

  _codeToNameKeyDown: undefined, // lazilyDefined

  /** Convert a key name (see above) to a standard key code. */
  nameToCode: function(name) {
    if (name.length !== 1) {
      if (/[A-Z](_[A-Z]+)*/.test(name)) {
        return glift.keyMappings.specialChars[name] || null
      } else {
        return null
      }
    } else {
      return name.charCodeAt(0);
    }
  },

  /** Convert a standard key code to a key name (see above). */
  codeToName: function(keyCode) {
    if (!glift.keyMappings._codeToNameKeyDown) {
      // Bite the bullet and define the map.
      var newmap = {};
      for (var name in glift.keyMappings.specialChars) {
        var keycode = glift.keyMappings.specialChars[name]
        newmap[keycode] = name;
      }
      glift.keyMappings._codeToNameKeyDown = newmap;
    }
    if (glift.keyMappings._codeToNameKeyDown[keyCode]) {
      return glift.keyMappings._codeToNameKeyDown[keyCode];
    } else {
      return String.fromCharCode(keyCode) || null;
    }
  },

  /**
   * The master keybinding registry.
   *
   * Maps:
   *  InstanceId -> (to)
   *    KeyName -> (to)
   *      Function or Icon
   */
  _keyBindingMap: {},

  /**
   * Registers a keybinding function with a manager instance.
   *
   * id: Glift manager instance id.
   * keyName: string representing the keypress. Must be a member of _nameToCode.
   * funcOrIcon: The function or icon.name to register.
   */
  registerKeyAction: function(id, keyName, funcOrIcon) {
    var map = glift.keyMappings._keyBindingMap;
    if (!glift.keyMappings.nameToCode(keyName)) {
      // We don't know about this particular keyCode.  It might be an error, or
      // it might be that it needs to be added to the above.
      throw new Error('Unknown key name: ' + keyName);
    }

    if (!map[id]) {
      map[id] = {};
    }
    if (id && keyName && funcOrIcon) {
      map[id][keyName] = funcOrIcon;
    }
  },

  /** Remove all keys associated with an ID. */
  unregisterInstance: function(id) {
    if (glift.keyMappings._keyBindingMap[id]) {
      delete glift.keyMappings._keyBindingMap[id];
    }
  },

  /**
   * Gets a keybinding function or an icon path
   *
   * id: The glift manager instance id.
   * keyName: The number representing the instance.
   */
  getFuncOrIcon: function(id, keyName) {
    var map = glift.keyMappings._keyBindingMap;
    if (id && keyName && map[id] && map[id][keyName]) {
      return map[id][keyName];
    }
    return null;
  },

  /** Whether the listener has been initialized. */
  _initializedListener: false,

  /**
   * Initializes a global listener on keypresses.  Should only be really
   * initialized once, but it's ok to call this function more than once -- it
   * will be idempotent.
   */
  initKeybindingListener: function() {
    if (glift.keyMappings._initializedListener) {
      return;
    }
    var body = document.body;

    // Note: difference between keypress and keydown!
    //
    // We use keydown so we can capture the left/right arrow keys, but keypress
    // should be preferred since it's easier to get the char code.
    body.addEventListener('keydown', glift.keyMappings._keyHandlerFunc);
    body.addEventListener('keypress', glift.keyMappings._keyHandlerFunc);
    glift.keyMappings._initializedListener = true;
  },

  /**
   * Internal function for processing key-presses.
   */
  _keyHandlerFunc: function(keyEvent) {
    var keyName = glift.keyMappings.codeToName(keyEvent.which);// || e.charCode);
    if (keyEvent.type === 'keydown' && !(/[A-Z_]+/.test(keyName))) {
      // This key should be processed by the keypress event rather than this
      // one.
      return;
    }

    var activeId = glift.global.activeInstanceId;
    var bindingMap = glift.keyMappings._keyBindingMap;
    var funcOrIcon = glift.keyMappings.getFuncOrIcon(activeId, keyName);
    if (!funcOrIcon) { return; }

    var manager = glift.global.instanceRegistry[activeId];
    if (!manager) { return; }

    var widget = manager.getCurrentWidget();
    if (!widget) { return; }

    var argType = glift.util.typeOf(funcOrIcon)

    if (argType === 'function') {
      funcOrIcon(widget);
      if (manager.isFullscreen()) {
        // We don't want the widget interacting with anything else while
        // full-screen.
        if (keyEvent.preventDefault) keyEvent.preventDefault();
        else keyEvent.returnValue = false; // IE
      }
    } else if (argType === 'string') {
      // Assume it's an icon-action-path
      // icon namespaces look like: icons.arrowleft.mouseup
      var actionNamespace = funcOrIcon.split('.');
      if (actionNamespace[0] !== 'iconActions' &&
          actionNamespace[0] !== 'stoneActions') {
        throw new Error('Unexpected action namespace: ' + actionNamespace[0]);
      }
      var action = widget[actionNamespace[0]];
      for (var i = 1; i < actionNamespace.length; i++) {
        action = action[actionNamespace[i]];
      }
      action(keyEvent, widget);
      if (manager.isFullscreen()) {
        // We don't want the widget interacting with anything else while
        // full-screen.
        if (keyEvent.preventDefault) keyEvent.preventDefault();
        else  keyEvent.returnValue = false; // IE
      }
    }
  }
};

glift.math = {
  isEven: function(num1) {
    if ((num1 % 2) == 0) return true;
    else return false;
  },

  // Returns a random integer between min and max
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  mostlyEqual: function(v1, v2, epsilon) {
    return Math.abs(v1 - v2) < epsilon
  }
};

glift.obj = {
  /**
   * A helper for merging obj information (typically CSS or SVG rules).  This
   * method is non-recursive and performs only shallow copy.
   */
  flatMerge: function(base, varargs) {
    var newObj = {};
    if (glift.util.typeOf(base) !== 'object') {
      return newObj;
    }
    for (var key in base) {
      newObj[key] = base[key];
    }
    for (var i = 1; arguments.length >= 2 && i < arguments.length; i++) {
      var arg = arguments[i];
      if (glift.util.typeOf(arg) === 'object') {
        for (var key in arg) {
          newObj[key] = arg[key];
        }
      }
    }
    return newObj;
  },

  /** Returns true if an object is empty. False otherwise. */
  isEmpty: function(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  }
};

glift.util.perfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  var lastMajor = glift.global.perf.lastMajor;
  var last = glift.global.perf.last;
  console.log("Since Major Record: " + (time - lastMajor + "ms. " + msg));
  if (glift.global.performanceDebugLevel === 'FINE') {
    console.log("  Since Last Record: " + (time - last + "ms. " + msg));
  }
  glift.global.perf.last = time;
};

glift.util.majorPerfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  glift.util.perfLog(msg);
  glift.global.perf.lastMajor = time;
};

glift.util.perfDone = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var time = glift.util.perfTime();
  var first = glift.global.perf.first;
  var lastMajor = glift.global.perf.lastMajor;
  console.log("---Performance Test Complete---");
  console.log("Since Beginning: " + (time - first) + 'ms.')
};

glift.util.perfInit = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'NONE') {
    return;
  }
  var t = glift.util.perfTime();
  glift.global.perf = { first: t, last: t, lastMajor: t};
};

glift.util.perfTime = function() {
  return (new Date()).getTime();
};

glift.platform = {
  _isIOS:  null,
  isIOS: function() {
    if (glift.platform._isIOS !== null) return glift.platform._isIOS;
    glift.platform._isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return glift.platform._isIOS;
  },

  _isAndroid: null,
  isAndroid: function() {
    if (glift.platform._isAndroid !== null) return glift.platform._isAndroid;
    glift.platform._isAndroid = /Android/i.test(navigator.userAgent);
    return glift.platform._isAndroid;
  },

  _isWinPhone: null,
  isWinPhone: function() {
    if (glift.platform._isWinPhone !== null) return glift.platform._isWinPhone;
    glift.platform._isWinPhone = /Windows Phone/i.test(navigator.userAgent);
    return glift.platform._isWinPhone;
  },

  /** Whether a page is being viewed by a mobile browser. */
  // TODO(kashomon): Change to inspecting viewport size?
  isMobile: function() {
    return glift.platform.isAndroid() ||
        glift.platform.isIOS() ||
        glift.platform.isWinPhone();
  },

  /** Whether a page can support SVG (and thus Glift).*/
  _supportsSvg: null,
  supportsSvg: function() {
    if (glift.platform._supportsSvg !== null) return glift.platform._supportsSvg;
    // From: http://css-tricks.com/test-support-svg-img/
    glift.platform._supportsSvg = document.implementation.hasFeature(
        "http://www.w3.org/TR/SVG11/feature#Image", "1.1");
    return glift.platform._supportsSvg;
  }
};

goog.provide('glift.util.point');
goog.provide('glift.Point');
goog.provide('glift.PtStr');

/**
 * A point string is just a string with the format '<Number>,<Number>'. We use
 * this special type as a reminder to the reader of the code.
 *
 * Example: '12,5'
 *
 * @typedef {string}
 */
glift.PtStr;

/**
 * Create a point.  We no longer cache points
 * @param {number} x
 * @param {number} y
 * return {!glift.Point}
 */
glift.util.point = function(x, y) {
  return new glift.Point(x, y);
};

/**
 * @param {number} x
 * @param {number} y
 * return {!glift.PtStr}
 */
glift.util.coordToString = function(x, y) {
  return x + ',' + y;
};

/**
 * @param {glift.PtStr} str
 * @return {!glift.Point}
 */
glift.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0], 10);
    var y = parseInt(split[1], 10);
    return glift.util.point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

/**
 * Convert SGF data from SGF data.
 *
 * Returns an array of points. This exists to handle point-rectangle data sets
 * and point data sets uniformly.
 *
 * Example: TR[aa][ab]... vs TR[aa:cc]
 *
 * @param {string} str The sgf string to pars.
 * @return {!Array<!glift.Point>} An array of points.
 */
glift.util.pointArrFromSgfProp = function(str) {
  if (str.length === 2) {
    // Assume the properties have the form [ab].
    return [glift.util.pointFromSgfCoord(str)];
  } else if (str.length > 2) {
    // Assume a point rectangle. This a weirdness of the SGF spec and the reason
    // why this function exists. See http://www.red-bean.com/sgf/sgf4.html#3.5.1
    var splat = str.split(':');
    if (splat.length !== 2) {
      throw new Error('Expected two points: TopLeft and BottomRight for ' +
        'point rectangle. Instead found: ' + str);
    }
    var out = [];
    var tl = glift.util.pointFromSgfCoord(splat[0]);
    var br = glift.util.pointFromSgfCoord(splat[1]);
    if (br.x() < tl.x() || br.y() < br.y()) {
      throw new Error('Invalid point rectangle: tl: ' + tl.toString() +
          ', br: ' + br.toString());
    }
    var delta = br.translate(-tl.x(), -tl.y());
    for (var i = 0; i <= delta.y(); i++) {
      for (var j = 0; j <= delta.x(); j++) {
        var newX = tl.x() + j, newY = tl.y() + i;
        out.push(glift.util.point(newX, newY));
      }
    }
    return out;
  } else {
    throw new Error('Unknown pointformat for property data: ' + str);
  }
};


/**
 * Take an SGF point (e.g., 'mc') and return a GliftPoint.
 * SGFs are indexed from the Upper Left:
 *    _  _  _
 *   |aa ba ca ...
 *   |ab bb
 *   |.
 *   |.
 *   |.
 * @param {string} str The SGF string point
 * @return {!glift.Point} the finished point.
 */
glift.util.pointFromSgfCoord = function(str) {
  if (str.length !== 2) {
    throw 'Unknown SGF Coord length: ' + str.length +
        'for property ' + str;
  }
  var a = 'a'.charCodeAt(0)
  return glift.util.point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};


/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 *
 * @constructor
 * @struct
 * @final
 */
glift.Point = function(xIn, yIn) {
  /**
   * @private {number}
   * @const
   */
  this.x_ = xIn;
  /**
   * @private {number}
   * @const
   */
  this.y_ = yIn;
};

glift.Point.prototype = {
  /** @return {number} x value */
  x: function() { return this.x_ },
  /** @return {number} y value */
  y: function() { return this.y_ },
  /** @return {boolean} Whether this point equals another obj. */
  equals: function(pt) {
    return this.x_ === pt.x() && this.y_ === pt.y();
  },

  /** @return {!glift.Point} */
  clone: function() {
    return glift.util.point(this.x(), this.y());
  },

  /**
   * @return {string}  an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(this.x() + a) +
        String.fromCharCode(this.y() + a);
  },

  /**
   * Return a string representation of the coordinate.  I.e., "12,3".
   * @return {!glift.PtStr}
   */
  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * @param {number} x
   * @param {number} y
   * @return {!glift.Point} a new point that's a translation from this one.
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  /**
   * Rotate an (integer) point based on the board size.
   * Note: This is an immutable transformation on the point.
   *
   * @param {number} maxIntersections The max intersections of the uncropped
   *    board. Typically 19, 13, or 9.
   * @param {glift.enums.rotations} rotation To perform on the point.
   * @return {!glift.Point} A new point that has possibly been rotated.
   */
  rotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations;
    if (maxIntersections < 0 ||
        rotation === undefined ||
        rotation === rotations.NO_ROTATION) {
      return this;
    }
    var point = glift.util.point;
    var mid = (maxIntersections - 1) / 2;
    var normalized = point(this.x() - mid, mid - this.y());

    if (glift.util.outBounds(this.x(), maxIntersections) ||
        glift.util.outBounds(this.x(), maxIntersections)) {
      throw new Error("rotating a point outside the bounds: " +
          this.toString());
    }

    var rotated = normalized;
    if (rotation === rotations.CLOCKWISE_90) {
      rotated = point(normalized.y(), -normalized.x());

    } else if (rotation === rotations.CLOCKWISE_180) {
      rotated = point(-normalized.x(), -normalized.y());

    } else if (rotation === rotations.CLOCKWISE_270) {
      rotated = point(-normalized.y(), normalized.x());
    }

    // renormalize
    return point(mid + rotated.x(), -rotated.y() + mid);
  },

  /**
   * The inverse of rotate (see above)}
   * @param {number} maxIntersections Usually 9, 13, or 19.
   * @param {glift.enums.rotations} rotation Usually 9, 13, or 19.
   * @return {!glift.Point} A rotated point.
   */
  antirotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations
    if (rotation === rotations.CLOCKWISE_90) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_270)
    } else if (rotation === rotations.CLOCKWISE_180) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_180)
    } else if (rotation === rotations.CLOCKWISE_270) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_90)
    } else {
      return this.rotate(maxIntersections, rotation);
    }
  },

  /** Log this point to the console. Should probably be deleted. */
  log: function() {
    glift.util.logz(this.toString());
  }
};

glift.util.regions = {
  getComponents: function(boardRegion) {
    var br = glift.enums.boardRegions,
        out = {};
    if (boardRegion === br.TOP_LEFT) {
      out[br.TOP] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.TOP_RIGHT) {
      out[br.TOP] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion === br.BOTTOM_LEFT) {
      out[br.BOTTOM] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.BOTTOM_RIGHT) {
      out[br.BOTTOM] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion == br.TOP) {
      out[br.TOP] = 1;
    } else if (boardRegion == br.BOTTOM) {
      out[br.BOTTOM] = 1;
    } else if (boardRegion == br.LEFT) {
      out[br.LEFT] = 1;
    } else if (boardRegion == br.RIGHT) {
      out[br.RIGHT] = 1;
    }
    return out;
  }
};

goog.provide('glift.dom');
goog.provide('glift.dom.Element');

/** @namespace */
glift.dom = {
  /**
   * Constructs a glift dom element. If arg is a string, assume an ID is being
   * passed in. If arg is an object and has nodeType and nodeType is 1
   * (ELEMENT_NODE), just wrap the element.
   *
   * @param {string|!Element} arg
   * @return {glift.dom.Element} A wrapped DOM element. Can be null if the ID
   *    cannot be found or the arg type is not a string or Element.
   */
  elem: function(arg) {
    var argtype = glift.util.typeOf(arg);
    if (argtype === 'string') {
      // Assume an element ID.
      arg = /** @type {string} */ (arg);
      var el = document.getElementById(arg);
      if (el === null) {
        return null;
      } else {
        return new glift.dom.Element(/* @type {!Element} */ (el), arg);
      };
    } else if (argtype === 'object' && arg.nodeType && arg.nodeType === 1) {
      // Assume an HTML node.
      // Note: nodeType of 1 => ELEMENT_NODE.
      return new glift.dom.Element(/** @type {!Element} */ (arg));
    }
    return null;
  },

  /**
   * Creates a new div dom element with the relevant id.
   * @param {string} id
   * @return {!glift.dom.Element}
   */
  newDiv: function(id) {
    var elem = glift.dom.elem(document.createElement('div'));
    elem.setAttr('id', id);
    return elem;
  },

  /**
   * Convert some text to some dom elements.
   * @param {string} text The input raw text
   * @param {boolean} useMarkdown Whether or not to render with markdown.
   * @param {!Object=} opt_css Optional CSS object to apply to the lines.
   */
  convertText: function(text, useMarkdown, opt_css) {
    text = glift.dom.sanitize(text);
    if (useMarkdown) {
      text = glift.markdown.render(text);
    }
    var wrapper = glift.dom.newElem('div');
    // TODO(kashomon): It's so hacky to use the comment box css here.
    wrapper.setAttr('class', glift.dom.classes.commentBox);

    if (useMarkdown) {
      wrapper.html(text);
    } else {
      var textSegments = text.split('\n');
      for (var i = 0; i < textSegments.length; i++) {
        var seg = textSegments[i];
        var baseCss = { margin: 0, padding: 0, 'min-height': '1em' };
        if (opt_css) {
          for (var key in opt_css) {
            baseCss[key] = opt_css[key];
          }
        }
        var pNode = glift.dom.newElem('p').css(baseCss);
        pNode.html(seg);
        wrapper.append(pNode);
      }
    }
    return wrapper;
  },

  /**
   * Produces an absolutely positioned div from a bounding box.
   */
  absBboxDiv: function(bbox, id) {
    var newDiv  = this.newDiv(id);
    var cssObj = {
      position: 'absolute',
      margin: '0px',
      padding: '0px',
      top: bbox.top() + 'px',
      left: bbox.left() + 'px',
      width: bbox.width() + 'px',
      height: bbox.height() + 'px',
      MozBoxSizing: 'border-box',
      boxSizing: 'border-box'
    };
    newDiv.css(cssObj);
    return newDiv;
  },

  /**
   * Convert a string allow user to specify a type of Element.
   *
   * @param {string} type The type of element to create.
   * @return {glift.dom.Element}
   */
  newElem: function(type) {
    if (!type || glift.util.typeOf(type) !== 'string') {
      throw new Error('Type must be a string. was: [' + type + ']');
    }
    return glift.dom.elem(document.createElement(type));
  }
};

/**
 * A simple wrapper for a plain old dom element. Note, id can be null if the
 * Element is constructed directly from elem.
 *
 * @param {!Element} el A DOM Element.
 * @param {string=} opt_id Optional ID -- defaults to null.
 *
 * @constructor @final @struct
 */
glift.dom.Element = function(el, opt_id) {
  /** @type {!Element} */
  this.el = el;
  /** @type {?string} */
  this.id = opt_id || null;
}

glift.dom.Element.prototype = {
  /** Prepends an element, but only if it's a glift dom element. */
  prepend: function(that) {
    if (that.constructor === this.constructor) {
      // It's ok if firstChild is null;
      this.el.insertBefore(that.el, this.el.firstChild);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /** Appends an element, but only if it's a glift dom element. */
  append: function(that) {
    if (that.constructor === this.constructor) {
      this.el.appendChild(that.el);
    } else {
      throw new Error('Could not append unknown element: ' + that);
    }
    return this;
  },

  /** Sets a text node under this element. */
  appendText: function(text) {
    if (text) {
      var newNode = this.el.ownerDocument.createTextNode(text);
      this.el.appendChild(newNode);
    }
    return this;
  },

  /**
   * Set an attribute on the element. If the key is an ID and the value is a
   * string, also set the ID field.
   *
   * @param {string} key
   * @param {boolean|number|string} value
   * @return {!glift.dom.Element}
   */
  setAttr: function(key, value) {
    this.el.setAttribute(key, value);
    if (key === 'id' && glift.util.typeOf(value) === 'string') {
      // Also set the ID field if the key is 'id'.
      this.id = /** @type {string} */ (value);
    }
    return this;
  },

  /** @return {*} The attribute value */
  attr: function(key) {
    return this.el.getAttribute(key);
  },

  /**
   * Set several attributes using an attribute object.
   * @param {Object} attrObj A object with multiple attributes.
   */
  setAttrObj: function(attrObj) {
    for (var attrObjKey in attrObj) {
      var attrObjVal = attrObj[attrObjKey];
      this.el.setAttribute(attrObjKey, attrObjVal);
    }
  },

  /**
   * Gets all the attributes of the element, but as an object.
   * @return {Object} Attribute object.
   */
  attrs: function() {
    var out = {};
    for (var i = 0; i < this.el.attributes.length; i++) {
      var att = this.el.attributes[i];
      out[att.nodeName] = att.value;
    }
    return out;
  },

  /**
   * Sets the CSS with a CSS object. Note this converts foo-bar to fooBar.
   */
  css: function(obj) {
    for (var key in obj) {
      var outKey = key.replace(/-(.)?/g, function(match, group1) {
        return group1 ? group1.toUpperCase() : '';
      });
      this.el.style[outKey] = obj[key];
    }
    return this;
  },

  /** Add a CSS class. */
  addClass: function(className) {
    if (!this.el.className) {
      this.el.className = className;
    } else {
      this.el.className += ' ' + className;
    }
    return this;
  },

  /** Remove a CSS class. */
  removeClass: function(className) {
    this.el.className = this.el.className.replace(
        new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g'), '');
  },

  /** Get the client height of the element */
  height: function() { return this.el.clientHeight; },

  /** Get the client width of the element */
  width: function() { return this.el.clientWidth; },

  /** Set an event on the element */
  on: function(eventName, func) {
    func.bind(this);
    this.el.addEventListener(eventName, func);
  },

  /** Set the inner HTML. Rather dangerous -- should be used with caution. */
  html: function(inhtml) {
    if (inhtml !== undefined) {
      this.el.innerHTML = inhtml;
    } else {
      return this.el.innerHTML;
    }
  },

  /** Remove the current element from the dom. */
  remove: function() {
    var parent = this.el.parentNode;
    if (parent) parent.removeChild(this.el);
  },

  /** Empty out the children. */
  empty: function() {
    var node = this.el;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },

  /**
   * Get the current coordinates of the first element, or set the coordinates of
   * every element, in the set of matched elements, relative to the document.
   * Calculates a top and left. Largely taken from jQuery. 
   */
  offset: function() {
    var box = {top: 0, left: 0};
    var doc = this.el && this.el.ownerDocument;
    var docElem = doc.documentElement;
    var win = doc.defaultView;
    // If we don't have gBCR, just use 0,0 rather than error
    if (glift.util.typeOf(this.el.getBoundingClientRect) !== 'undefined') {
      box = this.el.getBoundingClientRect();
    }
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  },

  /** Gets the boundingClientRect */
  boundingClientRect: function() {
    return this.el.getBoundingClientRect();
  }
};

goog.provide('glift.dom.clasess');

/**
 * Built-in clases used to style Glift.
 */
// TODO(kashomon): Move to a more appropriate API location. Or just delete this
// nonsense.
glift.dom.classes = {
  commentBox: 'glift-comment-box'
};

goog.require('glift.dom');

/** Tags currently allowed. */
glift.dom._sanitizeWhitelist = {
  'br': true,
  'b': true,
  'strong': true,
  'i': true,
  'u': true,
  'em': true,
  'h1': true,
  'h2': true,
  'h3': true
};

/** Characters to escape */
glift.dom._escapeMap = {
 '&': '&amp;',
 '"': '&quot;',
 '\'': '&#x27;',
 '/': '&#x2F;'
};

/**
 * Sanitizes text to prevent XSS. A single pass parser.
 */
glift.dom.sanitize = function(text) {
  var outbuffer = [];
  var strbuff = [];
  var states = { DEFAULT: 1, TAG: 2 };
  var whitelist = glift.dom._sanitizeWhitelist;
  var curstate = states.DEFAULT;
  var numBrackets = 0;
  var lt = '&lt;';
  var gt = '&gt;';
  for (var i = 0, len = text.length; i < len; i++) {
    var chr = text.charAt(i);
    if (chr === '<') {
      curstate = states.TAG;
      numBrackets++;
      if (numBrackets > 1) {
        strbuff.push(lt); 
      }
    } else if (chr === '>') {
      numBrackets--;
      if (numBrackets < 0) {
        curstate = states.DEFAULT;
        numBrackets = 0;
        outbuffer.push(gt);
      } else if (numBrackets > 0) { 
        strbuff.push(gt);
      } else if (numBrackets === 0) {
        curstate = states.DEFAULT;
        var strform = strbuff.join('');
        strbuff = [];
        if (strform in whitelist) {
          outbuffer.push('<' + strform + '>');
        } else if (strform.charAt(0) === '/' &&
            strform.substring(1, strform.length) in whitelist) {
          outbuffer.push('<' + strform + '>');
        } else {
          outbuffer.push(lt + strform + gt);
        }
      }
    } else {
      if (curstate === states.TAG) {
        strbuff.push(chr);
      } else {
        if (chr in glift.dom._escapeMap) {
          chr = glift.dom._escapeMap[chr];
        }
        outbuffer.push(chr);
      }
    }
  }
  return outbuffer.join('');
};

goog.provide('glift.dom.ux');

// Note to self: common vendor property patterns:
//
// -webkit-property => webkitProperty
// -moz-property => MozProperty
// -ms-property => msProperty
// -o-property => OProperty
// property => property


/**
 * Miscellaneous utility methods for UX.
 */
glift.dom.ux = {
  /**
   * Provide scrolling, but only for the inner div.  Prepare for nastiness.
   * It's not totally clear that this is the right UX experience.  For boards
   * that don't over flow, it's actually kind of obnoxious.
   */
  // TODO(kashomon): This isn't used currently.  Probably should be removed.
  onlyInnerVertScroll: function(elem, bbox) {
    var preventScroll = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.returnValue = false;
    };

    elem.on('mousewheel', function(e) {
      var el = elem.el;
      var deltaY = e.deltaY;
      var scrollTop = el.scrollTop;
      var scrollHeight = el.scrollHeight;
      var height = bbox.height();
      // Delta is positive if scrolling down and negative if scrolling up.
      var positiveDelta = deltaY > 0; // for IE

      var actualScroll = scrollTop + height;
      // console.log('dy:' + deltaY + ',h:' + height
          // + ',scrollTop:' + scrollTop + ',scrollHeight:' + scrollHeight);
      if (!positiveDelta && deltaY + scrollTop < 0) {
        el.scrollTop = 0;
        preventScroll(e);
      } else if (positiveDelta > scrollHeight - actualScroll) {
        el.scrollTop = scrollHeight - height;
        preventScroll(e);
      }
      return this;
    });
  },

  /**
   * Sets a div (or other element), as not selectable.
   */
  setNotSelectable: function(id) {
    glift.dom.elem(id).css({
      'webkitTouchCallout': 'none',
      'webkitUserSelect': 'none',
      'MozUserSelect': 'moz-none',
      'msUserSelect': 'none',
      'user-select': 'none',
      'webkitHighlight': 'none',
      'webkitTapHighlightColor': 'rgba(0,0,0,0)',
      'cursor': 'default'
    });
  }
};

goog.provide('glift.ajax');

/**
 * Ajax/XHR wrapper.
 */
glift.ajax = {
  get: function(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200 || request.status === 304) {
          callback(request.responseText);
        } else {
          // We reached our target server, but it returned an error
          console.log('(' + request.status + ') Error retrieving ' + url);
        }
      }
    };
    request.onerror = function() {
      throw new Error(request.responseText);
      // There was a connection error of some sort
    };
    request.open('GET', url, true);
    request.send();
  }
};

goog.provide('glift.themes');

glift.themes = {
  /**
   * Registered themes dict.
   *
   * TODO(kashomon): Make private?  Or perhaps denote with underscore.
   */
  registered: {},

  /**
   * Get a Theme based on ID
   *
   * Accepts a (case sensitive) ID and returns a COPY of the theme.
   *
   * Returns null if no such theme exists.
   *
   * @param {string} id ID of the theme.
   * @return {!glift.themes.base} A theme templated by the relevant them
   *    specified.
   */
  get: function(id) {
    var registered = glift.themes.registered;
    if (!id in registered) {
      throw new Error('No theme available for theme with name: ' + id);
    }
    var rawTheme = !(id in registered) ? null : registered[id];
    if (rawTheme) {
      return glift.themes.deepCopy({}, rawTheme, glift.themes.baseTemplate);
    } else {
      return rawTheme;
    }
  },

  /**
   * Copy the theme data from the templateTheme to the themeBase. This is a true
   * deep copy of the properties.  We do this so that we don't pollute the base
   * themes with random data injected later, such as a GoBoard background image.
   *
   * This isn't smart about cycles or crazy things like that, but why would you
   * ever put something like that in a theme?
   *
   * The builder, which should start out an empyty object, is simply a place to
   * dump the copied theme data
   */
  deepCopy: function(builder, themeBase, templateTheme) {
    for (var key in templateTheme) {
      var type = glift.util.typeOf(templateTheme[key]);
      var copyFrom = templateTheme;
      if (themeBase[key] !== undefined) {
        copyFrom = themeBase;
      }

      switch(type) {
        case 'object':
          builder[key] = glift.themes.deepCopy(
              {}, themeBase[key] || {}, templateTheme[key]);
          break;
        case 'array':
          var set = {};
          var out = [];
          var arr = templateTheme[key].concat(themeBase[key] || []);
          for (var i = 0; i < arr.length; i++) {
            // if the items are objects, they won't currently be deep copied.
            var item = arr[i];
            if (item in set) {
              // do nothing
            } else {
              out.push(item);
              set[item] = 1;
            }
          }
          builder[key] = item;
          break;
        default:
          builder[key] = copyFrom[key];
      }
    }
    return builder;
  },

  /**
   * Accepts a (case sensitive) theme ID and true if the theme exists and false
   * otherwise.
   * @param {string} id
   * @return {boolean} Whether or not the theme is regestered.
   */
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  /**
   * Set the 'fill' for the go board to be an image
   * For a theme object. This generally assumes you're called 'get' so that you
   * have a copy of the base theme.
   *
   * @param {!glift.themes.base} theme
   * @param {string} value
   */
  setGoBoardBackground: function(theme, value) {
    if (theme) {
      theme.board.imagefill = value
      // "url('" + value  + "')";
    } else {
      throw "Yikes! Not a theme: cannot set background image."
    }
  }
};

goog.provide('glift.themes.base');

/**
 * @typedef {!Object}
 */
// TODO(kashomon): Provide real type
glift.themes.base;

/**
 * Base theme from which all others extend. All possible options should be
 * placed here.
 */
glift.themes.baseTemplate = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000",
    // imagefill -- defined on loading
    'stroke-width': 1
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: 'black'
  },

  lines: {
    stroke: "black",
    'stroke-width': 0.5
  },

  boardCoordLabels: {
    fill: 'black',
    stroke: 'black',
    opacity: '0.6',
    'font-family': 'sans-serif',
    'font-size': '0.6'
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "none"
    },

    marks: {
      'font-family' : 'sans-serif',
      'font-size': '0.7'
    },

    EMPTY : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black',
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
        CORRECT_VARIATION : {
          stroke: '#22D',
          fill: '#22D'
        }
      }
    },

    BLACK : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white',
        STONE_MARKER : {
          fill: '#CCF',
          opacity: 0.6
        }
      }
    },
    BLACK_HOVER : {
      fill: "black",
      opacity: 0.5
    },
    WHITE : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      'stroke-width': 1, // The default value
      marks: {
        fill: 'black',
        stroke: 'black',
        STONE_MARKER : {
          fill: '#33F',
          opacity: 0.6
        }
      }
    },
    WHITE_HOVER : {
      fill: "white",
      stroke: "black",
      opacity: 0.5
    }
  },

  icons: {
    // Vertical margin in pixels.
    vertMargin: 5,
    // Minimum horizontal margin in pixels.
    horzMargin: 5,

    DEFAULT: {
      fill: "#000",
      stroke: 'black'
      //fill: "90-#337-#55B"
    },

    DEFAULT_HOVER: {
      fill: '#AAA',
      stroke: '#AAA'
      //fill: "90-#337-#55D"
    },

    tooltips: {
      padding: '5px',
      background: '#555',
      color: '#EEE',
      webkitBorderRadius: '10px',
      MozBorderRadius: '10px',
      'border-radius': '10px'
      // fontSize: '16px',
      // fontFamily: 'Palatino'
    },

    tooltipTimeout: 1200 // milliseconds
  },

  statusBar: {
    fullscreen: {
      'background-color': '#FFF'
    },

    gameInfo: {
      textDiv: {
        'background-color': 'rgba(0,0,0,0.75)',
        'border-radius': '25px'
      },
      text: {
        'fontFamily': '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#FFF'
      },
      textBody: {
        'margin-bottom': '0.5em'
      },
      textTitle: {
        'margin-bottom': '1em'
      }
    },

    icons: {
      vertMargin: 4,
      horzMargin: 5,

      DEFAULT: {
        fill: "#000",
        stroke: '#000',
        opacity: 1.0
      },

      DEFAULT_HOVER: {
        fill: '#AAA',
        stroke: '#AAA'
      },

      tooltips: {
        padding: '5px',
        background: '#555',
        color: '#EEE',
        webkitBorderRadius: '10px',
        MozBorderRadius: '10px',
        borderRadius: '10px'
      },

      tooltipTimeout: 1200 // milliseconds
    }
  },

  commentBox:  {
    css: {
      background: 'none',
      padding: '10px',
      margin: '0px'
    }
  },

  defs: {
    // TODO(kashomon): Support SVG Defs
  }
};

goog.provide('glift.themes.registered.COLORFUL');

/**
 * A colorful theme used for debugging.
 *
 * @extends {glift.themes.base}
 */
glift.themes.registered.COLORFUL = {
  board: {
    fill: '#f5be7e'
  },

  commentBox: {
    css: {
      background: '#CCF',
      border: '1px solid'
    }
  },

  icons: {
    DEFAULT: {
      fill: 'blue',
      stroke: 'none'
    },
    DEFAULT_HOVER: {
      fill: 'red',
      stroke: 'none'
    }
  }
};

goog.provide('glift.themes.registered.DEFAULT');

/**
 * @extends {glift.themes.base}
 */
glift.themes.registered.DEFAULT = {};

goog.provide('glift.themes.registered.DEPTH');

/**
 * @extends {glift.themes.base}
 */
glift.themes.registered.DEPTH = {
  stones: {
    shadows: {
      stroke: "none",
      fill: "#777"
    },
    "WHITE" : {
      stroke: "white",
      fill: "white"
    },
    "WHITE_HOVER" : {
      fill: "white",
      stroke: "white",
      opacity: 0.5
    }
  }
};

goog.provide('glift.themes.registered.MOODY');

/**
 * @extends {glift.themes.base}
 */
glift.themes.registered.MOODY = {
  board: {
    fill: '#777'
  },

  stones: {
    'WHITE' : {
      stroke: 'white',
      fill: 'white'
    },
    'WHITE_HOVER' : {
      fill: 'white',
      stroke: 'white',
      opacity: 0.5
    }
  },

  commentBox: {
    css: {
      background: 'none',
      border: ''
    }
  }
}

goog.provide('glift.themes.registered.TEXTBOOK');

/**
 * @extends {glift.themes.base}
 */
glift.themes.registered.TEXTBOOK = {
  board: {
    fill: '#FFF'
  },

  commentBox: {
    css: {
      background: '#FFF'
    }
  }
};

goog.provide('glift.themes.registered.TRANSPARENT');

/**
 * @extends {glift.themes.base}
 */
glift.themes.registered.TRANSPARENT = {
  board: {
    fill: 'none'
  },

  commentBox: {
    css: {
      background: 'none',
      border: ''
    }
  }
};

goog.provide('glift.markdown');
goog.provide('glift.markdown.Ast');

goog.require('glift.marked');

/**
 * Marked is dumped into this namespace. Just for reference
 * https://github.com/chjj/marked
 */
glift.markdown = {
  /** Render the AST from some text. */
  renderAst: function(text) {
    // We expect the markdown extern to be exposed.
    var lex = glift.marked.lexer(text);
    return new glift.markdown.Ast(lex);
  },

  render: function(text) {
    return glift.marked(text);
  }
};


/**
 * Wrapper object for the abstract syntax tree.
 *
 * @constructor @final @struct
 */
glift.markdown.Ast = function(tree) {
  /** From marked, this is an  */
  this.tree = tree;
};

glift.markdown.Ast.prototype = {
  /**
   * Returns the headers. We assume no nested headers.
   */
  headers: function() {
    var out = [];
    for (var i = 0; i < this.tree.length; i++) {
      var elem = this.tree[i];
      if (elem.type === 'heading') {
        out.push(elem);
      }
    }
    return out;
  }
};

goog.provide('glift.marked');


/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 *
 * Modified by Kashomon to include closure type checking.
 */
goog.scope(function() {

/**
 * Helpers
 * @param {string} html Content to encode
 * @param {boolean=} opt_encode Optional encode param
 */
function escape(html, opt_encode) {
  // TODO(kashomon): Currently I've disabled escaping because it's not language
  // agnostic. TODO(kashomon): Flag guardthis function to conditionally turn
  // auto-escaping off.
  return html;
  // return html
    // .replace(!opt_encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    // .replace(/</g, '&lt;')
    // .replace(/>/g, '&gt;')
    // .replace(/"/g, '&quot;')
    // .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

/**
 * An extremely clever function. Successively replaces content in the
 *
 * @param {!RegExp} regexBase Regexp object
 * @param {!string=} opt_flags Optional regex flags
 *
 * Note: The return type is complex and thus elided.
 */
function replace(regexBase, opt_flags) {
  var regex = regexBase.source;
  var opt = opt_flags || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

/**
 * @param {!Object} obj Base object
 * @param {...!Object} var_args Target objects to merge into
 */
function merge(obj, var_args) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

/**
 * Marked Parse Method.
 *
 * @param {string} src Source text to process
 * @param {(!glift.marked.Options|Function)=} opt_options Marked options or
 *    callback
 * @param {Function=} opt_callback
 */
var marked = function(src, opt_options, opt_callback) {
  /** @type {Function} */
  var callback;
  /** @type {glift.marked.Options|undefined} */
  var opt;

  if (opt_callback || typeof opt_options === 'function') {
    if (!opt_callback) {
      // opt_options must be the callback.
      callback = /** @type {Function} */ (opt_options);
      opt = undefined;
    }

    opt = /** @type {glift.marked.Options} */ (
        merge({}, glift.marked.defaults, opt_options || {}));

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    /**
     * Done callback
     * @param {string=} err Optional err message.
     */
    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    // No callback available.
    if (opt_options) {
      opt = merge({}, glift.marked.defaults, opt_options);
    }
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/kashomon/glift.';
    if ((opt_options || glift.marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
};

glift.marked = marked;
glift.marked.parse = marked;

/**
 * Noop function that acts like a Regex object.
 */
var noop = function() {};
noop.exec = noop;

/**
 * Block-Level Grammar
 * @constructor
 * @struct
 */
var Blocker = function() {
  this.newline = /^\n+/;
  this.code = /^( {4}[^\n]+\n*)+/;
  this.fences = noop;
  this.hr = /^( *[-*_]){3,} *(?:\n+|$)/;
  this.heading = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/;
  this.nptable = noop,
  this.lheading = /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/;
  this.blockquote = /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/;
  this.list = /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/;
  this.html = /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/;
  this.def = /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/;
  this.table = noop;
  this.paragraph = /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/;
  this.text = /^[^\n]+/;
  this.bullet = /(?:[*+-]|\d+\.)/;
  this.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
  this.item = replace(this.item, 'gm')
    (/bull/g, this.bullet)
    ();
  this.list = replace(this.list)
    (/bull/g, this.bullet)
    ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
    ('def', '\\n+(?=' + this.def.source + ')')
    ();
  this.blockquote = replace(this.blockquote)
    ('def', this.def)
    ();
  this._tag = '(?!(?:'
    + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
    + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
    + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';
  this.html = replace(this.html)
    ('comment', /<!--[\s\S]*?-->/)
    ('closed', /<(tag)[\s\S]+?<\/\1>/)
    ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
    (/tag/g, this._tag)
    ();
  this.paragraph = replace(this.paragraph)
    ('hr', this.hr)
    ('heading', this.heading)
    ('lheading', this.lheading)
    ('blockquote', this.blockquote)
    ('tag', '<' + this._tag)
    ('def', this.def)
    ();
  /** Normal Block Grammar */
  this.normal = merge({}, this);
  /** GFM Block Grammar */
  this.gfm = merge({}, this.normal, {
    fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    paragraph: /^/
  });
  this.gfm.paragraph = replace(this.paragraph)
    ('(?!', '(?!'
      + this.gfm.fences.source.replace('\\1', '\\2') + '|'
      + this.list.source.replace('\\1', '\\3') + '|')
    ();
  /**
   * GFM + Tables Block Grammar
   */
  this.tables = merge({}, this.gfm, {
    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
  });
};

var block = new Blocker();

/**
 * @typedef {{
 *  type: string,
 *  text: (string|undefined),
 *  lang: (string|undefined),
 *  depth: (number|undefined),
 *  header: (string|undefined),
 *  align: (string|undefined),
 *  cells: (string|undefined),
 *  ordered: (boolean|undefined),
 *  pre: (string|undefined),
 *  href: (string|undefined),
 *  title: (string|undefined)
 * }}
 */
glift.marked.Token;


/**
 * Block Lexer
 *
 * @constructor
 *
 * @param {glift.marked.Options=} opt_options
 */
glift.marked.Lexer = function(opt_options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = opt_options || glift.marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
};

var Lexer = glift.marked.Lexer;

/**
 * Expose Block Rules
 */
Lexer.rules = block;

/**
 * Static Lex Method
 *
 * @param {string} src
 * @param {glift.marked.Options=} opt_options
 *
 * @return {!Array<!glift.marked.Token>} Array of tokens
 */
Lexer.lex = function(src, opt_options) {
  var lexer = new Lexer(opt_options);
  return lexer.lex(src);
};

glift.marked.lexer = Lexer.lex;

/**
 * Preprocessing
 *
 * @return {!Array<!glift.marked.Token>} Array of tokens.
 */
Lexer.prototype.lex = function(src) {
  src = src
    // Convert carriage returns into newlines
    .replace(/\r\n|\r/g, '\n')
    // Convert tabs to 4 spaces
    .replace(/\t/g, '    ')
    // Convert No-break space to a normal space
    .replace(/\u00a0/g, ' ')
    // Weird Unicode newline codepoint
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing. Tokenize some source text
 *
 * (Kashomon:I have no idea what top or bq do. They look like hacky flags to
 * encode state).
 *
 * @param {string} src Source text
 * @param {boolean=} top
 * @param {boolean=} bq
 *
 * @return {!Array<!glift.marked.Token>}
 *
 */
Lexer.prototype.token = function(src, top, bq) {
  src = src.replace(/^ +$/gm, '')
  var next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 *
 * @constructor
 */
glift.marked.InlineLexer = function(links, options) {
  this.options = options || glift.marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer();
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

var InlineLexer = glift.marked.InlineLexer;

/**
 * Expose Inline Rules
 */
InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */
InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

glift.marked.inlineLexer = InlineLexer.output;

/**
 * Lexing/Compiling
 */
InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */
InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */
InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */
InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 *
 * @constructor
 * @param {glift.marked.Options=} opt_options
 */
glift.marked.Renderer = function(opt_options) {
  this.options = opt_options || {};
}

var Renderer = glift.marked.Renderer;

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

/**
 * Constructs an HTML Image string.
 * @param {string} href
 * @param {string} title
 * @param {string} text
 * @return {string}
 */
Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

/**
 * Parsing & Compiling
 *
 * @constructor
 * @param {glift.marked.Options=} opt_options
 */
glift.marked.Parser = function(opt_options) {
  this.tokens = [];
  this.token = null;
  this.options = opt_options || glift.marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

var Parser = glift.marked.Parser;

/**
 * Static Parse Method
 * @param {!Array<glift.marked.Token>} src Array of tokens.
 * @param {glift.marked.Options=} opt_options Optional marked options
 */
Parser.parse = function(src, opt_options) {
  var parser = new Parser(opt_options);
  return parser.parse(src);
};

glift.marked.parse = Parser.parse;

/**
 * Parse Loop
 * @param {!Array<glift.marked.Token>} src Array of tokens.
 */
Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */
Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */
Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */
Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse the current token
 */
Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * @typedef {{
 *  gfm: (boolean|undefined),
 *  tables: (boolean|undefined),
 *  breaks: (boolean|undefined),
 *  pedantic: (boolean|undefined),
 *  sanitize: (boolean|undefined),
 *  smartLists: (boolean|undefined),
 *  silent: (boolean|undefined),
 *  highlight: (?Function|undefined),
 *  langPrefix: (string|undefined),
 *  smartypants: (boolean|undefined),
 *  headerPrefix: (string|undefined),
 *  renderer: (!glift.marked.Renderer|undefined),
 *  xhtml: (boolean|undefined)
 * }}
 */
glift.marked.Options;

/**
 * @type {!glift.marked.Options}
 */
glift.marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer(),
  xhtml: false
};

/**
 * Options
 */
glift.marked.setOptions = function(opt) {
  merge(glift.marked.defaults, opt);
  return glift.marked.parse;
};

glift.marked.options = glift.marked.setOptions;

});  // goog.scope

goog.provide('glift.displays');

glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which creates an SVG
   * based Go Board.
   *
   * @param {string} divId
   * @param {!glift.orientation.BoundingBox} boardBox
   * @param {!glift.themes.base} theme Glift theme.
   * @param {glift.enums.boardRegions} boardRegion Board region to crop the
   *    board to.
   * @param {number} intersections Number of intersections for the Go
   *    board. Usually 9, 13 or 19.
   * @param {glift.enums.rotations} rotation Apply a rotation to the Go board
   *    during the draw phase.
   * @param {boolean} drawBoardCoords Whether or not to draw the board
   *    coordinates.
   *
   * @return {glift.displays.board.Display} The display.
   */
  create: function(
      divId,
      boardBox,
      theme,
      boardRegion,
      intersections,
      rotation,
      drawBoardCoords) {
    glift.util.majorPerfLog("Before environment creation");

    var env = glift.displays.environment.get(
        divId, boardBox, boardRegion, intersections, drawBoardCoords);

    glift.util.majorPerfLog("After environment creation");
    return glift.displays.board.create(env, theme, rotation);
  },

  /**
   * Return the bounding box for a div.
   * @param {string} divId ID of a div.
   * @return {!glift.orientation.BoundingBox}
   */
  bboxFromDiv: function(divId) {
    var elem = glift.dom.elem(divId);
    return glift.orientation.bbox.fromSides(
        glift.util.point(0,0), elem.width(), elem.height());
  }
};

goog.provide('glift.displays.boardPoints');
goog.provide('glift.displays.BoardPoints');

/**
 * @typedef {{
 *  intPt: glift.Point,
 *  coordPt: glift.Point,
 *  bbox: glift.orientation.BoundingBox
 * }}
 */
glift.displays.BoardPt;

/**
 * Construct the board points from a linebox.
 */
glift.displays.boardPoints = function(
    linebox, maxIntersects, drawBoardCoords) {
  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      leftExtAmt = linebox.leftExt * spacing,
      rightExtAmt = linebox.rightExt * spacing,
      left = linebbox.left() + leftExtAmt,

      topExtAmt = linebox.topExt * spacing,
      botExtAmt = linebox.botExt * spacing,
      top = linebbox.top() + topExtAmt,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      // Mapping from int point string, e.g., '0,18', to coordinate data.
      points = {},
      xCoordLabels = 'ABCDEFGHJKLMNOPQRSTUVWXYZ',
      edgeCoords = [];

  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);
      var coordPt = glift.util.point(xCoord, yCoord);

      if (drawBoardCoords) {
        if ((i === 0 || i === linebox.yPoints) &&
            (j === 0 || j === linebox.xPoints)) {
          // Discard corner points
        } else if (i === 0 || i === linebox.yPoints) {
          // Handle the top and bottom sides.
          if (i === 0) {
            coordPt = coordPt.translate(0, -1 * topExtAmt);
          } else if (i === linebox.yPoints) {
            coordPt = coordPt.translate(0, botExtAmt)
          }
          edgeCoords.push({
            label: xCoordLabels.charAt(intPt.x()  - 1),
            coordPt: coordPt
          });
        } else if (j === 0 || j === linebox.xPoints)  {
          // Handle the left and right sides.
          if (j === 0) {
            coordPt = coordPt.translate(-1 * leftExtAmt, 0);
          } else if (j === linebox.xPoints) {
            coordPt = coordPt.translate(rightExtAmt, 0)
          }
          edgeCoords.push({
            // Flip the actual label around the x-axis.
            label: Math.abs(intPt.y() - maxIntersects) + 1,
            coordPt: coordPt
          });
        } else {
          intPt = intPt.translate(-1, -1);
          points[intPt.toString()] = {
            intPt: intPt,
            coordPt: coordPt,
            bbox: glift.orientation.bbox.fromPts(
                glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
                glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
          };
        }
      } else {
        // Default case: Don't draw coordinates
        points[intPt.toString()] = {
          intPt: intPt,
          coordPt: coordPt,
          bbox: glift.orientation.bbox.fromPts(
              glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
              glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
        };
      }
    }
  }
  return new glift.displays.BoardPoints(
      points, spacing, maxIntersects, edgeCoords);
};

/**
 * BoardPoints maintains a mapping from an intersection on the board
 * to a coordinate in pixel-space. It also contains information about the
 * spcaing of the points and the radius (useful for drawing circles).
 *
 * Later, this is directly to create everything that lives on an intersection.
 * In particular,
 *  - lines
 *  - star ponts
 *  - marks
 *  - stones
 *  - stone shadows
 *  - button bounding box.
 *
 *  Note: The integer points are 0 Indexed.
 *
 * @constructor @final @struct
 */
glift.displays.BoardPoints = function(
    points, spacing, numIntersections, edgeLabels) {
  this.points = points; // string map 
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
  this.edgeCoordLabels = edgeLabels;
  this.dataCache = undefined;
};

glift.displays.BoardPoints.prototype = {
  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18 for a 19x19.  Recall that board points
   * from the the top left (0,0) to the bottom right (18, 18).
   *
   * Ex. :  (0,2) =>
   *  {
   *    intPt: (0,2),
   *    coordPt: (12.2, 34.2),
   *    ...
   *  }
   */
  getCoord: function(pt) {
    return this.points[pt.toString()];
  },

  /**
   * Traverse over all the points. The order in which the points are traversed
   * is not guaranteed.
   */
  forEach: function(func) {
    for (var key in this.points) {
      func(this.points[key]);
    }
  },

  /**
   * Return the points as an array.
   */
  data: function() {
    if (this.dataCache !== undefined) {
      return this.dataCache;
    }
    var data = [];
    this.forEach(function(point) {
      data.push(point);
    });
    this.dataCache = data;
    return data;
  },

  /**
   * Test whether an integer point exists in the points map.
   * TODO(kashomon): Rename.  This is not apt since it confuses the idea of
   * integer points and float coordinates.
   */
  hasCoord: function(pt) {
    return this.points[pt.toString()] !== undefined;
  },

  /**
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   */
  starPoints: function() {
    var point = glift.util.point,
        // In pts, each element in the sub array is mapped against every other
        // element.  Thus [2, 6] generates [(2,2), (2,6), (6,2), (6,6)] and
        // [[2, 6], [4]] generates the above concatinated with [4,4].
        pts = {
          9 : [[ 2, 6 ], [ 4 ]],
          13 : [[ 3, 9 ], [6]],
          19 : [[ 3, 9, 15 ]]
        },
        outerSet = pts[this.numIntersections] || [],
        outStarPoints = [];
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (this.hasCoord(pt)) {
            outStarPoints.push(pt);
          }
        }
      }
    }
    return outStarPoints;
  }
};

goog.provide('glift.displays.cropbox');
goog.provide('glift.displays.DisplayCropBox');

glift.displays.cropbox = {
  /** @const */
  EXT: .5, // Extension
  /** @const */
  DEFAULT_EXTENSION: 0, // Wut.
  /** @const */
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  /**
   * Creates a cropbox based on a region, the number of intersections, and a
   * true/false flag for drawing the board coordinates.
   *
   * @param {glift.enums.boardRegions} region
   * @param {number} intersects Number of intersections for the Go board.
   * @param {boolean=} opt_drawBoardCoords Whether or not to draw board coordinates.
   *    Optional: Defaults to false.
   */
  getFromRegion: function(region, intersects, opt_drawBoardCoords) {
    var cropbox = glift.orientation.cropbox.get(region, intersects);
    var drawBoardCoords = opt_drawBoardCoords || false;
    var maxIntersects = drawBoardCoords ? intersects + 2 : intersects;
    var top = cropbox.bbox.top(),
        bottom = cropbox.bbox.bottom(),
        left = cropbox.bbox.left(),
        right = cropbox.bbox.right();
    if (drawBoardCoords) {
      bottom += 2;
      right += 2;
    }

    var cx = new glift.orientation.Cropbox(
        glift.orientation.bbox.fromPts(
            glift.util.point(left, top),
            glift.util.point(right, bottom)),
        maxIntersects);
    return new glift.displays.DisplayCropBox(cx);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 *
 * @param {!glift.orientation.Cropbox} cbox The wrapped Cropbox.
 *
 * @constructor
 */
glift.displays.DisplayCropBox = function(cbox) {
  /** @private {!glift.orientation.Cropbox} */
  this.cbox_ = cbox;
};

glift.displays.DisplayCropBox.prototype = {
  /**
   * Returns the cbox. The cbox is a bounding box that describes what points on
   * the go board should be displayed. Generally, both the width and height of
   * the cbox must be between 0 (exclusive) and maxIntersects (inclusive).
   *
   * @return {!glift.orientation.Cropbox}
   */
  cbox: function() { return this.cbox_; },

  /**
   * Returns the bbox for the cropbox
   *
   * @return {!glift.orientation.BoundingBox}
   */
  bbox: function() { return this.cbox_.bbox; },

  /**
   * Returns the maximum board size.  Often referred to as max intersections
   * elsewhere.  Typically 9, 13 or 19.
   *
   * @return {number}
   */
  maxBoardSize: function() { return this.cbox_.size; },

  /**
   * The extensions are a special modification for cropped boards.  Due to some
   * quirks of the way the board is drawn, it's convenient to add this here to
   * indicate an extra amount around the edge necessary for the overflow lines
   * (the ragged crop-edge).
   *
   * Note: the x and y coordinates for these points will either be 0 or 0.5.
   *
   * @return {number}
   */
  topExt: function() {
    return this.cbox_.hasRaggedTop() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  botExt: function() { 
    return this.cbox_.hasRaggedBottom() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  leftExt: function() {
    return this.cbox_.hasRaggedLeft() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  rightExt: function() {
    return this.cbox_.hasRaggedRight() ? glift.displays.cropbox.EXT : 0;
  },

  /**
   * Number of x points (or columns) for the cropped go board.
   * @return {number}
   */
  xPoints: function() { return this.cbox().bbox.width(); },

  /**
   * Number of y points (or rows) for the cropped go board.
   * @return {number}
   */
  yPoints: function() { return this.cbox().bbox.height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   * @return {number}
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.width() + this.leftExt() +
        + this.rightExt() + OVERFLOW;
  },

  /** @return {number} */
  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.height() + this.topExt() +
        + this.botExt() + OVERFLOW;
  }
};

goog.provide('glift.displays.environment');
goog.provide('glift.displays.GuiEnvironment');

/**
 * The Environment contains:
 *  - The bounding box for the lines.
 *  - The bounding box for the whole board
 *  - The bounding boxes for the sidebars.
 *  - The divId to be used
 */
glift.displays.environment = {
  /**
   * Gets the environment wrapper, passing in the display options. This is the
   * preferred method.  It's expected that the proper display code will
   */
  get: function(
      divId, boardBox, boardRegion, intersections, drawBoardCoords) {
    if (!divId) {
      throw new Error('No DivId Specified!')
    }

    // For speed and isolation purposes, it's preferred to define the boardBox
    // rather than to calculate the h/w by inspecting the div here.
    // TODO(kashomon): Remove this now given the UI positioner stuff?
    if (divId && !boardBox) {
      boardBox = glift.displays.bboxFromDiv(divId);
    }

    if (!boardBox) {
      throw new Error('No Bounding Box defined for display environment!')
    }
    return new glift.displays.GuiEnvironment(
        divId, boardBox, boardRegion, intersections, drawBoardCoords);
  }
};

/**
 * @param {string} divId
 * @param {!glift.orientation.BoundingBox} bbox
 * @param {!glift.enums.boardRegions} boardRegion
 * @param {number} intersections Number of intersections (usu. 19).
 * @param {boolean} drawBoardCoords Whether or not to draw the board
 *    coordinates.
 *
 * @constructor @final @struct
 */
glift.displays.GuiEnvironment = function(
    divId, bbox, boardRegion, intersections, drawBoardCoords) {
  /** @type {string} */
  this.divId = divId;
  /** @type {!glift.orientation.BoundingBox} */
  this.bbox = bbox; // required
  /** @type {number} */
  this.divHeight = bbox.height();
  /** @type {number} */
  this.divWidth = bbox.width();
  /** @type {!glift.enums.boardRegions} */
  this.boardRegion = boardRegion;
  /** @type {number} */
  this.intersections = intersections;
  /** @type {boolean} */
  this.drawBoardCoords = drawBoardCoords;

  var cropNamespace = glift.displays.cropbox;

  /** @type {!glift.displays.DisplayCropBox} */
  this.cropbox = glift.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections, this.drawBoardCoords);

  // ------- Defined during init ------- //
  /** @type {glift.orientation.BoundingBox} */
  this.divBox = null;
  /** @type {glift.orientation.BoundingBox} */
  this.goBoardBox = null;
  /** @type {glift.displays.LineBox} */
  this.goBoardLineBox = null;
  /** @type {glift.displays.BoardPoints} */
  this.boardPoints = null;
};

glift.displays.GuiEnvironment.prototype = {
  /**
   * Initialize the internal variables that tell where to place the go
   * broard.
   */
  init: function() {
    var displays = glift.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth = this.divWidth,
        cropbox = this.cropbox,
        dirs = glift.enums.directions,

        // The box for the entire div.
        // TODO(kashomon): This is created twice, which is a little silly (but
        // not expensive) in _resetDimensions. Might want to replace.
        divBox = glift.orientation.bbox.fromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.displays.boardPoints(
            goBoardLineBox, this.intersections, this.drawBoardCoords);
    this.divBox = divBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    return this;
  }
};

goog.provide('glift.displays.ids');
goog.provide('glift.displays.ids.Generator');

/**
 * Collection of ID utilities, mostly for SVG.
 */
glift.displays.ids = {
  /**
   * Create an ID generator.
   */
  generator: function(divId) {
    return new glift.displays.ids.Generator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * @param {string} divId
   * @param {glift.enums.svgElements} type
   * @param {glift.Point|Object|string=} opt_extraData
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  element: function(divId, type, opt_extraData) {
    var base = divId + "_" + type;
    if (opt_extraData !== undefined) {
      if (opt_extraData.x !== undefined) {
        return base + '_' + opt_extraData.x() + "_" + opt_extraData.y();
      } else {
        return base + '_' + opt_extraData.toString();
      }
    } else {
      return base;
    }
  }
};

/**
 * Id Generator constructor.
 *
 * @constructor @final @struct
 */
glift.displays.ids.Generator = function(divId) {
  this.divId = divId;
  this._eid = glift.displays.ids.element;
  this._enum = glift.enums.svgElements;

  this._svg = this._eid(this.divId, this._enum.SVG);
  this._board = this._eid(this.divId, this._enum.BOARD);
  this._boardCoordLabelGroup =
      this._eid(this.divId, this._enum.BOARD_COORD_LABELS);
  this._stoneGroup = this._eid(this.divId, this._enum.STONE_CONTAINER);
  this._stoneShadowGroup =
      this._eid(this.divId, this._enum.STONE_SHADOW_CONTAINER);
  this._starpointGroup = this._eid(this.divId, this._enum.STARPOINT_CONTAINER);
  this._buttonGroup = this._eid(this.divId, this._enum.BUTTON_CONTAINER);
  this._boardButton = this._eid(this.divId, this._enum.FULL_BOARD_BUTTON);
  this._lineGroup = this._eid(this.divId, this._enum.BOARD_LINE_CONTAINER);
  this._markGroup = this._eid(this.divId, this._enum.MARK_CONTAINER);
  this._iconGroup = this._eid(this.divId, this._enum.ICON_CONTAINER);
  this._intersectionsGroup = this._eid(this.divId, this._enum.BOARD);
      this._eid(this.divId, this._enum.INTERSECTIONS_CONTAINER);
  this._tempMarkGroup = this._eid(this.divId, this._enum.TEMP_MARK_GROUP);
};

glift.displays.ids.Generator.prototype = {
  /** ID for the svg container. */
  svg: function() { return this._svg; },

  /** ID for the board. */
  board: function() { return this._board; },

  /** Group id for the board coordinate label group */
  boardCoordLabelGroup: function() { return this._boardCoordLabelGroup; },

  /** ID for the intersections group. */
  intersections: function() { return this._intersectionsGroup; },

  /** Group id for the stones. */
  stoneGroup: function() { return this._stoneGroup; },

  /** Id for a stone. */
  stone: function(pt) { return this._eid(this.divId, this._enum.STONE, pt); },

  /** Group id for the stone shadows. */
  stoneShadowGroup: function() { return this._stoneShadowGroup; },

  /** ID for a stone shadow. */
  stoneShadow: function(pt) {
    return this._eid(this.divId, this._enum.STONE_SHADOW, pt);
  },

  /** Group id for the star points. */
  starpointGroup: function() { return this._starpointGroup; },

  /** ID for a star point. */
  starpoint: function(pt) {
    return this._eid(this.divId, this._enum.STARPOINT, pt);
  },

  /** Group id for the buttons. */
  buttonGroup: function() { return this._buttonGroup; },

  /** ID for a button. */
  button: function(name) {
    return this._eid(this.divId, this._enum.BUTTON, name);
  },

  /** ID for a full-board button. */
  fullBoardButton: function() { return this._boardButton; },

  /** Group id for the lines. */
  lineGroup: function() { return this._lineGroup; },

  /** ID for a line. */
  line: function(pt) {
    return this._eid(this.divId, this._enum.BOARD_LINE, pt);
  },

  /** Group id a Mark Container. */
  markGroup: function() { return this._markGroup; },

  /** ID for a mark. */
  mark: function(pt) {
    return this._eid(this.divId, this._enum.MARK, pt);
  },

  /** Group id for temporary marks. */
  tempMarkGroup: function() {
    return this._tempMarkGroup;
  },

  /** ID for a guideline. */
  guideLine: function() {
    return this._eid(this.divId, this._enum.GUIDE_LINE);
  },

  /** Group ID for the icons.  */
  iconGroup: function() { return this._iconGroup; },

  /** ID for an icon . */
  icon: function(name) {
    return this._eid(this.divId, this._enum.ICON, name);
  },

  /** Group ID for the temporary icons. */
  tempIconGroup: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON_CONTAINER, name);
  },

  /** ID for a temporary icon . */
  tempIcon: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON, name);
  },

  /** ID for a temporary text. */
  tempIconText: function(name) {
    return this._eid(this.divId, this._enum.TEMP_TEXT, name);
  }
};

goog.provide('glift.displays.LineBox');

/**
 * @return {!glift.displays.LineBox} The constructed LineBox.
 */
glift.displays.getLineBox = function(boardBox, cropbox) {
  var totalOverflow = glift.displays.cropbox.OVERFLOW;
  var oneSidedOverflow = totalOverflow / 2;
  // TODO(kashomon): This is very mysterious. Provide more documentation.
  var xSpacing = boardBox.width() / cropbox.widthMod();
  var ySpacing = boardBox.height() / cropbox.heightMod();
  var top = ySpacing * oneSidedOverflow; // Scale the overflow by spacing
  var left = xSpacing * oneSidedOverflow; // Scale the overflow by spacing
  var bot = ySpacing * (cropbox.heightMod() - oneSidedOverflow);
  var right = xSpacing * (cropbox.widthMod() - oneSidedOverflow);
  var leftBase = boardBox.topLeft().x();
  var topBase = boardBox.topLeft().y();

  // The Line Box is an extended cropbox.
  var lineBoxBoundingBox = glift.orientation.bbox.fromPts(
      glift.util.point(left + leftBase, top + topBase),
      glift.util.point(right + leftBase, bot + topBase));

  var out = new glift.displays.LineBox(
      lineBoxBoundingBox, xSpacing, cropbox);
  return out;
};

/**
 * Container for information relating to line-boxes.
 *
 * @constructor
 * @final
 * @struct
 */
glift.displays.LineBox = function(boundingBox, spacing, cropbox) {
  this.bbox = boundingBox;
  this.spacing = spacing;
  this.topExt = cropbox.topExt();
  this.botExt = cropbox.botExt();
  this.leftExt = cropbox.leftExt();
  this.rightExt = cropbox.rightExt();

  this.pointTopLeft = cropbox.cbox().bbox.topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};

/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 *
 * @param {glift.orientation.BoundingBox} divBox
 * @param {glift.displays.DisplayCropBox} cropbox
 * @param {glift.enums.boardAlignments=} opt_alignment
 */
glift.displays.getResizedBox = function(divBox, cropbox, opt_alignment) {
  var aligns = glift.enums.boardAlignments;
  var alignment = opt_alignment || aligns.CENTER;
  var util = glift.util,
      newDims = glift.displays.getCropDimensions(
          divBox.width(),
          divBox.height(),
          cropbox),
      newWidth = newDims.width,
      newHeight = newDims.height,
      xDiff = divBox.width() - newWidth,
      yDiff = divBox.height() - newHeight,
      // These are used to center the box.  However, it's not always the case
      // that we really do want to center the box.
      xDelta = alignment === aligns.RIGHT ? xDiff : xDiff / 2,
      yDelta = alignment === aligns.TOP ? 0 : yDiff / 2,
      newLeft = divBox.topLeft().x() + xDelta,
      newTop = divBox.topLeft().y() + yDelta,
      newBox = glift.orientation.bbox.fromSides(
          util.point(newLeft, newTop), newWidth, newHeight);
  if (glift.global.debugMode) {
    newBox._debugInfo = function() {
      return {
        newDims: newDims,
        newWidth: newWidth,
        newHeight: newHeight,
        xDiff: xDiff,
        yDiff: yDiff,
        xDelta: xDelta,
        yDelta: yDelta,
        newLeft: newLeft,
        newTop: newTop
      };
    };
  }
  return newBox;
};

/**
 * Change the dimensions of the box (the height and width) to have the same
 * proportions as cropHeight / cropWidth;
 *
 * @param {number} width
 * @param {number} height
 * @param {glift.displays.DisplayCropBox} cropbox.
 */
glift.displays.getCropDimensions = function(width, height, cropbox) {
  var origRatio = height / width,
      cropRatio = cropbox.heightMod() / cropbox.widthMod(),
      newHeight = height,
      newWidth = width;
  if (origRatio > cropRatio) {
    newHeight = width * cropRatio;
  } else if (origRatio < cropRatio) {
    newWidth = height / cropRatio;
  }
  return {
    height: newHeight,
    width: newWidth
  };
};

goog.provide('glift.displays.board');
goog.provide('glift.displays.board.Display');

/** @namespace */
glift.displays.board = {};

/**
 * Create a new display Board.
 *
 * @param {!glift.displays.GuiEnvironment} env Glift display environment.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {!glift.enums.rotations} rotation Rotation enum
 */
glift.displays.board.create = function(env, theme, rotation) {
  return new glift.displays.board.Display(env, theme, rotation).draw();
};

/**
 * The core Display object returned to the user.
 *
 * @param {!glift.displays.GuiEnvironment} environment Gui environment object.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {glift.enums.rotations=} opt_rotation Optional rotation to rotate the
 *    points.
 *
 * @constructor @struct @final
 * @package
 */
glift.displays.board.Display = function(environment, theme, opt_rotation) {
  /** @private {glift.displays.GuiEnvironment} */
  this.environment_ = environment;

  /** @private {!glift.themes.base} */
  this.theme_ = theme;

  /**
   * Rotation indicates whether we should rotate by stones/marks in the display
   * by 90, 180, or 270 degrees,
   * @private {!glift.enums.rotations}
   */
  this.rotation_ = opt_rotation || glift.enums.rotations.NO_ROTATION;

  // Variables defined during draw()
  /** @private {glift.displays.svg.SvgObj} svgBase Root SVG object. */
  this.svg_ = null;

  /** @private {?glift.displays.board.Intersections} */
  this.intersections_ = null;

  /**
   * The flattened representation of the Go board. This should exactly
   * correspond to the data rendered in the SGF.
   *
   * @private {!glift.flattener.Flattened}
   */
  this.flattened_ = glift.flattener.emptyFlattened(this.numIntersections());
};

glift.displays.board.Display.prototype = {
  boardPoints: function() { return this.environment_.boardPoints; },
  /** @return {string} */
  boardRegion: function() { return this.environment_.boardRegion; },
  /** @return {string} */
  divId: function() { return this.environment_.divId },
  /** @return {number} */
  numIntersections: function() { return this.environment_.intersections; },
  /** @return {?glift.displays.board.Intersections} */
  intersections: function() { return this.intersections_; },
  /** @return {!glift.enums.rotations} */
  rotation: function() { return this.rotation_; },
  /** @return {boolean} */
  drawBoardCoords: function() { return this.environment_.drawBoardCoords; },
  /** @return {number} */
  width: function() { return this.environment_.goBoardBox.width() },
  /** @return {number} */
  height: function() { return this.environment_.goBoardBox.height() },

  /**
   * Initialize the SVG This allows us to create a base display object without
   * creating all drawing all the parts.
   *
   * @return {!glift.displays.board.Display}
   */
  init: function() {
    if (!this.svg_) {
      this.destroy(); // make sure everything is cleared out of the div.
      this.svg_ = glift.displays.svg.svg({
        height: '100%',
        width: '100%',
        position: 'float',
        top: 0,
        id: this.divId() + '_svgboard'
      });
    }
    this.environment_.init();
    return this;
  },

  /**
   * Draws the GoBoard!
   * @return {!glift.displays.board.Display}
   */
  draw:  function() {
    this.init();
    var board = glift.displays.board,
        env = this.environment_,
        boardPoints = env.boardPoints,
        theme = this.theme_,
        svg = this.svg_,
        divId = this.divId(),
        svglib = glift.displays.svg,
        idGen = glift.displays.ids.generator(divId);

    board.boardBase(svg, idGen, env.goBoardBox, theme);
    board.initBlurFilter(divId, svg); // in boardBase.  Should be moved.

    var intGrp = svglib.group().setId(idGen.intersections());
    svg.append(intGrp);

    board.boardLabels(intGrp, idGen, boardPoints, theme);

    board.lines(intGrp, idGen, boardPoints, theme);
    board.starpoints(intGrp, idGen, boardPoints, theme);

    board.shadows(intGrp, idGen, boardPoints, theme);
    board.stones(intGrp, idGen, boardPoints, theme);
    board.markContainer(intGrp, idGen);
    board.buttons(intGrp, idGen, boardPoints);

    this.intersections_ = new glift.displays.board.Intersections(
        divId, intGrp, boardPoints, theme, this.rotation());
    glift.util.majorPerfLog("After display object creation");

    this.flush();
    glift.util.majorPerfLog("After flushing to display");
    return this; // required
  },

  /**
   * Update the board with a new flattened object. The board stores the previous
   * flattened object and just updates based on the diff between the two.
   *
   * @param {!glift.flattener.Flattened} flattened
   * @return {!glift.displays.board.Display} this
   */
  updateBoard: function(flattened) {
    this.intersections().clearMarks();
    var diffArr = this.flattened_.board().diff(flattened.board());

    var symb = glift.flattener.symbols;
    var marks = glift.enums.marks
    var symbolStoneToState = glift.flattener.symbolStoneToState;
    var symbolMarkToMark = glift.flattener.symbolMarkToMark;

    for (var i = 0; i < diffArr.length; i++) {
      /** @type {!glift.flattener.BoardDiffPt<glift.flattener.Intersection>} */
      var diffPt = diffArr[i];
      if (diffPt.newValue.stone() !== diffPt.prevValue.stone()) {
        var newStoneStr = diffPt.newValue.stone();
        this.intersections().setStoneColor(
            diffPt.boardPt, symbolStoneToState[newStoneStr]);
      }
      if (diffPt.newValue.mark() !== diffPt.prevValue.mark() &&
          diffPt.newValue.mark() !== 0) { // We've already cleared empty marks.
        var newMark = diffPt.newValue.mark();
        var enumMark = symbolMarkToMark[newMark];
        var lbl = undefined;
        if (enumMark === marks.LABEL ||
            enumMark === marks.VARIATION_MARKER ||
            enumMark === marks.CORRECT_VARIATION) {
          lbl = diffPt.newValue.textLabel();
        }
        this.intersections().addMarkPt(
            diffPt.boardPt, enumMark, lbl);
      }
    }
    this.flattened_ = flattened;
    return this;
  },

  /** @return {!glift.displays.board.Display} this */
  flush: function() {
    this.svg_.attachToParent(this.divId());
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   *
   * @return {!glift.displays.board.Display} this
   */
  destroy: function() {
    glift.dom.elem(this.divId()).empty();
    this.svg_ = null;
    this.flattened_ = glift.flattener.emptyFlattened(this.numIntersections());
    this.intersections_ = null;
    return this;
  }
};

goog.require('glift.displays.board');
goog.require('glift.displays.svg');

/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 *
 * @param {glift.displays.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.ids.Generator} idGen The ID generator for SVG.
 * @param {?glift.orientation.BoundingBox} goBox The bounding box of the go board.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  if (goBox === null) {
    throw new Error('goBox null: Gui Environment obj not initialized');
  }
  if (theme.board.imagefill) {
    svg.append(glift.displays.svg.image()
      .setAttr('x', goBox.topLeft().x())
      .setAttr('y', goBox.topLeft().y())
      .setAttr('width', goBox.width())
      .setAttr('height', goBox.height())
      .setAttr('xlink:href', theme.board.imagefill)
      .setAttr('preserveAspectRatio', 'none'));
  }

  svg.append(glift.displays.svg.rect()
    .setAttr('x', goBox.topLeft().x() + 'px')
    .setAttr('y', goBox.topLeft().y() + 'px')
    .setAttr('width', goBox.width() + 'px')
    .setAttr('height', goBox.height() + 'px')
    .setAttr('height', goBox.height() + 'px')
    .setAttr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
    .setAttr('stroke', theme.board.stroke)
    .setAttr('stroke-width', theme.board['stroke-width'])
    .setId(idGen.board()));
};

/**
 * @param {string} divId The element ID of the div in which the SVG board lives.
 * @param {glift.displays.svg.SvgObj} svg Base svg obj, in which the filters should be
 *    placed.
 */
glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .setAttr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .setAttr("stdDeviation", 2);
};

goog.require('glift.displays.board');

/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 *
 * @param {glift.displays.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.ids.Generator} idGen The ID generator for SVG.
 * @param {?glift.displays.BoardPoints} boardPoints Board points object.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.boardLabels = function(svg, idGen, boardPoints, theme) {
  if (boardPoints === null) {
    throw new Error('boardPoints null: Gui Environment obj not initialized');
  }
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.boardCoordLabelGroup());
  svg.append(container);
  var labels = boardPoints.edgeCoordLabels;
  for (var i = 0, ii = labels.length; i < ii; i++) {
    var lbl = labels[i];
    container.append(svglib.text()
        .setText(lbl.label)
        .setAttr('fill', theme.boardCoordLabels.fill)
        .setAttr('stroke', theme.boardCoordLabels.stroke)
        .setAttr('opacity', theme.boardCoordLabels.opacity)
        .setAttr('text-anchor', 'middle')
        .setAttr('dy', '.33em') // for vertical centering
        .setAttr('x', lbl.coordPt.x()) // x and y are the anchor points.
        .setAttr('y', lbl.coordPt.y())
        .setAttr('font-family', theme.boardCoordLabels['font-family'])
        .setAttr('font-size',
            boardPoints.spacing * theme.boardCoordLabels['font-size']));
  }
};

goog.require('glift.displays.board');

/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  var len = data.length
  var tl = data[0];
  var br = data[len - 1];

  data = { tl: tl, br: br, spacing: boardPoints.spacing };
  container.append(svglib.rect()
    .setData(data)
    .setAttr("x", tl.coordPt.x() - boardPoints.radius)
    .setAttr("y", tl.coordPt.y() - boardPoints.radius)
    .setAttr("width", br.coordPt.x() - tl.coordPt.x() + boardPoints.spacing)
    .setAttr("height", br.coordPt.y() - tl.coordPt.y() + boardPoints.spacing)
    .setAttr('opacity', 0)
    .setAttr('fill', 'red')
    .setAttr('stroke', 'red')
    .setAttr('stone_color', 'EMPTY')
    .setId(idGen.fullBoardButton()));
};

goog.provide('glift.displays.board.Intersections');

goog.require('glift.displays.board');

/**
 * The backing data for the display.
 *
 * @package
 * @constructor
 */
glift.displays.board.Intersections = function(
    divId, svg, boardPoints, theme, rotation) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.rotation = rotation;
  this.boardPoints = boardPoints;
  this.idGen = glift.displays.ids.generator(this.divId);

  /**
   * Defined during events, the lastHoverPoint allows us to
   */
  this.lastHoverPoint = null;

  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      pt: <pt>,
  //      func: func
  //    }
  //  }
  // Note that the funcs take two parameters: event and icon.
  // TODO(kashomon): delete
  this.events = {};

  /**
   * Tracking for which intersections have been modified with marks.
   */
  this.markPts = [];
};

glift.displays.board.Intersections.prototype = {
  /**
   * Sets the color of a stone.  Note: the 'color' is really a key into the
   * Theme, so it should always be BLACK or WHITE, which can then point to any
   * color.
   */
  setStoneColor: function(pt, color) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var key = pt.toString();
    if (this.theme.stones[color] === undefined) {
      throw 'Unknown color key [' + color + ']';
    }

    var stoneGroup = this.svg.child(this.idGen.stoneGroup());
    var stone = stoneGroup.child(this.idGen.stone(pt));
    if (stone !== undefined) {
      var stoneColor = this.theme.stones[color];
      stone.setAttr('fill', stoneColor.fill)
        .setAttr('stroke', stoneColor.stroke || 1)
        .setAttr('stone_color', color)
        .setAttr('opacity', stoneColor.opacity);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup  !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        if (stoneColor.opacity === 1) {
          stoneShadow.setAttr('opacity', 1);
        } else {
          stoneShadow.setAttr('opacity', 0);
        }
      }
    }
    this._flushStone(pt);
    return this;
  },

  /**
   * Flush any stone changes to the board.
   */
  _flushStone: function(pt) {
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      // A stone might not exist if the board is cropped.
      glift.dom.elem(stone.id()).setAttrObj(stone.attrObj());
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        glift.dom.elem(stoneShadow.id()).setAttrObj(stoneShadow.attrObj());
      }
    }
    return this;
  },

  /**
   * Add a mark to the display.
   */
  addMarkPt: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.markGroup());
    return this._addMarkInternal(container, pt, mark, label);
  },

  /**
   * Test whether the board has a mark at the point.
   */
  hasMark: function(pt) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    if (this.svg.child(this.idGen.markGroup()).child(this.idGen.mark(pt))) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Add a temporary mark.  This is meant for display situations (like mousover)
   * where the user is displayed the state before it is recorded in a movetree
   * or goban.
   */
  addTempMark: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.tempMarkGroup());
    return this._addMarkInternal(container, pt, mark, label);
  },

  /**
   * Like the name says, remove the temporary marks from the backing svg (empty
   * the group container) and remove them from the display.
   */
  clearTempMarks: function() {
    this.clearMarks(this.svg.child(this.idGen.tempMarkGroup()));
    return this;
  },

  _addMarkInternal: function(container, pt, mark, label) {
    // If necessary, clear out intersection lines and starpoints.  This only
    // applies when a stone hasn't yet been set (stoneColor === 'EMPTY').
    this._reqClearForMark(pt, mark) && this._clearForMark(pt);
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      var stoneColor = stone.attr('stone_color');
      var stonesTheme = this.theme.stones;
      var marksTheme = stonesTheme[stoneColor].marks;
      glift.displays.board.addMark(container, this.idGen, this.boardPoints,
          marksTheme, stonesTheme, pt, mark, label);
      this._flushMark(pt, mark, container);
    }
    return this;
  },

  /**
   * Determine whether an intersection (pt) needs be cleared of lines /
   * starpoints.
   */
  _reqClearForMark: function(pt, mark) {
    var marks = glift.enums.marks;
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      // A stone might not exist at a point if the board is cropped.
      var stoneColor = stone.attr('stone_color');
      return stoneColor === 'EMPTY' && (mark === marks.LABEL
          || mark === marks.VARIATION_MARKER
          || mark === marks.CORRECT_VARIATION
          || mark === marks.LABEL_NUMERIC
          || mark === marks.LABEL_ALPHA);
    } else {
      return false;
    }
  },

  /**
   * Clear a pt of lines / starpoints so that we can place a mark (typically a
   * text-mark) without obstruction.
   */
  _clearForMark: function(pt) {
    var starpoint = this.svg.child(this.idGen.starpointGroup())
        .child(this.idGen.starpoint(pt))
    if (starpoint) {
      starpoint.setAttr('opacity', 0);
    }
    this.svg.child(this.idGen.lineGroup())
        .child(this.idGen.line(pt))
        .setAttr('opacity', 0);
    return this;
  },

  _flushMark: function(pt, mark, markGroup) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (this._reqClearForMark(pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        glift.dom.elem(starp.id()).setAttr('opacity', starp.attr('opacity'));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      glift.dom.elem(linept.id()).setAttr('opacity', linept.attr('opacity'));
    }
    markGroup.child(idGen.mark(pt)).attachToParent(markGroup.id());
    this.markPts.push(pt);
    return this;
  },

  /**
   * Clear marks (optionally) from a group.
   * @param {string=} opt_markGroup Specify a mark group ID, or generate one.
   * @return {glift.displays.board.Intersections} the current obj.
   */
  clearMarks: function(opt_markGroup) {
    var markGroup = opt_markGroup || this.svg.child(this.idGen.markGroup());
    var idGen = this.idGen;
    var children = markGroup.children();
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i]
      var pt = child.data();
      var starpoint =
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starpoint) {
        starpoint.setAttr('opacity', 1).updateAttrInDom('opacity');
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(pt))
      if (line) {
        line.setAttr('opacity', 1).updateAttrInDom('opacity');
      }
    }
    markGroup.emptyChildren();
    glift.dom.elem(markGroup.id()).empty();
    return this;
  },

  /**
   * Currently unused. Add guideLines for mobile devices.
   */
  addGuideLines: function(pt) {
    var elems = glift.enums.svgElements;
    var svglib = glift.displays.svg;
    var container = this.svg.child(this.idGen.markGroup());
    container.rmChild(this.idGen.guideLine());

    var bpt = this.boardPoints.getCoord(pt);
    var boardPoints = this.boardPoints;
    container.append(svglib.path()
      .setAttr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .setAttr('stroke-width', 3)
      .setAttr('stroke', 'blue')
      .setId(this.idGen.guideLine()))
  },

  clearGuideLines: function() {
    var elems = glift.enums.svgElements;
    var container = this.svg.child(this.idGen.markGroup())
      .rmChild(this.idGen.guideLine());
    return this;
  },

  setGroupAttr: function(groupId, attrObj) {
    var g = this.svg.child(groupId);
    if (g !== undefined) {
      var children = g.children();
      for (var i = 0, ii = children.length; i < ii; i++) {
        for (var key in attrObj) {
          children[i].setAttr(key, attrObj[key]);
        }
      }
    }
    return this;
  },

  /**
   * Clear all the stones and stone shadows.
   */
  clearStones: function() {
    var stoneAttrs = {opacity: 0, stone_color: "EMPTY"};
    var shadowAttrs = {opacity: 0};
    this.setGroupAttr(this.idGen.stoneGroup(), stoneAttrs)
        .setGroupAttr(this.idGen.stoneShadowGroup(), shadowAttrs);

    var stones = this.svg.child(this.idGen.stoneGroup()).children();
    for (var i = 0, len = stones.length; i < len; i++) {
      glift.dom.elem(stones[i].id()).setAttrObj(stoneAttrs);
    }

    var shadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (shadowGroup) {
      var shadows = shadowGroup.children();
      for (var i = 0, len = shadows.length; i < len; i++) {
        glift.dom.elem(shadows[i].id()).setAttrObj(shadowAttrs);
      }
    }
    return this;
  },

  clearAll: function() {
    this.clearMarks().clearStones();
    return this;
  },

  /** Set events for the button rectangle. */
  setEvent: function(eventName, func) {
    var that = this;
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .id();
    glift.dom.elem(id).on(eventName, function(e) {
      var pt = that._buttonEventPt(e);
      pt && func(e, pt);
    });
    return this;
  },

  /** Set events for the button rectangle. */
  setHover: function(hoverInFunc, hoverOutFunc) {
    var that = this;
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .id();
    glift.dom.elem(id).on('mousemove', function(e) {
      var lastpt = that.lastHoverPoint;
      var curpt = that._buttonEventPt(e);
      if (curpt && lastpt && !lastpt.equals(curpt)) {
        hoverOutFunc(e, lastpt);
        hoverInFunc(e, curpt);
      } else if (!lastpt && curpt) {
        hoverInFunc(e, curpt);
      }
      that.lastHoverPoint = curpt;
    });
    glift.dom.elem(id).on('mouseout', function(e) {
      var lastpt = that.lastHoverPoint;
      that.lastHoverPoint = null;
      if (lastpt) {
        hoverOutFunc(e, lastpt);
      }
    });
  },

  /** Get the point from an event on the button rectangle. */
  _buttonEventPt: function(e) {
    var data = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .data();
    var maxInts = this.boardPoints.numIntersections;
    var offset = glift.dom.elem(this.idGen.fullBoardButton()).offset();

    // X Calculations
    var left = data.tl.intPt.x();
    var pageOffsetX = e.pageX;
    if (e.changedTouches && e.changedTouches[0]) {
      pageOffsetX = e.changedTouches[0].pageX;
    }

    var ptx = (pageOffsetX - offset.left) / data.spacing;

    var intPtx = Math.floor(ptx) + left;
    if (intPtx < left) {
      intPtx = left
    } else if (intPtx > maxInts - 1) {
      intPtx = maxInts - 1
    }

    // TODO(kashomon): Remove copy pasta here.
    // Y calculations
    var top = data.tl.intPt.y();
    var pageOffsetY = e.pageY;
    if (e.changedTouches && e.changedTouches[0]) {
      pageOffsetY = e.changedTouches[0].pageY;
    }

    var pty = (pageOffsetY - offset.top) / data.spacing;
    var intPty = Math.floor(pty) + top;
    if (intPty < top) {
      intPty = top;
    } else if (intPty > maxInts - 1) {
      intPty = maxInts - 1;
    }

    var pt = glift.util.point(intPtx, intPty);
    if (this.rotation != glift.enums.rotations.NO_ROTATION) {
      pt = pt.antirotate(this.boardPoints.numIntersections, this.rotation);
    }
    return pt;
  }
};

goog.require('glift.displays.board');

/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 *
 * @param {glift.displays.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.ids.Generator} idGen The ID generator for SVG.
 * @param {?glift.displays.BoardPoints} boardPoints Board points object.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.lines = function(svg, idGen, boardPoints, theme) {
  if (boardPoints === null) {
    throw new Error('boardPoints null: Gui Environment obj not initialized');
  }

  // Mapping from int point (e.g., 3,3) pt string to id;
  var svglib = glift.displays.svg;

  var container = svglib.group().setId(idGen.lineGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.path()
      .setAttr('d', glift.displays.board.intersectionLine(
          pt, boardPoints.radius, boardPoints.numIntersections))
      .setAttr('stroke', theme.lines.stroke)
      .setAttr('stroke-width', theme.lines['stroke-width'])
      .setAttr('stroke-linecap', 'round')
      .setId(idGen.line(pt.intPt)));
  }
};

/**
 * @param {glift.displays.BoardPt} boardPt A
 * @param {!number} radius Size of the space between the lines
 * @param {!number} numIntersections Number of intersecitons on the board.
 */
glift.displays.board.intersectionLine = function(
    boardPt, radius, numIntersections) {
  // minIntersects: 0 indexed,
  // maxIntersects: 0 indexed,
  // numIntersections: 1 indexed (it's the number of intersections)
  var minIntersects = 0,
      maxIntersects = numIntersections - 1,
      coordinate = boardPt.coordPt,
      intersection = boardPt.intPt,
      svgpath = glift.displays.svg.pathutils;
  var top = intersection.y() === minIntersects ?
      coordinate.y() : coordinate.y() - radius;
  var bottom = intersection.y() === maxIntersects ?
      coordinate.y() : coordinate.y() + radius;
  var left = intersection.x() === minIntersects ?
      coordinate.x() : coordinate.x() - radius;
  var right = intersection.x() === maxIntersects ?
      coordinate.x() : coordinate.x() + radius;
  var line =
      // Vertical Line
      svgpath.move(coordinate.x(), top) + ' '
      + svgpath.lineAbs(coordinate.x(), bottom) + ' '
      // Horizontal Line
      + svgpath.move(left, coordinate.y()) + ' '
      + svgpath.lineAbs(right, coordinate.y());
  return line;
};

/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 */
glift.displays.board.markContainer = function(svg, idGen) {
  svg.append(glift.displays.svg.group().setId(idGen.markGroup()));
  svg.append(glift.displays.svg.group().setId(idGen.tempMarkGroup()));
};

/**
 * Add a mark of a particular type to the GoBoard
 */
glift.displays.board.addMark = function(
    container, idGen, boardPoints, marksTheme, stonesTheme, pt, mark, label) {
  // Note: This is a static method instead of a method on intersections because,
  // due to the way glift is compiled together, there'no s guarantee what order
  // the files come in (beyond the base package file).  So, either we need to
  // combine intersections.js with board.js or keep this a separate static
  // method.
  var svgpath = glift.displays.svg.pathutils;
  var svglib = glift.displays.svg;
  var rootTwo = 1.41421356237;
  var rootThree = 1.73205080757;
  var marks = glift.enums.marks;
  var coordPt = boardPoints.getCoord(pt).coordPt;
  var markId = idGen.mark(pt);

  var fudge = boardPoints.radius / 8;
  // TODO(kashomon): Move the labels code to a separate function.  It's pretty
  // hacky right now.  It doesn't seem right that there should be a whole
  // separate coditional based on what are essentially color requirements.
  if (mark === marks.LABEL
      || mark === marks.VARIATION_MARKER
      || mark === marks.CORRECT_VARIATION
      || mark === marks.LABEL_ALPHA
      || mark === marks.LABEL_NUMERIC) {
    if (mark === marks.VARIATION_MARKER) {
      marksTheme = marksTheme.VARIATION_MARKER;
    } else if (mark === marks.CORRECT_VARIATION) {
      marksTheme = marksTheme.CORRECT_VARIATION;
    }
    container.append(svglib.text()
        .setText(label)
        .setData(pt)
        .setAttr('fill', marksTheme.fill)
        .setAttr('stroke', marksTheme.stroke)
        .setAttr('text-anchor', 'middle')
        .setAttr('dy', '.33em') // for vertical centering
        .setAttr('x', coordPt.x()) // x and y are the anchor points.
        .setAttr('y', coordPt.y())
        .setAttr('font-family', stonesTheme.marks['font-family'])
        .setAttr('font-size',
            boardPoints.spacing * stonesTheme.marks['font-size'])
        .setId(markId));

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    container.append(svglib.rect()
        .setData(pt)
        .setAttr('x', coordPt.x() - halfWidth)
        .setAttr('y', coordPt.y() - halfWidth)
        .setAttr('width', 2 * halfWidth)
        .setAttr('height', 2 * halfWidth)
        .setAttr('fill', 'none')
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    container.append(svglib.path()
        .setData(pt)
        .setAttr('d',
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topRight) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botRight))
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else if (mark === marks.CIRCLE) {
    container.append(svglib.circle()
        .setData(pt)
        .setAttr('cx', coordPt.x())
        .setAttr('cy', coordPt.y())
        .setAttr('r', boardPoints.radius / 2)
        .setAttr('fill', 'none')
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = stonesTheme.marks['STONE_MARKER'];
    container.append(svglib.circle()
        .setData(pt)
        .setAttr('cx', coordPt.x())
        .setAttr('cy', coordPt.y())
        .setAttr('r', boardPoints.radius / 3)
        .setAttr('opacity', marksTheme.STONE_MARKER.opacity)
        .setAttr('fill', marksTheme.STONE_MARKER.fill)
        .setId(markId));
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    container.append(svglib.path()
        .setData(pt)
        .setAttr('fill', 'none')
        .setAttr('d',
            svgpath.movePt(topNode) + ' ' +
            svgpath.lineAbsPt(leftNode) + ' ' +
            svgpath.lineAbsPt(rightNode) + ' ' +
            svgpath.lineAbsPt(topNode))
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};

/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 */
glift.displays.board.starpoints = function(
    svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.starpointGroup());
  svg.append(container);

  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  for (var i = 0, ii = starPointData.length; i < ii; i++) {
    var pt = starPointData[i];
    var coordPt = boardPoints.getCoord(pt).coordPt;
    container.append(svglib.circle()
      .setAttr('cx', coordPt.x())
      .setAttr('cy', coordPt.y())
      .setAttr('r', size)
      .setAttr('fill', theme.starPoints.fill)
      .setAttr('opacity', 1)
      .setId(idGen.starpoint(pt)));
  }
};

/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.stoneGroup());
  svg.append(container);
  var data = boardPoints.data()
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .setAttr('cx', pt.coordPt.x())
      .setAttr('cy', pt.coordPt.y())
      .setAttr('r', boardPoints.radius - .4) // subtract for stroke
      .setAttr('opacity', 0)
      .setAttr('stone_color', 'EMPTY')
      .setAttr('fill', 'blue') // dummy color
      .setAttr('class', glift.enums.svgElements.STONE)
      .setId(idGen.stone(pt.intPt)));
  }
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 */
glift.displays.board.shadows = function(svg, idGen, boardPoints, theme) {
  if (theme.stones.shadows === undefined) { return {}; }
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.stoneShadowGroup());
  svg.append(container);
  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .setAttr('cx', pt.coordPt.x() + boardPoints.radius / 7)
      .setAttr('cy', pt.coordPt.y() + boardPoints.radius / 7)
      .setAttr('r', boardPoints.radius - 0.4)
      .setAttr('opacity', 0)
      .setAttr('fill', theme.stones.shadows.fill)
      // .setAttr('stroke', theme.stones.shadows.stroke)
      // .setAttr('filter', 'url(#' + divId + '_svg_blur)')
      .setAttr('class', glift.enums.svgElements.STONE_SHADOW)
      .setId(idGen.stoneShadow(pt.intPt)));
  }
};

goog.provide('glift.displays.commentbox');

glift.displays.commentbox = {};

goog.provide('glift.displays.commentbox.CommentBox');

/**
 * Create a comment box with:
 *
 * @param {string} divId The div in which the comment box should live
 * @param {!glift.orientation.BoundingBox} posBbox The bounding box of the div
 *    (expensive to recompute)
 * @param {!glift.themes.base} theme The theme object.
 * @param {boolean} useMarkdown Whether or not to use markdown
 */
glift.displays.commentbox.create = function(
    divId, posBbox, theme, useMarkdown) {
  useMarkdown = useMarkdown || false;
  if (!theme) {
    throw new Error('Theme must be defined. was: ' + theme);
  }
  return new glift.displays.commentbox.CommentBox(
      divId, posBbox, theme, useMarkdown).draw();
};

/**
 * Comment box object.
 *
 * @package
 * @constructor
 */
glift.displays.commentbox.CommentBox = function(
    divId, positioningBbox, theme, useMarkdown) {
  this.divId = divId;
  this.bbox = glift.orientation.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(positioningBbox.width(), positioningBbox.height()));
  this.theme = theme;
  this.useMarkdown = useMarkdown;
  this.el = undefined;
};

glift.displays.commentbox.CommentBox.prototype = {
  /** Draw the comment box */
  draw: function() {
    this.el = glift.dom.elem(this.divId);
    if (this.el === null) {
      throw new Error('Could not find element with ID ' + this.divId);
    }
    this.el.css(glift.obj.flatMerge({
      'overflow-y': 'auto',
      'MozBoxSizing': 'border-box',
      'boxSizing': 'border-box'
    }, this.theme.commentBox.css))
    // TODO(kashomon): Maybe add this in.
    // glift.dom.ux.onlyInnerVertScroll(this.el, this.bbox);
    this.el.addClass('glift-comment-box');
    return this;
  },

  /**
   * Set the text of the comment box. Note: this sanitizes the text to prevent
   * XSS and does some basic HTML-izing.
   * @param {string} text
   */
  setText: function(text) {
    this.el.empty();
    this.el.append(glift.dom.convertText(text, this.useMarkdown));
  },

  /** Clear the text from the comment box. */
  clearText: function() {
    this.el.empty();
  },

  /** Remove all the relevant comment box HTML. */
  destroy: function() {
    this.el.remove();
  }
};

goog.provide('glift.displays.gui');

/**
 * Extra GUI methods and data.  This also contains pieces used by widgets.
 */
glift.displays.gui = {};

goog.provide('glift.displays.gui.MultiCenter')
goog.provide('glift.displays.gui.SingleCenter')
goog.provide('glift.displays.gui.Transform')

/**
 * Transform object. Note that that the scale is set immediately, while the
 * xMove and yMove are often set later.
 *
 * @param {number} scale Scaling factor. Not that 1 means that the object should
 *    not be scaled.
 * @param {number=} opt_xMove Defaults to zero if not set.
 * @param {number=} opt_yMove Defaults to zero if not set
 * @constructor @final @struct
 */
glift.displays.gui.Transform = function(scale, opt_xMove, opt_yMove) {
  /**
   * How much to scale the object by.
   * @type {number}
   */
  this.scale = scale;
  /**
   * How much to translate the object along the x-axis.
   * @type {number}
   */
  this.xMove = opt_xMove || 0;
  /**
   * How much to translate the object along the y-axis.
   * @type {number}
   */
  this.yMove = opt_yMove || 0;
};

/**
 * Result of either row-centering or column centering operation
 *
 * @param {!Array<!glift.displays.gui.Transform>} transforms The transformations
 *    to perform.
 * @param {!Array<!glift.orientation.BoundingBox>} bboxes The transformed bounding
 *    boxes.
 * @param {!Array<!glift.orientation.BoundingBox>} unfit Bounding boxes that
 *    didn't fit given the parameters.
 * @constructor @final @struct
 */
glift.displays.gui.MultiCenter = function(transforms, bboxes, unfit) {
  this.transforms = transforms;
  this.bboxes = bboxes;
  this.unfit = unfit;
};

/**
 * Result of either single-element centering.
 *
 * @param {!glift.displays.gui.Transform} transform The transformation
 *    to perform.
 * @param {!glift.orientation.BoundingBox} bbox The transformed bounding
 *    boxes.
 *
 * @constructor @final @struct
 */
glift.displays.gui.SingleCenter = function(transform, bbox) {
  this.transform = transform;
  this.bbox = bbox;
};

/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box. Note: The returned items are guaranteed to be in the order they
 * appeared as inputs.
 *
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 *
 * @return {!glift.displays.gui.MultiCenter}
 */
glift.displays.gui.rowCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui.linearCentering_(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'h');
};

/**
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 *
 * @return {!glift.displays.gui.MultiCenter}
 */
glift.displays.gui.columnCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui.linearCentering_(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'v');
};

/**
 * Perform linearCentering either vertically or horizontally.
 *
 * @private
 *
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 * @param {number} maxSpacing Zero indicates no max spacing
 * @param {string} dir Dir must be either 'v' or 'h'.
 *
 * @return {!glift.displays.gui.MultiCenter}
 */
glift.displays.gui.linearCentering_ = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing, dir) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [];
  // TODO(kashomon): Min spacing is totally broken and has no tests.
  // Probably should just remove it.
  minSpacing = minSpacing || 0;
  maxSpacing = maxSpacing || 0;
  dir = (dir === 'v' || dir === 'h') ? dir : 'h';
  var getLongSide = function(bbox, dir) {
    return dir === 'h' ? bbox.width() : bbox.height();
  };

  var outsideLongSide = getLongSide(outerBox, dir);
  // Use some arbitrarily large number as an upper bound default
  maxSpacing = maxSpacing <= 0 ? 10000000 : maxSpacing;
  minSpacing = minSpacing <= 0 ? 0 : minSpacing;

  // Adjust all the bboxes so that they are the right scale.
  var totalElemLength = 0;
  for (var i = 0; i < inBboxes.length; i++) {
    if (innerHeight > innerWidth) {
      var scale = innerWidth / inBboxes[i].width();
    } else {
      var scale = innerHeight / inBboxes[i].height();
    }
    var partialTransform = new glift.displays.gui.Transform(scale);
    var newBbox = inBboxes[i].scale(scale);
    transforms.push(partialTransform);
    newBboxes.push(newBbox);
    totalElemLength += getLongSide(newBbox, dir);
    if (i < inBboxes.length - 1) {
      totalElemLength += minSpacing;
    }
  }

  // Pop off elements that don't fit.
  var unfitBoxes = [];
  while (outsideLongSide < totalElemLength) {
    var outOfBoundsBox = newBboxes.pop();
    transforms.pop();
    totalElemLength -= getLongSide(outOfBoundsBox, dir);
    totalElemLength -= minSpacing;
    unfitBoxes.push(outOfBoundsBox);
  }

  // Find how much space to use for the parts
  if (dir === 'h') {
    var extraSpace = innerWidth - totalElemLength;
  } else {
    var extraSpace = innerHeight - totalElemLength;
  }
  var extraSpacing = extraSpace / (transforms.length + 1);
  var elemSpacing = extraSpacing;
  var extraMargin = extraSpacing;
  if (extraSpacing > maxSpacing) {
    elemSpacing = maxSpacing;
    var totalExtraMargin = extraSpace - elemSpacing * (transforms.length - 1);
    extraMargin = totalExtraMargin / 2;
  }

  var left = outerBox.left() + horzMargin;
  var top = outerBox.top() + vertMargin;
  if (dir === 'h') {
    left += extraMargin;
  } else {
    top += extraMargin;
  }

  // Find the x and y translates.
  var finishedBoxes = []
  for (var i = 0; i < newBboxes.length; i++) {
    var newBbox = newBboxes[i];
    var partialTransform = transforms[i];
    var yTranslate = top - newBbox.top();
    var xTranslate = left - newBbox.left();
    partialTransform.xMove = xTranslate;
    partialTransform.yMove = yTranslate;
    finishedBoxes.push(newBbox.translate(xTranslate, yTranslate));
    if (dir === 'h') {
      left += newBbox.width() + elemSpacing;
    } else {
      top += newBbox.height() + elemSpacing;
    }
  }

  return new glift.displays.gui.MultiCenter(
      transforms, finishedBoxes, unfitBoxes);
};

/**
 * Center an bounding box within another bounding box.
 *
 * @param {!glift.orientation.BoundingBox} outerBbox
 * @param {!glift.orientation.BoundingBox} bbox The bbox to center within the
 *    outerBbox.
 * @param {number} vertMargin
 * @param {number} horzMargin
 *
 * @return {!glift.displays.gui.SingleCenter}
 */
glift.displays.gui.centerWithin = function(
    outerBbox, bbox, vertMargin, horzMargin) {
  var outerWidth = outerBbox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBbox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = undefined,
      newBboxes = undefined,
      elemWidth = 0;

  var scale = 1; // i.e., no scaling;
  if (innerHeight / innerWidth >
      bbox.height() / bbox.width()) {
    // Outer box is a 'more-tall' box than the inner-box.  So, we scale the
    // inner box by width (since the height has more wiggle room).
    scale = innerWidth / bbox.width();
  } else {
    scale = innerHeight / bbox.width();
  }
  var newBbox = bbox.scale(scale);
  var left = outerBbox.left() + horzMargin;
  if (newBbox.width() < innerWidth) {
    left = left + (innerWidth - newBbox.width()) / 2; // Center horz.
  }
  var top = outerBbox.top() + vertMargin;
  if (newBbox.height() < innerHeight) {
    top = top + (innerHeight -  newBbox.height()) / 2;
  }
  var transform = new glift.displays.gui.Transform(
    scale,
    left - newBbox.left(),
    top - newBbox.top());
  newBbox = newBbox.translate(transform.xMove, transform.yMove);
  return new glift.displays.gui.SingleCenter(transform, newBbox);
};

goog.provide('glift.displays.icons');

/**
 * Objects and methods having to do with icons.
 */
glift.displays.icons = {};

goog.provide('glift.displays.icons.bar');
goog.provide('glift.displays.icons.IconBar');
goog.provide('glift.displays.icons.IconBarOptions');

/**
 * Some Notes:
 *  - divId: the divId for this object
 *  - positioning: bounding box for the bar
 *  - parentBox: bounding box for the parent widget
 *  - icons: an array of icon names)
 *  - vertMargin: in pixels
 *  - horzMargin: in pixels
 *  - theme: The theme. default is the DEFAULT theme, of course
 *
 * @typedef {{
 *  divId: string,
 *  icons: !Array<string>,
 *  theme: !glift.themes.base,
 *  positioning: !glift.orientation.BoundingBox,
 *  parentBbox: !glift.orientation.BoundingBox,
 *  allDivIds: !Object<string, string>,
 *  allPositioning: !glift.displays.position.WidgetBoxes
 * }}
 */
glift.displays.icons.IconBarOptions;


/**
 * @param {!glift.displays.icons.IconBarOptions} options
 * @return {!glift.displays.icons.IconBar}
 */
glift.displays.icons.bar = function(options) {
  return new glift.displays.icons.IconBar(options);
};

/**
 * IconBar Object
 *
 * @constructor
 * @param {!glift.displays.icons.IconBarOptions} options
 */
glift.displays.icons.IconBar = function(options) {
  if (!options.theme) {
    throw new Error("Theme undefined in iconbar");
  }
  if (!options.divId) {
    throw new Error("Must define an options 'divId' as an option");
  }
  this.divId = options.divId;
  this.position = options.positioning;
  this.divBbox = glift.orientation.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(this.position.width(), this.position.height()));
  this.theme = options.theme;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = options.parentBbox;
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(options.icons);

  // The positioning information for all divs.
  this.allDivIds = options.allDivIds;
  this.allPositioning = options.allPositioning;

  // Map of icon name to icon object. initialized with _initNameMapping
  // TODO(kashomon): Make this non-side-affecting.
  this.nameMapping = {};

  this.vertMargin = this.theme.icons.vertMargin;
  this.horzMargin = this.theme.icons.horzMargin;
  this.svg = undefined; // initialized by draw
  this.idGen = glift.displays.ids.generator(this.divId);

  // Data related to tool tips.
  this.tooltipTimer = undefined;
  this.tooltipId = undefined;

  // Post constructor initializiation
  this.initIconIds_(); // Set the ids for the icons above.
  this.initNameMapping_(); // Init the name mapping.
};

glift.displays.icons.IconBar.prototype = {
  /**
   * Inializes the name-mapping lookup
   * @private
   */
  initNameMapping_: function() {
    this.forEachIcon(function(icon) {
      this.nameMapping[icon.iconName] = icon;
    }.bind(this));
  },

  /**
   * Creates html element ids for each of the icons.
   * @private
   */
  initIconIds_: function() {
    this.forEachIcon(function(icon) {
      icon.setElementId(this.idGen.icon(icon.iconName));
    }.bind(this));
  },

  /** Draws the icon bar. */
  draw: function() {
    this.destroy();
    var svglib = glift.displays.svg;
    var divBbox = this.divBbox,
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svglib.svg()
      .setAttr('width', '100%')
      .setAttr('height', '100%');
    glift.displays.icons.rowCenterWrapped(
        divBbox, this.icons, this.vertMargin, this.horzMargin)
    this._createIcons();
    this._createIconButtons();
    this.flush();
    return this;
  },

  /**
   * Actually draw the icon.
   */
  _createIcons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().setId(this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(svglib.group().setId(this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      var path = svglib.path()
        .setId(icon.elementId)
        .setAttr('d', icon.iconStr)
        .setAttr('transform', icon.transformString());
      for (var key in this.theme.icons.DEFAULT) {
        path.setAttr(key, this.theme.icons.DEFAULT[key]);
      }
      container.append(path);
    }
  },

  /**
   * We draw transparent boxes around the icon to use for touch events.  For
   * complicated icons, it turns out to be obnoxious to try to select the icon.
   */
  _createIconButtons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().setId(this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, len = this.icons.length; i < len; i++) {
      var icon = this.icons[i];
      container.append(svglib.rect()
        .setData(icon.iconName)
        .setAttr('x', icon.bbox.topLeft().x())
        .setAttr('y', icon.bbox.topLeft().y())
        .setAttr('width', icon.bbox.width())
        .setAttr('height', icon.bbox.height())
        .setAttr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .setAttr('opacity', 0)
        .setId(this.idGen.button(icon.iconName)));
    }
  },

  // TODO(kashomon): Delete this flush nonsense.  It's not necessary for the
  // iconbar.
  flush: function() {
    this.svg.attachToParent(this.divId);
    var multi = this.getIcon('multiopen');
    if (multi !== undefined) {
      this.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
    }
  },

  /**
   * Add a temporary associated icon and center it.  If the parentIcon has a
   * subbox specified, then use that.  Otherwise, just center within the
   * parent icon's bbox.
   *
   * If the tempIcon is specified as a string, it is wrapped first.
   *
   * @param {string} parentIconNameOrIndex Parent icon name.
   * @param {string|!glift.displays.icons.WrappedIcon} tempIcon Temporary icon
   *    to display.
   * @param {string} color Color string
   * @param {number=} opt_vMargin Optional v margin. Defaults to 2px.
   * @param {number=} opt_hMargin Optional h margin. Defaults to 2px.
   */
  setCenteredTempIcon: function(
      parentIconNameOrIndex, tempIcon, color, opt_vMargin, opt_hMargin) {
    // Move these defaults into the Theme.
    var svglib = glift.displays.svg;
    var hm = opt_hMargin || 2,
        vm = opt_vMargin || 2;
    var parentIcon = this.getIcon(parentIconNameOrIndex);
    /** @type {!glift.displays.icons.WrappedIcon} */
    var wrappedTemp;
    if (glift.util.typeOf(tempIcon) === 'string') {
      wrappedTemp = glift.displays.icons.wrappedIcon(
        /** @type {string} */ (tempIcon));
    } else {
      wrappedTemp = tempIcon.rewrapIcon();
    }
    var tempIconId = this.idGen.tempIcon(parentIcon.iconName);

    // Remove if it exists.
    glift.dom.elem(tempIconId) && glift.dom.elem(tempIconId).remove();

    if (parentIcon.subboxIcon) {
      wrappedTemp = parentIcon.centerWithinSubbox(wrappedTemp, vm, hm);
    } else {
      wrappedTemp = parentIcon.centerWithinIcon(wrappedTemp, vm, hm);
    }

    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.path()
      .setId(tempIconId)
      .setAttr('d', wrappedTemp.iconStr)
      .setAttr('fill', color) // theme.icons.DEFAULT.fill
      .setAttr('transform', wrappedTemp.transformString()));
    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, attrsObj, textMod) {
    var svglib = glift.displays.svg;
    var icon = this.getIcon(iconName);
    var bbox = icon.bbox;
    if (icon.subboxIcon) {
      bbox = icon.subboxIcon.bbox;
    }
    // TODO(kashomon): Why does this constant work?  Replace the 0.50 nonsense
    // with something more sensible.
    var textMultiplier = textMod || 0.50;
    var fontSize = bbox.width() * textMultiplier;
    var id = this.idGen.tempIconText(iconName);
    var boxStrokeWidth = 7
    this.clearTempText(iconName);
    var textObj = svglib.text()
      .setId(this.idGen.tempIconText(iconName))
      .setText(text)
      .setAttr('class', 'tempIcon')
      .setAttr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .setAttr('font-size', fontSize + 'px')
      .setAttr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .setAttr('y', bbox.center().y()) //+ fontSize)
      .setAttr('dy', '.33em') // Move down, for centering purposes
      .setAttr('style', 'text-anchor: middle; vertical-align: middle;')
      .setAttr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    for (var key in attrsObj) {
      textObj.setAttr(key, attrsObj[key]);
    }
    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(textObj);
    return this;
  },

  clearTempText: function(iconName) {
    var iconId = this.idGen.tempIconText(iconName);
    this.svg.rmChild(iconId);
    var el = glift.dom.elem(iconId);
    el && el.remove();
  },

  createIconSelector: function(baseIcon, icons) {
    // TODO(kashomon): Implement
  },

  destroyIconSelector: function() {
    // TODO(kashomon): Implement
  },

  destroyTempIcons: function() {
    this.svg.child(this.idGen.tempIconGroup()).emptyChildrenAndUpdate();
    return this;
  },

  /** Get the Element ID of the button. */
  buttonId: function(iconName) {
    return this.idGen.button(iconName);
  },

  /**
   * Initialize the icon actions.  These actions are received at widget-creation
   * time.
   */
  initIconActions: function(parentWidget, iconActions) {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    this.forEachIcon(function(icon) {
      var iconName = icon.iconName;
      if (!iconActions.hasOwnProperty(icon.iconName)) {
        // Make sure that there exists an action specified in the
        // displayOptions, before we add any options.
        return
      }
      var actionsForIcon = {};

      if (glift.platform.isMobile()) {
        actionsForIcon.touchend = iconActions[iconName].click;
      } else {
        actionsForIcon.click = iconActions[iconName].click;
      }

      // Add hover events for non-mobile browsers.
      if (!glift.platform.isMobile()) {
        actionsForIcon.mouseover = iconActions[iconName].mouseover ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId);
            var theme = widgetRef.iconBar.theme.icons;
            for (var key in theme.DEFAULT_HOVER) {
              elem.setAttr(key, theme.DEFAULT_HOVER[key]);
            }
          };
        actionsForIcon.mouseout = iconActions[iconName].mouseout ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId)
            if (elem) { // elem can be null during transitions.
              var theme = widgetRef.iconBar.theme.icons;
              for (var key in theme.DEFAULT) {
                elem.setAttr(key, theme.DEFAULT[key]);
              }
            }
          };
      }
      for (var eventName in actionsForIcon) {
        var eventFunc = actionsForIcon[eventName];
        // We init each action separately so that we avoid the lazy binding of
        // eventFunc.
        this._initOneIconAction(parentWidget, icon, eventName, eventFunc);
      }

      // Initialize tooltips.  Not currently supported for mobile.
      if (iconActions[iconName].tooltip &&
          !glift.platform.isMobile()) {
        this._initializeTooltip(icon, iconActions[iconName].tooltip)
      }
    }.bind(this));
  },

  _initOneIconAction: function(parentWidget, icon, eventName, eventFunc) {
    var buttonId = this.idGen.button(icon.iconName);
    glift.dom.elem(buttonId).on(eventName, function(event) {
      if (eventName === 'click' && this.tooltipTimer) {
        // Prevent the tooltip from appearing.
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = null;
      }
      if (this.tooltipId) {
        // Clear the tool tip div if it exists
        glift.dom.elem(this.tooltipId) &&
            glift.dom.elem(this.tooltipId).remove();
        this.tooltipId = null;
      }

      // We've interacted with this widget.  Set this widget as active for the
      // purposes of key presses.
      parentWidget.manager.setActive();
      eventFunc(event, parentWidget, icon, this);
    }.bind(this));
  },

  /** Initialize the icon tooltips. */
  _initializeTooltip: function(icon, tooltip) {
    var tooltipId = this.divId + '_tooltip';
    var id = this.idGen.button(icon.iconName);
    glift.dom.elem(id).on('mouseover', function(e) {
      var tooltipTimerFunc = function() {
        var newDiv = glift.dom.newDiv(tooltipId);
        newDiv.appendText(tooltip);
        var baseCssObj = {
          position: 'absolute',
          top: -1.2 * (icon.bbox.height()) + 'px',
          'z-index': 2,
          boxSizing: 'border-box'
        };
        for (var key in this.theme.icons.tooltips) {
          baseCssObj[key] = this.theme.icons.tooltips[key];
        }
        newDiv.css(baseCssObj);
        var elem = glift.dom.elem(this.divId);
        if (elem) {
          // Elem can be null if we've started the time and changed the state.
          elem.append(newDiv);
          this.tooltipId = tooltipId;
        }
        this.tooltipTimer = null;
      }.bind(this);
      this.tooltipTimer = setTimeout(
          tooltipTimerFunc, this.theme.icons.tooltipTimeout);
    }.bind(this));
    glift.dom.elem(id).on('mouseout', function(e) {
      if (this.tooltipTimer != null) {
        clearTimeout(this.tooltipTimer);
      }
      this.tooltipTimer = null;
      // Remove if it exists.
      glift.dom.elem(tooltipId) && glift.dom.elem(tooltipId).remove();
    }.bind(this));
  },

  /**
   * Return whether the iconBar has instantiated said icon or not
   */
  // TODO(kashomon): Add test
  hasIcon: function(name) {
    return this.nameMapping[name] !== undefined;
  },

  /**
   * Return a wrapped icon.
   */
  getIcon: function(nameOrIndex) {
    var itype = glift.util.typeOf(nameOrIndex);
    if (itype === 'string') {
      return this.nameMapping[nameOrIndex];
    } else if (itype === 'number') {
      return this.icons[nameOrIndex];
    } else {
      return undefined;
    }
  },

  /**
   * Convenience method to loop over each icon, primarily for the purpose of
   * adding events.
   */
  forEachIcon: function(func) {
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      func(this.icons[i]);
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && glift.dom.elem(this.divId) && glift.dom.elem(this.divId).empty();
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.bbox = undefined;
    return this;
  }
};

goog.require('glift.displays.icons');

/**
 * Row center Direcotry
 * @enum {string}
 * @private
 */
glift.displays.icons.CenterDir = {
  H: 'h',
  V: 'v'
};


/**
 * Row-Center an array of wrapped icons.
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number=} opt_minSpacing
 */
glift.displays.icons.rowCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, opt_minSpacing) {
  var minSpacing = opt_minSpacing || 0;
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing,
      glift.displays.icons.CenterDir.H);
}

/**
 * Column-Center an array of wrapped icons.
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number=} opt_minSpacing
 */
glift.displays.icons.columnCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, opt_minSpacing) {
  var minSpacing = opt_minSpacing || 0;
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing,
      glift.displays.icons.CenterDir.V);
}

/**
 * Center wrapped icons
 *
 * @private
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number} minSpacing
 * @param {glift.displays.icons.CenterDir} direction
 */
glift.displays.icons._centerWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing, direction) {
  var bboxes = [];
  if (direction !== glift.displays.icons.CenterDir.H &&
      direction !== glift.displays.icons.CenterDir.V) {
    direction = glift.displays.icons.CenterDir.H;
  }
  for (var i = 0; i < wrappedIcons.length; i++) {
    bboxes.push(wrappedIcons[i].bbox);
  }

  // Row center returns: { transforms: [...], bboxes: [...] }
  if (direction === glift.displays.icons.CenterDir.H) {
    var centeringData = glift.displays.gui.rowCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing);
  } else {
    var centeringData = glift.displays.gui.columnCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing)
  }
  var transforms = centeringData.transforms;

  // TODO(kashomon): Can the transforms be less than the centerede icons? I
  // think so.  In any case, this case probably needs to be handled.
  for (var i = 0; i < transforms.length && i < wrappedIcons.length; i++) {
    wrappedIcons[i].performTransform(transforms[i]);
  }
  return transforms;
};

goog.provide('glift.displays.icons.IconSelector');

goog.require('glift.displays.icons');

glift.displays.icons.iconSelector = function(parentDivId, iconBarDivId, icon) {
  return new glift.displays.icons.IconSelector(parentDivId, iconBarDivId, icon)
      .draw();
};

/**
 * Icon Selector class.
 *
 * @constructor
 * @package
 * @final
 */
glift.displays.icons.IconSelector = function(parentDivId, iconBarId, icon) {
  // The assumption is currently that there can only be one IconSelector.  This
  // may be incorrect, but it can easily be reevaluated later.
  this.iconBarId = iconBarId;
  this.parentDivId = parentDivId;
  this.icon = icon; // base icon.

  this.baseId = 'iconSelector_' + parentDivId;
  this.wrapperDivId = this.baseId + '_wrapper';

  this.displayedIcons = undefined; // defined on draw.

  // Div ids for the columns.
  this.columnIdList = [];
  // SVG data structures for each column.
  this.svgColumnList = []; // defined on draw. Single array.
  // list of columns rewraped icons.  Thus, a double array.
  this.iconList = [];
};

glift.displays.icons.IconSelector.prototype = {
  draw: function() {
    // TODO(kashomon): This needs to be cleaned up. It's currently quite the
    // mess.
    this.destroy();
    var that = this;
    var svglib = glift.displays.svg;
    var parentBbox = glift.displays.bboxFromDiv(this.parentDivId);

    var barElem = glift.dom.elem(this.iconBarId);
    var barPosLeft = barElem.boundingClientRect().left;

    var iconBarBbox = glift.displays.bboxFromDiv(this.iconBarId);
    var iconBbox = this.icon.bbox;
    var columnWidth = iconBbox.height();
    // This assumes that the iconbar is always on the bottom.
    var columnHeight = parentBbox.height() - iconBarBbox.height();
    var paddingPx = 5; // TODO(kashomon): Get from theme.
    var rewrapped = [];

    for (var i = 0; i < this.icon.associatedIcons.length; i++) {
      rewrapped.push(this.icon.associatedIcons[i].rewrapIcon());
    }

    var newWrapperDiv = glift.dom.newDiv(this.wrapperDivId);
    newWrapperDiv.css({
      position: 'absolute',
      height: parentBbox.height() + 'px',
      width: parentBbox.width() + 'px'
    });
    glift.dom.elem(this.parentDivId).append(newWrapperDiv);

    var columnIndex = 0;
    while (rewrapped.length > 0) {
      this.iconList.push([]);
      var columnId = this.baseId + '_column_' + columnIndex;
      this.columnIdList.push(columnId);

      var newColumnDiv = glift.dom.newDiv(columnId);
      newColumnDiv.css({
        bottom: iconBarBbox.height() + 'px',
        height: columnHeight + 'px',
        left: barPosLeft + columnIndex * iconBbox.width() + 'px',
        width: iconBbox.width() + 'px',
        position: 'absolute'
      });
      newWrapperDiv.append(newColumnDiv);

      var columnBox = glift.displays.bboxFromDiv(columnId);
      var transforms = glift.displays.icons.columnCenterWrapped(
          columnBox, rewrapped, paddingPx, paddingPx);

      var svgId = columnId + '_svg';
      var svg = svglib.svg()
          .setId(columnId + '_svg')
          .setAttr('height', '100%')
          .setAttr('width', '100%');
      var idGen = glift.displays.ids.generator(columnId);
      var container = svglib.group().setId(idGen.iconGroup());
      svg.append(container);
      for (var i = 0, len = transforms.length; i < len; i++) {
        var icon = rewrapped.shift();
        var id = svgId + '_' + icon.iconName;
        icon.setElementId(id);
        this.iconList[columnIndex].push(icon);
        container.append(svglib.path()
            .setId(icon.elementId)
            .setAttr('d', icon.iconStr)
            .setAttr('fill', 'black') // replace with theme
            .setAttr('transform', icon.transformString()));
      }
      this.svgColumnList.push(svg);
      columnIndex++;
    }

    this._createIconButtons();
    this._setBackgroundEvent();
    for (var i = 0; i < this.svgColumnList.length; i++) {
      this.svgColumnList[i].attachToParent(this.columnIdList[i]);
    }
    return this;
  },

  _createIconButtons: function() {
    var svglib = glift.displays.svg;
    for (var i = 0; i < this.iconList.length; i++) {
      var svg = this.svgColumnList[i];
      var idGen = glift.displays.ids.generator(this.columnIdList[i]);
      var iconColumn = this.iconList[i];
      var container = svglib.group().setId(idGen.buttonGroup());
      svg.append(container);
      for (var j = 0; j < iconColumn.length; j++) {
        var icon = iconColumn[j]
        container.append(svglib.rect()
          .setData(icon.iconName)
          .setAttr('x', icon.bbox.topLeft().x())
          .setAttr('y', icon.bbox.topLeft().y())
          .setAttr('width', icon.bbox.width())
          .setAttr('height', icon.bbox.height())
          .setAttr('fill', 'blue') // color doesn't matter, but need a fill
          .setAttr('opacity', 0)
          .setId(idGen.button(icon.iconName)));
      }
    }
  },

  _setBackgroundEvent: function() {
    var that = this;
    glift.dom.elem(this.wrapperDivId).on('click', function(e) {
      this.remove();
    });
    return this;
  },

  setIconEvents: function(eventName, func) {
    for (var i = 0; i < this.iconList.length; i++) {
      var idGen = glift.displays.ids.generator(this.columnIdList[i]);
      for (var j = 0; j < this.iconList[i].length; j++) {
        var icon = this.iconList[i][j];
        var buttonId = idGen.button(icon.iconName);
        this._setOneEvent(eventName, buttonId, icon, func);
      }
    }
    return this;
  },

  _setOneEvent: function(eventName, buttonId, icon, func) {
    glift.dom.elem(buttonId).on(eventName, function(event) {
      func(event, icon);
    });
    return this;
  },

  destroy: function() {
    glift.dom.elem(this.wrapperDivId) &&
        glift.dom.elem(this.wrapperDivId).remove();
    return this;
  }
};

/**
 * The bounding boxes are precalculated by running BboxFinder.html
 */
glift.displays.icons.svg = {
  // http://raphaeljs.com/icons/#cross
  // Used for problem correctness
  cross: {
    string: "M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z",
    bbox: {
      "x":8.116,
      "y":7.585,
      "x2":24.778,
      "y2":24.248,
      "width":16.662,
      "height":16.663
    }
  },

  // http://raphaeljs.com/icons/#check
  // Used for problem correctness
  check: {
    string: "M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z",
    bbox: {
      "x":2.379,
      "y":6.733,
      "x2":28.707,
      "y2":25.308,
      "width":26.328,
      "height":18.575
    }
  },

  // http://raphaeljs.com/icons/#refresh
  // Used for some types of problems.
  refresh: {
    string: "M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z",
    bbox: {
      "x":3.416,
      "y":3.415,
      "x2":27.583,
      "y2":27.583,
      "width":24.167,
      "height":24.168
    }
  },

  // http://raphaeljs.com/icons/#undo
  // Return from explain widget.
  undo: {
    string: "M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z",
    bbox: {"x":0.875,"y":6.817,"x2":29.54,"y2":27.042158,"width":28.665,"height":20.225158}
  },

  // http://raphaeljs.com/icons/#arrowright2
  // Next widget / problem
  'chevron-right': {
    string: "M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z",
    bbox: {
      "x":10.129,
      "y":6.276,
      "x2":23.389,
      "y2":25.725,
      "width":13.26,
      "height":19.449
    }
  },

  // http://raphaeljs.com/icons/#arrowleft2
  // Previous widget / problem
  'chevron-left': {
    string: "M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z",
    bbox: { "x":8.612,"y":6.276,"x2":21.871,"y2":25.725,"width":13.259,"height":19.449
    }
  },
  // Problem answer icon
  // http://iconmonstr.com/help-3-icon/
  'problem-explanation': {
    string: "M256,90c91.74,0,166,74.244,166,166c0,91.741-74.245,166-166,166c-91.741,0-166-74.245-166-166 C90,164.259,164.244,90,256,90 M256,50C142.229,50,50,142.229,50,256s92.229,206,206,206s206-92.229,206-206S369.771,50,256,50 L256,50z M258.025,379.511c-14.546,0-26.343-11.797-26.343-26.349c0-14.543,11.797-26.336,26.343-26.336 c14.549,0,26.342,11.793,26.342,26.336C284.367,367.714,272.574,379.511,258.025,379.511z M278.735,301.646v4.739 c0,0-39.494,0-43.423,0v-4.739c0-13.408,1.956-30.61,17.523-45.565c15.569-14.958,35.024-27.312,35.024-45.996 c0-20.655-14.335-31.581-32.409-31.581c-30.116,0-32.085,31.234-32.827,38.112H180.39c1.125-32.57,14.891-78.127,75.315-78.127 c52.363,0,75.905,35.07,75.905,67.957C331.61,258.793,278.735,267.886,278.735,301.646z",
    bbox: {"x":50,"y":50,"x2":462,"y2":462,"width":412,"height":412}
  },

  /////////////////////////////
  // Icons used for GameView //
  /////////////////////////////

  // http://raphaeljs.com/icons/#play
  play: {
    string: "m 58.250001,41.61219 0,40 34.69375,-20.03045 z",
    bbox:{"x":58.250001,"y":41.61219,"x2":92.94375099999999,"y2":81.61219,"width":34.693749999999994,"height":40}
  },

  // My own creation.  See themes/assets.
  unplay: {
    string: "m 74.987245,22.583592 0,39.978487 L 40,42.362183 z",
    bbox: {"x":40,"y":22.583592,"x2":74.987245,"y2":62.562079,"width":34.987245,"height":39.978487}
  },

  // http://raphaeljs.com/icons/#end
  // end: {
    // string: "M21.167,5.5,21.167,13.681,6.684,5.318,6.684,25.682,21.167,17.318,21.167,25.5,25.5,25.5,25.5,5.5z",
    // bbox: {"x":6.684,"y":5.318,"x2":25.5,"y2":25.682,"width":18.816,"height":20.364}
  // },

  // http://raphaeljs.com/icons/#start
  // start: {
    // string: "M24.316,5.318,9.833,13.682,9.833,5.5,5.5,5.5,5.5,25.5,9.833,25.5,9.833,17.318,24.316,25.682z",
    // bbox: {"x":5.5,"y":5.318,"x2":24.316,"y2":25.682,"width":18.816,"height":20.364}
  // },

  // http://raphaeljs.com/icons/#arrowup
  arrowup: {
    string: "M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z",
    bbox: {"x":7.684895,"y":8.56825,"x2":24.315105,"y2":23.432,"width":16.630209,"height":14.86375}
  },

  // Next Move
  // http://raphaeljs.com/icons/#arrowright
  arrowright: {
    string: "M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z",
    bbox: {"x":8.568,"y":7.684457,"x2":23.4315,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

  // Previous Move
  // http://raphaeljs.com/icons/#arrowleft
  arrowleft: {
    string: "M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z",
    bbox: {"x":8.5685,"y":7.684457,"x2":23.432,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

  // Hypothetically for passing
  // http://raphaeljs.com/icons/#detour
  detour: {
    string: "M29.342,15.5l-7.556-4.363v2.614H18.75c-1.441-0.004-2.423,1.002-2.875,1.784c-0.735,1.222-1.056,2.561-1.441,3.522c-0.135,0.361-0.278,0.655-0.376,0.817c-1.626,0-0.998,0-2.768,0c-0.213-0.398-0.571-1.557-0.923-2.692c-0.237-0.676-0.5-1.381-1.013-2.071C8.878,14.43,7.89,13.726,6.75,13.75H2.812v3.499c0,0,0.358,0,1.031,0h2.741c0.008,0.013,0.018,0.028,0.029,0.046c0.291,0.401,0.634,1.663,1.031,2.888c0.218,0.623,0.455,1.262,0.92,1.897c0.417,0.614,1.319,1.293,2.383,1.293H11c2.25,0,1.249,0,3.374,0c0.696,0.01,1.371-0.286,1.809-0.657c1.439-1.338,1.608-2.886,2.13-4.127c0.218-0.608,0.453-1.115,0.605-1.314c0.006-0.01,0.012-0.018,0.018-0.025h2.85v2.614L29.342,15.5zM10.173,14.539c0.568,0.76,0.874,1.559,1.137,2.311c0.04,0.128,0.082,0.264,0.125,0.399h2.58c0.246-0.697,0.553-1.479,1.005-2.228c0.252-0.438,0.621-0.887,1.08-1.272H9.43C9.735,14.003,9.99,14.277,10.173,14.539z",
    bbox: {"x":2.812,"y":11.137,"x2":29.342,"y2":23.37325,"width":26.53,"height":12.23625}
  },

  checkbox: {
    string: "M26,27.5H6c-0.829,0-1.5-0.672-1.5-1.5V6c0-0.829,0.671-1.5,1.5-1.5h20c0.828,0,1.5,0.671,1.5,1.5v20C27.5,26.828,26.828,27.5,26,27.5zM7.5,24.5h17v-17h-17V24.5z",
    bbox: {"x":4.5,"y":4.5,"x2":27.5,"y2":27.5,"width":23,"height":23}
  },

  edit: {
    string: "M27.87,7.863L23.024,4.82l-7.889,12.566l4.842,3.04L27.87,7.863zM14.395,21.25l-0.107,2.855l2.527-1.337l2.349-1.24l-4.672-2.936L14.395,21.25zM29.163,3.239l-2.532-1.591c-0.638-0.401-1.479-0.208-1.882,0.43l-0.998,1.588l4.842,3.042l0.999-1.586C29.992,4.481,29.802,3.639,29.163,3.239zM25.198,27.062c0,0.275-0.225,0.5-0.5,0.5h-19c-0.276,0-0.5-0.225-0.5-0.5v-19c0-0.276,0.224-0.5,0.5-0.5h13.244l1.884-3H5.698c-1.93,0-3.5,1.57-3.5,3.5v19c0,1.93,1.57,3.5,3.5,3.5h19c1.93,0,3.5-1.57,3.5-3.5V11.097l-3,4.776V27.062z",
    bbox: {"x":2.198,"y":1.4388,"x2":29.80125,"y2":30.562,"width":27.60325,"height":29.12316}
  },

  // From iconmonstr
  // http://iconmonstr.com/arrow-17-icon/
  // Jump to previous variation or comment
  'jump-left-arrow': {
    string: "M 179.229,182.397 V 127.433 L 50,256.445 179.229,385.455 v -54.964 h 96.773 V 182.397 h -96.773 z m 123.385,0 h 47.184 V 330.491 H 302.614 V 182.397 z m 73.794,0 h 35.388 V 330.491 H 376.408 V 182.397 z m 62,0 H 462 V 330.491 H 438.408 V 182.397 z",
    bbox: {"x":50,"y":127.433,"x2":462,"y2":385.455,"width":412,"height":258.022}
  },

  // From iconmonstr: http://iconmonstr.com/arrow-17-icon/
  // Jump to next variation or comment
  'jump-right-arrow': {
    string: "M332.771,182.397v-54.964L462,256.445l-129.229,129.01v-54.964h-96.773V182.397H332.771z    M209.386,182.397h-47.184v148.094h47.184V182.397z M135.592,182.397h-35.388v148.094h35.388V182.397z M73.592,182.397H50v148.094   h23.592V182.397z",
    bbox: {"x":50,"y":127.433,"x2":462,"y2":385.455,"width":412,"height":258.022 }
  },

  // From iconmonstr: http://iconmonstr.com/arrow-39-icon/
  // Undo a play in a problem
  'undo-problem-move': {
    string: "m 256,50 c 113.771,0 206,92.229 206,206 0,113.771 -92.229,206 -206,206 C 142.229,462 50,369.771 50,256 50,142.229 142.229,50 256,50 z m 58.399,329.6 V 132.4 L 135.6,256.001 314.399,379.6 z",
    bbox: {"x":50,"y":50,"x2":462,"y2":462,"width":412,"height":412}
  },

  ///////////////////////////////////
  // Icons used for the Status Bar //
  ///////////////////////////////////

  // From Iconmonstr: http://iconmonstr.com/info-2-icon/
  // Show the game info.  Part of the status bar.
  'game-info': {
    string: 'M256,90.002c91.74,0,166,74.241,166,165.998c0,91.739-74.245,165.998-166,165.998 c-91.738,0-166-74.242-166-165.998C90,164.259,164.243,90.002,256,90.002 M256,50.002C142.229,50.002,50,142.228,50,256 c0,113.769,92.229,205.998,206,205.998c113.77,0,206-92.229,206-205.998C462,142.228,369.77,50.002,256,50.002L256,50.002z M252.566,371.808c-28.21,9.913-51.466-1.455-46.801-28.547c4.667-27.098,31.436-85.109,35.255-96.079 c3.816-10.97-3.502-13.977-11.346-9.513c-4.524,2.61-11.248,7.841-17.02,12.925c-1.601-3.223-3.852-6.906-5.542-10.433 c9.419-9.439,25.164-22.094,43.803-26.681c22.27-5.497,59.492,3.29,43.494,45.858c-11.424,30.34-19.503,51.276-24.594,66.868 c-5.088,15.598,0.955,18.868,9.863,12.791c6.959-4.751,14.372-11.214,19.806-16.226c2.515,4.086,3.319,5.389,5.806,10.084 C295.857,342.524,271.182,365.151,252.566,371.808z M311.016,184.127c-12.795,10.891-31.76,10.655-42.37-0.532 c-10.607-11.181-8.837-29.076,3.955-39.969c12.794-10.89,31.763-10.654,42.37,0.525 C325.577,155.337,323.809,173.231,311.016,184.127z',
    bbox: {"x":50,"y":50.002,"x2":462,"y2":461.998,"width":412,"height":411.996}
  },

  // From Iconmonstr: http://iconmonstr.com/loading-14-icon/
  // Show current move number.  Part of the status bar.
  'old-move-indicator': {
    string: "M256,50C142.23,50,50,142.23,50,256s92.23,206,206,206s206-92.23,206-206S369.77,50,256,50z M256.001,124.6c72.568,0,131.399,58.829,131.399,131.401c0,72.568-58.831,131.398-131.399,131.398 c-72.572,0-131.401-58.83-131.401-131.398C124.6,183.429,183.429,124.6,256.001,124.6z M70,256 c0-49.682,19.348-96.391,54.479-131.521S206.318,70,256,70v34.6c-83.482,0.001-151.4,67.918-151.4,151.401 c0,41.807,17.035,79.709,44.526,107.134l-24.269,24.757c-0.125-0.125-0.254-0.245-0.379-0.37C89.348,352.391,70,305.682,70,256z",
    bbox: {"x":50,"y":50,"x2":462,"y2":462,"width":412,"height":412}
  },

  'move-indicator': {
    string: "M 121.40625 65.5625 C 120.45721 65.5625 119.6875 66.18524 119.6875 66.96875 L 119.6875 68.0625 C 119.6875 68.846 120.45721 69.46875 121.40625 69.46875 L 178.5625 69.46875 C 179.51154 69.46875 180.28125 68.846 180.28125 68.0625 L 180.28125 66.96875 C 180.28125 66.18524 179.51154 65.5625 178.5625 65.5625 L 121.40625 65.5625 z M 121.40625 103.4375 C 120.45721 103.4375 119.6875 104.06024 119.6875 104.84375 L 119.6875 105.9375 C 119.6875 106.721 120.45721 107.375 121.40625 107.375 L 178.5625 107.375 C 179.51154 107.375 180.28125 106.721 180.28125 105.9375 L 180.28125 104.84375 C 180.28125 104.06024 179.51154 103.4375 178.5625 103.4375 L 121.40625 103.4375 z",
    bbox: {"x":119.6875,"y":65.5625,"x2":180.28125,"y2":107.375,"width":60.59375,"height":41.8125}
  },

  // Fullscreen Glift!
  // http://raphaeljs.com/icons/#expand
  fullscreen: {
    // http://iconmonstr.com/fullscreen-icon/
    // string: "M157.943,426.942L192.94,462H50V319.062l35.058,34.997l57.253-57.254l72.884,72.886L157.943,426.942z M319.062,50l34.997,35.058l-56.08,56.079l72.885,72.885l56.08-56.08L462,192.938V50H319.062z M85.058,157.943L50,192.94V50h142.938 L157.94,85.058l57.254,57.253l-72.886,72.884L85.058,157.943z M462,319.062l-35.058,34.997l-56.079-56.08l-72.885,72.885 l56.08,56.08L319.062,462H462V319.062z",
    // string: "M363.68,288.439h-76.24v76.238h-58.877v-76.238h-76.24v-58.877h76.24v-76.24h58.877v76.24h76.24V288.439z M462,256c0,113.771-92.229,206-206,206S50,369.771,50,256S142.229,50,256,50S462,142.229,462,256z M422,256 c0-91.755-74.258-166-166-166c-91.755,0-166,74.259-166,166c0,91.755,74.258,166,166,166C347.755,422,422,347.741,422,256z",
    string: "M25.545,23.328,17.918,15.623,25.534,8.007,27.391,9.864,29.649,1.436,21.222,3.694,23.058,5.53,15.455,13.134,7.942,5.543,9.809,3.696,1.393,1.394,3.608,9.833,5.456,8.005,12.98,15.608,5.465,23.123,3.609,21.268,1.351,29.695,9.779,27.438,7.941,25.6,15.443,18.098,23.057,25.791,21.19,27.638,29.606,29.939,27.393,21.5z",
    bbox: {"x":1.351,"y":1.394,"x2":29.649,"y2":29.939,"width":28.298,"height":28.545}
  },

  // Un-Fullscreen Glift!
  // http://raphaeljs.com/icons/#contract
  unfullscreen: {
    string: "M25.083,18.895l-8.428-2.259l2.258,8.428l1.838-1.837l7.053,7.053l2.476-2.476l-7.053-7.053L25.083,18.895zM5.542,11.731l8.428,2.258l-2.258-8.428L9.874,7.398L3.196,0.72L0.72,3.196l6.678,6.678L5.542,11.731zM7.589,20.935l-6.87,6.869l2.476,2.476l6.869-6.869l1.858,1.857l2.258-8.428l-8.428,2.258L7.589,20.935zM23.412,10.064l6.867-6.87l-2.476-2.476l-6.868,6.869l-1.856-1.856l-2.258,8.428l8.428-2.259L23.412,10.064z",
    bbox: {"x":0.719,"y":0.718,"x2":30.28,"y2":30.28,"width":29.561,"height":29.562}
  },

  // From Iconmonstr: http://iconmonstr.com/wrench-icon/
  // Glift settings (themes, etc)
  // TODO(kashomon): Change to control panel?
  // 'settings-wrench': {
    // string: "M447.087,375.073L281.4,209.387c-11.353-11.353-17.2-27.142-15.962-43.149 c2.345-30.325-8.074-61.451-31.268-84.644c-30.191-30.19-73.819-38.74-111.629-25.666l68.646,68.647 c1.576,26.781-39.832,68.188-66.612,66.612l-68.646-68.646c-13.076,37.81-4.525,81.439,25.665,111.629 c23.193,23.194,54.319,33.612,84.645,31.268c16.024-1.239,31.785,4.598,43.15,15.962l165.687,165.686 c19.885,19.886,52.126,19.886,72.013,0C466.972,427.2,466.972,394.959,447.087,375.073z M408.597,428.96 c-11.589,0-20.985-9.396-20.985-20.987c0-11.59,9.396-20.985,20.985-20.985c11.59,0,20.987,9.396,20.987,20.985 C429.584,419.564,420.187,428.96,408.597,428.96z",
    // bbox: {"x":49.999876,"y":49.999979,"x2":462.001000,"y2":462.000500,"width":412.001124,"height":412.000522}
  // },

  'widget-page': {
    string: "M170.166,421.825V156.714H409.5c0,0,0,133.5,0,165.25c0,50.953-70.109,33.833-70.109,33.833 s16.609,66.028-32,66.028C275.328,421.825,288.508,421.825,170.166,421.825z M449.5,320.417V116.714H130.166v345.111H308 C376.165,461.825,449.5,381.819,449.5,320.417z M97.5,420.942V85.333h311V50.175h-346v370.768H97.5z",
    bbox: {"x":62.5,"y":50.175,"x2":449.5,"y2":461.825,"width":387,"height":411.65},
    subboxName: 'widget-page-inside'
  },

  'widget-page-inside': {
    string: "m 169.51387,157.63164 240.08073,0 0,263.09167 -240.08073,0 z",
    bbox: {"x":169.51387,"y":157.63164,"x2":409.5946,"y2":420.72331,"width":240.08073000000002,"height":263.09167}
  },

  ///////////////////////////////
  // Icons used for GameEditor //
  ///////////////////////////////

  // My own creation.  For layered icons (multi-icons).
  multiopen: {
    string: "m 130,73.862183 6.5,-13 6.5,13 z M 70.709141,37.871643 c -5.658849,0 -10.21875,4.412745 -10.21875,9.90625 l 0,43.3125 c 0,5.493505 4.559901,9.906247 10.21875,9.906247 l 44.624999,0 c 5.65885,0 10.21875,-4.412742 10.21875,-9.906247 l 0,-43.3125 c 0,-5.493505 -4.5599,-9.90625 -10.21875,-9.90625 l -44.624999,0 z m 2.0625,3.125 40.468749,0 c 5.12994,0 9.25,3.959703 9.25,8.90625 l 0,39 c 0,4.946547 -4.12006,8.9375 -9.25,8.9375 l -40.468749,0 c -5.129943,0 -9.25,-3.990953 -9.25,-8.9375 l 0,-39 c 0,-4.946547 4.120057,-8.90625 9.25,-8.90625 z",
    bbox: {"x":60.490391,"y":37.871643,"x2":143,"y2":100.99664,"width":82.509609,"height":63.124997},
    subboxName: 'multiopen-boxonly-inside'
  },

  // The above minus the arrow.
  "multiopen-boxonly": {
    string: "m 71.1875,38.25 c -5.658849,0 -10.21875,4.412745 -10.21875,9.90625 l 0,43.3125 c 0,5.493505 4.559901,9.90625 10.21875,9.90625 l 44.625,0 c 5.65885,0 10.21875,-4.412745 10.21875,-9.90625 l 0,-43.3125 c 0,-5.493505 -4.5599,-9.90625 -10.21875,-9.90625 l -44.625,0 z m 2.0625,3.125 40.46875,0 c 5.12994,0 9.25,3.959703 9.25,8.90625 l 0,39 c 0,4.946547 -4.12006,8.9375 -9.25,8.9375 l -40.46875,0 c -5.129943,0 -9.25,-3.990953 -9.25,-8.9375 l 0,-39 C 64,45.334703 68.120057,41.375 73.25,41.375 z",
    bbox: {"x":60.96875,"y":38.25,"x2":126.03125,"y2":101.375,"width":65.0625,"height":63.125},
    subboxName: 'multiopen-boxonly-inside'
  },

  // Used to indicate where the inside box lives, which is in turn used to
  // position icons with the box.
  "multiopen-boxonly-inside": {
    string: "m 73.259825,41.362183 40.445075,0 c 5.12994,0 9.25982,3.982238 9.25982,8.928785 l 0,38.999149 c 0,4.946547 -4.12988,8.928786 -9.25982,8.928786 l -40.445075,0 C 68.129882,98.218903 64,94.236664 64,89.290117 l 0,-38.999149 c 0,-4.946547 4.129882,-8.928785 9.259825,-8.928785 z",
    bbox: {"x":64,"y":41.362183,"x2":122.96472,"y2":98.218903,"width":58.96472,"height":56.85672}
  },

  ///////////////////////////////////////
  // Individual Icons the Board Editor //
  ///////////////////////////////////////

  // My own creation
  twostones: {
    string: "m 42.894737,29.335869 c 0,6.540213 -5.301891,11.842106 -11.842105,11.842106 -6.540214,0 -11.842105,-5.301893 -11.842105,-11.842106 0,-6.540214 5.301891,-11.842105 11.842105,-11.842105 6.540214,0 11.842105,5.301891 11.842105,11.842105 z M 31.052632,16.309553 c -7.194236,0 -13.026316,5.83208 -13.026316,13.026316 0,7.194233 5.83208,13.026314 13.026316,13.026314 3.733917,0 7.098575,-1.575815 9.473684,-4.092928 2.375029,2.516206 5.740532,4.092928 9.473684,4.092928 7.194235,0 13.026316,-5.832081 13.026316,-13.026314 0,-7.194236 -5.832081,-13.026316 -13.026316,-13.026316 -3.733152,0 -7.098655,1.56932 -9.473684,4.085526 -2.374906,-2.51483 -5.741698,-4.085526 -9.473684,-4.085526 z",
    bbox: {"x":18.026316,"y":16.309553,"x2":63.026316,"y2":42.362183,"width":45,"height":26.05263}
  },

  bstone: {
    string: "m 105.05587,69.988831 a 23.738585,23.738585 0 1 1 -47.477171,0 23.738585,23.738585 0 1 1 47.477171,0 z",
    bbox: {"x":57.578699,"y":46.2148296,"x2":105.05587,"y2":93.7628323,"width":47.477171,"height":47.548002735}
  },

  wstone: {
    string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 107.5 42.375 C 130.9721 42.375 150 61.402898 150 84.875 C 150 108.3471 130.9721 127.375 107.5 127.375 C 84.027898 127.375 65 108.3471 65 84.875 C 65 61.402898 84.027898 42.375 107.5 42.375 z",
    bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  },

  bstone_a: {
    string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 102.78125 52.53125 L 111.96875 52.53125 L 134.75 112.375 L 126.34375 112.375 L 120.90625 97 L 93.90625 97 L 88.46875 112.375 L 79.9375 112.375 L 102.78125 52.53125 z M 107.34375 60.5 L 96.375 90.28125 L 118.375 90.28125 L 107.34375 60.5 z",
    bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  },

  // bstone_1: {
    // string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 103.46875 52.125 L 111.625 52.125 L 111.625 105.5 L 124.9375 105.5 L 124.9375 112.375 L 90.25 112.375 L 90.25 105.5 L 103.5625 105.5 L 103.5625 59.5625 L 89.0625 62.46875 L 89.0625 55.03125 L 103.46875 52.125 z",
    // bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  // },

  bstone_1: {
    string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 106.96875 52.4375 L 116.21875 52.4375 L 116.21875 112.21875 L 104.8125 112.21875 L 104.8125 69.21875 C 100.64371 73.116859 95.751353 75.975961 90.09375 77.84375 L 90.09375 67.5 C 93.071433 66.525528 96.289216 64.675791 99.78125 61.96875 C 103.27325 59.23474 105.66937 56.064927 106.96875 52.4375 z",
    bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  },

  bstone_triangle: {
    string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 107.8125 45.875 L 143.28125 107.3125 L 72.375 107.3125 L 107.8125 45.875 z M 107.78125 54.53125 L 80.3125 102.15625 L 135.28125 102.15625 L 107.78125 54.53125 z",
    bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  },

  bstone_square: {
    string: "M 107.5 37.375 C 81.266474 37.375 60 58.641474 60 84.875 C 60 111.10853 81.266474 132.375 107.5 132.375 C 133.73353 132.375 155 111.10853 155 84.875 C 155 58.641474 133.73353 37.375 107.5 37.375 z M 76.0625 53.40625 L 139.21875 53.40625 L 139.21875 116.5625 L 76.0625 116.5625 L 76.0625 53.40625 z M 80.15625 57.59375 L 80.15625 112.34375 L 134.875 112.34375 L 134.875 57.59375 L 80.15625 57.59375 z",
    bbox: {"x":60,"y":37.375,"x2":155,"y2":132.375,"width":95,"height":95}
  },

  eraser: {
    string: "M 115 32.375 L 70.21875 87.40625 L 95.15625 112.375 L 140 57.375 L 115 32.375 z M 115 38.25 L 135 57.375 L 95 107.375 L 75 87.375 L 115 38.25 z",
    bbox: {"x":70.21875,"y":37.375,"x2":140,"y2":112.375,"width":69.78125,"height":80}
  },

  'nostone-xmark': {
    string: "M462,256c0,113.771-92.229,206-206,206S50,369.771,50,256S142.229,50,256,50S462,142.229,462,256z M422,256c0-91.755-74.258-166-166-166c-91.755,0-166,74.259-166,166c0,91.755,74.258,166,166,166C347.755,422,422,347.741,422,256z M325.329,362.49l-67.327-67.324l-67.329,67.332l-36.164-36.186l67.314-67.322l-67.321-67.317l36.185-36.164l67.31,67.301 l67.3-67.309l36.193,36.17l-67.312,67.315l67.32,67.31L325.329,362.49z",
    bbox: {"x":50,"y":50,"x2":462,"y2":462,"width":412,"height":412}
  },

  //////////////////
  // Misc Helpers //
  //////////////////

  // TODO(kashomon): Use for overflow indicator.
  simpletriangleup: {
    string: "M256,77.599 L462,434.4 L50,434.4Z",
    bbox:{"x":50,"y":77.599,"x2":462,"y2":434.4,"width":412,"height":356.801} 
  },

  simpletriangledown: {
    string: "M256,434.4 L462,77.599 L50,77.599Z",
    bbox:{"x":50,"y":77.599,"x2":462,"y2":434.4,"width":412,"height":356.801} 
  }
};

goog.provide('glift.displays.icons.WrappedIcon');

goog.require('glift.displays.icons');

/**
 * Create a wrapper icon.
 *
 * @param {string} iconName name of the relevant icon.
 * @return {!glift.displays.icons.WrappedIcon}
 */
glift.displays.icons.wrappedIcon = function(iconName) {
  return new glift.displays.icons.WrappedIcon(iconName);
};

/**
 * Wrap an array of iconNames.
 *
 * @param {!Array<string|!Array<string>>} iconsRaw
 * return {Array<glift.displays.icons.WrappedIcon>}
 */
glift.displays.icons.wrapIcons = function(iconsRaw) {
  var out = [];
  for (var i = 0; i < iconsRaw.length; i++) {
    var item = iconsRaw[i];
    if (glift.util.typeOf(item) === 'string') {
      out.push(glift.displays.icons.wrappedIcon(
          /** @type {string} */ (item)));
    } else if (glift.util.typeOf(item) === 'array') {
      var subIcons = item;
      // Looks like we only accept the multiopen icon for this category...
      var outerIcon = glift.displays.icons.wrappedIcon('multiopen')
      for (var j = 0; j < subIcons.length; j++) {
        outerIcon.addAssociatedIcon(subIcons[j]);
      }
      out.push(outerIcon);
    }
  }
  return out;
};

/**
 * Validate that an iconName is valid.
 * @param {string} iconName
 * @return {string}
 */
glift.displays.icons.validateIcon = function(iconName) {
  if (iconName === undefined ||
      glift.displays.icons.svg[iconName] === undefined) {
    throw new Error('Icon unknown: [' + iconName + ']');
  }
  return iconName;
};

/**
 * Icon wrapper for convenience.  All you need is:
 *  - The name of the icon
 *
 * @param {string} iconName Name of the icon.
 *
 * @constructor
 * @final
 */
glift.displays.icons.WrappedIcon = function(iconName) {
  this.iconName = glift.displays.icons.validateIcon(iconName);
  var iconData = glift.displays.icons.svg[iconName];
  this.iconStr = iconData.string;
  this.originalBbox = glift.orientation.bbox.fromPts(
      glift.util.point(iconData.bbox.x, iconData.bbox.y),
      glift.util.point(iconData.bbox.x2, iconData.bbox.y2));
  this.associatedIcons = []; // Added with addAssociatedIcon
  this.activeAssociated = 0; // Index into the above array
  this.bbox = this.originalBbox; // can change on "translate"
  this.transformObj = undefined; // Set if the icon is transformed
  this.elementId = undefined; // set with setElementId.  The id in the DOM.
  this.subboxIcon = undefined; // Set from setSubboxIcon(...);
  if (iconData.subboxName !== undefined) {
    this.setSubboxIcon(iconData.subboxName);
  }
};

/**
 * Wrapped icon methods.
 */
glift.displays.icons.WrappedIcon.prototype = {
  /**
   * Add an associated icon and return the new icon.
   */
  addAssociatedIcon: function(iconName) {
    var newIcon = glift.displays.icons.wrappedIcon(iconName)
    this.associatedIcons.push(newIcon);
    return newIcon;
  },

  /**
   * Add an associated icon and return the icon (for parity with the above).
   */
  _addAssociatedWrapped: function(wrapped) {
    if (wrapped.originalBbox === undefined) {
      throw "Wrapped icon not actually a wrapped icon: " + wrapped;
    }
    this.associatedIcons.push(wrapped);
    return wrapped;
  },

  /**
   * Clear the associated icons, returning the old list.
   */
  clearAssociatedIcons: function() {
    var oldIcons = this.associatedIcons;
    this.associatedIcons = [];
    return oldIcons;
  },

  /**
   * Return a the wrapped icon from the associated icon list. If index isn't
   * specified, the assumption is that the index is the active index;
   */
  getAssociated: function(index) {
    index = index || this.activeAssociated;
    return this.associatedIcons[index];
  },

  /**
   * Get the active associated icon.
   */
  getActive: function() {
    return this.associatedIcons[this.activeAssociated];
  },

  /**
   * Set the 'active' icon. Note: this doesn't refresh the icons on screen.
   * That task is left to the bar or selector.
   */
  setActive: function(iconName) {
    for (var i = 0, len = this.associatedIcons.length; i < len; i++) {
      var icon = this.associatedIcons[i];
      if (icon.iconName === iconName) {
        this.activeAssociated = i;
      }
    }
    return this;
  },

  /**
   * Set the div element id.
   */
  setElementId: function(id) {
    this.elementId = id;
    return this;
  },

  /**
   * Set a subbox, so we can center icons within the subbox.  A caveat is that
   * the subbox must be specified as an icon.
   */
  setSubboxIcon: function(iconName) {
    this.subboxIcon = glift.displays.icons.wrappedIcon(iconName);
    return this.subboxIcon;
  },

  /**
   * Center a icon (specified as a wrapped icon) within a subbox. Returns the
   * wrapped icon with the proper scaling.
   */
  centerWithinSubbox: function(wrapped, vMargin, hMargin) {
    if (this.subboxIcon === undefined) {
      throw "No subbox defined, so cannot centerWithin.";
    }
    var centerObj = glift.displays.gui.centerWithin(
        this.subboxIcon.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * Center a icon (specified as a wrapped icon) within the current icon.
   * Returns the wrapped icon with the proper scaling.
   */
  centerWithinIcon: function(wrapped, vMargin, hMargin) {
    var centerObj = glift.displays.gui.centerWithin(
        this.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * The transform parameter looks like the following:
   *  {
   *    scale: num,
   *    xMove: num,
   *    yMove: num
   *  }
   *
   * This translates the bounding box of the icon.
   *
   * Note that the scale is performed first, then the translate is performed.
   */
  performTransform: function(transformObj) {
    if (transformObj.scale) {
      this.bbox = this.bbox.scale(transformObj.scale)
    }
    if (transformObj.xMove && transformObj.yMove) {
      this.bbox = this.bbox.translate(transformObj.xMove, transformObj.yMove);
    }
    if (this.subboxIcon !== undefined) {
      this.subboxIcon.performTransform(transformObj);
    }
    // TODO(kashomon): Should we transform the associated icons?
    this.transformObj = transformObj;
    return this;
  },

  /**
   * Reset the bounding box to the initial position.
   */
  resetTransform: function() {
    this.bbox = this.originalBbox;
    this.transformObj = undefined;
    return this;
  },

  /**
   * Get the scaling string to be used as a SVG transform parameter.
   *
   * @return {string} the SVG transform string.
   */
  transformString: function() {
    if (this.transformObj != undefined) {
      return 'translate(' + this.transformObj.xMove + ','
          + this.transformObj.yMove + ') '
          + 'scale(' + this.transformObj.scale + ')';
    } else {
      return "";
    }
  },

  /**
  * Create a new wrapper icon.  This 'forgets' all
  */
  rewrapIcon: function() {
    return glift.displays.icons.wrappedIcon(this.iconName);
  }
};

goog.provide('glift.displays.svg');

/** SVG utilities. */
glift.displays.svg = {};

goog.provide('glift.displays.svg.pathutils');

/** @namespace */
glift.displays.svg.pathutils = {
  /**
   * Move the current position to X,Y.  Usually used in the context of creating a
   * path.
   */
  move: function(x, y) {
    return "M" + x + " " + y;
  },

  movePt: function(pt) {
    return glift.displays.svg.pathutils.move(pt.x(), pt.y());
  },

  /**
   * Create a relative SVG line, starting from the 'current' position.
   */
  lineRel: function(x, y) {
    return "l" + x + " " + y;
  },

  lineRelPt: function(pt) {
    return glift.displays.svg.pathutils.lineRel(pt.x(), pt.y());
  },

  /**
   * Create an absolute SVG line -- different from lower case.
   * This form is usually preferred.
   */
  lineAbs: function(x, y) {
    return "L" + x + " " + y;
  },

  // Create an absolute SVG line -- different from lower case.
  lineAbsPt: function(pt) {
    return glift.displays.svg.pathutils.lineAbs(pt.x(), pt.y());
  }
};

goog.provide('glift.displays.svg.SvgObj');

/**
 * Creats a SVG Wrapper object.
 *
 * @param {string} type Svg element type.
 * @param {Object=} opt_attrObj optional attribute object.
 */
glift.displays.svg.createObj = function(type, opt_attrObj) {
   return new glift.displays.svg.SvgObj(type, opt_attrObj);
};

/**
 * Creates a root SVG object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.svg = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('svg', opt_attrObj)
      .setAttr('version', '1.1')
      .setAttr('xmlns', 'http://www.w3.org/2000/svg');
};

/**
 * Creates a circle svg object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.circle = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('circle', opt_attrObj);
};

/**
 * Creates a path svg object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.path = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('path', opt_attrObj);
};

/**
 * Creates an rectangle svg object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.rect = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('rect', opt_attrObj);
};

/**
 * Creates an image svg object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.image = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('image', opt_attrObj);
};

/**
 * Creates a text svg object.
 * @param {Object=} opt_attrObj optional attribute object.
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.text = function(opt_attrObj) {
  return new glift.displays.svg.SvgObj('text', opt_attrObj);
};

/**
 * Create a group object (without any attributes)
 * @return {!glift.displays.svg.SvgObj}
 */
glift.displays.svg.group = function() {
  return new glift.displays.svg.SvgObj('g');
};

/**
 * SVG Wrapper object.
 * @constructor @final @struct
 *
 * @param {string} type Svg element type.
 * @param {Object=} opt_attrObj optional attribute object.
 */
glift.displays.svg.SvgObj = function(type, opt_attrObj) {
  /** @private {string} */
  this.type_ = type;
  /** @private {!Object} */
  this.attrMap_ = opt_attrObj || {};
  /** @private {!Array<!glift.displays.svg.SvgObj>} */
  this.children_ = [];
  /** @private {!Object<!glift.displays.svg.SvgObj>} */
  this.idMap_ = {};
  /** @private {string} */
  this.text_ = '';
  /** @private {Object} */
  this.data_ = null;
};

glift.displays.svg.SvgObj.prototype = {
  /**
   * Attach content to a div.
   * @param {string} divId}
   */
  attachToParent: function(divId) {
    var svgContainer = document.getElementById(divId);
    if (svgContainer) {
      svgContainer.appendChild(this.asElement());
    }
  },

  /**
   * Remove from the element from the DOM.
   * @return {!glift.displays.svg.SvgObj} this object.
   */
  removeFromDom: function() {
    if (this.id()) {
      var elem = document.getElementById(this.idOrThrow());
      if (elem) { elem.parentNode.removeChild(elem); }
    }
    return this;
  },

  /**
   * Turn this node (and all children nodes) into SVG elements.
   * @return {Element} Dom element.
   */
  asElement: function() {
    var elem = document.createElementNS(
        "http://www.w3.org/2000/svg", this.type_);
    for (var attr in this.attrMap_) {
      if (attr === 'xlink:href') {
        elem.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'href', this.attrMap_[attr]);
      } else {
        elem.setAttribute(attr, this.attrMap_[attr]);
      }
    }
    if (this.type_ === 'text') {
      var textNode = document.createTextNode(this.text_);
      elem.appendChild(textNode);
    }
    for (var i = 0, len = this.children_.length; i < len; i++) {
      elem.appendChild(this.children_[i].asElement());
    }
    return elem;
  },

  /**
   * Return the string form of the svg object.
   * @return {string}
   */
  render: function() {
    var base = '<' + this.type_;
    for (var key in this.attrMap_) {
      base += ' ' + key + '="' + this.attrMap_[key] + '"';
    }
    base += '>' + this.text_;
    if (this.children_.length > 0) {
      var baseBuffer = [base];
      for (var i = 0, ii = this.children_.length; i < ii; i++) {
        baseBuffer.push(this.children_[i].render());
      }
      baseBuffer.push('</' + this.type_ + '>');
      base = baseBuffer.join("\n");
    } else {
      base += '</' + this.type_ + '>';
    }
    return base;
  },

  /** @return {*} A value in the attribute map. */
  attr: function(key) {
    return this.attrMap_[key];
  },

  /**
   * Sets an SVG attribute.
   * @param {string} key The key of an object in the map.
   * @param {*} value The value to set in the map.
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  setAttr: function(key, value) {
    this.attrMap_[key] = value;
    return this;
  },

  /** @return {?string} the Id of this object or null. */
  id: function() {
    return /** @type {?string} */ (this.attrMap_['id'] || null);
  },

  /**
   * Convenience method to avoid null ID type.
   * @return {string}
   */
  idOrThrow: function() {
    if (this.id() == null) {
      throw new Error('ID was null; expected to be non-null');
    }
    return /** @type {string} */ (this.id());
  },

  /**
   * Sets the ID (using the Attribute object as a store).
   * @param {string} id
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  setId: function(id) {
    if (id) {
      this.attrMap_['id'] = id;
    }
    return this;
  },

  /** @return {Object} The attribute object.  */
  attrObj: function() {
    return this.attrMap_;
  },

  /**
   * Sets the entire attribute object.
   * @param {!Object} attrObj
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  setAttrObj: function(attrObj) {
    if (glift.util.typeOf(attrObj) !== 'object') {
      throw new Error('Attr obj must be of type object');
    }
    this.attrMap_ = attrObj;
    return this;
  },

  /**
   * Update a particular attribute in the DOM with at attribute that exists on
   * this element.
   * @param {string} attrName
   */
  updateAttrInDom: function(attrName) {
    var id = this.id();
    if (id) {
      var elem = document.getElementById(id)
      if (elem && attrName && this.attr(attrName)) {
        var value = /** @type (boolean|number|string) */ (this.attr(attrName));
        elem.setAttribute(attrName, value);
      }
    } else {
      throw new Error('No ID present: could not update the dom:' + id);
    }
    return this;
  },

  /** @return {Object} The node's data */
  data: function(data) {
    return this.data_
  },

  /**
   * Set some internal data. Note: this data is not attached when the element is
   * generated.
   * @param {Object} data
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  setData: function(data) {
    this.data_ = data;
    return this;
  },

  /** @return {string} The text on the node. */
  text: function(text) {
    return this.text_;
  },

  /**
   * Append some text. Usually only for text elements.
   * @param {string} text
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  setText: function(text) {
    this.text_ = text;
    return this;
  },

  /**
   * Get child from an Id.
   * @return {!glift.displays.svg.SvgObj} The child obj.
   */
  child: function(id) {
    return this.idMap_[id];
  },

  /**
   * Remove child, based on id.
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  rmChild: function(id) {
    delete this.idMap_[id];
    return this;
  },

  /**
   * Get all the Children.
   * @return {!Array<glift.displays.svg.SvgObj>}
   */
  children: function() {
    return this.children_;
  },

  /**
   * Empty out all the children.
   * @return {!glift.displays.svg.SvgObj} this object.
   */
  emptyChildren: function() {
    this.children_ = [];
    return this;
  },

  /**
   * Empty out all the children and update.
   * @return {!glift.displays.svg.SvgObj} this object.
   */
  emptyChildrenAndUpdate: function() {
    this.emptyChildren();
    var elem = document.getElementById(this.idOrThrow());
    while (elem && elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
    return this;
  },

  /**
   * Add an already existing child.
   * @param {!glift.displays.svg.SvgObj} obj Object to add.
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  append: function(obj) {
    if (obj.id() !== undefined) {
      this.idMap_[obj.id()] = obj;
    }
    this.children_.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   * @param {string} type
   * @param {Object} attrObj
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  appendNew: function(type, attrObj) {
    var obj = glift.displays.svg.createObj(type, attrObj);
    return this.append(obj);
  },

  /**
   * Append an SVG element and attach to the DOM.
   * @param {!glift.displays.svg.SvgObj} obj
   * @return {!glift.displays.svg.SvgObj} This object.
   */
  appendAndAttach: function(obj) {
    this.append(obj);
    if (this.id()) {
      obj.attachToParent(this.idOrThrow());
    }
    return this;
  },

  /**
   * Create a copy of the object without any children
   * @return {!glift.displays.svg.SvgObj} The new object.
   */
  copyNoChildren: function() {
    var newAttr = {};
    for (var key in this.attrMap_) {
      newAttr[key] = this.attrMap_[key];
    }
    return glift.displays.svg.createObj(this.type_, newAttr);
  }
};

goog.provide('glift.displays.statusbar');
goog.provide('glift.displays.statusbar.StatusBar');

glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   *
   * @return {!glift.displays.statusbar.StatusBar} The status bar instance.
   */
  create: function(options) {
    return new glift.displays.statusbar.StatusBar(
        options.iconBarPrototype,
        options.theme,
        options.widget,
        options.allPositioning
    );
  }
};

/**
 * The status bar component. Displays at the top of Glift and is used to display
 * Game information like move number, settings, and game info.
 *
 * @constructor @final @struct
 */
glift.displays.statusbar.StatusBar = function(
    iconBarPrototype, theme, widget, positioning) {
  this.iconBar = iconBarPrototype;
  this.theme = theme;
  // TODO(kashomon): Restructure in such a way so the status bar doesn't need to
  // depend on the widget object
  this.widget = widget;

  // Bboxes for all components.
  this.positioning = positioning;

  // TODO(kashomon): Don't depend on manager data.
  this.totalPages = widget.manager.sgfCollection.length;
  this.pageIndex = widget.manager.sgfColIndex + 1;
};

glift.displays.statusbar.StatusBar.prototype = {
  draw: function() {
    this.iconBar.draw();
    this.setPageNumber(this.pageIndex, this.totalPages);
    return this;
  },

  /** Sets the move number for the current move */
  setMoveNumber: function(number) {
    // TODO(kashomon): Note: This hardcodes the move-indicator name.
    if (!this.iconBar.hasIcon('move-indicator')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    // var mod = num.length > 2 ? 0.35 : null;
    this.iconBar.addTempText(
        'move-indicator',
        num,
        { fill: color, stroke: color },
        null /* size modifier, as float */);
  },

  /** Sets the page number for the current move */
  setPageNumber: function(number, denominator) {
    if (!this.iconBar.hasIcon('widget-page')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var denom = (denominator || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    this.iconBar.addTempText(
        'widget-page',
        num,
        { fill: color, stroke: color },
        0.85);
  }
};

goog.require('glift.displays.statusbar.StatusBar');

/**
 * Makes Glift full-screen. Sort of. True fullscreen isn't supported yet.
 *
 * Note: Key bindings are set in the base_widget.
 */
// TODO(kashomon): Make into a first-class class.
glift.displays.statusbar.StatusBar.prototype.fullscreen = function() {
  // TODO(kashomon): Support true fullscreen: issues/69
  var widget = this.widget,
      wrapperDivId = widget.wrapperDivId,
      newDivId = wrapperDivId + '_fullscreen',
      newDiv = glift.dom.newDiv(newDivId),
      state = widget.getCurrentState(),
      manager = widget.manager;

  var body = document.body;
  if (body == null) {
    throw new Error('document.body was null, ' +
        'but it must not be null for fullscreen to work');
  }
  body = glift.dom.elem(/* @type {!HTMLBodyElement} */ (body));

  var cssObj = glift.obj.flatMerge({
      position: 'absolute',
      top: '0px', bottom: '0px', left: '0px', right: '0px',
      margin: '0px', padding: '0px',
      // Some sites set the z-index obnoxiously high (looking at you bootstrap).
      // So, to make it really fullscreen, we need to set the z-index higher.
      'z-index': 110000
    }, this.theme.statusBar.fullscreen);
  newDiv.css(cssObj);

  // Prevent scrolling outside the div
  body.addClass('glift-fullscreen-no-scroll').append(newDiv);
  manager.prevScrollTop =
      window.pageYOffset ||
      document.body.scrollTop ||
      document.documentElement.scrollTop || null;
  window.scrollTo(0, 0); // Scroll to the top.
  manager.fullscreenDivId = newDivId;
  widget.destroy();
  widget.wrapperDivId = newDivId;
  widget.draw();
  widget.applyState(state);
  manager.enableFullscreenAutoResize();
};

/** Returns Glift to non-fullscreen */
glift.displays.statusbar.StatusBar.prototype.unfullscreen = function() {
  if (!this.widget.manager.isFullscreen()) {
    return;
  }
  var widget = this.widget,
      wrapperDivEl = glift.dom.elem(widget.wrapperDivId),
      state = widget.getCurrentState(),
      manager = widget.manager,
      prevScrollTop = manager.prevScrollTop,
      // We can safely cast the body; There's no way to get here unless
      // 'fullscreen()' has already been called.
      body = glift.dom.elem(/** @type {!HTMLBodyElement} */ (document.body));

  widget.destroy();
  wrapperDivEl.remove(); // remove the fullscreen div completely
  widget.wrapperDivId = widget.manager.divId;
  window.scrollTo(0, manager.prevScrollTop || 0);

  // Re-enable scrolling now that we're done with fullscreen.
  body.removeClass('glift-fullscreen-no-scroll');

  manager.fullscreenDivId = null;
  manager.prevScrollTop = null;

  widget.draw();
  widget.applyState(state);
  widget.manager.disableFullscreenAutoResize();
};

goog.require('glift.displays.statusbar.StatusBar');

/**
 * Create a game info object. Takes a array of game info data.
 *
 * Note: Key bindings are set in the base_widget.
 */
// TODO(kashomon): Make into a first-class class.
glift.displays.statusbar.StatusBar.prototype.gameInfo =
    function(gameInfoArr, captureCount) {
  var infoWindow = glift.displays.statusbar.infoWindow(
      this.widget.wrapperDivId,
      this.positioning.fullWidgetBbox(),
      this.theme.statusBar.gameInfo,
      this.widget.manager.id);

  // This is a hack until a better solution for captures can be crafted for
  // displaying captured stones.
  var captureArr = [
    {displayName: 'Captured White Stones', value: captureCount.WHITE},
    {displayName: 'Captured Black Stones', value: captureCount.BLACK}
  ];

  gameInfoArr = captureArr.concat(gameInfoArr);

  var textArray = [];
  for (var i = 0; i < gameInfoArr.length; i++) {
    var obj = gameInfoArr[i];
    textArray.push('<strong>' + obj.displayName + ': </strong>' + obj.value);
  }

  var gameInfoTheme = this.theme.statusBar.gameInfo;
  infoWindow.textDiv
    .append(glift.dom.newElem('h3')
      .appendText('Game Info')
      .css(glift.obj.flatMerge(gameInfoTheme.textTitle, gameInfoTheme.text)))
    .append(glift.dom.convertText(textArray.join('\n'),
          false, /* useMarkdown */
          glift.obj.flatMerge(gameInfoTheme.textBody, gameInfoTheme.text)))
    .css({ padding: '10px'})
  infoWindow.finish()
};

goog.provide('glift.displays.statusbar.InfoWindow');

/**
 * Creates an info window.  This isn't super useful on its own -- it's meant to
 * be populated with data.
 */
glift.displays.statusbar.infoWindow = function(
    wrapperDivId, bbox, theme, instanceId) {
  var suffix = '_info_window',
      newDivId = wrapperDivId + suffix + '_wrapper',
      wrapperDivEl = glift.dom.elem(wrapperDivId),
      fullBox = bbox;

  var newDiv = glift.dom.absBboxDiv(fullBox, newDivId);
  newDiv.css({'z-index': 100}); // ensure on top.

  var textDiv = glift.dom.newDiv(wrapperDivId + suffix + '_textdiv');
  var textDivCss = glift.obj.flatMerge({
      position: 'relative',
      margin: '0px',
      padding: '0px',
      'overflow-y': 'auto',
      height: fullBox.height() + 'px',
      width: fullBox.width() + 'px',
      MozBoxSizing: 'border-box',
      boxSizing: 'border-box'
    }, theme.textDiv);
  textDiv.css(textDivCss);

  var exitScreen = function() {
    newDiv.remove();
  };

  if (glift.platform.isMobile()) {
    textDiv.on('touchend', exitScreen);
  } else {
    textDiv.on('click', exitScreen);
  }

  var oldEscAction = glift.keyMappings.getFuncOrIcon(instanceId, 'ESCAPE');
  glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', function() {
    exitScreen();
    if (oldEscAction) {
      glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', oldEscAction);
    }
  });
  return new glift.displays.statusbar.InfoWindow(wrapperDivEl, newDiv, textDiv);
};

/**
 * Info Window wrapper class.
 *
 * @package
 * @constructor @final @struct
 */
glift.displays.statusbar.InfoWindow = function(
    wrapperDiv, baseStatusDiv, textDiv) {
  /**
   * Div that wraps both the baseDiv and the Text Div
   */
  this.wrapperDiv_ = wrapperDiv;

  /**
   * Div that defines all the dimensions and z-index
   */
  this.baseStatusDiv_ = baseStatusDiv;

  /**
   * Div where users are expected to put centent.
   */
  this.textDiv = textDiv;
};

glift.displays.statusbar.InfoWindow.prototype = {
  /** Finishes the Info Window by attaching all the elements. */
  finish: function() {
    this.baseStatusDiv_.append(this.textDiv);
    this.wrapperDiv_.prepend(this.baseStatusDiv_);
  }
};



goog.provide('glift.displays.position');

glift.displays.position = {};

goog.provide('glift.displays.position.WidgetBoxes');
goog.provide('glift.displays.position.WidgetColumn');

/**
 * Container for the widget boxes. Everything starts undefined,
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetBoxes = function() {
  /** @private {glift.displays.position.WidgetColumn} */
  this._first = null;
  /** @private {glift.displays.position.WidgetColumn} */
  this._second = null;
};

glift.displays.position.WidgetBoxes.prototype = {
  /** @param {!glift.displays.position.WidgetColumn} col */
  setFirst: function(col) {
    this._first = col;
  },

  /** @param {!glift.displays.position.WidgetColumn} col */
  setSecond: function(col) {
    this._second = col;
  },

  /** @return {glift.displays.position.WidgetColumn} First column */
  first: function() {
    return this._first;
  },

  /** @return {glift.displays.position.WidgetColumn} Second column */
  second: function(col) {
    return this._second;
  },

  /**
   * Get a component by ID.
   * @param {glift.enums.boardComponents} key Component key
   * @return {?glift.orientation.BoundingBox} A bounding box or null.
   */
  getBbox: function(key) {
    if (this._first && this._first.mapping[key]) {
      return this._first.mapping[key]
    }
    if (this._second && this._second.mapping[key]) {
      return this._second.mapping[key]
    }
    return null;
  },

  /**
   * Get the bbox of a component or throw an exception
   *
   * @param {glift.enums.boardComponents} key Component key
   * @return {!glift.orientation.BoundingBox}.
   */
  mustGetBbox: function(key) {
    var bbox = this.getBbox(key);
    if (bbox == null) {
      throw new Error('Column was null for component: ' + key);
    }
    return bbox;
  },

  /**
   * Iterate through all the bboxes.
   *
   * This method passes both the component name and the relevant to the fn.
   * Another way to say this is fn has the form:
   *
   * fn(<component-name>, bbox>);
   */
  map: function(fn) {
    if (glift.util.typeOf(fn) !== 'function') {
      return;
    }
    var applyOrdering = (function(col, inFn) {
      var ordering = col.ordering;
      for (var j = 0; j < ordering.length; j++) {
        var key = ordering[j];
        inFn(key, col.mapping[key]);
      }
    }).bind(this);
    this._first && applyOrdering(this._first, fn.bind(this));
    this._second && applyOrdering(this._second, fn.bind(this));
  },

  /**
   * Get the bounding box for the whole widget. Useful for creating temporary
   * divs.  Note: Returns a new bounding box everytime, since it's calculated
   * based on the existing bboxes.
   */
  fullWidgetBbox: function() {
    var top = null;
    var left = null;
    var bottom = null;
    var right = null;
    this.map(function(compName, bbox) {
      if (top === null) {
        top = bbox.top();
        left = bbox.left();
        bottom = bbox.bottom();
        right = bbox.right();
        return;
      }
      if (bbox.top() < top) { top = bbox.top(); }
      if (bbox.left () < left) { left = bbox.left(); }
      if (bbox.bottom() > bottom) { bottom = bbox.bottom(); }
      if (bbox.right() > right) { right = bbox.right(); }
    });
    if (top !== null && left !== null && bottom !== null && right !== null) {
      return glift.orientation.bbox.fromPts(
          glift.util.point(left, top),
          glift.util.point(right, bottom));
    } else  {
      return null;
    }
  }
};

/**
 * Data container for information about how the widegt is positioned.
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetColumn = function() {
  /** Mapping from component from map to box. */
  this.mapping = {};

  /** This ordering of the components. */
  this.ordering = [];
};

glift.displays.position.WidgetColumn.prototype = {
  /** Set a mapping from from component to bounding box. */
  setComponent: function(component, bbox) {
    if (!glift.enums.boardComponents[component]) {
      throw new Error('Unknown component: ' + component);
    }
    this.mapping[component] = bbox;
    return this;
  },

  /**
   * Get the bbox of a component or return null.
   *
   * @param {glift.enums.boardComponents} component Component key
   * @return {?glift.orientation.BoundingBox} A bounding box or null.
   */
  getBbox: function(component) {
    return this.mapping[component] || null;
  },

  /**
   * Get the bbox of a component or throw an exception.
   *
   * @param {glift.enums.boardComponents} component Component key
   * @return {!glift.orientation.BoundingBox}
   */
  mustGetBbox: function(component) {
    var bbox = this.getBbox(component);
    if (bbox == null) {
      throw new Error('Bbox was null for component: ' + component);
    }
    return bbox;
  },

  /**
   * Set the column from an ordering. Recall that ratio arrays have the
   * following format:
   * [
   *  { component: BOARD, ratio: 0.3}
   *  { component: COMMENT_BOX, ratio: 0.6}
   *  ...
   * ].
   *
   * This is typically set before setting components.
   */
  setOrderingFromRatioArray: function(column) {
    var ordering = [];
    for (var i = 0; i < column.length; i++) {
      var item = column[i];
      if (item && item.component) {
          ordering.push(item.component);
      }
    }
    this.ordering = ordering;
    return this;
  },

  /**
   * An ordering function. Expects the fn to take a component name.
   */
  orderFn: function(fn) {
    for (var i = 0; i < this.ordering.length; i++) {
      fn(this.ordering[i]);
    }
  }
};

goog.provide('glift.displays.position.WidgetPositioner');

goog.require('glift.displays.position.WidgetBoxes');
goog.require('glift.displays.position.WidgetColumn');

/**
 * Find the optimal positioning of the widget. Returns the calculated div
 * boxes.
 *
 * divBox: The cropbox for the div.
 * boardRegion: The region of the go board that will be displayed.
 * intersections: The number of intersections (9-19, typically);
 * compsToUse: The board components requseted by the user
 * oneColSplits: The split percentages for a one-column format
 * twoColSplits: The split percentages for a two-column format
 *
 * @return {!glift.displays.position.WidgetPositioner} The widget positioner
 */
glift.displays.position.positioner = function(
    divBox,
    boardRegion,
    intersections,
    componentsToUse,
    oneColSplits,
    twoColSplits) {
  if (!divBox) {
    throw new Error('No Div box. [' + divBox + ']'); 
  }
  if (!boardRegion || !glift.enums.boardRegions[boardRegion]) {
    throw new Error('Invalid Board Region. [' + boardRegion + ']');
  }
  if (!intersections) {
    throw new Error('No intersections. [' + intersections + ']');
  }
  if (!oneColSplits) {
    throw new Error('No one col splits. [' + oneColSplits + ']');
  }
  if (!twoColSplits) {
    throw new Error('No two col splits. [' + twoColSplits + ']');
  }
  return new glift.displays.position.WidgetPositioner(divBox, boardRegion,
      intersections, componentsToUse, oneColSplits, twoColSplits);
};


/**
 * Internal widget positioner object
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetPositioner = function(
    divBox, boardRegion, ints, compsToUse, oneColSplits, twoColSplits) {
  this.divBox = divBox;
  this.boardRegion = boardRegion;
  this.ints = ints;
  this.compsToUse = compsToUse;
  this.oneColSplits = oneColSplits;
  this.twoColSplits = twoColSplits;

  // Calculated values;
  this.componentSet = this._getComponentSet();
  this.cropbox = glift.displays.cropbox.getFromRegion(boardRegion, ints);
};

/** Methods for the Widget Positioner */
glift.displays.position.WidgetPositioner.prototype = {
  /**
   * Calculate the Widget Positioning.  This uses heuristics to determine if the
   * orientation should be horizontally oriented or vertically oriented.
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcWidgetPositioning: function() {
    if (this.useHorzOrientation()) {
      return this.calcHorzPositioning();
    } else {
      return this.calcVertPositioning();
    }
  },

  /**
   * Determines whether or not to use a horizontal orientation or vertical
   * orientation.
   * Returns: True or False
   */
  useHorzOrientation: function() {
    var divBox = this.divBox,
        boardRegion = this.boardRegion,
        componentSet = this.componentSet,
        comps = glift.enums.boardComponents,
        hwRatio = divBox.height() / divBox.width(),
        longBoxRegions = { TOP: true, BOTTOM: true };
    if (!componentSet[comps.COMMENT_BOX] ||
        !componentSet[comps.BOARD]) {
      return false; // Force vertical if no comment box or board.
    } else if (hwRatio < 0.45 && longBoxRegions[boardRegion]) {
      return true;
    } else if (hwRatio < 0.800 && !longBoxRegions[boardRegion]) {
      return true;
    } else {
      return false; // Default to vertical orientation
    }
  },

  /**
   * Calculates the Widget Positioning for a vertical orientation. returns a
   * Widget Boxes
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcVertPositioning: function() {
    var recalCol = this.recalcSplits(this.oneColSplits).first;
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.setFirst(this.calculateColumn(
        recalCol,
        this.divBox,
        glift.enums.boardAlignments.TOP,
        0 /* startTop */));
    return boxes;
  },

  /**
   * Position a widget horizontally, i.e.,
   * |   X   X   |
   *
   * Since a resizedBox is designed to fill up either the h or w dimension. There
   * are only three scenarios:
   *  1. The GoBoardBox naturally touches the top & bottom
   *  2. The GoBoardBox naturally touches the left & right
   *  2. The GoBoardBox fits perfectly.
   *
   * Note, we should never position horizontally for TOP and BOTTOM board regions.
   *
   * returns: WidgetBoxes instance.
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcHorzPositioning: function() {
    var splits = this.recalcSplits(this.twoColSplits);
    var horzSplits = this.splitDivBoxHoriz();
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.setFirst(this.calculateColumn(
        splits.first,
        horzSplits[0],
        glift.enums.boardAlignments.RIGHT,
        0 /* startTop */));
    boxes.setSecond(this.calculateColumn(
        splits.second,
        horzSplits[1],
        null,
        boxes.first().getBbox(boxes.first().ordering[0]).top()));
    return boxes;
  },

  /**
   * Calculate the a widget column.  General enough that it's used for vertical
   * or horizontal positioning.
   *
   * Returns the completed WidgetColumn.
   */
  calculateColumn: function(recalCol, wrapperDiv, alignment, startTop) {
    var top = startTop || 0;
    var column = new glift.displays.position.WidgetColumn();
    var components = glift.enums.boardComponents;
    var divBoxSplits = [wrapperDiv];
    var ratios = this._extractRatios(recalCol);
    column.setOrderingFromRatioArray(recalCol);
    if (ratios.length > 1) {
      // We remove the last ratio, so we can be exact about the last component
      // ratio because we assume that:
      // splitN.ratio = 1 - split1.ratio + split2.ratio + ... splitN-1.ratio.
      //
      // This splits a div box into rows.
      divBoxSplits = wrapperDiv.hSplit(ratios.slice(0, ratios.length - 1));
    }

    // Map from component to split.
    var splitMap = {};
    for (var i = 0; i < recalCol.length; i++) {
      splitMap[recalCol[i].component] = divBoxSplits[i];
    }

    var board = null;
    // Reuse the environment calculations, if we have a board available.
    if (splitMap.BOARD) {
      // We defer to the display calculations that come from the environment.
      board = glift.displays.getResizedBox(
          splitMap.BOARD, this.cropbox, alignment);
      column.setComponent(components.BOARD, board);
    }

    var previousComp = null;
    var previousCompTop = null;
    var colWidth = board ? board.width() : wrapperDiv.width();
    var colLeft = board ? board.left() : wrapperDiv.left();
    column.orderFn(function(comp) {
      if (comp === components.BOARD) {
        previousComp = comp;
        top += board.height();
        return;
      }
      var split = splitMap[comp];
      var bbox = glift.orientation.bbox.fromSides(
          glift.util.point(colLeft, top), colWidth, split.height());
      column.setComponent(comp, bbox);
      top += bbox.height();
      previousComp = comp;
    }.bind(this));
    return column;
  },

  /**
   * Recalculates the split percentages based on the components to use.  This
   * works by figuring out the left over area (when pieces are disabled), and
   * then apportioning it out based on the relative size of the other
   * components.
   *
   * This is design to work with both one-column splits or two column splits.
   *
   * Returns a recalculated splits mapping. Has the form:
   * {
   *  first: [
   *    { component: BOARD, ratio: 0.3 },
   *    ...
   *  ],
   *  second: [...]
   * }
   */
  recalcSplits: function(columnSplits) {
    var out = {};
    var compsToUseSet = this.componentSet;
    // Note: this is designed with the outer loop in this way to work with
    // the one-col-split and two-col-split styles.
    for (var colKey in columnSplits) {
      // Grab array of component-ratio objs.
      var col = columnSplits[colKey];
      var colOut = [];
      var extra = 0;

      // Add up the unused pieces.
      var total = 0;
      for (var i = 0; i < col.length; i++) {
        var part = col[i];
        if (compsToUseSet[part.component]) {
          colOut.push({ // perform a copy.
            component: part.component,
            ratio: part.ratio
          });
          total += part.ratio;
        }
      }

      // Apportion the total amount so that the relative ratios are preserved.
      for (var i = 0; i < colOut.length; i++) {
        var part = colOut[i];
        part.ratio = part.ratio / total;
      }
      out[colKey] = colOut;
    }
    return out;
  },

  /**
   * Split the enclosing divbox horizontally.
   *
   * Returns: [
   *    Column 1 BBox,
   *    Column 2 Bbox
   * ]
   */
  splitDivBoxHoriz: function() {
    // Tentatively createa board box to see how much space it takes up.
    var boardBox = glift.displays.getResizedBox(
        this.divBox, this.cropbox, glift.enums.boardAlignments.RIGHT);

    // These are precentages of boardWidth.  We require that the right column be
    // at last 1/2 go board width and at most 3/4 the go board width.
    // TODO(kashomon): Make this configurable.
    var minColPercent = 0.5;
    var minColBoxSize = boardBox.width() * minColPercent;
    var maxColPercent = 0.75;
    var maxColBoxSize = boardBox.width() * maxColPercent;
    var widthDiff = this.divBox.width() - boardBox.width();

    // The boxPercentage is percentage of the width of the goboard that
    // we want the right-side box to be.
    var boxPercentage = maxColPercent;
    if (widthDiff < minColBoxSize) {
      boxPercentage = minColPercent;
    } else if (widthDiff >= minColBoxSize && widthDiff < maxColBoxSize) {
      boxPercentage = widthDiff / boardBox.width();
    }
    // Split percentage is how much we want to split the boxes by.
    var desiredWidth = boxPercentage * boardBox.width();
    var splitPercentage = boardBox.width() / (desiredWidth + boardBox.width());
    var splits = this.divBox.vSplit([splitPercentage]);

    // TODO(kashomon): This assumes a BOARD is the only element in the left
    // column.
    var resizedBox = glift.displays.getResizedBox(
        splits[0], this.cropbox, glift.enums.boardAlignments.RIGHT);

    // Defer to the Go board height calculations.
    var baseRightCol = glift.orientation.bbox.fromPts(
      glift.util.point(splits[1].topLeft().x(), resizedBox.topLeft().y()),
      glift.util.point(splits[1].botRight().x(), resizedBox.botRight().y()));

    // TODO(kashomon): Make max right col size configurable.
    if (splits[1].width() > (0.75 * resizedBox.width())) {
      baseRightCol = baseRightCol.vSplit(
          [0.75 * resizedBox.width() / baseRightCol.width()])[0];
    }
    splits[1] = baseRightCol;
    return splits;
  },

  ////////////////////////////
  // Private helper methods //
  ////////////////////////////

  /** Converts the components to use array into a set (object=>true/false). */
  _getComponentSet: function() {
    var out = {};
    for (var i = 0; i < this.compsToUse.length; i++) {
      out[this.compsToUse[i]] = true;
    }
    return out;
  },

  /** Extracts ratios from either the one-col splits or two col-splits. */
  _extractRatios: function(column) {
    var out = [];
    for (var i = 0; i < column.length; i++) {
      out.push(column[i].ratio);
    }
    return out;
  }
};

goog.provide('glift.rules');

/**
 * Objects and methods that enforce the basic rules of Go.
 */
glift.rules = {};

goog.provide('glift.rules.prop');

/**
 * All the SGF Properties plus some things.
 * @enum {string}
 */
//  TODO(kashomon): Comment these and delete the invalid ones.
glift.rules.prop = {
/** Node: Black placements */
AB: 'AB',
AE: 'AE',
AN: 'AN',
/** Root: Creating program ex:[Glift:1.1.0] */
AP: 'AP',
AR: 'AR',
AS: 'AS',
AW: 'AW',
/** Node: Black move */
B: 'B',
BL: 'BL',
BM: 'BM',
BR: 'BR',
BS: 'BS',
BT: 'BT', 
/** Node: Comment */
C: 'C',
/** Root: Encoding ex:[UTF-8] */
CA: 'CA',
CH: 'CH',
CP: 'CP',
CR: 'CR',
DD: 'DD',
DM: 'DM',
DO: 'DO',
DT: 'DT',
EL: 'EL', 
EV: 'EV',
EX: 'EX', 
/** Root: SGF Version. */
FF: 'FF',
FG: 'FG',
GB: 'GB', 
/** Root: Game Comment. */
GC: 'GC',
/** Root: Game */
GM: 'GM', 
/** Root: Game Name */
GN: 'GN',
GW: 'GW',
HA: 'HA',
HO: 'HO',
ID: 'ID',
IP: 'IP',
IT: 'IT',
IY: 'IY',
/** Root: Komi ex:[0.00]*/
KM: 'KM',
KO: 'KO',
L: 'L',
/** Node: Label Mark */
LB: 'LB',
LN: 'LN',
LT: 'LT',
M: 'M',
MA: 'MA',
MN: 'MN',
N: 'N',
OB: 'OB',
OH: 'OH',
OM: 'OM',
ON: 'ON',
OP: 'OP',
OT: 'OT',
OV: 'OV',
OW: 'OW',
PB: 'PB',
PC: 'PC',
/** Node: Current player */
PL: 'PL',
PM: 'PM',
PW: 'PW',
RE: 'RE',
RG: 'RG',
RO: 'RO',
RU: 'RU',
SC: 'SC',
SE: 'SE',
SI: 'SI',
SL: 'SL',
SO: 'SO',
/** Node: Square-mark */
SQ: 'SQ',
ST: 'ST',
SU: 'SU',
/** Root: Size of the Go board */
SZ: 'SZ',
TB: 'TB',
TC: 'TC',
TE: 'TE',
TM: 'TM',
TR: 'TR',
TW: 'TW',
UC: 'UC',
US: 'US',
V: 'V', 
VW: 'VW',
/** Node: White Move. */
W: 'W',
WL: 'WL',
WR: 'WR',
WS: 'WS',
WT: 'WT',
MU: 'MU'
};

goog.require('glift.rules');

/**
 * Autonumber a movetree.
 *
 * NOTE! This removes all numeric labels and replaces them with the labels
 * constructed here, but that's sort of the point.
 *
 * Modifies the current movetree, so nothing is returned.
 *
 * @param {!glift.rules.MoveTree} movetree The movetree to autonumber.
 */
glift.rules.autonumber = function(movetree) {
  var digitregex = /\d+/;
  var singledigit = /0\d/;
  movetree.recurseFromRoot(function(mt) {
    if (!mt.properties().getComment()) {
      return; // Nothing to do.  We only autonumber on comments.
    }
    // First, clear all numeric labels
    var labels = mt.properties().getAllValues(glift.rules.prop.LB);
    /**
     * Map from SGF point to string label.
     * @type {!Object<string>}
     */
    var lblMap = {};
    for (var i = 0; labels && i < labels.length; i++) {
      var lblData = labels[i].split(':')
      if (digitregex.test(lblData[1])) {
        // Clear out digits
      } else {
        lblMap[lblData[0]] = lblData[1];
      }
    }

    var pathOut = glift.rules.treepath.findNextMovesPath(mt);
    var newMt = pathOut.movetree;
    var goban = glift.rules.goban.getFromMoveTree(newMt).goban;

    var mvnum = mt.onMainline() ?
        newMt.node().getNodeNum() + 1:
        newMt.movesToMainline() + 1;
    var applied = glift.rules.treepath.applyNextMoves(
        newMt, goban, pathOut.nextMoves);

    var seen = 0;
    for (var i = 0, st = applied.stones; i < st.length; i++) {
      var stone = st[i];
      if (!stone.collision) {
        var sgfPoint = stone.point.toSgfCoord();
        lblMap[sgfPoint] = mvnum + seen;
        seen++;
      }
    }

    var newlabels = [];
    for (var sgfpt in lblMap) {
      var l = lblMap[sgfpt] + '';
      if (l.length > 2) {
        var subl = l.substring(l.length - 2, l.length);
        if (subl !== '00') {
          l = subl;
        }
        if (l.length === 2 && singledigit.test(l)) {
          l = l.charAt(l.length - 1);
        }
      }
      newlabels.push(sgfpt + ':' + l);
    }

    if (newlabels.length === 0) {
      mt.properties().remove(glift.rules.prop.LB);
    } else {
      mt.properties().set(glift.rules.prop.LB, newlabels);
    }

    glift.rules.removeCollidingLabels(mt, lblMap);
  });
};

/**
 * Remove the colliding labels from the label map.
 *
 * @param {!glift.rules.MoveTree} mt The movetree
 * @param {!Object<string>} lblMap Map of SGF Point string to label.
 * @package
 */
glift.rules.removeCollidingLabels = function(mt, lblMap) {
  var toConsider = ['TR', 'SQ'];
  for (var i = 0; i < toConsider.length; i++) {
    var key = toConsider[i];
    if (mt.properties().contains(key)) {
      var lbls = mt.properties().getAllValues(key);
      var newLbls = [];
      for (var j = 0; j < lbls.length; j++) {
        var sgfCoord = lbls[j];
        if (lblMap[sgfCoord]) {
          // do nothing.  This is a collision.
        } else {
          newLbls.push(sgfCoord);
        }
      }
      if (newLbls.length === 0) {
        mt.properties().remove(key);
      } else {
        mt.properties().set(key, newLbls);
      }
    }
  }
};

/**
 * Clear any number-labels at all nodes in the movetree.
 *
 * @param {!glift.rules.MoveTree} movetree
 */
// TODO(kashomon): Remove? This looks unused.
glift.rules.clearnumbers = function(movetree) {
  var digitregex = /\d+/;
  movetree.recurseFromRoot(function(mt) {
    // Clear all numeric labels
    if (!mt.properties().contains(glift.rules.prop.LB)) {
      return; // no labels to clear;
    }
    var labels = mt.properties().getAllValues(glift.rules.prop.LB);
    var newLbls = [];
    for (var i = 0; labels && i < labels.length; i++) {
      var lblData = labels[i].split(':')
      if (digitregex.test(lblData[1])) {
        // Clear out digits
      } else {
        newLbls.push(labels[i]);
      }
    }
    if (newLbls.length === 0) {
      mt.properties().remove(glift.rules.prop.LB);
    } else {
      mt.properties().set(glift.rules.prop.LB, newLbls);
    }
  });
};

goog.provide('glift.rules.CaptureResult');
goog.provide('glift.rules.Goban');
goog.provide('glift.rules.StoneResult');
goog.provide('glift.rules.goban');
goog.provide('glift.rules.ConnectedGroup');

/**
 * Result of a Capture
 *
 * @typedef {{
 *   WHITE: !Array<!glift.rules.Move>,
 *   BLACK: !Array<!glift.rules.Move>
 * }}
 */
glift.rules.CaptureResult;

glift.rules.goban = {
  /**
   * Creates a Goban instance, just with intersections.
   * @param {number=} opt_intersections
   * @return {!glift.rules.Goban}
   */
  getInstance: function(opt_intersections) {
    var ints = opt_intersections || 19;
    return new glift.rules.Goban(ints);
  },

  /**
   * Creates a goban, from a move tree and (optionally) a treePath, which
   * defines how to get from the start to a given location.  Usually, the
   * treePath is the initialPosition, but not necessarily.
   *
   * NOTE: This leaves the movetree in a modified state.
   *
   * @param {!glift.rules.MoveTree} mt The movetree.
   * @param {!glift.rules.Treepath=} opt_treepath Optional treepath If the
   *    treepath is undefined, we craft a treepath to the current location in
   *    the movetree.
   *
   * @return {{
   *   goban: !glift.rules.Goban,
   *   captures: !Array<!glift.rules.CaptureResult>
   * }}
   */
  getFromMoveTree: function(mt, opt_treepath) {
    var treepath = opt_treepath || mt.treepathToHere();
    var goban = new glift.rules.Goban(mt.getIntersections()),
        movetree = mt.getTreeFromRoot(),
        captures = []; // array of captures.
    goban.loadStonesFromMovetree(movetree); // Load root placements.
    for (var i = 0;
        i < treepath.length && movetree.node().numChildren() > 0;
        i++) {
      movetree.moveDown(treepath[i]);
      captures.push(goban.loadStonesFromMovetree(movetree));
    }
    return {
      goban: goban,
      captures: captures
    };
  }
};

/**
 * The Goban tracks the state of the stones, because the state is stored in a
 * double array, the board positions are indexed from the upper left corner:
 *
 * 0,0    : Upper Left
 * 0,19   : Lower Left
 * 19,0   : Upper Right
 * 19,19  : Lower Right
 *
 * Currently, the Goban has rudimentary support for Ko. Ko is currently
 * supported in the simple case where a move causing a cappture can be
 * immediately recaptured:
 *
 * ......
 * ..OX..
 * .OX.X.
 * ..OX..
 * .....
 *
 * Currently, all other repeateding board situations are ignored. Worrying about
 * hashing the board position and checking the current position against past
 * positions is beyond this class, since this class contains no state except for
 * stones and possibly a single Ko point.
 *
 * As a historical note, this is the oldest part of Glift.
 *
 * @param {number} ints
 *
 * @constructor @final @struct
 */
glift.rules.Goban = function(ints) {
  if (!ints || ints <= 0) {
    throw new Error("Invalid Intersections. Was: " + ints)
  }

  /** @private {number} */
  this.ints_ = ints;

  /** @private {!Array<glift.enums.states>} */
  this.stones_ = glift.rules.initStones_(ints);

  /**
   * The Ko Point, if it exists. Null if there is no Ko.
   * @private {?glift.Point}
   */
  this.koPoint_ = null;
};

glift.rules.Goban.prototype = {
  /** @return {number} The number of intersections. */
  intersections: function() {
    return this.ints_;
  },

  /**
   * Sets the Ko point. Normally, this should be set by addStone. However, users
   * may want to set this when going backwards through a game.
   * @param {!glift.Point} pt
   */
  setKo: function(pt) {
    if (pt && this.inBounds_(pt)) {
      this.koPoint_ = pt;
    }
  },

  /**
   * Clears the Ko point. Note that the Ko point is cleared automatically by
   * some operations (clearStone, addStone).
   */
  clearKo: function() { this.koPoint_ = null; },

  /** @return {?glift.Point} The ko point or null if it doesn't exist. */
  getKo: function() { return this.koPoint_; },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the board is empty at particular point and the
   *    point is within the bounds of the board.
   */
  placeable: function(point) {
    // Currently, color is unused, but there are plans to use it because
    // self-capture is disallowed. Add-stone will still fail.
    return this.inBounds_(point)
        && this.getStone(point) === glift.enums.states.EMPTY;
  },

  /**
   * Retrieves a state (color) from the board.
   *
   * Note that, for our purposes,
   * x: refers to the column.
   * y: refers to the row.
   *
   * Thus, to get a particular "stone" you must do
   * stones[y][x]. Also, stones are 0-indexed.
   *
   * @param {!glift.Point} pt
   * @return {!glift.enums.states} the state of the intersection
   */
  getStone: function(pt) {
    return this.stones_[pt.y()][pt.x()];
  },

  /**
   * Get all the placed stones on the board (BLACK or WHITE)
   * @return {!Array<!glift.rules.Move>}
   */
  getAllPlacedStones: function() {
    var out = [];
    for (var i = 0; i < this.intersections(); i++) {
      for (var j = 0; j < this.intersections(); j++) {
        var color = this.getStone(glift.util.point(j, i));
        if (color === glift.enums.states.BLACK ||
            color === glift.enums.states.WHITE) {
          out.push({point: glift.util.point(j, i), color:color});
        }
      }
    }
    return out;
  },

  /**
   * Clear a stone from an intersection. Clears the Ko point.
   * @param {!glift.Point} point
   */
  clearStone: function(point) {
    this.clearKo();
    this.setColor_(glift.enums.states.EMPTY, point);
  },

  /**
   * Clear an array of stones on the board. Clears the Ko point (since it calls
   * clearStone).
   * @param {!Array<!glift.Point>} points
   */
  clearSome: function(points) {
    for (var i = 0; i < points.length; i++) {
      this.clearStone(points[i]);
    }
  },

  /**
   * Try to add a stone on a new go board instance, but don't change state.
   *
   * @param {!glift.Point} point
   * @param {glift.enums.states} color
   * @return {boolean} true / false depending on whether the 'add' was successful.
   */
  testAddStone: function(point, color) {
    var ko = this.getKo();
    var addStoneResult = this.addStone(point, color);
    if (ko !== null ) {
      this.setKo(ko);
    }

    // Undo our changes (this is pretty icky). First remove the stone and then
    // add the captures back.
    if (addStoneResult.successful) {
      this.clearStone(point);
      var oppositeColor = glift.util.colors.oppositeColor(color);
      for (var i = 0; i < addStoneResult.captures.length; i++) {
        this.setColor_(oppositeColor, addStoneResult.captures[i]);
      }
    }
    return addStoneResult.successful;
  },

  /**
   * Add a stone to the GoBoard (0-indexed).  Requires the intersection (a
   * point) where the stone is to be placed, and the color of the stone to be
   * placed.
   *
   * The goban also tracks where the last Ko occurred. Subsequent calls to this
   * method invalidate the previous Ko.
   *
   * @param {!glift.Point} pt A point
   * @param {glift.enums.states} color The State to add.
   * @return {!glift.rules.StoneResult} The result of the placement, and whether
   *    the placement was successful.
   */
  addStone: function(pt, color) {
    if (!glift.util.colors.isLegalColor(color)) throw "Unknown color: " + color;

    // Add stone fail.  Return a failed StoneResult.
    if (this.outBounds_(pt) || !this.placeable(pt)) {
      return new glift.rules.StoneResult(false);
    }

    // Set the stone as active and see what happens!
    this.setColor_(color, pt);

    // First find the oppositely-colored connected groups on each of the
    // cardinal directions.
    var capturedGroups = this.findCapturedGroups_(pt, color);

    if (capturedGroups.length === 0) {
      // If a move doesn't capture, then it's possible that the move is self
      // capture. If there are captured groups, this is not an issue.
      //
      // So, let's find the connected group for the stone placed.
      var g = this.findConnected_(pt, color);
      if (g.liberties === 0) {
        // Onos! The move is self capture.
        this.clearStone(pt);
        return new glift.rules.StoneResult(false);
      }
    }

    // This move is going to be successful, so we now invalidate the Ko point.
    this.clearKo();

    // Remove the captures from the board.
    var capturedPoints = [];
    for (var i = 0; i < capturedGroups.length; i++) {
      var g = capturedGroups[i];
      for (var j = 0; j < g.group.length; j++) {
        var capPoint = /** @type {!glift.Point} */ (g.group[j].point);
        capturedPoints.push(capPoint);
        this.clearStone(capPoint);
      }
    }

    // Finally, test for Ko. Ko only technically only occurs when a single stone
    // is captured and the opponent can retake that one stone.
    //
    // Some rulesets specify that repeating board positions are not allowed.
    // This is too expensive and generally unnecesary except in rare cases for
    // this UI.
    if (capturedPoints.length === 1) {
      var oppColor = glift.util.colors.oppositeColor(color);
      var capPt = capturedPoints[0];

      // Try to recapture, and see what happen.
      this.setColor_(oppColor, capPt);
      var koCapturedGroups = this.findCapturedGroups_(capPt, oppColor);
      // Undo our damage to the board.
      this.clearStone(capPt);
      if (koCapturedGroups.length === 1) {
        var g = koCapturedGroups[0];
        if (g.group.length === 1 && g.group[0].point.equals(pt)) {
          // It's a Ko!!
          this.setKo(capPt);
          return new glift.rules.StoneResult(true, capturedPoints, capPt);
        }
      }
    }

    // No ko, but it's a go!
    return new glift.rules.StoneResult(true, capturedPoints);
  },

  /**
   * For the current position in the movetree, load all the stone values into
   * the goban. This includes placements [AW,AB] and moves [B,W].
   *
   * returns captures -- an object that looks like the following
   * {
   *    WHITE: [{point},{point},{point},...],
   *    BLACK: [{point},{point},{point},...]
   * }
   *
   * @param {!glift.rules.MoveTree} movetree
   * @return {!glift.rules.CaptureResult}
   */
  loadStonesFromMovetree: function(movetree) {
    /** @type {!Array<glift.enums.states>} */
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    var captures = { BLACK : [], WHITE : [] };
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i]
      var placements = movetree.properties().getPlacementsAsPoints(color);
      for (var j = 0, len = placements.length; j < len; j++) {
        this.loadStone_({point: placements[j], color: color}, captures);
      }
    }
    this.loadStone_(movetree.properties().getMove(), captures);
    return captures;
  },

  /////////////////////
  // Private Methods //
  /////////////////////

  /**
   * Set a color without performing any validation.
   *
   * @param {glift.enums.states} color
   * @param {!glift.Point} pt
   * @private
   */
  setColor_: function(color, pt) {
    this.stones_[pt.y()][pt.x()] = color;
  },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the point is out-of-bounds.
   * @private
   */
  outBounds_: function(point) {
    return glift.util.outBounds(point.x(), this.intersections())
        || glift.util.outBounds(point.y(), this.intersections());
  },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the point is in-bounds.
   * @private
   */
  inBounds_: function(point) {
    return glift.util.inBounds(point.x(), this.intersections())
        && glift.util.inBounds(point.y(), this.intersections());
  },

  /**
   * Cardinal points. Because arrays are indexed from upper left.
   * @private {!Object<string, !glift.Point>}
   */
  cardinals_:  {
    left: glift.util.point(-1, 0),
    right: glift.util.point(1, 0),
    up: glift.util.point(0, -1),
    down: glift.util.point(0, 1)
  },

  /**
   * Get the inbound neighbors. Thus, can return 2, 3, or 4 points.
   *
   * @param {!glift.Point} pt
   * @return {!Array<!glift.Point>}
   * @private
   */
  neighbors_: function(pt) {
    var newpt = glift.util.point;
    var out = [];
    for (var ckey in this.cardinals_) {
      var c = this.cardinals_[ckey];
      var outp = newpt(pt.x() + c.x(), pt.y() + c.y());
      if (this.inBounds_(outp)) {
        out.push(outp);
      }
    }
    return out;
  },

  /**
   * Gets the captures at a point with a given color.
   *
   * @param {!glift.Point} inPoint
   * @param {!glift.enums.states} color
   * @return {!glift.rules.ConnectedGroup} A connected group, with an
   *    associated number of liberties.
   * @private
   */
  findConnected_: function(inPoint, color) {
    var group = new glift.rules.ConnectedGroup(color);
    var stack = [inPoint];
    while (stack.length > 0) {
      var pt = stack.pop();
      if (group.hasSeen(pt)) {
        continue;
      }
      var stone = this.getStone(pt);
      if (stone === color) {
        group.addStone(pt, color);
        var nbors = this.neighbors_(pt);
        for (var n = 0; n < nbors.length; n++) {
          stack.push(nbors[n]);
        }
      }
      if (stone === glift.enums.states.EMPTY) {
        group.addLiberty();
      }
    }
    return group;
  },

  /**
   * Find the captured groups resulting from the placing of a stone of a color
   * at a point pt. This assumes the original point has already been placed.
   *
   * @param {!glift.Point} pt
   * @param {!glift.enums.states} color
   * @return {!Array<glift.rules.ConnectedGroup>} The groups that have been
   *    captured.
   */
  findCapturedGroups_: function(pt, color) {
    var oppColor = glift.util.colors.oppositeColor(color);
    /** @type {!Array<!glift.rules.ConnectedGroup>} */
    var groups = [];
    var nbors = this.neighbors_(pt);
    for (var i = 0; i < nbors.length; i++) {
      var nborPt = nbors[i];
      var alreadySeen = false;
      for (var j = 0; j < groups.length; j++) {
        var g = groups[j];
        if (g.hasSeen(nborPt)) {
          alreadySeen = true;
          break;
        }
      }
      if (!alreadySeen) {
        var newGroup = this.findConnected_(nborPt, oppColor);
        if (newGroup.group.length) {
          groups.push(newGroup);
        }
      }
    }

    var capturedGroups = [];
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.liberties === 0) {
        capturedGroups.push(g);
      }
    }
    return capturedGroups;
  },

  /**
   * Add a Move to the go board. Intended to be used from
   * loadStonesFromMovetree.
   *
   * @param {?glift.rules.Move} mv
   * @param {!glift.rules.CaptureResult} captures
   * @private
   */
  loadStone_: function(mv, captures) {
    // note: if mv is defined, but mv.point is undefined, this is a PASS.
    if (mv && mv.point !== undefined) {
      var result = this.addStone(mv.point, mv.color);
      if (result.successful) {
        var oppositeColor = glift.util.colors.oppositeColor(mv.color);
        for (var k = 0; k < result.captures.length; k++) {
          captures[oppositeColor].push(result.captures[k]);
        }
      }
    }
  },
};

/**
 * Private function to initialize the stones.
 *
 * @param {number} ints The number of intersections.
 * @return {!Array<glift.enums.states>} The board, as an array of states.
 * @private
 */
glift.rules.initStones_ = function(ints) {
  var stones = [];
  for (var i = 0; i < ints; i++) {
    var newRow = [];
    for (var j = 0; j < ints; j++) {
      newRow[j] = glift.enums.states.EMPTY;
    }
    stones[i] = newRow
  }
  return stones;
};


/**
 * A connected group
 * @param {glift.enums.states} color
 *
 * @constructor @final @struct
 */
glift.rules.ConnectedGroup = function(color) {
  /** @private {glift.enums.states} */
  this.color = color;
  /** @private {number} */
  this.liberties = 0;
  /** @private {!Object<glift.PtStr, boolean>} */
  this.seen = {};
  /** @private {!Array<glift.rules.Move>} */
  this.group = [];
};

glift.rules.ConnectedGroup.prototype = {
  /**
   * Add some liberties to the group.
   * @param {!glift.Point} pt
   * @return {boolean} Whether the point has been seen
   */
  hasSeen: function(pt) {
    return this.seen[pt.toString()];
  },

  /**
   * Add a stone to the group. Note that the point must not have been seen and
   * the color must be equal to the group's color.
   *
   * @param {!glift.Point} pt
   * @param {glift.enums.states} color
   * @return {!glift.rules.ConnectedGroup} this
   */
  addStone: function(pt, color) {
    if (!this.seen[pt.toString()] && this.color === color) {
      this.seen[pt.toString()] = true;
      this.group.push({
        point: pt,
        color: color
      });
    }
    return this;
  },

  /**
   * Add some liberties to the group.
   * @return {!glift.rules.ConnectedGroup} this
   */
  addLiberty: function() {
    this.liberties += 1;
    return this;
  },
};

/**
 * The stone result keeps track of whether placing a stone was successful and what
 * stones (if any) were captured.
 *
 * @param {boolean} success Whether or not the stone-placement was successful.
 * @param {!Array<!glift.Point>=} opt_captures The Array of captured points, if
 *    there are any captures
 * @param {!glift.Point=} opt_koPt A ko point.
 * @constructor @final @struct
 */
glift.rules.StoneResult = function(success, opt_captures, opt_koPt) {
  /**
   * Whether or not the place was successful.
   * @type {boolean}
   */
  this.successful = success;

  /**
   * Array of captured points.
   * @type {!Array<!glift.Point>}
   */
  this.captures = opt_captures || [];

  /**
   * Point for where there's a Ko. Null if it doesn't exist.
   * @type {?glift.Point}
   */
  this.koPt = opt_koPt || null;
};

goog.provide('glift.rules.Move');

/**
 * A type encapsulating the idea of a move.
 *
 * A move can have an undefined point because players may pass.
 *
 * @typedef {{
 *  point: (!glift.Point|undefined),
 *  color: !glift.enums.states
 * }}
 */
glift.rules.Move;

goog.provide('glift.rules.MoveNode');

/**
 * Id for a particular node. Note: The ID is not guaranteed to be unique
 *
 * @typedef {{
 *  nodeNum: number,
 *  varNum: number
 * }}
 */
glift.rules.NodeId

/**
 * Creates a new
 *
 * @param {!glift.rules.Properties=} opt_properties
 * @param {!Array<glift.rules.MoveNode>=} opt_children
 * @param {!glift.rules.NodeId=} opt_nodeId
 * @param {!glift.rules.MoveNode=} opt_parentNode
 *
 */
glift.rules.movenode = function(
    opt_properties, opt_children, opt_nodeId, opt_parentNode) {
  return new glift.rules.MoveNode(
       opt_properties, opt_children, opt_nodeId, opt_parentNode);
};

/**
 * A Node in the MoveTree.
 *
 * @param {!glift.rules.Properties=} opt_properties
 * @param {!Array<glift.rules.MoveNode>=} opt_children
 * @param {!glift.rules.NodeId=} opt_nodeId
 * @param {!glift.rules.MoveNode=} opt_parentNode
 *
 * @package
 * @constructor @final @struct
 */
glift.rules.MoveNode = function(
    opt_properties, opt_children, opt_nodeId, opt_parentNode) {
  this._properties = opt_properties || glift.rules.properties();
  this.children = opt_children || [];
  this._nodeId = opt_nodeId || { nodeNum: 0, varNum: 0 }; // this is a bad default.
  this._parentNode = opt_parentNode;
  /**
   * Marker for determining mainline.  Should ONLY be used by onMainline from
   * the movetree.
   */
  // TODO(kashomon): Consider putting this in a data class.
  this._mainline = false;
};

glift.rules.MoveNode.prototype = {
  /** Get the properties */
  properties: function() { return this._properties; },

  /**
   * Set the NodeId. Each node has an ID based on the depth and variation
   * number.
   *
   * Great caution should be exercised when using this method.  If you
   * don't adjust the surrounding nodes, the movetree will get into a funky
   * state.
   */
  _setNodeId: function(nodeNum, varNum) {
    this._nodeId = { nodeNum: nodeNum, varNum: varNum };
    return this;
  },

  /**
   * Get the node number (i.e., the depth number).  For our purposes, we
   * consider passes to be moves, but this is a special enough case that it
   * shouldn't matter for most situations.
   */
  getNodeNum: function() { return this._nodeId.nodeNum; },

  /** Gets the variation number. */
  getVarNum: function() { return this._nodeId.varNum; },

  /** Gets the number of children. */
  numChildren: function() { return this.children.length; },

  getIntersection: function() {
    var colors = ['B', 'W'];
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];
      if(this._properties.propMap[color] != undefined) {
        return this._properties.propMap[color];
      }
    }
  },

  /** Add a new child node. */
  addChild: function() {
    this.children.push(glift.rules.movenode(
      glift.rules.properties(),
      [], // children
      { nodeNum: this.getNodeNum() + 1, varNum: this.numChildren() },
      this));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * movetree.
   */
  getChild: function(variationNum) {
    variationNum = variationNum || 0;
    if (this.children.length > 0) {
      return this.children[variationNum];
    } else {
      return null;
    }
  },

  /** Return the parent node. Returns null if no parent node exists. */
  getParent: function() { return this._parentNode ? this._parentNode : null; },

  /**
   * Renumber the nodes.  Useful for when nodes are deleted during SGF editing.
   * Note: This performs the renumbering recursively
   */
  renumber: function() {
    numberMoves(this, this._nodeId.nodeNum, this._nodeId.varNum);
    return this;
  }
};

// Private number moves function
var numberMoves = function(move, nodeNum, varNum) {
  move._setNodeId(nodeNum, varNum);
  for (var i = 0; i < move.children.length; i++) {
    var next = move.children[i];
    numberMoves(next, nodeNum + 1, i);
  }
  return move;
};

goog.provide('glift.rules.MoveTree');
goog.provide('glift.rules.movetree');

/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 * currentNode_
 * rootNode_
 *}
 *
 * And where a MoveNode looks like the following:
 * MoveNode: {
 *    nodeId: { ... },
 *    properties: Properties,
 *    children: [MoveNode, MoveNode, MoveNode],
 *    parent: MoveNode
 *  }
 *}
 *
 * Additionally, each node in the movetree has an ID property that looks like:
 *
 * node : {
 *  nodeId : <num>,  // The vertical position in the tree.
 *  varId  : <num>,  // The variation number, which is identical to the position
 *                   // in the 'nodes' array.  Also, the 'horizontal' position .
 * }
 *
 * If you are familiar with the SGF format, this should look very similar to the
 * actual SGF format, and is easily converted back to a SGF. And so, The
 * MoveTree is a simple wrapper around the parsed SGF.
 *
 * Each move is an object with two properties: tokens and nodes, the
 * latter of which is a list to capture the idea of multiple variations.
 */
glift.rules.movetree = {
  /**
   * Create an empty MoveTree.
   *
   * @param {number=} opt_intersections Optional intersections. Defaults to 19.
   * @return {!glift.rules.MoveTree} New movetree instance.
   */
  getInstance: function(opt_intersections) {
    var mt = new glift.rules.MoveTree(glift.rules.movenode());
    if (opt_intersections !== undefined) {
      mt._setIntersections(opt_intersections);
    }
    return mt;
  },

  /**
   * Create a MoveTree from an SGF.
   * Note: initPosition and parseType are both optional.
   *
   * @param {string} sgfString
   * @param {(string|number|!Array<number>)=} opt_initPosition
   * @param {glift.parse.parseType=} opt_parseType
   * @return {!glift.rules.MoveTree}
   */
  getFromSgf: function(sgfString, opt_initPosition, opt_parseType) {
    var initPosition = opt_initPosition || []; // treepath.
    var parseType = parseType || glift.parse.parseType.SGF;

    if (glift.util.typeOf(initPosition) === 'string' ||
        glift.util.typeOf(initPosition) === 'number') {
      initPosition = glift.rules.treepath.parsePath(initPosition);
    }

    var initTreepath = /** @type {!glift.rules.Treepath} */ (initPosition);

    if (sgfString === undefined || sgfString === '') {
      return glift.rules.movetree.getInstance(19);
    }

    glift.util.majorPerfLog('Before SGF parsing in movetree');
    var mt = glift.parse.fromString(sgfString, parseType);

    mt = mt.getTreeFromRoot(initTreepath);
    glift.util.majorPerfLog('After SGF parsing in movetree');

    return mt;
  },

  /**
   * Seach nodes with a Depth First Search.
   * @param {!glift.rules.MoveTree} moveTree
   * @param {function(!glift.rules.MoveTree)} func
   */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      var mtz = moveTree.newTreeRef();
      glift.rules.movetree.searchMoveTreeDFS(mtz.moveDown(i), func);
    }
  },

  /**
   * Convenience method for setting the root properties in a standard way
   * @param {!glift.rules.MoveTree} mt
   * @return {!glift.rules.MoveTree} The initialized movetree.
   */
  initRootProperties: function(mt) {
    var root = mt.getTreeFromRoot();
    var props = root.properties();
    var prop = glift.rules.prop;
    if (!props.contains(prop.GM)) {
      props.add(prop.GM, '1');
    }
    if (!props.contains(prop.FF)) {
      props.add(prop.FF, '4');
    }
    if (!props.contains(prop.CA)) {
      props.add(prop.CA, 'UTF-8');
    }
    if (!props.contains(prop.AP)) {
      props.add(prop.AP, 'Glift:' + glift.global.version);
    }
    if (!props.contains(prop.KM)) {
      props.add(prop.KM, '0.00');
    }
    if (!props.contains(prop.RU)) {
      props.add(prop.RU, 'Japanese');
    }
    if (!props.contains(prop.SZ)) {
      props.add(prop.SZ, '19');
    }
    if (!props.contains(prop.PB)) {
      props.add(prop.PB, 'Black');
    }
    if (!props.contains(prop.PW)) {
      props.add(prop.PW, 'White');
    }
    // Note: we don't set ST because it's a dumb option. (Style of
    // variation-showing).
    return mt;
  }
};

/**
 * A MoveTree is a tree of movenodes played.  The movetree is (usually) a
 * processed parsed SGF, but could be created organically.
 *
 * Semantically, a MoveTree can be thought of as a game, but could also be a
 * problem, demonstration, or example.  Thus, this is the place where such moves
 * as currentPlayer or lastMove.
 *
 * @param {!glift.rules.MoveNode} rootNode
 * @param {!glift.rules.MoveNode=} opt_currentNode
 * @param {Object=} opt_metadata
 *
 * @constructor @final @struct
 */
glift.rules.MoveTree = function(rootNode, opt_currentNode, opt_metadata) {
  /** @private {!glift.rules.MoveNode} */
  this.rootNode_ = rootNode;
  /** @private {!glift.rules.MoveNode} */
  this.currentNode_ = opt_currentNode || rootNode;
  /** @private {boolean} */
  this.markedMainline_ = false;

  /**
   * Metadata is arbitrary data attached to the node.
   *
   * As a side note, Metadata extraction in Glift happens in the parser and so
   * will not show up in comments.  See the metadataProperty option in
   * options.baseOptions.
   * @private {Object}
   */
  this.metadata_ = opt_metadata || null;
};

glift.rules.MoveTree.prototype = {
  /////////////////////////
  // Most common methods //
  /////////////////////////

  /**
   * Get the current node -- that is, the node at the current position.
   * @return {!glift.rules.MoveNode}
   */
  node: function() {
    return this.currentNode_;
  },

  /**
   * Get the properties object on the current node.
   * @return {!glift.rules.Properties}
   */
  properties: function() {
    return this.node().properties();
  },

  /**
   * Gets global movetree metadata.
   * @return {Object}
   */
  metadata: function() {
    return this.metadata_;
  },

  /**
   * Set the metadata for this Movetree.
   * @param {Object} data
   * @return {!glift.rules.MoveTree} this
   */
  setMetdata: function(data) {
    this.metadata_ = data;
    return this;
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   * @param {number=} opt_variationNum
   * @return {!glift.rules.MoveTree} this
   */
  moveDown: function(opt_variationNum) {
    var num = opt_variationNum || 0;
    if (this.node().getChild(num) !== undefined) {
      this.currentNode_ = this.node().getChild(num);
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not at root move.
   * At the root node, movetree.moveUp().moveUp() == movetree.moveUp();
   * @return {!glift.rules.MoveTree} this
   */
  moveUp: function() {
    var parent = this.currentNode_.getParent();
    if (parent) { this.currentNode_ = parent; }
    return this;
  },

  /**
   * Get the current player as a color.
   * @return {!glift.enums.states}
   */
  getCurrentPlayer: function() {
    var states = glift.enums.states;
    var tokenMap = {W: 'WHITE', B: 'BLACK'};
    var curNode = this.currentNode_;

    // The PL property is a short circuit. Usually only used on the root node.
    if (this.properties().contains(glift.rules.prop.PL)) {
      return tokenMap[this.properties().getOneValue(glift.rules.prop.PL)];
    }

    var move = curNode.properties().getMove();
    while (!move) {
      curNode = curNode.getParent();
      if (!curNode) {
        return states.BLACK;
      }
      move = curNode.properties().getMove();
    }
    if (!move) {
      return states.BLACK;
    } else if (move.color === states.BLACK) {
      return states.WHITE;
    } else if (move.color === states.WHITE) {
      return states.BLACK;
    } else {
      return states.BLACK;
    }
  },

  /**
   * Get a new tree reference.  The underlying tree remains the same, but this
   * is a lightway to create new references so the current node position can be
   * changed.
   * @return {!glift.rules.MoveTree}
   */
  newTreeRef: function() {
    return new glift.rules.MoveTree(
        this.rootNode_, this.currentNode_, this.metadata_);
  },

  /**
   * Creates a new Movetree reference from a particular node. The underlying
   * node-tree remains the same.
   *
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   *
   * @param {!glift.rules.MoveNode} node
   * @return {!glift.rules.MoveTree} New movetree reference.
   */
  getFromNode: function(node) {
    return new glift.rules.MoveTree(node, node, this.metadata_);
  },

  /**
   * Gets a new move tree instance from the root node. Important note: this
   * creates a new tree reference. Thus, if you don't assign to a var, nothing
   * will happen.
   *
   * @param {!glift.rules.Treepath=} treepath
   * @return {!glift.rules.MoveTree} New movetree reference.
   */
  getTreeFromRoot: function(treepath) {
    var mt = this.getFromNode(this.rootNode_);
    if (treepath && glift.util.typeOf(treepath) === 'array') {
      for (var i = 0, len = treepath.length;
           i < len && mt.node().numChildren() > 0; i++) {
        mt.moveDown(treepath[i]);
      }
    }
    return mt;
  },

  ///////////////////////////////////
  // Other methods, in Alpha Order //
  ///////////////////////////////////
  /**
   * Add a new Node to the cur position and move to that position. 
   * @return {!glift.rules.MoveTree} this
   */
  addNode: function() {
    this.node().addChild();
    this.moveDown(this.node().numChildren() - 1);
    return this;
  },

  /** Delete the current node and move up */
  // TODO(kashomon): Finish this.
  deleteNode: function() { throw "Unfinished"; },

  /**
   * Given a point and a color, find the variation number corresponding to the
   * branch that has the specified move. The idea behind this method is that:
   * some player plays a move: does the move currently exist in the movetree?
   *
   * @param {!glift.Point} point Intersection for the move
   * @param {glift.enums.states} color Color of the move.
   * @return {number|null} either the number or null if no such number exists.
   */
  findNextMove: function(point, color) {
    var nextNodes = this.node().children,
        token = glift.sgf.colorToToken(color),
        ptSet = {};
    for (var i = 0; i < nextNodes.length; i++) {
      var node = nextNodes[i];
      if (node.properties().contains(token)) {
        if (node.properties().getOneValue(token) == "") {
          // This is a 'PASS'.  Ignore
        } else {
          ptSet[node.properties().getAsPoint(token).toString()] =
            node.getVarNum();
        }
      }
    }
    if (ptSet[point.toString()] !== undefined) {
      return ptSet[point.toString()];
    } else {
      return null;
    }
  },

  /**
   * Get the intersections number of the go board, by looking at the props. 
   * @return {number}
   */
  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        prop = glift.rules.prop;
    if (mt.properties().contains(prop.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(prop.SZ), 10);
      return ints;
    } else {
      return 19;
    }
  },

  /**
   * Get the last move ([B] or [W]). This is a convenience method, since it
   * delegates to properties().getMove();
   *
   * Returns a move object: { color:<color point:<point } or null;
   *
   * There are two cases where null can be returned:
   *  - At the root node.
   *  - When, in the middle of the game, stone-placements are added for
   *    illustration (AW,AB).
   * @return {?glift.rules.Move}
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * If not on the mainline, returns the appriate 'move number' for a variation,
   * for the current location, which is the number of moves to mainline
   *
   * @return {number} The number of moves to get to the mainline branch and 0 if
   *    already on the mainline branch.
   */
  movesToMainline: function() {
    var mt = this.newTreeRef();
    for (var n = 0; !mt.onMainline() && mt.node().getParent(); n++) {
      mt.moveUp();
    }
    return n;
  },

  /**
   * Gets the the first node in the parent chain that is on the mainline.
   *
   * @return {!glift.rules.MoveNode}
   */
  getMainlineNode: function() {
    var mt = this.newTreeRef();
    while (!mt.onMainline()) {
      mt.moveUp();
    }
    return mt.node();
  },

  /**
   * Get the next moves (i.e., nodes with either B or W properties);
   *
   * The ordering of the moves is guaranteed to be the ordering of the
   *    variations at the time of creation.
   *
   * @return {!Array<!glift.rules.Move>}
   */
  nextMoves: function() {
    var curNode = this.node();
    var nextMoves = [];
    for (var i = 0; i < curNode.numChildren(); i++) {
      var nextNode = curNode.getChild(i);
      var move = nextNode.properties().getMove();
      if (move) {
        nextMoves.push(move);
      }
    }
    return nextMoves;
  },

  /**
   * @return {boolean} Returns true if the tree is currently on a mainline
   *    variation.
   */
  onMainline: function() {
    if (!this.markedMainline_) {
      var mt = this.getTreeFromRoot();
      mt.node()._mainline = true;
      while (mt.node().numChildren() > 0) {
        mt.moveDown();
        mt.node()._mainline = true;
      }
      this.markedMainline_ = true;
    }
    return this.node()._mainline;
  },

  /**
   * Construct an entirely new movetree, but add all the previous stones as
   * placements.  If the tree is at the root, it's equivalent to a copy of the
   * movetree.
   *
   * @return {!glift.rules.MoveTree} Entirely new movetree.
   */
  rebase: function() {
    var path = this.treepathToHere();
    var oldMt = this.getTreeFromRoot();
    var oldCurrentPlayer = this.getCurrentPlayer();

    var mt = glift.rules.movetree.getInstance();
    var propMap = { 'BLACK': 'AB', 'WHITE': 'AW' };
    for (var i = 0; i <= path.length; i++) {
      var stones = oldMt.properties().getAllStones();
      for (var color in stones) {
        var moves = stones[color];
        var prop = propMap[color];
        for (var j = 0; j < moves.length; j++) {
          var point = moves[j].point;
          if (point && prop) {
            mt.properties().add(prop, point.toSgfCoord());
          }
        }
      }
      if (i < path.length) {
        oldMt.moveDown(path[i]);
      }
    }

    // Recursive function for copying data.
    var copier = function(oldnode, newnode) {
      for (var prop in oldnode.properties().propMap) {
        if (newnode.getNodeNum() === 0 && (prop === 'AB' || prop === 'AW')) {
          continue; // Ignore. We've already copied stones on the root.
        }
        newnode.properties().set(prop,
            glift.util.simpleClone(oldnode.properties().getAllValues(prop)));
      }
      for (var i = 0; i < oldnode.children.length; i++) {
        var oldChild = oldnode.getChild(i);
        var newChild = newnode.addChild().getChild(i);
        copier(oldChild, newChild);
      }
    }
    copier(oldMt.node(), mt.node());

    // Ensure the current player remains the same.
    var tokenmap = {BLACK: 'B', WHITE: 'W'};
    var mtCurPlayer = mt.getCurrentPlayer();
    if (mtCurPlayer !== oldCurrentPlayer) {
      mt.properties().add(glift.rules.prop.PL, tokenmap[oldCurrentPlayer]);
    }
    return mt;
  },

  /**
   * Recursive over the movetree. func is called on the movetree.
   * @param {function(glift.rules.MoveTree)} func
   */
  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  /**
   * Recursive over the movetree from root. func is called on the movetree. 
   * @param {function(glift.rules.MoveTree)} func
   */
  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  /**
   * Convert this movetree to an SGF.
   * @return {string}
   */
  toSgf: function() {
    return this._toSgfBuffer(this.getTreeFromRoot().node(), []).join("");
  },

  /**
   * Create a treepath to the current location. This does not change the current
   * movetree.
   *
   * @return {!glift.rules.Treepath} A treepath (an array of variation numbers);
   */
  treepathToHere: function() {
    var newTreepath = [];
    var movetree = this.newTreeRef();
    while (movetree.node().getParent()) {
      newTreepath.push(movetree.node().getVarNum());
      movetree.moveUp();
    }
    return newTreepath.reverse();
  },

  /**
   * Set the intersections property.
   * Note: This is quite dangerous. If the goban and other data structures are
   * not also updated, chaos will ensue
   *
   * @param {number} intersections
   * @return {glift.rules.MoveTree} this object.
   */
  _setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        prop = glift.rules.prop;
    if (!mt.properties().contains(prop.SZ)) {
      this.properties().add(prop.SZ, intersections + "");
    }
    return this;
  },

  /**
   * Recursive method to build an SGF into an array of data.
   * @param {!glift.rules.MoveNode} node A MoveNode instance.
   * @param {!Array<string>} builder String buffer
   * @return {!Array<string>} the built buffer
   */
  _toSgfBuffer: function(node, builder) {
    if (node.getParent()) {
      // Don't add a \n if we're at the root node
      builder.push('\n');
    }

    if (!node.getParent() || node.getParent().numChildren() > 1) {
      builder.push("(");
    }

    builder.push(';');
    for (var prop in node.properties().propMap) {
      var values = node.properties().getAllValues(prop);
      var out = prop;
      if (values.length > 0) {
        for (var i = 0; i < values.length; i++) {
          // Ensure a string and escape right brackets.
          var val = node.properties().escape(values[i]);
          out += '[' + val + ']'
        }
      } else {
        out += '[]';
      }
      builder.push(out);
    }

    for (var i = 0, len = node.numChildren(); i < len; i++) {
      this._toSgfBuffer(node.getChild(i), builder);
    }

    if (!node.getParent() || node.getParent().numChildren() > 1) {
      builder.push(')');
    }
    return builder
  }
};

goog.provide('glift.rules.ProblemConditions');
goog.provide('glift.rules.problems');

/**
 * Map of prop-to-values.
 *
 * @typedef {!Object<glift.rules.prop, !Array<string>>}
 */
glift.rules.ProblemConditions;

glift.rules.problems = {
  /**
   * Determines if a 'move' is correct. Takes a movetree and a series of
   * conditions, which is a map of properties to an array of possible substring
   * matches.  Only one conditien must be met.
   *
   * Problem results:
   *
   * CORRECT - The position properties must match one of several problem
   *    conditions.
   * INDETERMINATE - There must exist at path to a correct position from the
   *    current position.
   * INCORRECT - The position has to path to a correct position.
   *
   * Some Examples:
   *    Correct if there is a GB property or the words 'Correct' or 'is correct' in
   *    the comment. This is the default.
   *    { GB: [], C: ['Correct', 'is correct'] }
   *
   *    Nothing is correct
   *    {}
   *
   *    Correct as long as there is a comment tag.
   *    { C: [] }
   *
   *    Correct as long as there is a black stone (a strange condition).
   *    { B: [] }
   *
   * @param {!glift.rules.MoveTree} movetree
   * @param {!glift.rules.ProblemConditions} conditions
   * @return {glift.enums.problemResults}
   */
  isCorrectPosition: function(movetree, conditions) {
    var problemResults = glift.enums.problemResults;
    if (movetree.properties().matches(conditions)) {
      return problemResults.CORRECT;
    } else {
      var flatPaths = glift.rules.treepath.flattenMoveTree(movetree);
      var successTracker = {};
      for (var i = 0; i < flatPaths.length; i++) {
        var path = flatPaths[i];
        var newmt = movetree.getFromNode(movetree.node());
        var pathCorrect = false
        for (var j = 0; j < path.length; j++) {
          newmt.moveDown(path[j]);
          if (newmt.properties().matches(conditions)) {
            pathCorrect = true;
          }
        }
        if (pathCorrect) {
          successTracker[problemResults.CORRECT] = true;
        } else {
          successTracker[problemResults.INCORRECT] = true;
        }
      }
      if (successTracker[problemResults.CORRECT] &&
          !successTracker[problemResults.INCORRECT]) {
        if (movetree.properties().matches(conditions)) {
          return problemResults.CORRECT;
        } else {
          return problemResults.INDETERMINATE;
        }
      } else if (
          successTracker[problemResults.CORRECT] &&
          successTracker[problemResults.INCORRECT]) {
        return problemResults.INDETERMINATE;
      } else {
        return problemResults.INCORRECT;
      }
    }
  },

  /**
   * Gets the correct next moves. This assumes the the SGF is a problem-like SGF
   * with with right conditions specified somehow.
   *
   * @param {!glift.rules.MoveTree} movetree
   * @param {!glift.rules.ProblemConditions} conditions
   * @return {!Array<!glift.rules.Move>} An array of correct next moves.
   */
  correctNextMoves: function(movetree, conditions) {
    var nextMoves = movetree.nextMoves();
    var INCORRECT = glift.enums.problemResults.INCORRECT;
    var correctNextMoves = [];
    for (var i = 0; i < nextMoves.length; i++) {
      movetree.moveDown(i);
      if (glift.rules.problems.isCorrectPosition(movetree, conditions)
          !== INCORRECT) {
        correctNextMoves.push(nextMoves[i]);
      }
      movetree.moveUp(); // reset the position
    }
    return correctNextMoves;
  }
};

goog.provide('glift.rules.Properties');
goog.provide('glift.rules.MoveCollection');

/**
 * @param {!Object<glift.rules.prop, !Array<string>>=} opt_map
 * @return {!glift.rules.Properties}
 */
glift.rules.properties = function(opt_map) {
  return new glift.rules.Properties(opt_map);
};

/**
 * A collection of moves.
 *
 * @typedef {{
 *  WHITE: !Array<!glift.rules.Move>,
 *  BLACK: !Array<!glift.rules.Move>
 * }}
 */
glift.rules.MoveCollection;


/**
 * Mark Value. Encapsulates type of mark properties.
 * @typedef {{
 *  point: !glift.Point,
 *  value: string
 * }}
 */
glift.rules.MarkValue;


/**
 * A collection of marks.
 *
 * @typedef {!Object<glift.enums.marks, !Array<glift.rules.MarkValue>>}
 */
glift.rules.MarkCollection;


/**
 * An object describing a property.
 *
 * Example:
 * {
 *  prop: GN
 *  displayName: 'Game Name',
 *  value: 'Lee Sedol vs Gu Li'
 * }
 *
 * @typedef {{
 *  prop: glift.rules.prop,
 *  displayName: string,
 *  value: string
 * }}
 */
glift.rules.PropDescriptor;

/**
 * Properties that accept point values. This is here mostly for full-board
 * modifications (e.g., rotations). It may also be useful for identifying boards
 *
 * Notes: There are several ways to represent points in SGFs.
 *  [ab] - Simple point at 0,1 (origin=upper left. oriented down-right)
 *  [aa:cc] - Point Rectangle (all points from 0,0 to 2,2 in a rect)
 *
 * Additionally Labels (LB) have the format
 *  [ab:label]
 *
 * @type {!Object<glift.rules.prop, boolean>}
 */
glift.rules.propertiesWithPts = {
  // Marks
  CR: true, LB: true, MA: true, SQ: true, TR: true,
  // Stones
  B: true, W: true, AW: true, AB: true,
  // Clear Stones
  AE: true,
  // Misc. These properties are very rare, and usually can be ignored.
  // Still, they're here for completeness.
  AR: true, // arrow
  DD: true, // gray area
  LN: true, // line
  TB: true, // black area/territory
  TW: true // white area
};

/**
 * @param {!Object<glift.rules.prop, !Array<string>>=} opt_map
 *
 * @package
 * @constructor @final @struct
 */
glift.rules.Properties = function(opt_map) {
  /** @package {!Object<glift.rules.prop, !Array<string>>} */
  this.propMap = opt_map || {};
};

glift.rules.Properties.prototype = {
  /**
   * Add an SGF Property to the current move.
   *
   * Prop: An SGF Property
   * Value: Either of:
   *  A string.
   *  An array of strings.
   *
   * Eventually, each sgf property should be matched to a datatype.  For now,
   * the user is allowed to put arbitrary data into a property.
   *
   * Note that this does not overwrite an existing property - for that, the user
   * has to delete the existing property. If the property already exists, we add
   * another data element onto the array.
   *
   * @param {glift.rules.prop} prop
   * @param {string|!Array<string>} value
   * @return {!glift.rules.Properties} this
   */
  add: function(prop, value) {
    // Return if the property is not string or a real property
    if (!glift.rules.prop[prop]) {
      glift.util.logz('Warning! The property [' + prop + ']' +
          ' is not valid and is not recognized in the SGF spec.' +
          ' Thus, this property will be ignored');
      return this;
    }
    var valueType = glift.util.typeOf(value);

    if (valueType !== 'string' && valueType !== 'array') {
      throw new Error('Unsupported type "' + valueType + '" for prop ' + prop);
    } else if (valueType === 'array') {
      // Force all array values to be of type string.
      for (var i = 0, len = value.length; i < len; i++) {
        // Ensure properties are strings
        value[i] = this.unescape(value[i]);
      }
    } else if (valueType === 'string') {
      value = [ this.unescape(/** @type {string} */ (value)) ];
    } else {
      throw new Error('Unexpected type ' +
          glift.util.typeOf(value) + ' for prop ' + prop);
    }

    // Convert any point rectangles. We do not allow point rectangles in our
    // SGF property data, since it makes everything much more complex.
    var pointRectangleRegex = /^[a-z][a-z]:[a-z][a-z]$/;
    var finished = [];
    for (var i = 0; i < value.length; i++) {
      if (pointRectangleRegex.test(value[i])) {
        // This is a rectangle of points. Sigh.
        var pts = glift.util.pointArrFromSgfProp(value[i]);
        for (var j = 0; j < pts.length; j++) {
          finished.push(pts[j].toSgfCoord());
        }
      } else {
        finished.push(value[i]);
      }
    }

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(finished);
    } else {
      this.propMap[prop] = finished;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key.  Note: this returns
   * a shallow copy of the properties.
   *
   * If the property doesn't exist, returns null.
   */
  getAllValues: function(strProp) {
    if (glift.rules.prop[strProp] === undefined) {
      return null; // Not a valid Property
    } else if (this.propMap[strProp]) {
      return this.propMap[strProp].slice(); // Return a shallow copy.
    } else {
      return null;
    }
  },

  /**
   * Gets one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the getOneValue() always returns an array, it's sometimes useful to
   * return the first property in the list.  Like getOneValue(), if a property
   * or value can't be found, null is returned.
   *
   * @param {glift.rules.prop} prop The property
   * @param {number=} opt_index Optional index. Defaults to 0.
   * @return {?string} The string property or null.
   */
  getOneValue: function(prop, opt_index) {
    var index = opt_index || 0;
    var arr = this.getAllValues(prop);
    if (arr && arr.length >= 1) {
      return arr[index];
    } else {
      return null;
    }
  },

  /**
   * Get a value from a property and return the point representation.
   * Optionally, the user can provide an index, since each property points to an
   * array of values.
   *
   * @param {glift.rules.prop} prop The SGF property.
   * @param {number=} opt_index Optional index. defaults to 0.
   * @return {?glift.Point} Returns a Glift point or null if the property
   *    doesn't exist.
   */
  getAsPoint: function(prop, opt_index) {
    var out = this.getOneValue(prop, opt_index);
    if (out) {
      return glift.util.pointFromSgfCoord(out);
    } else {
      return null;
    }
  },

  /**
   * Rotates an SGF Property. Note: This only applies to stone-properties.
   *
   * Recall that in the SGF, we should have already converted any point
   * rectangles, so there shouldn't be any issues here with converting point
   * rectangles.
   *
   * @param {glift.rules.prop} prop
   * @param {number} size Size of the Go Board.
   * @param {glift.enums.rotations} rotation Rotation to perform
   */
  rotate: function(prop, size, rotation) {
    if (!glift.rules.propertiesWithPts[prop]) {
      return;
    }
    if (!glift.enums.rotations[rotation] ||
        rotation === glift.enums.rotations.NO_ROTATION) {
      return
    }
    var regex = /([a-z][a-z])/g;
    if (prop === glift.rules.prop.LB) {
      // We handle labels specially since labels have a unqiue format
      regex = /([a-z][a-z])(?=:)/g;
    }
    var vals = this.getAllValues(prop);
    for (var i = 0; i < vals.length; i++) {
      vals[i] = vals[i].replace(regex, function(sgfPoint) {
        return glift.util.pointFromSgfCoord(sgfPoint)
            .rotate(size, rotation)
            .toSgfCoord();
      });
    }
    this.propMap[prop] = vals;
  },

  /**
   * Returns true if the current move has the property "prop".  Return
   * false otherwise.
   *
   * @param {glift.rules.prop} prop
   * @return {boolean}
   */
  contains: function(prop) {
    return prop in this.propMap;
  },

  /**
   * Tests wether a prop contains a value
   *
   * @param {glift.rules.prop} prop
   * @param {string} value
   * @return {boolean}
   */
  hasValue : function(prop, value) {
    if (!this.contains(prop)) {
      return false;
    }
    var vals = this.getAllValues(prop);
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] === value) {
        return true;
      }
    }
    return false;
  },

  /**
   * Deletes the prop and return the value.
   * @param {glift.rules.prop} prop
   * @return {?Array<string>} The former values of this property.
   */
  remove: function(prop) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      delete this.propMap[prop];
      return allValues;
    } else {
      return null;
    }
  },

  /**
   * Remove one value from the property list. Returns the value if it was
   * successfully removed.  Removes only the first value -- any subsequent value
   * remains in the property list.
   * @param {glift.rules.prop} prop
   * @param {string} value
   */
  removeOneValue: function(prop, value) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      var index = -1;
      for (var i = 0, len = allValues.length; i < len; i++) {
        if (allValues[i] === value) {
          index = i;
          break;
        }
      }
      if (index !== -1) {
        allValues.splice(index, 1);
        this.set(prop, allValues);
      }
    } else {
      return null;
    }
  },

  /**
   * Sets current value, even if the property already exists.
   * @param {glift.rules.prop} prop
   * @param {string|!Array<string>} value
   * @return {glift.rules.Properties} this
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [
            this.unescape(/** @type {string} */ (value)) ];
      } else if (glift.util.typeOf(value) === 'array') {
        for (var i = 0; i < value.length; i++) {
          if (glift.util.typeOf(value[i]) !== 'string') {
            throw new Error('When setting via an array, all values ' +
              'must be strings. was [' + glift.util.typeOf(value[i]) +
              '], for value ' + value[i]);
          }
          value[i] = this.unescape(value[i]);
        }
        this.propMap[prop] = /** @type {!Array<string>} */ (value);
      }
    }
    return this;
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  /**
   * Get all the placements for a color.  Return as an array.
   * @param {glift.enums.states} color
   * @return {!Array<!glift.Point>} points.
   */
  getPlacementsAsPoints: function(color) {
    var prop;
    if (color === glift.enums.states.BLACK) {
      prop = glift.rules.prop.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.rules.prop.AW;
    } else {
      return  [];
    }

    if (!this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  /**
   * Get the current comment on the move. It's provided as a convenience method
   * since it's an extremely comment operation.
   *
   * @return {?string}
   */
  getComment: function() {
    if (this.contains(glift.rules.prop.C)) {
      return this.getOneValue(glift.rules.prop.C);
    } else {
      return null;
    }
  },

  /**
   * Get the current Move.  Returns null if no move exists.
   *
   * If the move is a pass, then in the SGF, we'll see B[] or W[].  Thus,
   * we will return { color: BLACK } or { color: WHITE }, but we won't have any
   * point associated with this.
   *
   * @return {?glift.rules.Move}.
   */
  getMove: function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    if (this.contains(glift.rules.prop.B)) {
      if (this.getOneValue(glift.rules.prop.B) === "") {
        return { color: BLACK }; // This is a PASS
      } else {
        return {
          color: BLACK,
          point: this.getAsPoint(glift.rules.prop.B) || undefined
        }
      }
    } else if (this.contains(glift.rules.prop.W)) {
      if (this.getOneValue(glift.rules.prop.W) === '') {
        return { color: WHITE }; // This is a PASS
      } else {
        return {
          color: WHITE,
          point: this.getAsPoint(glift.rules.prop.W) || undefined
        };
      }
    } else {
      return null;
    }
  },

  /**
   * Test whether this set of properties match a series of conditions.  Returns
   * true or false.  Conditions have the form:
   *
   * { <property>: [series,of,conditions,to,match], ... }
   *
   * Example:
   *    Matches if there is a GB property or the words 'Correct' or 'is correct' in
   *    the commentj
   *    { GB: [], C: ['Correct', 'is correct'] }
   *
   * Note: This is an O(lnm) ~ O(n^3).  But practice, you'll want to test
   * against singular properties, so it's more like O(n^2)
   *
   * @param {!glift.rules.ProblemConditions} conditions Set of
   *    property-conditions to check.
   * @return {boolean}
   */
  matches: function(conditions) {
    for (var key in conditions) {
      if (this.contains(key)) {
        var substrings = conditions[key];
        if (substrings.length === 0) {
          return true;
        }
        var allValues = this.getAllValues(key);
        for (var i = 0, len = allValues.length ; i < len; i++) {
          for (var j = 0, slen = substrings.length; j < slen; j++) {
            var value = allValues[i];
            var substr = substrings[j];
            if (value.indexOf(substr) !== -1) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  /**
   * Get all the stones (placements and moves).  This ignores 'PASS' moves.
   *
   * @return {!glift.rules.MoveCollection}
   */
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out.WHITE = [];
    out.BLACK = [];

    var bplace = this.getPlacementsAsPoints(states.BLACK);
    var wplace = this.getPlacementsAsPoints(states.WHITE);
    for (var i = 0; i < bplace.length; i++) {
      out.BLACK.push({point: bplace[i], color: BLACK});
    }
    for (var i = 0; i < wplace.length; i++) {
      out.WHITE.push({point: wplace[i], color: WHITE});
    }
    var move = this.getMove();
    if (move && move.point) {
      out[move.color].push(move);
    }
    return out;
  },


  /**
   * Gets all the marks, where the output is a map from glift mark enum to array
   * of points. In the case of labels, a value key is supplied as well to
   * indicate the label. Note that the board must contain at least one mark for
   * a key to exist in the output map
   *
   * The return has the format:
   *  {
   *    LABEL: [{value: lb, point: pt}, ...],
   *    : [{point: pt}, ...]
   *  }
   * return {!glift.rules.MarkCollection}
   */
  getAllMarks: function() {
    /**
     * @type {!Object<glift.rules.prop, glift.enums.states>}
     */
    var propertiesToMarks = {
      CR: glift.enums.marks.CIRCLE,
      LB: glift.enums.marks.LABEL,
      MA: glift.enums.marks.XMARK,
      SQ: glift.enums.marks.SQUARE,
      TR: glift.enums.marks.TRIANGLE
    };
    var outMarks = {};
    for (var prop in propertiesToMarks) {
      var mark = propertiesToMarks[prop];
      if (this.contains(prop)) {
        var data = this.getAllValues(prop);
        var marksToAdd = [];
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.rules.prop.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point or a point rectangle (which is why the return-type
            // is an array.
            var newPts = glift.util.pointArrFromSgfProp(data[i])
            for (var j = 0; j < newPts.length; j++) {
              marksToAdd.push({
                point: newPts[j]
              });
            }
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  },

  /**
   * Get all display intersections. Equivalent to calling getAllStones and
   * getAllMarks and merging the result. Note that the points are segregated by
   * category:
   *
   * {
   *  BLACK: [...],
   *  WHITE: [...],
   *  LABEL: [...],
   *  SQUARE: [...],
   * }
   *
   * Note that the marks could (and usually will) overlap with the stones, so
   * duplicate points need to be accounted for.
   */
  getAllDisplayPts: function() {
    var marks = this.getAllMarks();
    var stones = this.getAllStones();
    var out = {};
    for (var key in marks) {
      out[key] = marks[key];
    }
    for (var key in stones) {
      out[key] = stones[key];
    }
    return out;
  },

  /**
   * Get the game info key-value pairs. Ex:
   * [{
   *  prop: GN
   *  displayName: 'Game Name',
   *  value: 'Lee Sedol vs Gu Li'
   * },...
   * ]
   * @return {!Array<!glift.rules.PropDescriptor>}
   */
  // TODO(kashomon): Add test
  getGameInfo: function() {
    var gameInfoArr = [];
    /**
     * @type {!Object<glift.rules.prop, string>}
     */
    var propNameMap = {
      PW: 'White Player',
      PB: 'Black Player',
      RE: 'Result',
      AN: 'Commenter',
      SO: 'Source',
      RU: 'Ruleset',
      KM: 'Komi',
      GN: 'Game Name',
      EV: 'Event',
      RO: 'Round',
      PC: 'Place Name',
      DT: 'Date'
    };
    for (var key in propNameMap) {
      if (this.contains(key)) {
        var displayName = propNameMap[key];
        var obj = {
          prop: key,
          displayName: displayName,
          value: this.getOneValue(key)
        };
        // Post processing for some values.
        // We attach the ranks like Kashomon [9d], if they exist.
        if (key === glift.rules.prop.PW &&
            this.contains(glift.rules.prop.WR)) {
          obj.value += ' [' + this.getOneValue(glift.rules.prop.WR) + ']';
        } else if (key === glift.rules.prop.PB &&
            this.contains(glift.rules.prop.BR)) {
          obj.value += ' [' + this.getOneValue(glift.rules.prop.BR) + ']';
        }
        // Remove trailing zeroes on komi amounts.
        else if (key === glift.rules.prop.KM) {
          obj.value = parseFloat(this.getOneValue(key)) + '' || '0';
        }
        gameInfoArr.push(obj);
      }
    }
    return gameInfoArr;
  },

  /**
   * Escapes some text by converting ] to \\] 
   * @param {string} text
   * @return {string}
   */
  escape: function(text) {
    return text.toString().replace(/]/g, '\\]');
  },

  /**
   * Unescapes some text by converting \\] to ] 
   * @param {string} text
   * @return {string}
   */
  unescape: function(text) {
    return text.toString().replace(/\\]/g, ']');
  }
};

goog.provide('glift.rules.AppliedTreepath');
goog.provide('glift.rules.Treepath');
goog.provide('glift.rules.treepath');

/**
 * @typedef {!Array<number>}
 */
glift.rules.Treepath;

/**
 * The result of a treepath applied to a movetree.
 *
 * @typedef {{
 *  movetree: !glift.rules.MoveTree,
 *  stones: !Array<!glift.rules.Move>
 * }}
 */
glift.rules.AppliedTreepath;

/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem. This implies that the treepaths discussed below
 * are initial treepaths.
 *
 * Note: Both moves and and variations are 0 indexed.
 *
 * Some examples:
 * 0         - Start at the 0th move (the root node)
 * 53        - Start at the 53rd move, taking the primary path
 * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
 * 3         - Start at the 3rd move
 * 2.0       - Start at the 3rd move
 * 0.0.0.0   - Start at the 3rd move
 * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by traveling
 *             through the 3rd varition of the 2nd move
 *
 * Note: '+' is a special symbol which means "go to the end via the first
 * variation." This is implemented with a by appending 500 0s to the path array.
 * This is a hack, but in practice games don't go over 500 moves.
 *
 * The init position returned is an array of variation numbers traversed through.
 * The move number is precisely the length of the array.
 *
 * So:
 * 0       becomes []
 * 1       becomes [0]
 * 0.1     becomes [1]
 * 53      becomes [0,0,0,...,0] (53 times)
 * 2.3     becomes [0,0,3]
 * 0.0.0.0 becomes [0,0,0]
 * 2.3-4.1 becomes [0,0,3,0,1]
 * 1+      becomes [0,0,...(500 times)]
 * 0.1+    becomes [1,0,...(500 times)]
 * 0.2.6+  becomes [2,6,0,...(500 times)]
 *
 * Treepath Fragments
 *
 * In contrast to initial treepaths, treepaths can also be fragments that say
 * how to get from position n to position m.  Thus treepath fragments only
 * allow variation numbers and disallow the 3-10 syntax.
 *
 * This is how fragment strings are parsed:
 * 0       becomes [0]
 * 1       becomes [1]
 * 53      becomes [53]
 * 2.3     becomes [2,3]
 * 0.0.0.0 becomes [0,0,0]
 * 1+      becomes [1,0...(500 times)]
 */
glift.rules.treepath = {
  /**
   * Parse a treepath
   *
   * @param {number|string|!Array<number>|undefined} initPos The initial
   *    position, which can be defined as a variety of types.
   * @return {!glift.rules.Treepath}
   */
  parsePath: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = '' + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return /** @type {glift.rules.Treepath} */ (initPos);
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      return glift.rules.treepath.toEnd_();
    }

    var out = [];
    var lastNum = 0;
    // "2.3-4.1+"
    var sect = initPos.split('-');
    // [2.3, 4.1+]
    for (var i = 0; i < sect.length; i++) {
      // 4.1 => [4,1+]
      var v = sect[i].split('\.');
      // Handle the first number (e.g., 4); We necessitate this to be a move
      // number, so we push 0s until we get to the move number.
      var firstNum = parseInt(v[0], 10)
      for (var j = 0; j < firstNum - lastNum; j++) {
        out.push(0);
      }

      // If there's only one number, we add 500 those zeroes and break.
      if (/\+/.test(v[0])) {
        if (v.length !== 1 || i !== sect.length - 1) {
          throw new Error('Improper use of + at ' + v[0] + 
              ':  The + character can only occur at the end.');
        }
        out = out.concat(glift.rules.treepath.toEnd_());
        return out;
      }

      lastNum = firstNum;
      // Handle the rest of the numbers. These must be variations.
      for (var j = 1; j < v.length; j++) {
        var testNum = v[j];
        // Handle the last number. 1+
        if (testNum.charAt(testNum.length - 1) === '+') {
          testNum = testNum.slice(0, testNum.length - 1);
          out.push(parseInt(testNum, 10));
          // + must be the last character.
          out = out.concat(glift.rules.treepath.toEnd_());
          return out;
        } else {
          out.push(parseInt(testNum, 10));
        }
        lastNum++;
      }
    }
    return out;
  },

  /**
   * Path fragments are like path strings except that path fragments only allow
   * the 0.0.1.0 or [0,0,1,0] syntax. Also, paths like 3.2.1 are transformed
   * into [3,2,1] rather than [0,0,0,2,1].
   *
   * @param {!Array<number>|string} pathStr An initial path.
   * @return {!glift.rules.Treepath} The parsed treepath.
   */
  parseFragment: function(pathStr) {
    if (!pathStr) {
      pathStr = [];
    }
    var vartype = glift.util.typeOf(pathStr);
    if (vartype === 'array') {
      // Assume the array is in the correct format
      return /** @type {glift.rules.Treepath} */ (pathStr);
    }
    if (vartype !== 'string') {
      throw new Error('When parsing fragments, type should be string. was: ' + 
          vartype);
    }
    var splat = pathStr.split('.');
    var out = [];
    for (var i = 0; i < splat.length; i++) {
      var num = splat[i];
      if (num.charAt(num.length - 1) === '+') {
        num = num.slice(0, num.length - 1);
        out.push(parseInt(num, 10))
        out = out.concat(glift.rules.treepath.toEnd_());
      } else {
        out.push(parseInt(num, 10));
      }
    }
    return out;
  },

  /**
   * Converts a treepath fragement back to a string.  In other words:
   *    [2,0,1,2,6] => 2.0.1.2.6
   *
   * @param {!glift.rules.Treepath} path A treepath fragment.
   * @return {string} A fragment string.
   */
  toFragmentString: function(path) {
    if (glift.util.typeOf(path) !== 'array') {
      return path.toString();
    }
    return path.join('.');
  },

  /**
   * Converts a treepath back to an initial path string. This is like the
   * toFragmentString, except that long strings of -initial- zeroes are
   * converted to move numbers.
   *
   * I.e,
   *   0,0,0 => 3
   *   0,0,0.1 => 3.1
   *
   * Note: Once we're on a variation, we don't collapse the path
   *
   * @param {!glift.rules.Treepath} path A full treepath from the root.
   * @return {string} A full path string.
   */
  toInitPathString: function(path) {
    var out = [];
    var onMainLine = true;
    for (var i = 0; i < path.length; i++) {
      var elem = path[i];
      if (elem === 0) {
        if (onMainLine && i === path.length - 1) {
          out.push(i + 1);
        } else if (!onMainLine) {
          out.push(elem);
        }
        // ignore otherwise
      } else if (elem > 0) {
        // Since elem is non-zero, it's a variation indicator.
        if (onMainLine) {
          onMainLine = false;
          // Note: We only want to push the initial-move-number part *once*
          out.push(i);
        }
        out.push(elem);
      }
    }
    return out.join('.');
  },

  /**
   * Lazily computed treepath value.
   * @private {?glift.rules.Treepath}
   */
  storedToEnd_: null,

  /**
   * Return an array of 500 0-th variations.  This is sort of a hack, but
   * changing this would involve rethinking what a treepath is.
   *
   * @private
   * @return {!glift.rules.Treepath}
   */
  toEnd_: function() {
    if (glift.rules.treepath.storedToEnd_ != null) {
      return glift.rules.treepath.storedToEnd_;
    }
    var storedToEnd = []
    for (var i = 0; i < 500; i++) {
      storedToEnd.push(0);
    }
    glift.rules.treepath.storedToEnd_ = storedToEnd;
    return glift.rules.treepath.storedToEnd_;
  },

  /**
   * Use some heuristics to find a nextMovesTreepath.  This is used for
   * automatically adding move numbers.
   *
   * Note: The movetree should be in _final position_. The algorithm below works
   * backwards, continually updating a next-moves path as it goes. It finally
   * terminates when it reaches one of three conditions
   *  - There's a comment.
   *  - We go from variation to main branch.
   *  - We exceed minus-moves-override.
   *
   * _Important Note_ on starting moves: the resulting movetree has the
   * property that the initial position of the movetree should not be considered
   * for diagram purposes. I.e., the first move to be diagramed should be the
   * first element of the nextMoves path. So movetree+nextMoves[0] should be
   * the first move.
   *
   * @param {glift.rules.MoveTree} movetree A movetree, of course.
   * @param {glift.rules.Treepath=} opt_initTreepath The initial treepath. If not
   *    specified or undefined, use the current location in the movetree.
   * @param {number=} opt_minusMovesOverride: Force findNextMoves to to return a
   *    nextMovesTreepath of this length, starting from the init treepath.  The
   *    actual nextMovesTreepath can be shorter. (Note: This option should be
   *    deleted).
   * @param {boolean=} opt_breakOnComment Whether or not to break on comments on the
   *    main variation.  Defaults to true
   *
   * @return {{
   *  movetree: !glift.rules.MoveTree,
   *  treepath: !glift.rules.Treepath,
   *  nextMoves: !glift.rules.Treepath
   * }} An object with the following properties:
   *
   * - movetree: An updated movetree
   * - treepath: A new treepath that says how to get to this position
   * - nextMoves: A nextMovesTreepath, used to apply for the purpose of
   *    crafting moveNumbers.
   */
  findNextMovesPath: function(
      movetree, opt_initTreepath, opt_minusMovesOverride, opt_breakOnComment) {
    var initTreepath = opt_initTreepath || movetree.treepathToHere();
    var breakOnComment = opt_breakOnComment === false ? false : true;
    var mt = movetree.getTreeFromRoot(initTreepath);
    var minusMoves = opt_minusMovesOverride || 1000;
    var nextMovesTreepath = [];
    var startMainline = mt.onMainline();
    for (var i = 0; mt.node().getParent() && i < minusMoves; i++) {
      var varnum = mt.node().getVarNum();
      nextMovesTreepath.push(varnum);
      mt.moveUp();
      if (breakOnComment &&
          mt.properties().getOneValue(glift.rules.prop.C)) {
        break;
      }

      if (!startMainline && mt.onMainline()) {
        break; // Break if we've moved to the mainline from a variation
      }
    }
    nextMovesTreepath.reverse();
    return {
      movetree: mt,
      treepath: mt.treepathToHere(),
      nextMoves: nextMovesTreepath
    };
  },

  /**
   * Apply the nextmoves and find the collisions.
   *
   * augmented stone objects take the form:
   *    {point: <point>, color: <color>}
   * or
   *    {point: <point>, color: <color>, collision:<idx>}
   *
   * where idx is an index into the stones object. If idx is null, the stone
   * conflicts with a stone added elsewhere (i.e., in the goban).  This should
   * be a reasonably common case.
   *
   * @param {!glift.rules.MoveTree} movetree A rules.movetree.
   * @param {!glift.rules.Goban} goban A rules.goban array.
   * @param {!glift.rules.Treepath} nextMoves A next-moves treepath (fragment).
   *
   * @return {!glift.rules.AppliedTreepath} The result of applying the treepath
   *
   * - movetree: The updated movetree after applying the nextmoves
   * - stones: Array of 'augmented' stone objects
   */
  applyNextMoves: function(movetree, goban, nextMoves) {
    var colors = glift.enums.states;
    var mt = movetree.newTreeRef();
    var stones = [];
    var placedMap = {}; // map from ptstring to idx
    for (var i = 0; i < nextMoves.length; i++) {
      mt.moveDown(nextMoves[i]);
      var move = mt.properties().getMove();
      if (move && move.point && move.color) {
        var ptString = move.point.toString();
        var gcolor = goban.getStone(move.point);
        if (gcolor !== colors.EMPTY) {
          move.collision = null;
        } else if (placedMap[ptString] !== undefined) {
          move.collision = placedMap[ptString];
        }
        stones.push(move);
        placedMap[ptString] = i;
      }
    }
    return {
      movetree: mt,
      stones: stones
    };
  },

  /**
   * Flatten the move tree variations into a list of lists, where the sublists
   * are each a treepath.
   *
   * @param {!glift.rules.MoveTree} movetree The current movetree to flatten.
   * return {!Array<glift.rules.Treepath>} treepath An array of all possible
   *    treepaths.
   */
  flattenMoveTree: function(movetree) {
    var out = [];
    movetree = movetree.newTreeRef();
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i);
      var result = glift.rules.treepath._flattenMoveTree(movetree, []);
      movetree.moveUp();
      for (var j = 0; j < result.length; j++) {
        out.push(result[j])
      }
    }
    return out;
  },

  /**
   * @param {!glift.rules.MoveTree} movetree The movetree.
   * @param {!glift.rules.Treepath} pathToHere A treepath to here.
   * @private
   */
  _flattenMoveTree: function(movetree, pathToHere) {
    if (pathToHere === undefined) pathToHere = [];
    pathToHere.push(movetree.node().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i)
      var thisout = glift.rules.treepath._flattenMoveTree(
          movetree, pathToHere.slice());
      out = out.concat(thisout)
      movetree.moveUp()
    }
    if (out.length == 0) out.push(pathToHere);
    return out;
  }
};

/**
 * The SGF library contains functions for dealing with SGFs.
 *
 * This includes a parser and various utilities related to SGFs.
 */
glift.sgf = {
  /** Return a move property from a property. */
  colorToToken: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'W';
    } else if (color === glift.enums.states.BLACK) {
      return 'B';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  /** Return placement property from a color. */
  colorToPlacement: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'AW';
    } else if (color === glift.enums.states.BLACK) {
      return 'AB';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  /**
   * Given a Glift mark type (enum), returns the revelant SGF property string.
   * If no such mapping is found, returns null.
   *
   * Example: XMARK => MA
   *          FOO => null
   */
  markToProperty: function(mark)  {
    var allProps = glift.rules.prop;
    var markToPropertyMap = {
      LABEL_ALPHA: allProps.LB,
      LABEL_NUMERIC: allProps.LB,
      LABEL: allProps.LB,
      XMARK: allProps.MA,
      SQUARE: allProps.SQ,
      CIRCLE: allProps.CR,
      TRIANGLE: allProps.TR
    };
    return markToPropertyMap[mark] || null;
  },

  /**
   * Given a SGF property, returns the relevant SGF property. If no such mapping
   * is found, returns null.
   *
   * Example: MA => XMARK
   *          FOO => null.
   */
  propertyToMark: function(prop) {
    var marks = glift.enums.marks;
    var propertyToMarkMap = {
      LB: marks.LABEL,
      MA: marks.XMARK,
      SQ: marks.SQUARE,
      CR: marks.CIRCLE,
      TR: marks.TRIANGLE
    };
    return propertyToMarkMap[prop] || null;
  },

  /**
   * Converts an array of SGF points ('ab', 'bb') to Glift points ((0,1),
   * (1,1)).
   */
  allSgfCoordsToPoints: function(arr) {
    var out = [];
    if (!arr) {
      return out;
    }
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.util.pointFromSgfCoord(arr[i]));
    }
    return out;
  },

  /**
   * Convert label data to a simple object.
   */
  convertFromLabelData: function(data) {
    var parts = data.split(":"),
        pt = glift.util.pointFromSgfCoord(parts[0]),
        value = parts[1];
    return {point: pt, value: value};
  },

  convertFromLabelArray: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.convertFromLabelData(arr[i]));
    }
    return out;
  }
};

goog.provide('glift.parse');

/**
 * Glift parsing
 */
glift.parse = {
  /**
   * Parse types
   * @enum {string}
   */
  parseType: {
    /** FF4 Parse Type */
    SGF: 'SGF',
    /** Tygem .gib files. */
    TYGEM: 'TYGEM',
    /** 
     * Really, this is FF3.
     * TODO(kashomon): Support FF3 as first class citizen
     */
    PANDANET: 'PANDANET'
  },

  /**
   * Parse a Go-format format from a string.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {string} filename Name of the file from which the contents came.
   * @return {!glift.rules.MoveTree}
   */
  fromFileName: function(str, filename) {
    var parseType = glift.parse.parseType;
    var ttype = parseType.SGF;
    if (filename.indexOf('.sgf') > -1) {
      if (str.indexOf('PANDANET') > -1) {
        ttype = parseType.PANDANET;
      } else {
        ttype = parseType.SGF;
      }
    } else if (filename.indexOf('.gib') > -1) {
      ttype = parseType.TYGEM;
    }
    return glift.parse.fromString(str, ttype);
  },

  /**
   * Transforms a stringified game-file into a movetree.
   *
   * @param {string} str Raw contents that need to be parsed.
   * @param {glift.parse.parseType=} opt_ttype The parse type.
   * @return {!glift.rules.MoveTree}
   */
  fromString: function(str, opt_ttype) {
    var ttype = opt_ttype || glift.parse.parseType.SGF;
    var methodName = glift.enums.toCamelCase(ttype);
    var func = glift.parse[methodName];
    var movetree = func(str);
    return glift.rules.movetree.initRootProperties(movetree);
  }
};

/**
 * Parse a pandanet SGF.  Pandanet SGFs, are the same as normal SGFs except that
 * they contain invalid SGF properties.
 */
// TODO(kashomon): Delete and fold into SGF parsing. this is really a special
// case of FF3, which should be supported by Glift.
glift.parse.pandanet = function(string) {
  var replaceRegex = /CoPyright\[[^\]]*\]/;
  var repl = string.replace(replaceRegex, '');
  return glift.parse.sgf(repl);
};

/**
 * Metadata Start and End tags allow us to insert metadata directly, as
 * JSON, into SGF comments.  It will not be display by glift (although it
 * will by other editors, of course). It's primary use is as an API for
 * embedding tertiary data.
 *
 * It is currently expected that this property is attached to the root node.
 *
 * Some other notes:
 *  - Metadata extraction happens in the parser.
 *  - If the metadataProperty field is set, it will grab all the data from
 *  the relevant property and try to convert it to JSON.
 *
 * To disable this behavior, set metadataProperty to null.
 *
 * api:experimental
 */
glift.parse.sgfMetadataProperty = 'GC';


/**
 * The new Glift SGF parser!
 * Takes a string, returns a movetree.  Easy =).
 *
 * Note: Because SGFs have notoriously bad data / properties, we log warnings
 * for unknown properties rather than throwing errors.
 *
 * @param {string} sgfString
 * @return {!glift.rules.MoveTree}
 */
glift.parse.sgf = function(sgfString) {
  var states = {
    BEGINNING_BEFORE_PAREN: 0,
    BEGINNING: 1,
    PROPERTY: 2, // e.g., 'AB[oe]' or 'A_B[oe]' or 'AB_[oe]'
    PROP_DATA: 3, // 'AB[o_e]'
    BETWEEN: 4, // 'AB[oe]_', '_AB[oe]'
    FINISHED_SGF: 5
  };
  var statesToString = {
    0: 'BEGINNING_BEFORE_PAREN',
    1: 'BEGINNING',
    2: 'PROPERTY',
    3: 'PROP_DATA',
    4: 'BETWEEN',
    5: 'FINISHED_SGF'
  };
  var syn = {
    LBRACE:  '[',
    RBRACE:  ']',
    LPAREN:  '(',
    RPAREN:  ')',
    SCOLON:  ';'
  };

  var wsRegex = /\s|\n/;
  var propRegex = /[A-Z]/;

  var curstate = states.BEGINNING_BEFORE_PAREN;
  var movetree = glift.rules.movetree.getInstance();
  var charBuffer = []; // List of characters.
  var propData = []; // List of Strings.
  var branchMoveNums = []; // used for when we pop up.
  var curProp = '';
  var curchar = '';
  var lineNum = 0;
  var colNum = 0;
  // We track how many parens we've seen, so we know when we've finished the
  // SGF.
  var parenDepth = 0;

  var perror = function(msg) {
    glift.parse.sgfParseError(lineNum, colNum, curchar, msg, false /* iswarn */);
  };

  var pwarn = function(msg) {
    glift.parse.sgfParseError(lineNum, colNum, curchar, msg, true /* iswarn */);
  };

  var flushCharBuffer = function() {
    var strOut = charBuffer.join("");
    charBuffer = [];
    return strOut;
  };


  /** Flush the property data to the movetree's properties. */
  var flushPropDataIfNecessary = function() {
    if (curProp.length > 0) {
      if (glift.parse.sgfMetadataProperty &&
          curProp === glift.parse.sgfMetadataProperty &&
          !movetree.node().getParent()) {
        try {
          var pdata = propData[0].replace(/\\]/g, ']');
          var mdata = JSON.parse(pdata);
          if (glift.util.typeOf(mdata) === 'object') {
            movetree.setMetdata(/** @type {Object} */ (mdata));
          }
        } catch (e) {
          glift.util.logz('For property: ' + curProp + ' unable to parse ' +
              ': ' + propData + ' as JSON for SGF metadata');
        }
      }
      movetree.properties().add(curProp, propData);
      propData = [];
      curProp = '';
    }
  };

  // Run everything inside an anonymous function so we can use 'return' as a
  // fullstop break.
  (function() {
    for (var i = 0; i < sgfString.length; i++) {
      colNum++; // This means that columns are 1 indexed.
      curchar = sgfString.charAt(i);

      if (curchar === "\n" ) {
        lineNum++;
        colNum = 0;
        if (curstate !== states.PROP_DATA) {
          continue;
        }
      }

      switch (curstate) {
        case states.BEGINNING_BEFORE_PAREN:
          if (curchar === syn.LPAREN) {
            branchMoveNums.push(movetree.node().getNodeNum()); // Should Be 0.
            parenDepth++;
            curstate = states.BEGINNING;
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror('Unexpected character. ' +
              'Expected first non-whitespace char to be [(]');
          }
          break;
        case states.BEGINNING:
          if (curchar === syn.SCOLON) {
            curstate = states.BETWEEN; // The SGF Begins!
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror('Unexpected character. Expected char to be [;]');
          }
          break;
        case states.PROPERTY:
          if (propRegex.test(curchar)) {
            charBuffer.push(curchar);
            // In the SGF Specification, SGF properties can be of arbitrary
            // lengths, even though all standard SGF properties are 1-2 chars.
          } else if (curchar === syn.LBRACE) {
            curProp = flushCharBuffer();
            if (glift.rules.prop[curProp] === undefined) {
              pwarn('Unknown property: ' + curProp);
            }
            curstate = states.PROP_DATA;
          } else if (wsRegex.test(curchar)) {
            // Should whitespace be allowed here?
            perror('Unexpected whitespace in property name')
          } else {
            perror('Unexpected character in property name');
          }
          break;
        case states.PROP_DATA:
          if (curchar === syn.RBRACE
              && charBuffer[charBuffer.length - 1] === '\\') {
            charBuffer.push(curchar);
          } else if (curchar === syn.RBRACE) {
            propData.push(flushCharBuffer());
            curstate = states.BETWEEN;
          } else {
            charBuffer.push(curchar);
          }
          break;
        case states.BETWEEN:
          if (propRegex.test(curchar)) {
            flushPropDataIfNecessary();
            charBuffer.push(curchar);
            curstate = states.PROPERTY;
          } else if (curchar === syn.LBRACE) {
            if (curProp.length > 0) {
              curstate = states.PROP_DATA; // more data to process
            } else {
              perror('Unexpected token.  Orphan property data.');
            }
          } else if (curchar === syn.LPAREN) {
            parenDepth++;
            flushPropDataIfNecessary();
            branchMoveNums.push(movetree.node().getNodeNum());
          } else if (curchar === syn.RPAREN) {
            parenDepth--;
            flushPropDataIfNecessary();
            if (branchMoveNums.length === 0) {
              while (movetree.node().getNodeNum() !== 0) {
                movetree.moveUp();
              }
              return movetree;
            }
            var parentBranchNum = branchMoveNums.pop();
            while (movetree.node().getNodeNum() !== parentBranchNum) {
              movetree.moveUp();
            }
            if (parenDepth === 0) {
              // We've finished the SGF.
              curstate = states.FINISHED_SGF;
            }
          } else if (curchar === syn.SCOLON) {
            flushPropDataIfNecessary();
            movetree.addNode();
          } else if (wsRegex.test(curchar)) {
            // Do nothing.  Whitespace can be ignored here.
          } else {
            perror('Unknown token');
          }
          break;
        case states.FINISHED_SGF:
          if (wsRegex.test(curchar)) {
            // Do nothing.  Whitespace can be ignored here.
          } else {
            pwarn('Garbage after finishing the SGF.');
          }
          break;
        default:
          perror('Fatal Error: Unknown State!'); // Shouldn't get here.
      }
    }
    if (movetree.node().getNodeNum() !== 0) {
      perror('Expected to end up at start.');
    }
  })();
  return movetree;
};

/**
 * Throw a parser error or log a parse warning.  The message is optional.
 * @param {number} lineNum
 * @param {number} colNum
 * @param {string} curchar
 * @param {string} message
 * @param {boolean} isWarning
 */
glift.parse.sgfParseError = function(lineNum, colNum, curchar, message, isWarning) {
  var header = 'SGF Parsing ' + (isWarning ? 'Warning' : 'Error');
  var err = header + ': At line [' + lineNum + '], column [' + colNum
      + '], char [' + curchar + '], ' + message;
  if (isWarning) {
    glift.util.logz(err);
  } else {
    throw new Error(err);
  }
};

/**
 * The GIB format (i.e., Tygem's file format) is not public, so it's rather
 * difficult to know if this is truly an accurate parser. Oh well.
 *
 * Also, it's a horrible format. Also, this is a pretty hacky parser.
 *
 * @param {string} gibString
 * @retutrn {!glift.rules.MoveTree}
 */
glift.parse.tygem = function(gibString) {
  var states = {
    HEADER: 1,
    BODY: 2
  };
  var colorToToken = { 1: 'B', 2: 'W' };

  var WHITE_NAME = 'GAMEWHITENAME';
  var BLACK_NAME = 'GAMEBLACKNAME';
  var KOMI = 'GAMECONDITION';

  var movetree = glift.rules.movetree.getInstance();
  var lines = gibString.split('\n');

  var grabHeaderProp = function(name, line, prop, mt) {
    line = line.substring(
        line.indexOf(name) + name.length + 1, line.length - 2);
    if (/\\$/.test(line)) {
      // This is a horrible hack. Sometimes \ appears as the last character
      line = line.substring(0, line.length - 1);
    }
    mt.properties().add(prop, line);
  };

  var curstate = states.HEADER;
  for (var i = 0, len = lines.length; i < len; i++) {
    var str = lines[i];
    var firstTwo = str.substring(0,2);
    if (firstTwo === '\\[') {
      // We're in the header.
      var eqIdx = str.indexOf('=');
      var type = str.substring(2, eqIdx);
      if (type === WHITE_NAME) {
        grabHeaderProp(WHITE_NAME, str, 'PW', movetree);
      } else if (type === BLACK_NAME) {
        grabHeaderProp(BLACK_NAME, str, 'PB', movetree);
      }
    } else if (firstTwo === 'ST') {
      if (curstate !== states.BODY) {
        // We're in stone-placing land and out of the header.
        curstate = states.BODY
      }

      // Stone lines look like:
      //     ? MoveNumber Color (1=B,2=W) x y
      // STO 0 2          2               15 15
      //
      // Note that the board is indexed from the bottom left rather than from
      // the upper left, as with SGFs. Also, the intersections are 0-indexed.
      var splat = str.split(" ");
      var colorToken = colorToToken[splat[3]];
      var x = parseInt(splat[4], 10);
      var y = parseInt(splat[5], 10);
      movetree.addNode().properties().add(
          colorToken, glift.util.point(x, y).toSgfCoord());
    }
  }
  return movetree.getTreeFromRoot();
};

goog.provide('glift.controllers');

/*
 * The controllers logical parts (the Brains!) of a Go board widget.  You can
 * use the movetree and rules directly, but it's usually easier to use the
 * controller layer to abstract dealing with the rules.  It's especially useful
 * for testing logic as distinct from UI changes.
 */
glift.controllers = {};

goog.provide('glift.controllers.BaseController');
goog.provide('glift.controllers.ControllerFunc');

/**
 * A controller function which indicates how to consturct a BaseController.
 *
 * @typedef {function(glift.api.SgfOptions):glift.controllers.BaseController}
 */
glift.controllers.ControllerFunc;

/**
 * Creates a base controller implementation.
 *
 * @return {!glift.controllers.BaseController}
 */
glift.controllers.base = function() {
  return new glift.controllers.BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, an abstract
 * base implementation for interacting with SGFs.  Typically, those objects
 * extending this base class will implement addStone and [optionally]
 * extraOptions.
 *
 * @constructor
 */
glift.controllers.BaseController = function() {
  /** @package {string} */
  this.sgfString = '';

  /**
   * The raw initial position.
   * @package {string|!Array<number>}
   */
  this.rawInitialPosition = [];

  /**
   * The raw next moves path. Used only for examples (see the Game Figure).
   * Indicates how to create move numbers.
   * @package {!string|!Array<number>}
   */
  this.rawNextMovesPath = [];
  /**
   * Used only for problem-types.
   * @package {!glift.rules.ProblemConditions}
   */
  this.problemConditions = {};

  /** @package {glift.parse.parseType} */
  this.parseType = glift.parse.parseType.SGF;

  /**
   * The treepath representing the pth to the current position.
   * @package {glift.rules.Treepath}
   */
  this.treepath = [];

  /**
   * The full tree of moves constructed from the SGF.
   * @package {!glift.rules.MoveTree}
   */
  // Here we create a dummy movetree to ensure that the movetree is always
  // initialized.
  this.movetree = glift.rules.movetree.getInstance();

  /**
   * The Goban representing the current state of the board. Here, we construct a
   * dummy Goban to ensure that the goban is non-nullable.
   * @package {!glift.rules.Goban} goban
   */
  this.goban = glift.rules.goban.getInstance(1);

  /**
   * The history of the captures so we can go backwards in time.
   * @package {!Array<!glift.rules.CaptureResult>}
   */
  this.captureHistory = [];

  /**
   * Enum indicating the show-variations preference
   * @private {glift.enums.showVariations|undefined}
   */
  this.showVariations_ = undefined;

  /**
   * Boolean indicating whether or not to mark the last move.
   * @private {boolean}
   */
  this.markLastMove_ = false;
};

glift.controllers.BaseController.prototype = {
  /**
   * Initialize both the options and the controller's children data structures.
   *
   * Note that these options should be protected by the options parsing (see
   * options.js in this same directory).  Thus, no special checks are made here.
   *
   * @param {!glift.api.SgfOptions} sgfOptions Object containing SGF options.
   */
  initOptions: function(sgfOptions) {
    if (sgfOptions === undefined) {
      throw 'Options is undefined!  Can\'t create controller'
    }
    this.sgfString = sgfOptions.sgfString || '';
    this.rawNextMovesPath = sgfOptions.nextMovesPath || [];
    this.rawInitialPosition = sgfOptions.initialPosition || [];

    this.parseType = sgfOptions.parseType || glift.parse.parseType.SGF;
    this.problemConditions = sgfOptions.problemConditions || {};

    // A controller may not be the best place for these next few, since they're
    // display only; However, this is currenly the best place to put these since
    // the controller is in charge of creating the flattened representation.
    this.showVariations_ = sgfOptions.showVariations || undefined;
    this.markLastMove_ = sgfOptions.markLastMove || false;

    this.initialize();
    return this;
  },

  /**
   * Initialize the:
   *  - initPosition -- Description of where to start.
   *  - treepath -- The path to the current position.  An array of variaton
   *    numbers.
   *  - movetree -- Tree of move nodes from the SGF.
   *  - goban -- Data structure describing the go board.  Really, the goban is
   *    useful for telling you where stones can be placed, and (after placing)
   *    what stones were captured.
   *  - capture history -- The history of the captures.
   *
   * @param {string=} opt_treepath Because we may want to reinitialize the
   *    GoBoard, we optionally pass in the treepath from the beginning and use
   *    that instead of the initialPosition treepath.
   */
  initialize: function(opt_treepath) {
    var rules = glift.rules;
    var initTreepath = opt_treepath || this.rawInitialPosition;
    this.treepath = rules.treepath.parsePath(initTreepath);

    // TODO(kashomon): Appending the nextmoves path is hack until the UI
    // supports passing using true flattened data representation.
    if (this.nextMovesPath) {
      this.treepath = this.treepath.concat(
          rules.treepath.parseFragment(this.nextMovesPath));
    }

    this.movetree = rules.movetree.getFromSgf(
        this.sgfString, this.treepath, this.parseType);

    var gobanData = rules.goban.getFromMoveTree(
        /** @type {!glift.rules.MoveTree} */ (this.movetree), this.treepath);

    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
    this.extraOptions(); // Overridden by implementers
    return this;
  },

  /**
   * It's expected that this will be implemented by those extending this base
   * class.  This is called during initOptions above.
   * @param {glift.api.SgfOptions=} opt_options
   */
  extraOptions: function(opt_options) { /* Implemented by other controllers. */ },

  /**
   * Add a stone.  This is intended to be overwritten.
   *
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {?glift.flattener.Flattened} The flattened representation.
   */
  addStone: function(point, color) { throw "Not Implemented"; },

  /**
   * Creates a flattener state.
   * @return {!glift.flattener.Flattened}
   */
  flattenedState: function() {
    var newFlat = glift.flattener.flatten(this.movetree, {
      goban: this.goban,
      showNextVariationsType: this.showVariations_,
      markLastMove: this.markLastMove_,
    });
    return newFlat;
  },

  /**
   * Applies captures and increments the move number
   *
   * Captures is expected to have the form
   *
   * {
   *  WHITE: []
   *  BLACK: []
   * }
   */
  // TODO(kashomon): Maybe this shouldn't increment move number?
  recordCaptures: function(captures) {
    this.captureHistory.push(captures)
    return this;
  },

  /**
   * Get the current move number.
   * @return {number}
   */
  currentMoveNumber: function() {
    return this.movetree.node().getNodeNum();
  },

  /**
   * Gets the variation number of the next move. This will be something different
   * if we've used setNextVariation or if we've already played into a variation.
   * Otherwise, it will be 0.
   *
   * @return {number}
   */
  nextVariationNumber: function() {
    return this.treepath[this.currentMoveNumber()] || 0;
  },

  /**
   * Sets what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   *
   * @param {number} num
   * @return {!glift.controllers.BaseController} this
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber());
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /**
   * Gets the treepath to the current position.
   * @return {!glift.rules.Treepath}.
   */
  pathToCurrentPosition: function() {
    return this.movetree.treepathToHere();
  },

  /**
   * Gets the game info key-value pairs. This consists of global data about the
   * game, such as the names of the players, the result of the game, the
   * name of the tournament, etc.
   * @return {!Array<!glift.rules.PropDescriptor>}
   */
  getGameInfo: function() {
    return this.movetree.getTreeFromRoot().properties().getGameInfo();
  },

  /**
   * Get the captures that occured for the current move.
   *
   * @return {!glift.rules.CaptureResult}
   */
  getCaptures: function() {
    if (this.captureHistory.length === 0) {
      return { BLACK: [], WHITE: [] };
    }
    return this.captureHistory[this.currentMoveNumber() - 1];
  },

  /**
   * Get the captures count. Returns an object of the form
   *  {
   *    BLACK: <number>
   *    WHITE: <number>
   *  }
   * @return {{
   *  BLACK: number,
   *  WHITE: number
   * }}
   */
  // TODO(kashomon): Add tests
  getCaptureCount: function() {
    var countObj = { BLACK: 0, WHITE: 0 };
    for (var i = 0; i < this.captureHistory.length; i++ ) {
      var obj = this.captureHistory[i];
      for (var color in obj) {
        countObj[color] += obj[color].length;
      }
    }
    return countObj;
  },

  /**
   * Return true if a Stone can (probably) be added to the board and false
   * otherwise.
   *
   * Note, this method isn't always totally accurate. This method must be very
   * fast since it's expected that this will be used for hover events.
   *
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {boolean}
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point);
  },

  /**
   * Returns a State (either BLACK or WHITE). Needs to be fast since it's used
   * to display the hover-color in the display.
   *
   * This will be undefined until initialize is called, so the clients of the
   * controller must make sure to always initialize the board position
   * first.
   *
   * @return {!glift.enums.states}
   */
  getCurrentPlayer: function() {
    return this.movetree.getCurrentPlayer();
  },

  /** @return {string} The current SGF string. */
  currentSgf: function() {
    return this.movetree.toSgf();
  },

  /** @return {string} The original SGF string. */
  originalSgf: function() {
    return this.sgfString;
  },

  /** @return {number} Returns the number of intersections. */
  getIntersections: function() {
    return this.movetree.getIntersections();
  },

  /**
   * Get the recommended quad-cropping for the bove tree. This is a display
   * consideration, but the knowledge of how to crop is dependent on the
   * movetree, so this method needs to live on the controller.
   *
   * @return {glift.enums.boardRegions} The recommend board region to use.
   */
  getQuadCropFromBeginning: function() {
    return glift.orientation.getQuadCropFromMovetree(
        /** @type {!glift.rules.MoveTree} */ (this.movetree));
  },

  /**
   * Gets the set of correct next moves. This should only apply to problem-based
   * widgets
   *
   * @return {!Array<!glift.rules.Move>}
   */
  getCorrectNextMoves: function() {
    return glift.rules.problems.correctNextMoves(
        /** @type {!glift.rules.MoveTree} */ (this.movetree),
        this.problemConditions);
  },

  /**
   * Get the Next move in the game.  If the player has already traversed a path,
   * then we follow this previous path.
   *
   * If varNum is undefined, we try to 'guess' the next move based on the
   * contents of the treepath.
   *
   * Proceed to the next move.  This is slightly trickier than you might
   * imagine:
   *   - We need to either add to the Movetree or, if the movetree is readonly,
   *   we need to make sure the move exists.
   *   - We need to update the Goban.
   *   - We need to store the captures.
   *   - We need to update the current move number.
   *
   * @param {number=} opt_varNum
   *
   * @return {?glift.flattener.Flattened} The flattened representation or null
   *    if there is no next move.
   */
  nextMove: function(opt_varNum) {
    if (this.treepath[this.currentMoveNumber()] !== undefined &&
        (opt_varNum === undefined || this.nextVariationNumber() === opt_varNum)) {
      // Don't mess with the treepath, if we're 'on variation'.
      this.movetree.moveDown(this.nextVariationNumber());
    } else {
      var varNum = opt_varNum === undefined ? 0 : opt_varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        return null; // No moves available
      }
    }
    var captures = this.goban.loadStonesFromMovetree(this.movetree)
    this.recordCaptures(captures);
    return this.flattenedState();
  },

  /**
   * Go back a move.
   * @return {?glift.flattener.Flattened} The flattened representation or null
   *    if there is no previous move.
   */
  prevMove: function() {
    if (this.currentMoveNumber() === 0) {
      return null;
    }
    var captures = this.getCaptures();
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber() - 1);
    this.unloadStonesFromGoban_(allCurrentStones, captures);
    this.movetree.moveUp();
    return this.flattenedState();
  },

  /**
   * Go back to the beginning.
   * @return {!glift.flattener.Flattened} The flattened representation.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    return this.flattenedState();
  },

  /**
   * Go to the end.
   * @return {!glift.flattener.Flattened} The flattened representation
   */
  toEnd: function() {
    while (this.nextMove()) {
      // All the action happens in nextMoveNoState.
    }
    return this.flattenedState();
  },

  /////////////////////
  // Private Methods //
  /////////////////////

  /**
   * Back out a movetree addition (used for going back a move).
   *
   * Recall that stones and captures both have the form:
   *  { BLACK: [..move..], WHITE: [..move..] };
   *
   * @param {!glift.rules.MoveCollection} stones
   * @param {!glift.rules.CaptureResult} captures
   *
   * @private
   */
  // TODO(kashomon): Add testing for this.
  unloadStonesFromGoban_: function(stones, captures) {
    for (var color in stones) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.rules.Move>} */ (stones[c]);
      for (var j = 0; j < arr.length; j++) {
        var move = arr[j];
        if (move.point) {
          this.goban.clearStone(move.point);
        }
      }
    }
    for (var color in captures) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.Point>} */ (captures[c]);
      for (var i = 0; i < arr.length; i++) {
        this.goban.addStone(arr[i], c);
      }
    }
  },
};

goog.provide('glift.controllers.BoardEditor');

goog.require('glift.controllers.BaseController');

/**
 * Creates a BoardEditor controller.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.boardEditor = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  glift.util.setMethods(baseController, ctrl.BoardEditor.prototype);
  baseController.initOptions(sgfOptions);
  return baseController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 */
glift.controllers.BoardEditor = function() {
};

glift.controllers.BoardEditor.prototype = {
  /**
   * Called during initialization, after the goban/movetree have been
   * initializied.
   */
  extraOptions: function() {
    // _initLabelTrackers creates:
    //
    // this._alphaLabels: An array of available alphabetic labels.
    // this._numericLabels: An array of available numeric labels.
    // this._ptTolabelMap: A map from pt (string) to label.  This is so we can ensure
    // that there is only ever one label per point.
    this._initLabelTrackers();

    // Note: it's unnecessary to initialize the stones, since they are
    // initialized into the built-in initialize method.
  },

  /**
   * Initialize the label trackers.  Thus should be called after every move up
   * or down, so that the labels are synced with the current position.
   *
   * Specifically, initializes:
   * this._alphaLabels: An array of available alphabetic labels.
   * this._numericLabels: An array of available numeric labels (as numbers).
   * this._ptTolabelMap: A map from pt (string) to {label + optional data}.
   */
  _initLabelTrackers: function() {
    var prop = glift.rules.prop;
    var marks = glift.enums.marks;
    var numericLabelMap = {}; // number-string to 'true'
    var alphaLabelMap = {}; // alphabetic label to 'true'
    this._ptTolabelMap = {}; // pt string to {label + optional data}
    for (var i = 0; i < 100; i++) {
      numericLabelMap[(i + 1)] = true;
    }
    for (var i = 0; i < 26; i++) {
      var label = '' + String.fromCharCode('A'.charCodeAt(0) + i);
      alphaLabelMap[label] = true;
    }

    var marksToExamine = [
      marks.CIRCLE,
      marks.LABEL,
      marks.SQUARE,
      marks.TRIANGLE,
      marks.XMARK
    ];
    var alphaRegex = /^[A-Z]$/;
    var digitRegex = /^\d*$/;

    for (var i = 0; i < marksToExamine.length; i++) {
      var curMark = marksToExamine[i];
      var sgfProp = glift.sgf.markToProperty(curMark);
      var mtLabels = this.movetree.properties().getAllValues(sgfProp);
      if (mtLabels) {
        for (var j = 0; j < mtLabels.length; j++) {
          var splat = mtLabels[j].split(':');
          var markData = { mark: curMark };
          var lbl = null;
          if (splat.length > 1) {
            lbl = splat[1];
            markData.data = lbl;
            if (alphaRegex.test(lbl)) {
              markData.mark = marks.LABEL_ALPHA;
            } else if (digitRegex.test(lbl)) {
              lbl = parseInt(lbl, 10);
              markData.mark = marks.LABEL_NUMERIC;
            }
          }
          var pt = glift.util.pointFromSgfCoord(splat[0]);
          this._ptTolabelMap[pt.toString()] = markData;
          if (numericLabelMap[lbl]) { delete numericLabelMap[lbl]; }
          if (alphaLabelMap[lbl]) { delete alphaLabelMap[lbl]; }
        }
      }
    }
    //
    this._alphaLabels = this._convertLabelMap(alphaLabelMap);
    this._numericLabels = this._convertLabelMap(numericLabelMap);
  },

  /**
   * Convert either the numericLabelMap or alphaLabelMap.  Recall that these are
   * maps from either number => true or alpha char => true, where the keys
   * represent unused labels.
   */
  _convertLabelMap: function(map) {
    var base = [];
    var digitRegex = /^\d+$/;
    for (var key in map) {
      if (digitRegex.test(key)) {
        base.push(parseInt(key, 10));
      } else {
        base.push(key);
      }
    }
    if (base.length > 0 && glift.util.typeOf(base[0]) === 'number') {
      base.sort(function(a, b) { return a - b });
      base.reverse();
    } else {
      base.sort().reverse();
    }
    return base;
  },

  /**
   * Retrieve the current alphabetic mark. Returns null if there are no more
   * labels available.
   */
  currentAlphaMark: function() {
    return this._alphaLabels.length > 0 ?
        this._alphaLabels[this._alphaLabels.length - 1] : null;
  },

  /** Retrieve the current numeric mark as a string. */
  currentNumericMark: function() {
    return this._numericLabels.length > 0 ?
        this._numericLabels[this._numericLabels.length - 1] + '': null;
  },

  /**
   * Get a mark if a mark exists at a point on the board. Returns
   *
   *  For a label:
   *    { mark:<markstring>, data:<label> }
   *  For a triangle, circle, square, or xmark:
   *    { mark:<markstring> }
   *  If there's no mark at the point:
   *    null
   */
  getMark: function(pt) {
    return this._ptTolabelMap[pt.toString()] || null;
  },

  /**
   * Use the current alpha mark (as a string). This removes the mark frome the
   * available alphabetic labels. Returns null if no mark is available.
   */
  _useCurrentAlphaMark: function() {
    var label = this._alphaLabels.pop();
    if (!label) { return null; }
    return label;
  },

  /**
   * Use the current numeric mark (as a string). This removes the mark from the
   * available numeric labels. Returns null if no mark is available.
   */
  _useCurrentNumericMark: function() {
    var label = this._numericLabels.pop() + ''; // Ensure a string.
    if (!label) { return null; }
    return label;
  },

  /**
   * Determine whether a mark is supported for adding. As you would expect,
   * returns true or false in the obvious way.
   */
  isSupportedMark: function(mark) {
    var supportedMap = {
      LABEL_ALPHA: true,
      LABEL_NUMERIC: true,
      SQUARE: true,
      TRIANGLE: true
    };
    return supportedMap[mark] || false;
  },

  /**
   * Add a mark to the Go board.
   */
  addMark: function(point, mark) {
    var marks = glift.enums.marks;
    var curProps = this.movetree.node().properties();
    if (!this.isSupportedMark(mark)) { return null; }

    // Remove the mark instead, since the point already has a mark.
    if (this.getMark(point)) { return this.removeMark(point); }

    var markData = { mark: mark };
    var data = null;
    if (mark === marks.LABEL_NUMERIC) {
      data = this._useCurrentNumericMark();
      markData.data = data;
    } else if (mark === marks.LABEL_ALPHA) {
      data = this._useCurrentAlphaMark();
      markData.data = data;
    }

    var prop = glift.sgf.markToProperty(mark);
    if (data && mark) {
      curProps.add(prop, point.toSgfCoord() + ':' + data);
    } else if (mark) {
      curProps.add(prop, point.toSgfCoord());
    }
    this._ptTolabelMap[point.toString()] = markData;
    return this.flattenedState();
  },

  /** Remove a mark from the board. */
  removeMark: function(point) {
    var marks = glift.enums.marks;
    var markData = this.getMark(point);
    if (!markData) { return null; }

    delete this._ptTolabelMap[point.toString()];
    var sgfProp = glift.sgf.markToProperty(markData.mark);
    if (markData.mark === marks.LABEL_NUMERIC) {
      this._numericLabels.push(parseInt(markData.data, 10));
      this._numericLabels.sort(function(a, b) { return a - b }).reverse();
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord() + ':' + markData.data);
    } else if (markData.mark === marks.LABEL_ALPHA) {
      this._alphaLabels.push(markData.data);
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord() + ':' + markData.data);
      this._alphaLabels.sort().reverse();
    } else {
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord());
    }
    return this.flattenedState();
  },

  /**
   * Add a stone.
   *
   * Returns: partial data to apply
   */
  addStone: function(point, color) {
    if (!this.canAddStone(point, color)) {
      return null;
    }

    // TODO(kashomon): Use the addResult
    var addResult = this.goban.addStone(point, color);

    this.movetree.addNode();
    this.movetree.properties().add(
        glift.sgf.colorToToken(color),
        point.toSgfCoord());
    return this.flattenedState();
  },

  /**
   * Add a stone placement.  These are properties indicated by AW and AB.  They
   * do not indicate a change in move number.
   */
  addPlacement: function(point, color) {
    var prop = glift.sgf.colorToPlacement(color);
    var oppColor = glift.util.colors.oppositeColor(color);
    var oppProp = glift.sgf.colorToPlacement(oppColor);
    var result = this.goban.addStone(point, color);
    if (result.successful) {
      this.movetree.properties().add(prop, point.toSgfCoord());
      for (var i = 0; i < result.captures.length; i++) {
        this.movetree.properties().removeOneValue(
            oppProp, result.captures[i].toSgfCoord());
      }
      var captures = {};
      captures[oppColor] = result.captures;
      return glift.bridge.intersections.nextBoardData(
          this.movetree, captures);
    }
    return this.flattenedState();
  },

  pass: function() { throw new Error('Not implemented'); },
  clearStone: function() { throw new Error('Not implemented'); }
};

goog.provide('glift.controllers.GameFigure');
goog.provide('glift.controllers.gameFigure');

goog.require('glift.controllers.BaseController');

/**
 * A GameFigure encapsulates the idea of a read-only SGF.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.gameFigure = function(sgfOptions) {
  var baseController = glift.util.beget(
      glift.controllers.base());
  var newController = glift.util.setMethods(baseController,
      glift.controllers.GameFigure.prototype);
  newController.initOptions(sgfOptions);
  return newController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 * @final
 */
glift.controllers.GameFigure = function() {
};

glift.controllers.GameFigure.prototype = {
  /**
   * Additional setup for the gamefigure.
   * @override
   */
  extraOptions: function() {
    // TODO(kashomon): Add this back in once the Flattener is the source of
    // truth for the UI.

    // var rules = glift.rules;
    // var initTreepath = treepath || this.initialPosition;
    // this.treepath = rules.treepath.parsePath(initTreepath);

    // var initialPosition = this.treepath.length; // used later
    // var nextTreepath = this.drawTo - this.treepath.length;
    // if (this.nextMovesPath.length > 0) {
      // nextTreepath = this.nextMovesPath;
    // }
    // nextTreepath = rules.treepath.parsePath(nextTreepath);
    // this.treepath = this.treepath.concat(nextTreepath);

    // this.movetree = rules.movetree.getFromSgf(
        // this.sgfString,
        // this.treepath,
        // this.parseType);
    // var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    // this.goban = gobanData.goban;

    // this.captureHistory = gobanData.captures;

    // // calculate marks, by going backwards through the movetree
    // var curnode = this.movetree.node();
    // var labels = [];
    // for (var i = this.treepath.length; i > initialPosition; i--) {
      // labels.push(curnode.getIntersection() + ":" + i);
      // curnode = curnode.getParent();
    // }

    // // add marks
    // var prop = glift.rules.prop;
    // this.movetree.properties().add(prop.LB, labels);
  }
};

/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.gameViewer = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  var newController = glift.util.setMethods(baseController,
      ctrl.GameViewerMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.GameViewerMethods = {
  /**
   * Called during initOptions, in the BaseController.
   *
   * This creates a treepath (a persisted treepath) and an index into the
   * treepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function() {},

  /**
   * Find the variation associated with the played move.
   *
   * Returns null if the addStone operation isn't possible.
   */
  addStone: function(point, color) {
    var possibleMap = this._possibleNextMoves();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return null;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
  },

  /**
   * Go back to the previous branch or comment.
   *
   * If maxMovesPrevious is defined, then we cap the number of moves at
   * maxMovesPrevious. Otherwise, we keep going until we hit the beginning of
   * the game.
   *
   * Returns null in the case that we're at the root already.
   */
  previousCommentOrBranch: function(maxMovesPrevious) {
    var displayDataList = []; // TODO(kashomon): Merge this together?
    var displayData = null;
    var movesSeen = 0;
    do {
      displayData = this.prevMove();
      var comment = this.movetree.properties().getOneValue('C');
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesPrevious && movesSeen === maxMovesPrevious) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1);
    // It's more expected to reset the 'next' variation to zero.
    this.setNextVariation(0);
    return this.flattenedState();
  },

  /**
   * Go to the next branch or comment.
   *
   * If maxMovesNext is defined, then we cap the number of moves at
   * maxMovesNext. Otherwise, we keep going until we hit the beginning of
   * the game.
   *
   * Returns null in the case that we're at the root already.
   */
  nextCommentOrBranch: function(maxMovesNext) {
    var displayData = null;
    var movesSeen = 0;
    do {
      displayData = this.nextMove();
      var comment = this.movetree.properties().getOneValue('C');
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesNext && movesSeen === maxMovesNext) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1); 
    return this.flattenedState();
  },

  /**
   * Move up what variation will be next retrieved.
   */
  moveUpVariations: function() {
    return this.setNextVariation((this.nextVariationNumber() + 1)
        % this.movetree.node().numChildren());
  },

  /**
   * Move down  what variation will be next retrieved.
   */
  moveDownVariations: function() {
    // Module is defined incorrectly for negative numbers.  So, we need to add n
    // to the result.
    return this.setNextVariation((this.nextVariationNumber() - 1 +
        + this.movetree.node().numChildren())
        % this.movetree.node().numChildren());
  },

  /**
   * Get the possible next moves.  Used to verify that a click is actually
   * reasonable.
   *
   * Implemented as a map from point-string+color to variationNumber:
   *  e.g., pt-BLACK : 1.  For pass, we use 'PASS' as the point string.  This is
   *  sort of a hack and should maybe be rethought.
   */
  _possibleNextMoves: function() {
    var possibleMap = {};
    var nextMoves = this.movetree.nextMoves();
    for (var i = 0; i < nextMoves.length; i++) {
      var move = nextMoves[i];
      var firstString = move.point !== undefined
          ? move.point.toString() : 'PASS'
      var key = firstString + '-' + (move.color);
      possibleMap[key] = i;
    }
    return possibleMap;
  }
};

goog.provide('glift.controllers.StaticProblem');

goog.require('glift.controllers.BaseController');

/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.staticProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  glift.util.setMethods(baseController, glift.controllers.StaticProblem.prototype);
  baseController.initOptions(sgfOptions);
  return baseController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 */
glift.controllers.StaticProblem = function() {
};

glift.controllers.StaticProblem.prototype = {
  /** Override extra options */
  extraOptions: function() {
    // Rebase the movetree, if we're not at the zeroth move
    if (this.movetree.node().getNodeNum() !== 0) {
      this.movetree = this.movetree.rebase();
      this.treepath = [];
      this.captureHistory = [];
      this.initialPosition = [];
      // It's a hack to reset the SGF string, but it's used by the problem
      // explanation button/widget.
      this.sgfString = this.movetree.toSgf();
      // Shouldn't need to reset the goban.
    }
  },

  /**
   * Reload the problems.
   *
   * TODO(kashomon): Remove this?  Or perhaps rename initialize() to load() or
   * reload() or something.
   */
  reload: function() {
    this.initialize();
  },

  /**
   * Add a stone to the board.  Since this is a problem, we check for
   * 'correctness', which we check whether all child nodes are labeled (in some
   * fashion) as correct.
   *
   * Note: color must be one of enums.states (either BLACK or WHITE).
   *
   * TODO(kashomon): Refactor this into something less ridiculous -- i.e.,
   * shorter and easier to understand.
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {!glift.flattener.Flattened} flattened obj
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults;
    var CORRECT = problemResults.CORRECT;
    var INCORRECT = problemResults.INCORRECT;
    var INDETERMINATE = problemResults.INDETERMINATE;
    var FAILURE = problemResults.FAILURE;

    if (!this.goban.placeable(point) ||
        !this.goban.testAddStone(point, color)) {
      var flattened = this.flattenedState();
      flattened.setProblemResult(FAILURE);
      return flattened
    }

    var nextVarNum = this.movetree.findNextMove(point, color);
    if (nextVarNum === null) {
      // There are no variations corresponding to the move made (i.e.,
      // nextVarNum is null), so we assume that the move is INCORRECT. However,
      // we still add the move down the movetree, adding a node if necessary.
      // This allows us to maintain a consistent state.
      this.movetree.addNode(); // add node and move down
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      this.movetree.moveUp();
      nextVarNum = this.movetree.node().numChildren() - 1;
    }

    var outData = this.nextMove(nextVarNum);
    var correctness = glift.rules.problems.isCorrectPosition(
        this.movetree, this.problemConditions);
    if (correctness === CORRECT) {
      // Don't play out variations for CORRECT>
      outData.setProblemResult(correctness);
      return outData;
    } else if (correctness === CORRECT ||
        correctness === INCORRECT ||
        correctness === INDETERMINATE) {
      // Play for the opposite player. Variation selection used to be random,
      // but randomness is confusing.
      var nextVariation = 0;
      this.nextMove(nextVariation);
      // We return the entire board state because we've just moved two moves.
      // In theory, we could combine the output of the next moves, but it's a
      // little tricky and it doesn't seem to be worth the effort at the moment.
      outData = this.flattenedState();
      outData.setProblemResult(correctness);
      return outData;
    }
    else {
      throw 'Unexpected result output: ' + correctness
    }
  },

  /** Get the current correctness status */
  correctnessStatus: function() {
    return glift.rules.problems.isCorrectPosition(
        this.movetree, this.problemConditions);
  }
};

goog.provide('glift.bridge');

/**
 * A bridge between the UI code and the data/logic code living in rules/widget.
 *
 * The bridge is the only place where display and core rules/widget code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion of the objects, see intersections.js in
   * glift.bridge.
   */
  setDisplayState: function(
      boardData, display, showVariations, markLastMove) {
    glift.util.majorPerfLog('Set display state');
    display.intersections().clearMarks();

    if (boardData.displayDataType === glift.enums.displayDataTypes.FULL) {
      display.intersections().clearAll();
    }
    for (var color in boardData.stones) {
      for (var i = 0; i < boardData.stones[color].length; i++) {
        var pt = boardData.stones[color][i];
        display.intersections().setStoneColor(pt, color);
      }
    }

    // Map from point-string to point.
    var variationMap = {};
    if (glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
      variationMap = glift.bridge.variationMapping(boardData.nextMoves);
    }

    // Map from point-string to true/false. This allows us to know whether or
    // not there's a mark at the particular location, which is in turn useful
    // for drawing the stone marker.
    var marksMap = {};

    var marks = glift.enums.marks;
    for (var markType in boardData.marks) {
      for (var i = 0; i < boardData.marks[markType].length; i++) {
        var markData = boardData.marks[markType][i];
        var markPt = markData.point ? markData.point : markData;
        var markPtString = markPt.toString();
        marksMap[markPtString] = true;
        if (markType === marks.LABEL) {
          if (variationMap[markPtString] &&
              glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
            // This is a variation label && we should show it
            var markValue = glift.bridge.markSelectedNext(
                boardData, markData.point, markData.value);
            display.intersections().addMarkPt(
                markData.point, marks.VARIATION_MARKER, markValue);
            delete variationMap[markPtString];
          } else {
            display.intersections().addMarkPt(
                markData.point, marks.LABEL, markData.value);
          }
        } else {
          display.intersections().addMarkPt(markData, markType);
        }
      }
    }

    var i = 1;
    var correctNextMap =
        glift.bridge.variationMapping(boardData.correctNextMoves);
    for (var ptstring in variationMap) {
      var pt = variationMap[ptstring];
      var markValue = glift.bridge.markSelectedNext(boardData, pt, i);
      if (pt in correctNextMap) {
        display.intersections().addMarkPt(pt, marks.CORRECT_VARIATION, markValue);
      } else {
        display.intersections().addMarkPt(pt, marks.VARIATION_MARKER, markValue);
      }
      i += 1;
    }

    if (boardData.lastMove && boardData.lastMove.point && markLastMove &&
        !marksMap[boardData.lastMove.point.toString()]) {
      var lm = boardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
    glift.util.majorPerfLog('Finish display state');
    // display.flush();
  },

  /** Mark the selected next move */
  markSelectedNext: function(boardData, pt, markValue) {
    if (boardData.selectedNextMove &&
        pt.equals(boardData.selectedNextMove.point)) {
      // Mark the 'selected' variation as active.
      markValue += '.';
      //'\u02D9';
      // -- some options
      // '\u02C8' => ˈ simple
      // '\u02D1' => ˑ kinda cool
      // '\u02D9' => ˙ dot above (actually goes to the right)
      // '\u00B4' => ´
      // '\u0332' => underline
    }
    return markValue;
  },

  /**
   * Logic for determining whether the next variations should be (automatically)
   * shown.
   */
  shouldShowNextMoves: function(boardData, showVariations) {
    return boardData.nextMoves &&
      ((boardData.nextMoves.length > 1 &&
          showVariations === glift.enums.showVariations.MORE_THAN_ONE) ||
      (boardData.nextMoves.length >= 1 &&
          showVariations === glift.enums.showVariations.ALWAYS));
  },

  /**
   * Make the next variations into in an object map.  This prevents us from
   * adding variations twice, which can happen if variations are automatically
   * shown and the SGF has explicit markings.  This happens quite frequently in
   * the case of game reviews.
   */
  variationMapping: function(variations) {
    var out = {};
    for (var i = 0; i < variations.length; i++) {
      var nextMove = variations[i];
      if (nextMove.point !== undefined) {
        out[nextMove.point.toString()] = nextMove.point;
      } else {
        // This is a 'pass'
      }
    }
    return out;
  }
};


goog.provide('glift.bridge.intersections');

/*
 * Intersection Data is the precise set of information necessary to display the
 * Go Board, which is to say, it is the set of stones and display information.
 *
 * The IntersectionData is just an object containing intersection information, of
 * the form:
 *
 *   {
 *     points: [
 *       pthash: {stone: "BLACK" , TRIANGLE: true, point: pt},
 *       pthash: {stone: "WHITE", point: pt},
 *       pthash: {LABEL: "A", point: pt}
 *     ],
 *     comment: "This is a good move",
 *   }
 * In the points array, each must object contain a point, and each should contain a
 * mark or a stone.  There can only be a maximum of one stone and one mark
 * (glift.enums.marks).
 */
glift.bridge.intersections = {
  propertiesToMarks: {
    CR: glift.enums.marks.CIRCLE,
    LB: glift.enums.marks.LABEL,
    MA: glift.enums.marks.XMARK,
    SQ: glift.enums.marks.SQUARE,
    TR: glift.enums.marks.TRIANGLE
  },

  /**
   * Returns property data -- everything minus the stone data.  The empty stone
   * data object is still supplied so that users can fill in the rest of the
   * data.
   *
   * Ex. of returned object:
   *  {
   *    stones: {
   *      WHITE: [],
   *      BLACK: [],
   *      EMPTY: [] // useful for clearing out captures
   *    },
   *    marks: {
   *      TRIANGLE: [pt, pt, ...],
   *      // It's unfortunate that labels need their own structure.
   *      LABEL: [{point:pt, value: 'val'}, ...]
   *    }
   *    comment : "foo",
   *    lastMove : { color: <color>, point: <point> }
   *    nextMoves : [ { color: <color>, point: <point> }, ...]
   *    correctNextMoves : [ {color: <color>, point: <point> }, ...]
   *    displayDataType : <Either PARTIAL or FULL>.  Defaults to partial.
   *  }
   *
   * @param {!glift.rules.MoveTree} movetree Glift movetree.
   * @param {!glift.rules.ProblemConditions=} opt_problemConditions Optional
   *    problem conditions.
   * @param {number=} opt_nextVarNumber Optional next variation number.
   */
  // TODO(kashomon): Make this a proper object constructor with accessors and
  // methods and whatnot.  It's getting far too complicated. Alternatively,
  // switch over to the flattener model.
  basePropertyData: function(movetree, opt_problemConditions, opt_nextVarNumber) {
    var out = {
      stones: {
        WHITE: [],
        BLACK: [],
        EMPTY: []
      },
      marks: {},
      comment: null,
      lastMove: null,
      nextMoves: [],
      selectedNextMove: null,
      correctNextMoves: [],
      captures: [],
      displayDataType: glift.enums.displayDataTypes.PARTIAL
    };
    out.comment = movetree.properties().getComment();
    out.lastMove = movetree.getLastMove();
    out.marks = glift.bridge.intersections.getCurrentMarks(movetree);
    out.nextMoves = movetree.nextMoves();
    out.selectedNextMove = opt_nextVarNumber ? out.nextMoves[opt_nextVarNumber] : null;
    out.correctNextMoves = opt_problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree,
            /** @type {!glift.rules.ProblemConditions} */ (opt_problemConditions))
        : [];
    return out;
  },

  /**
   * Extends the basePropertyData with stone data.
   */
  getFullBoardData: function(movetree, goban, problemConditions, nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions, nextVarNumber);
    baseData.displayDataType = glift.enums.displayDataTypes.FULL;
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      baseData.stones[stone.color].push(stone.point);
    }
    return baseData;
  },

  /**
   * CurrentCaptures is expected to look like:
   *
   * {
   *    BLACK: [..pts..],
   *    WHITE: [..pts..]
   * }
   *
   * @param {glift.rules.ProblemConditions=} opt_problemConditions Optional
   *    problem conditions.
   * @param {number=} opt_nextVarNumber Optional next var number.
   */
  nextBoardData: function(
      movetree, currentCaptures, opt_problemConditions, opt_nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, opt_problemConditions, opt_nextVarNumber);
    var allStones = movetree.properties().getAllStones();
    baseData.stones = {};

    // The properties returns moves rather than a list of points. However, the
    // intersections still expect an array of points =(. Thus we need to
    // transform into an array of points here.
    for (var color in allStones) {
      var moves = allStones[color];
      baseData.stones[color] = [];
      for (var i = 0; i < moves.length; i++) {
        baseData.stones[color].push(moves[i].point);
      }
    }
    baseData.stones.EMPTY = [];
    for (var color in currentCaptures) {
      for (var i = 0; i < currentCaptures[color].length; i++) {
        baseData.stones.EMPTY.push(currentCaptures[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Ascertain the previous board state.  This requires knowing what the 'next'
   * moves (stones) and captures were.
   */
  // TODO(kashomon): Reduce duplication with nextBoardData.
  previousBoardData: function(movetree, stones, captures,
      problemConditions, nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions, nextVarNumber);
    baseData.stones = captures;
    baseData.stones.EMPTY = [];
    for (var color in stones) {
      for (var i = 0; i < stones[color].length; i++) {
        baseData.stones.EMPTY.push(stones[color][i].point);
      }
    }
    return baseData;
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   *
   * returns: map from label to array of points
   */
  // TODO(kashomon): Use the getAllMarks directly from the properties code.
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.bridge.intersections.propertiesToMarks) {
      var mark = glift.bridge.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.rules.prop.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point or a point rectangle.
            var newPts = glift.util.pointArrFromSgfProp(data[i])
            if (newPts.length === 1) {
              // This is handled specially since it's the normal case.
              marksToAdd.push(newPts[0]);
            } else {
              marksToAdd = marksToAdd.concat(newPts);
            }
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  }
};

goog.provide('glift.orientation');

glift.orientation = {};

goog.provide('glift.orientation.bbox');
goog.provide('glift.orientation.BoundingBox');

glift.orientation.bbox = {
  /** Return a new bounding box with two points. */
  fromPts: function(topLeftPt, botRightPt) {
    return new glift.orientation.BoundingBox(topLeftPt, botRightPt);
  },

  /** Return a new bounding box with a top left point, a width, and a height. */
  fromSides: function(topLeft, width, height) {
    return new glift.orientation.BoundingBox(
        topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
  }
};

/**
 * A bounding box, represented by a top left point and bottom right point.
 * This is how we represent space in glift, from GoBoards to sections allocated
 * for widgets.
 *
 * @param {!glift.Point} topLeftPt The top-left point of the bounding box.
 * @param {!glift.Point} botRightPt The bottom right point of the bounding box.
 * @constructor @final @struct
 */
glift.orientation.BoundingBox = function(topLeftPt, botRightPt) {
  if (topLeftPt.x() > botRightPt.x() ||
      topLeftPt.y() > botRightPt.y()) {
    throw new Error('Topleft point must be less than the ' +
        'bottom right point. tl:' + topLeftPt.toString() +
        '; br:' + botRightPt.toString());
  }
  this._topLeftPt = topLeftPt;
  this._botRightPt = botRightPt;
};

glift.orientation.BoundingBox.prototype = {
  topLeft: function() { return this._topLeftPt; },
  botRight: function() { return this._botRightPt; },
  /** TopRight and BotLeft are constructed */
  topRight: function() {
    return glift.util.point(this.right(), this.top());
  },
  botLeft: function() {
    return glift.util.point(this.left(), this.bottom());
  },
  width: function() { return this.botRight().x() - this.topLeft().x(); },
  height: function() { return this.botRight().y() - this.topLeft().y(); },
  top: function() { return this.topLeft().y(); },
  left: function() { return this.topLeft().x(); },
  bottom: function() { return this.botRight().y(); },
  right: function() { return this.botRight().x(); },

  /**
   * Find the center of the box. Returns a point representing the center.
   */
  center: function() {
    return glift.util.point(
      Math.abs((this.botRight().x() - this.topLeft().x()) / 2)
          + this.topLeft().x(),
      Math.abs((this.botRight().y() - this.topLeft().y()) / 2)
          + this.topLeft().y());
  },

  /**
   * Test to see if a point is contained in the bounding box.  Points on the
   * edge count as being contained.
   *
   * We assume a canonical orientation of the top left being the minimum and the
   * bottom right being the maximum.
   */
  contains: function(point) {
   return point.x() >= this.topLeft().x()
      && point.x() <= this.botRight().x()
      && point.y() >= this.topLeft().y()
      && point.y() <= this.botRight().y();
  },

  /**
   * Test whether this bbox completely covers another bbox.
   */
  covers: function(bbox) {
    return this.contains(bbox.topLeft()) &&
        this.contains(bbox.botRight());
  },

  /**
   * Intersect this bbox with another bbox and return a new bbox that represents
   * the intersection.
   *
   * Returns null if the intersection is the emptyset.
   */
  intersect: function(bbox) {
    // Note: Boxes overlap iff one of the boxes contains at least one of
    // the corners.
    var bboxOverlaps =
        bbox.contains(this.topLeft()) ||
        bbox.contains(this.topRight()) ||
        bbox.contains(this.botLeft()) ||
        bbox.contains(this.botRight()) ||
        this.contains(bbox.topLeft()) ||
        this.contains(bbox.topRight()) ||
        this.contains(bbox.botLeft()) ||
        this.contains(bbox.botRight());
    if (!bboxOverlaps) {
      return null;
    }

    var top = Math.max(this.top(), bbox.top());
    var left = Math.max(this.left(), bbox.left());
    var bottom = Math.min(this.bottom(), bbox.bottom());
    var right = Math.min(this.right(), bbox.right());
    return glift.orientation.bbox.fromPts(
        glift.util.point(left, top),
        glift.util.point(right, bottom));
  },

  /**
   * Returns a new bounding box that has been expanded to contain the point.
   */
  expandToContain: function(point) {
    // Note that for our purposes the top left is 0,0 and the bottom right is
    // (+N,+N). Thus, by this definition, the top left is the minimum and the
    // bottom right is the maximum (true for both x and y).
    var tlx = this.topLeft().x();
    var tly = this.topLeft().y();
    var brx = this.botRight().x();
    var bry = this.botRight().y();
    if (point.x() < tlx) {
      tlx = point.x();
    }
    if (point.y() < tly) {
      tly = point.y();
    }
    if (point.x() > brx) {
      brx = point.x();
    }
    if (point.y() > bry) {
      bry = point.y();
    }
    return glift.orientation.bbox.fromPts(
        glift.util.point(tlx, tly),
        glift.util.point(brx, bry));
  },

  /**
   * Test to see if two bboxes are equal by comparing whether their points.
   */
  equals: function(other) {
    return other.topLeft() && this.topLeft().equals(other.topLeft()) &&
        other.botRight() && this.botRight().equals(other.botRight());
  },

  /**
   * Return a new bbox with the width and the height scaled by some fraction.
   * The TopLeft point is also scaled by the amount.
   */
  scale: function(amount) {
    var newHeight = this.height() * amount,
        newWidth = this.width() * amount,
        newTopLeft = glift.util.point(
            this.topLeft().x() * amount, this.topLeft().y() * amount);
    return glift.orientation.bbox.fromSides(newTopLeft, newWidth, newHeight);
  },

  /**
   * @returns {string} Stringified version of the bounding box.
   */
  toString: function() {
    return '(' + this.topLeft().toString() + '),(' +
        this.botRight().toString() + ')';
  },

  /**
   * Move the bounding box by translating the box
   * @param {number} dx
   * @param {number} dy
   * @return {glift.orientation.BoundingBox} A new bounding box.
   */
  translate: function(dx, dy) {
    return glift.orientation.bbox.fromPts(
        glift.util.point(this.topLeft().x() + dx, this.topLeft().y() + dy),
        glift.util.point(this.botRight().x() + dx, this.botRight().y() + dy));
  },

  // TODO(kashomon): Move this splitting methods out of the base class.

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.
   *
   * In other words, splits a box like so:
   *
   * X ->  X
   *       X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  hSplit: function(bboxSplits) {
    return this._splitBox('h', bboxSplits);
  },

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.  They must sum to 1, or an exception is thrown.
   *
   * In other words, splits a box like so:
   * X ->  X X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors. In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  vSplit: function(bboxSplits) {
    return this._splitBox('v', bboxSplits);
  },

  /**
   * Internal method for vSplit and hSplit.
   */
  _splitBox: function(d, bboxSplits) {
    if (glift.util.typeOf(bboxSplits) !== 'array') {
      throw "bboxSplits must be specified as an array. Was: "
          + glift.util.typeOf(bboxSplits);
    }
    if (!(d === 'h' || d === 'v')) {
      throw "What!? The only splits allowed are 'v' or 'h'.  " +
          "You supplied: " + d;
    }
    var totalSplitAmount = 0;
    for (var i = 0; i < bboxSplits.length; i++) {
      totalSplitAmount += bboxSplits[i];
    }
    if (totalSplitAmount >= 1) {
      throw "The box splits must sum to less than 1, but instead summed to: " +
          totalSplitAmount;
    }

    // Note: this is really just used as marker.  We use the final
    // this.botRight().x() / y() for the final marker to prevent rounding
    // errors.
    bboxSplits.push(1 - totalSplitAmount);

    var currentSplitPercentage = 0;
    var outBboxes = [];
    var currentTopLeft = this.topLeft().clone();
    for (var i = 0; i < bboxSplits.length; i++) {
      if (i === bboxSplits.length - 1) {
        currentSplitPercentage = 1;
      } else {
        currentSplitPercentage += bboxSplits[i];
      }

      // TODO(kashomon): All this switching makes me think there should be a
      // separate method for a single split.
      var nextBotRightX = d === 'h' ?
          this.botRight().x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextBotRightY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          this.botRight().y();
      var nextBotRight = glift.util.point(nextBotRightX, nextBotRightY);
      outBboxes.push(glift.orientation.bbox.fromPts(
          currentTopLeft, nextBotRight));
      var nextTopLeftX = d === 'h' ?
          currentTopLeft.x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextTopLeftY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          currentTopLeft.y();
      currentTopLeft = glift.util.point(nextTopLeftX, nextTopLeftY);
    }
    return outBboxes;
  }
};

goog.provide('glift.orientation.Cropbox');

/**
 * Definition of the cropbox
 *
 * @constructor @final @struct
 */
glift.orientation.Cropbox = function(bbox, size) {
  /**
   * Points in the bounding box are 0 indexed.
   * ex. 0,8, 0,12, 0,18
   */
  this.bbox = bbox;

  /** Size is 1 indexed (i.e., 19, 13, 9). */
  this.size = size;

  if (this.bbox.width() > this.size - 1) {
    throw new Error('BBox width cannot be bigger than the size:' +
        this.bbox.width() + ' -- ' + (this.size - 1));
  }

  if (this.bbox.height() > this.size - 1) {
    throw new Error('BBox height cannot be bigger than the size:' +
        this.bbox.height() + ' -- ' + (this.size - 1));
  }
};

glift.orientation.Cropbox.prototype = {
  /** Whether or not the top is ragged. */
  hasRaggedTop: function() {
    return this.bbox.topLeft().y() > 0;
  },
  /** Whether or not the left is ragged. */
  hasRaggedLeft: function() {
    return this.bbox.topLeft().x() > 0;
  },
  /** Whether or not the bottom is ragged. */
  hasRaggedBottom: function() {
    return this.bbox.botRight().y() < this.size - 1;
  },
  /** Whether or not the right is ragged. */
  hasRaggedRight: function() {
    return this.bbox.botRight().x() < this.size - 1;
  }
};

/**
 * Bounding boxes associated with the corpbox regions.
 */
glift.orientation.cropbox = {
  /**
   * Return a bounding box that indicates the cropbox. The logic is somewhat
   * nuanced:
   *
   * For corners:
   *   - the ragged top/bottom are +/- 1
   *   - the ragged right/left are +/- 2
   *
   * For edges:
   *   - the ragged top/bottom/right/eft are +/- 1
   *
   * For board sizes < 19, the cropbox is the whole board.
   *
   * @param {glift.enums.boardRegions} region
   * @param {number} intersects
   * @return {!glift.orientation.Cropbox}
   */
  get: function(region, intersects) {
    var point = glift.util.point,
        boardRegions = glift.enums.boardRegions,
        min = 0,
        max = intersects - 1,
        halfInts = Math.ceil(max / 2),
        top = min,
        left = min,
        bot = max,
        right = max;

    region = region || boardRegions.ALL;

    if (intersects < 19) {
      return new glift.orientation.Cropbox(
          glift.orientation.bbox.fromPts(
              point(min, min), point(max, max)),
          intersects);
    }

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL:
          break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          right = halfInts + 2;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          left = halfInts - 2;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          right = halfInts + 2;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          left = halfInts - 2;
          break;

      default:
          // Note: this can happen if we've let AUTO or MINIMAL slip in here
          // somehow.
          throw new Error('Unknown board region: ' + region);
    }
    var bbox = glift.orientation.bbox.fromPts;
    var pt = glift.util.point;
    return new glift.orientation.Cropbox(
        bbox(pt(left, top), pt(right, bot)), intersects);
  }
};

goog.require('glift.orientation');

/**
 * Takes a movetree and returns the optimal BoardRegion-Quad for cropping purposes.
 *
 * This isn't a minimal cropping: we split the board into 4 quadrants.
 * Then, we use the quad as part of the final quad-output. 
 *
 * Optionally, we allow a nextMovesPath so that we can 'optimally' crop just a
 * variation.
 *
 * Note: that we only allow convex shapes for obvious reasons.  Thus, these
 * aren't allowed (where the X's are quad-regions)
 * .X     X.
 * X. and XX
 *
 * @param {!glift.rules.MoveTree} movetree The movetree we want to find the
 *    optimal cropping-region for.
 * @param {!(glift.rules.Treepath|string)=} opt_nextMovesPath 
 *    Optional next moves path for cropping along a specific path.
 *
 * @return {!glift.enums.boardRegions} The resulting boardregion cropping.
 */
glift.orientation.getQuadCropFromMovetree =
    function(movetree, opt_nextMovesPath) {
  var br = glift.enums.boardRegions;
  var ints = movetree.getIntersections();
  // It's not clear to me if we should be cropping boards smaller than 19.  It
  // usually looks pretty weird, so hence this override.
  if (ints < 19) {
    return br.ALL;
  }

  var minimalBox = glift.orientation.minimalBoundingBox(
      movetree, opt_nextMovesPath);
  var boxMapping = glift.orientation.getCropboxMapping_();
  for (var i = 0; i < boxMapping.length; i++) {
    var obj = boxMapping[i];
    if (obj.bbox.covers(minimalBox)) {
      return obj.result;
    }
  }

  throw new Error('None of the boxes cover the minimal bbox!! ' +
      'This should never happen');
};

/**
 * An object contatin a pair: A bounding box and the board region it
 * corresponds to.
 *
 * @typedef {{
 *  bbox: !glift.orientation.BoundingBox,
 *  result: !glift.enums.boardRegions
 * }}
 */
glift.orientation.CropboxMapping;


/**
 * For 19x19, we cache the cropbox mappings.
 * @private {?Object<!glift.orientation.CropboxMapping>}
 */
glift.orientation.cropboxMappingCache_ = null;

/**
 * Gets the cropbox mapping. Only for 19x19 currently. I'm pretty sure it
 * doesn't make sense to crop a 9x9 and 13x13 is iffy.
 *
 * @private
 * @return {!Object<!glift.orientation.CropboxMapping>}
 */
glift.orientation.getCropboxMapping_ = function() {
  var br = glift.enums.boardRegions;
  // See glift.orientation.cropbox for more about how cropboxes are defined.
  var cbox = function(boardRegion) {
    return glift.orientation.cropbox.get(boardRegion, 19);
  };

  if (glift.orientation.cropboxMappingCache_ == null) {
    // The heart of this method. We know the minimal bounding box for the stones.
    // Then the question is: Which bbox best covers the minimal box? There are 4
    // cases:
    // -  The min-box is an 'in-between area'. First check the very middle of the
    //    board. then, check the edge areas.
    // -  The min-box lies within a corner
    // -  The min-box lies within a side
    // -  The min-box can only be covered by the entire board.
    var boxRegions = [
      // Check the overlap regions.
      // First, we check the very middle of the board.
      {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.BOTTOM_RIGHT).bbox),
        result: br.ALL
      // Now, check the side-overlaps.
      }, {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.TOP_RIGHT).bbox),
        result: br.TOP
      }, {
        bbox: cbox(br.TOP_LEFT).bbox.intersect(cbox(br.BOTTOM_LEFT).bbox),
        result: br.LEFT
      }, {
        bbox: cbox(br.BOTTOM_RIGHT).bbox.intersect(cbox(br.TOP_RIGHT).bbox),
        result: br.RIGHT
      }, {
        bbox: cbox(br.BOTTOM_RIGHT).bbox.intersect(cbox(br.BOTTOM_LEFT).bbox),
        result: br.BOTTOM
      }
    ];

    var toAdd = [
      br.TOP_LEFT, br.TOP_RIGHT, br.BOTTOM_LEFT, br.BOTTOM_RIGHT,
      br.TOP, br.BOTTOM, br.LEFT, br.RIGHT,
      br.ALL
    ];
    for (var i = 0; i < toAdd.length; i++) {
      var bri = toAdd[i];
      boxRegions.push({
        bbox: cbox(bri).bbox,
        result: bri
      });
    }
    glift.orientation.cropboxMappingCache_ = boxRegions;
  }

  // Cropbox mapping must be defined here by the logic above
  return /** @type !{glift.orientation.CropboxMapping} */ (
      glift.orientation.cropboxMappingCache_);
};

goog.require('glift.orientation');

/**
 * Get the minimal bounding box for set of stones and marks for the movetree.
 *
 * There are there cases;
 * 1. nextMovesPath is not defined. Recurse over the entire tree. Don't use
 *    marks for cropping consideration.
 * 2. nextMovesPath is an empty array. Calculate for the current position. Use
 *    marks for cropping consideration
 * 3. nextMovesPath is a non empty array. Treat the nextMovesPath as a
 *    variations tree path and traverse just the path. Really 2., is a special
 *    case of 3.
 *
 * To calculate the minimalBoundingBox for just the current position
 *
 * @param {!glift.rules.MoveTree} movetree
 * @param {(!glift.rules.Treepath|string)=} opt_nextMovesPath
 *    Optional next moves path for cropping along a specific path.
 * @return {!glift.orientation.BoundingBox}
 */
glift.orientation.minimalBoundingBox = function(movetree, opt_nextMovesPath) {
  var point = glift.util.point;
  var bbox = glift.orientation.bbox.fromPts;

  var ints = movetree.getIntersections() - 1;

  /** @type {!glift.rules.Treepath|undefined} */
  var nextMovesPath = undefined;
  if (opt_nextMovesPath && glift.util.typeOf(opt_nextMovesPath) === 'string') {
    nextMovesPath = glift.rules.treepath.parseFragment(opt_nextMovesPath);
  } else if (opt_nextMovesPath && glift.util.typeOf(opt_nextMovesPath) === 'array') {
    nextMovesPath = /** @type {!glift.rules.Treepath} */ (opt_nextMovesPath);
  }
  var pts = glift.orientation.getDisplayPts_(movetree, nextMovesPath);

  // Return a full board when there are no points.
  if (pts.length === 0) {
    return bbox(point(0,0), point(ints, ints));
  }

  // Return a bbox with one point.
  var bboxInstance = bbox(pts[0], pts[0]);
  for (var i = 1; i < pts.length; i++) {
    var pt = pts[i];
    if (!bboxInstance.contains(pt)) {
      bboxInstance = bboxInstance.expandToContain(pt);
    }
  }
  return bboxInstance;
};

/**
 * Gets all the display points associated with a movetree:
 *
 * There are there cases;
 * 1. nextMovesPath is not defined. Recurse over the entire tree. Don't use
 *    marks for cropping consideration.
 * 2. nextMovesPath is an empty array. Calculate for the current position. Use
 *    marks for cropping consideration
 * 3. nextMovesPath is a non empty array. Treat the nextMovesPath as a
 *    variations tree path and traverse just the path. Really 2., is a special
 *    case of 3.
 *
 * @private
 *
 * @param {!glift.rules.MoveTree} movetree
 *    Optional next moves path for cropping along a specific path.
 * @param {!glift.rules.Treepath=} opt_nextMovesPath
 *    Optional next moves path for cropping along a specific path.
 *
 * @return {!Array<!glift.Point>}
 */
glift.orientation.getDisplayPts_ = function(movetree, opt_nextMovesPath) {
  // Ensure we aren't changing the parent movetree's state.
  movetree = movetree.newTreeRef();
  var pts = [];
  /**
   * This hands objects that look like:
   * { StringKey: Array of objs that contain pts }.
   *
   * Ex.
   * {
   *  BLACK: [{point: {10, 16}, color: 'BLACK'}]
   *  TEXTLABEL: [{point: {13, 5}, value: '12'}]
   * }
   */
  var capturePoints = function(ptsObj) {
    for (var key in ptsObj) {
      var moveArr = ptsObj[key];
      for (var i = 0; i < moveArr.length; i++) {
        var item = moveArr[i];
        if (moveArr[i].point) {
          pts.push(moveArr[i].point);
        }
      }
    }
  };

  if (!opt_nextMovesPath) {
    movetree.recurseFromRoot(function(mt) {
      capturePoints(mt.properties().getAllStones());
    });
  } else if (opt_nextMovesPath) {
    // Case 3. Traverse the next moves path.
    for (var i = 0; i < opt_nextMovesPath.length; i++) {
      movetree.moveDown(opt_nextMovesPath[i]);
      capturePoints(movetree.properties().getAllStones());
    }
    // Case 2. Traverse the next moves path.
    if (opt_nextMovesPath.length === 0) {
      capturePoints(movetree.properties().getAllStones());
    }
    capturePoints(movetree.properties().getAllMarks());
  }
  return pts;
};

goog.require('glift.orientation');

/**
 * Calculates the desired rotation. Returns one of
 * glift.enums.rotations.
 *
 * Region ordering should specify what regions the rotation algorithm should
 * target. It has the format:
 * {
 *  corner: <boardregions>
 *  side: <boardregions>
 * }
 *
 */
glift.orientation.findCanonicalRotation = function(movetree, regionOrdering) {
  var boardRegions = glift.enums.boardRegions;
  var rotations = glift.enums.rotations;
  var cornerRegions = {
    TOP_LEFT: 0,
    BOTTOM_LEFT: 90,
    BOTTOM_RIGHT: 180,
    TOP_RIGHT: 270
  };
  var sideRegions = {
    TOP: 0,
    LEFT: 90,
    BOTTOM: 180,
    RIGHT: 270
  };

  if (!regionOrdering) {
    regionOrdering = {
      corner: boardRegions.TOP_RIGHT,
      side: boardRegions.TOP
    };
  }

  var region = glift.orientation.getQuadCropFromMovetree(movetree);

  if (cornerRegions[region] !== undefined ||
      sideRegions[region] !== undefined) {
    var start = 0, end = 0;
    if (cornerRegions[region] !== undefined) {
      start = cornerRegions[region];
      end = cornerRegions[regionOrdering.corner];
    }

    if (sideRegions[region] !== undefined) {
      start = sideRegions[region];
      end = sideRegions[regionOrdering.side];
    }

    var rot = (360 + start - end) % 360;
    if (rot === 0) { return rotations.NO_ROTATION; }
    return 'CLOCKWISE_' + rot;
  }

  // No rotations. We only rotate when the quad crop region is either a corner
  // or a side.
  return rotations.NO_ROTATION;
};

goog.provide('glift.flattener');

/**
 * Helps flatten a go board into a diagram definition. The flattened go board is
 * useful for all sorts of go-board rendering, be it print-rendering or a
 * dynamic UI.
 */
glift.flattener = {};

/**
 * Flattener Options
 *
 * Some notes about the parameters:
 *
 * Optional parameters:
 *  - goban: used for extracting all the inital stones.
 *  - nextMovesTreepath.  Defaults to [].  This is typically only used for
 *    printed diagrams.
 *  - startingMoveNum.  Optionally override the move number. If not set, it's
 *    automatically determined based on whether the position is on the
 *    mainpath or a variation.
 *
 *  Optional cropping params.
 *  - boardRegion: indicates what region to crop on.
 *  - autoBoxCropOnNextMoves. If set, will automatically crop based on the
 *    nextmoves path.
 *  - regionRestrictions. Array of allowed boardRegions. If the calculated
 *    region is not an member of this set, default to using 'ALL'.
 *  - autoBoxCropOnNextMoves. Whether or not to perform auto-box cropping.
 *
 *  Options for marks
 *  - showNextVariationsType
 *  - markLastMove
 *
 *  Options for problems
 *  - problemConditions
 *
 * @typedef {{
 *  goban: (!glift.rules.Goban|undefined),
 *  nextMovesTreepath: (!glift.rules.Treepath|string|!Array<number>|undefined),
 *  startingMoveNum: (number|undefined),
 *  boardRegion: (glift.enums.boardRegions|undefined),
 *  regionRestrictions: (!Array<glift.enums.boardRegions>|undefined),
 *  showNextVariationsType: (glift.enums.showVariations|undefined),
 *  autoBoxCropOnNextMoves: (boolean|undefined),
 *  markLastMove: (boolean|undefined),
 *  problemConditions: (!glift.rules.ProblemConditions|undefined)
 * }}
 */
// TODO(kashomon): Add support for markLastMove and problemConditions
glift.flattener.Options;


/**
 * This data is meant to be used like the following:
 *    '<color> <mvnum> at <collisionStoneColor> <label>'
 * as in this example:
 *    'Black 13 at White 2'
 *
 * Description:
 *  {
 *    color: <color of the move to be played>,
 *    mvnum: <move number>,
 *    label: <label where the collision occured>,
 *    collisionStoneColor: <color of the stone under the label>
 *  }
 *
 * @typedef {{
 *  color: glift.enums.states,
 *  mvnum: number,
 *  label: (string|undefined),
 *  collisionStoneColor: (glift.enums.states|undefined)
 * }}
 */
glift.flattener.Collision;

/**
 * Flatten the combination of movetree, goban, cropping, and treepath into an
 * array (really a 2D array) of symbols, (a Flattened object).
 *
 * @param {!glift.rules.MoveTree} movetreeInitial The movetree is used for
 *    extracting:
 *    -> The marks
 *    -> The next moves
 *    -> The previous move
 *    -> subsequent stones, if a nextMovesTreepath is present.  These are
 *    given labels.
 * @param {!glift.flattener.Options=} opt_options
 *
 * @return {!glift.flattener.Flattened}
 */
glift.flattener.flatten = function(movetreeInitial, opt_options) {
  // Create a new ref to avoid changing original tree ref.
  var mt = movetreeInitial.newTreeRef();
  var options = opt_options || {};

  // Use the provided goban, or reclaculate it.  This is somewhat inefficient,
  // so it's recommended that the goban be provided.
  var goban = options.goban || glift.rules.goban.getFromMoveTree(
      mt.getTreeFromRoot(), mt.treepathToHere()).goban;
  var showVars =
      options.showNextVariationsType  || glift.enums.showVariations.NEVER;
  var nmtp = glift.rules.treepath.parseFragment(options.nextMovesTreepath || '');

  var optStartingMoveNum = options.startingMoveNum || null;
  // Find the starting move number before applying the next move path.
  if (optStartingMoveNum === null) {
    optStartingMoveNum = glift.flattener.findStartingMoveNum_(mt, nmtp);
  }

  // Starting move num must be defined, so let's get the types right.
  var startingMoveNum = /** @type {number} */ (optStartingMoveNum);

  var boardRegion = glift.flattener.getBoardRegion_(mt, nmtp, options);
  var cropping = glift.orientation.cropbox.get(
      boardRegion, mt.getIntersections());


  // The move number before applying the next move path.
  var baseMoveNum = mt.node().getNodeNum();

  // The move number of the first mainline move in the parent-chain.
  var mainlineMoveNum = mt.getMainlineNode().getNodeNum();

  // Like the above, except in stne format. In other words: {color: <color>,
  // point: <pt>}. null if at the root (or due to weirdness like placements).
  var mainlineMove = mt.getMainlineNode().properties().getMove();

  // We also grab the next mainline move. For variations (for display), we
  // usually want to reference the _next_ move rather than the parent mainline
  // move. As with the mainline move above, the next move can be null.
  var nextMainlineMove = null;
  var nextMainlineNode = mt.getMainlineNode().getChild(0);
  if (nextMainlineNode) {
    nextMainlineMove = nextMainlineNode.properties().getMove();
  }

  // Initial move number -- used to calculate the ending move number.
  var initNodeNumber = mt.node().getNodeNum();

  // Map of ptString to move.
  var applied = glift.rules.treepath.applyNextMoves(mt, goban, nmtp);

  // Map of ptString to stone obj.
  var stoneMap = glift.flattener.stoneMap_(goban, applied.stones);

  // Replace the movetree reference with the new position.  This movetree
  // should be equivalent to applying the initial treepath and then applying
  // the nextmoves treepath.
  mt = applied.movetree;

  // Calculate the ending move number. Since starting move num is only used
  // in conjunction with next moves paths, we can just look at the next moves
  // path array.
  var endingMoveNum = startingMoveNum + nmtp.length - 1;
  if (endingMoveNum < startingMoveNum) {
    // This can occur if we haven't move anywhere. In that case, we won't be
    // using the starting / ending move numbers for labeling the next moves,
    // but it's nice to keep the starting/ending moves coherent.
    endingMoveNum = startingMoveNum;
  }

  var correctNextMoves = glift.flattener.getCorrectNextMoves_(
      mt, options.problemConditions);

  // Get the marks at the current position
  var mksOut = glift.flattener.markMap_(mt);
  var labels = mksOut.labels; // map of ptstr to label str
  var marks = mksOut.marks; // map of ptstr to symbol

  // Optionally update the labels with labels used to indicate variations.
  var sv = glift.enums.showVariations
  if (showVars === sv.ALWAYS || (
      showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
    glift.flattener.updateLabelsWithVariations_(mt, marks, labels);
  }

  // Calculate the collision stones and update the marks / labels maps if
  // necessary.
  var collisions = glift.flattener.createStoneLabels_(
      applied.stones, stoneMap, marks, labels, startingMoveNum);

  // Finally! Generate the intersections double-array.
  var board = glift.flattener.board.create(cropping, stoneMap, marks, labels);

  // TODO(kashomon): Support
  // - lastMove
  // - nextPossibleMoves
  // - selectedNextMove
  // - correctNextMoves
  var comment = mt.properties().getComment() || '';


  // We don't mark Ko for when the nextMovesTreepath is specified. If there's a
  // Ko, then stones will be captured and there's no point in putting a mark or
  // indicator on the location.
  var ko = nmtp ? null : goban.getKo();

  return new glift.flattener.Flattened({
      board: board,
      collisions: collisions,
      comment: comment,
      isOnMainPath: mt.onMainline(),
      baseMoveNum: baseMoveNum,
      startingMoveNum: startingMoveNum,
      endMoveNum: endingMoveNum,
      mainlineMoveNum: mainlineMoveNum,
      mainlineMove: mainlineMove,
      nextMainlineMove: nextMainlineMove,
      stoneMap: stoneMap,
      markMap: marks,
      labelMap: labels,
      ko: goban.getKo(),
      // ProblemSpecific:
      correctNextMoves: correctNextMoves,
      // TODO(kashomon): Add support directly in the flattener.
      problemResult: null,
  });
};


/**
 * Returns the board region for a movetree. Relevant configurability:
 *
 * mt: The movetree at the relevant position.
 * nmtp: The next moves treepath.
 *
 * options vars:
 * options.autoBoxCropOnNextMoves: auto-crop based on the just the nextmoves
 *    rather than the whole tree.
 * options.regionRestrictions: AN array
 *
 * This is probably too configurable at the moment.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.Treepath} nmtp
 * @param {!glift.flattener.Options} options
 *
 * @return {glift.enums.boardRegions} The board region.
 */
glift.flattener.getBoardRegion_ = function(mt, nmtp, options) {
  var boardRegion =
      options.boardRegion || glift.enums.boardRegions.ALL;
  var autoBoxCropOnNextMoves = options.autoBoxCropOnNextMoves || false;
  if (autoBoxCropOnNextMoves) {
    boardRegion = glift.orientation.getQuadCropFromMovetree(mt, nmtp);
  }
  if (boardRegion === glift.enums.boardRegions.AUTO) {
    boardRegion = glift.orientation.getQuadCropFromMovetree(mt);
  }
  var regionRestrictions = options.regionRestrictions || null;

  if (regionRestrictions) {
    if (glift.util.typeOf(regionRestrictions) !== 'array') {
      throw new Error('Invalid type for options.regionRestrictions: ' +
          'Must be array; was: ' + glift.util.typeOf(regionRestrictions));
    }
    // The user has decided to manuall specify a set of region restrictions.
    for (var i = 0; i < regionRestrictions.length; i++) {
      // We return the first region that matches. The order of the array
      // should give the preference of regions.
      if (boardRegion.indexOf(regionRestrictions[i]) > -1) {
        return regionRestrictions[i];
      }
    }
    return glift.enums.boardRegions.ALL;
  }
  return boardRegion;
};


/**
 * Note: This contains ALL stones for a given position.
 *
 * @param {!glift.rules.Goban} goban The current-state of the goban.
 * @param {!Array<glift.rules.Move>} nextStones that are the result of applying
 *    a next-moves path.
 * @return {!Object<!glift.PtStr, !glift.rules.Move>} Map from point string to stone.
 * @private
 */
glift.flattener.stoneMap_ = function(goban, nextStones) {
  var out = {};
  // Array of {color: <color>, point: <point>}
  var gobanStones = goban.getAllPlacedStones();
  for (var i = 0; i < gobanStones.length; i++) {
    var stone = gobanStones[i];
    out[stone.point.toString()] = stone;
  }

  for (var i = 0; i < nextStones.length; i++) {
    var stone = nextStones[i];
    var mv = { point: stone.point, color: stone.color };
    var ptstr = mv.point.toString();
    if (!out[ptstr]) {
      out[ptstr] = mv;
    }
  }
  return out;
};


/**
 * Example value:
 * {
 *  marks: {
 *    "12,5": 13
 *    "12,3": 23
 *  },
 *  labels: {
 *    "12,3": "A"
 *    "12,4": "B"
 *  }
 * }
 *
 * @typedef{{
 *  marks: !Object<!glift.PtStr, !glift.flattener.symbols>,
 *  labels: !Object<!glift.PtStr, string>
 * }}
 */
glift.flattener.MarkMap;

/**
 * Get the relevant marks.  Returns an object containing two fields: marks,
 * which is a map from ptString to Symbol ID. and labels, which is a map
 * from ptString to text label.
 *
 * If there are two marks on the same intersection specified, the behavior is
 * undefined. Either mark might succeed in being placed. We consider this to be
 * an incorrectly specified SGF/movetree.
 *
 * @param {glift.rules.MoveTree} movetree
 * @return {!glift.flattener.MarkMap}
 * @private
 */
glift.flattener.markMap_ = function(movetree) {
  /** @type {!glift.flattener.MarkMap} */
  var out = { marks: {}, labels: {} };
  var symbols = glift.flattener.symbols;
  /** @type {!Object<glift.rules.prop, !glift.flattener.symbols>} */
  var propertiesToSymbols = {
    CR: symbols.CIRCLE,
    LB: symbols.TEXTLABEL,
    MA: symbols.XMARK,
    SQ: symbols.SQUARE,
    TR: symbols.TRIANGLE
  };
  for (var prop in propertiesToSymbols) {
    var symbol = propertiesToSymbols[prop];
    if (movetree.properties().contains(prop)) {
      var data = movetree.properties().getAllValues(prop);
      for (var i = 0; i < data.length; i++) {
        if (prop === glift.rules.prop.LB) {
          var lblPt = glift.sgf.convertFromLabelData(data[i]);
          var key = lblPt.point.toString();
          out.marks[key] = symbol;
          out.labels[key] = lblPt.value;
        } else {
          var newPts = glift.util.pointArrFromSgfProp(data[i])
          for (var j = 0; j < newPts.length; j++) {
            out.marks[newPts[j].toString()] = symbol;
          }
        }
      }
    }
  }
  return out;
};

/**
 * Automatically finds the starting move number given a movetree position. This
 * is meant to be for well-formed variation paths.  That is, if we are
 * currently on the main path, we expect the next move paths will immediately
 * start on the variation or stay on the main path.
 *
 * Given this, there are three cases to consider:
 *    1. The movetree is on the mainpath and the next moves path stays on the
 *    main path:  Return the nodenum + 1 (this is the
 *    2. The movetere is on the mainpath, but the next move puts us on a
 *    variation. Return 1 (start over)
 *    3.  The movetree starts on a variation.  Count the number of moves since
 *    the mainpath branch.
 *
 * Note: The starting move is only interesting in the case where there's a
 * next-moves-path. If there's no next-moves-path specified, this number is
 * effectively unused.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.Treepath} nextMovesTreepath
 * @return {number}
 * @private
 */
glift.flattener.findStartingMoveNum_ = function(mt, nextMovesTreepath) {
  mt = mt.newTreeRef();
  if (mt.onMainline()) {
    if (nextMovesTreepath.length > 0 && nextMovesTreepath[0] > 0) {
      return 1;
    } else {
      return mt.node().getNodeNum() + 1;
    }
  }
  var mvnum = 1;
  while (!mt.onMainline()) {
    mvnum++;
    mt.moveUp();
  }
  return mvnum;
};

/**
 * Create or apply labels to identify collisions that occurred during apply.
 *
 * labels: map from ptstring to label string.
 * startingMoveNum: The number at which to start creating labels
 *
 * returns: an array of collision objects:
 *
 *
 *
 * Sadly, this has has the side effect of altering the marks / labels maps --
 * not in the underlying movetree, but in the ultimate representation.
 *
 * @param {!Array<!glift.rules.Move>} appliedStones The result of applying the
 *    treepath.
 * @param {!Object<!glift.PtStr, !glift.rules.Move>} stoneMap Map of ptstring
 *    to the move.
 * @param {!Object<!glift.PtStr, !glift.flattener.symbols>} marks
 * @param {!Object<!glift.PtStr, string>} labels
 * @param {number} startingMoveNum
 *
 * @return {!Array<!glift.flattener.Collision>}
 * @private
 */
// TODO(kashomon): Guard this with a autoLabelMoves flag.
glift.flattener.createStoneLabels_ = function(
    appliedStones, stoneMap, marks, labels, startingMoveNum) {
  if (!appliedStones || appliedStones.length === 0) {
    return []; // Don't perform relabeling if no stones are found.
  }
  // Collision labels, for when stone.collision = null.
  var extraLabs = 'abcdefghijklmnopqrstuvwxyz';
  var labsIdx = 0; // Index into extra labels string above.
  var symb = glift.flattener.symbols;
  var collisions = []; // {color: <color>, mvnum: <number>, label: <lbl>}

  // Remove any number labels currently existing in the marks map.
  var digitRegex = /[0-9]/;
  for (var ptstr in labels) {
    if (digitRegex.test(labels[ptstr])) {
      delete labels[ptstr];
      delete marks[ptstr];
    }
  }

  // Create labels for each stone in the next moves treepath.  Note -- we only
  // add labels in the case when there's a next moves path.
  for (var i = 0; i < appliedStones.length; i++) {
    var stone = appliedStones[i];
    var ptStr = stone.point.toString();
    var nextMoveNum = i + startingMoveNum;
    var colStone = stoneMap[ptStr];
    // If there's a stone in the stone map (which there _should_ be since
    // there's a collision), then we store that in the collision object
    var colStoneColor = undefined;
    if (colStone && colStone.color) {
      colStoneColor = colStone.color;
    }

    // This is a collision stone. Perform collision labeling.
    if (stone.hasOwnProperty('collision')) {
      var col = {
        color: stone.color,
        mvnum: (nextMoveNum),
        label: undefined,
        collisionStoneColor: colStoneColor
      };
      if (labels[ptStr]) { // First see if there are any available labels.
        col.label = labels[ptStr];
      } else if (glift.util.typeOf(stone.collision) === 'number') {
        var collisionNum = stone.collision + startingMoveNum;
        col.label = (collisionNum) + ''; // label is idx.
      } else { // should be null
        var lbl = extraLabs.charAt(labsIdx);
        labsIdx++;
        col.label = lbl;
        marks[ptStr] = symb.TEXTLABEL;
        labels[ptStr] = lbl;
      }
      collisions.push(col);

    // This is not a collision stone. Perform standard move-labeling.
    } else {
      // Create new labels for our move number.
      marks[ptStr] = symb.TEXTLABEL; // Override labels.
      labels[ptStr] = (nextMoveNum) + ''
    }
  }
  return collisions;
};

/**
 * Update the labels with variations numbers. This is an optional step and
 * usually isn't done for diagrams-for-print.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!Object<!glift.PtStr, !glift.flattener.symbols>} marks Map of ptstring
 *    to the move.
 * @param {!Object<!glift.PtStr, string>} labels
 * @private
 */
glift.flattener.updateLabelsWithVariations_ = function(mt, marks, labels) {
  for (var i = 0; i < mt.node().numChildren(); i++) {
    var move = mt.node().getChild(i).properties().getMove();
    if (move && move.point) {
      var pt = move.point;
      var ptStr = pt.toString();
      if (labels[ptStr] === undefined) {
        labels[ptStr] = '' + (i + 1);
      }
      marks[ptStr] = glift.flattener.symbols.NEXTVARIATION;
    }
  }
};

/**
 * Returns a map of ptstr to correct next moves. Usually used for creating marks
 * or other such display-handling.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.ProblemConditions|undefined} conditions
 * @return {!Object<glift.PtStr, glift.rules.Move>} object of correct next moves.
 * @private
 */
glift.flattener.getCorrectNextMoves_ = function(mt, conditions) {
  var correctNextMap = {};
  if (conditions) {
    var correctNextArr = glift.rules.problems.correctNextMoves(mt, conditions);
    for (var i = 0; i < correctNextArr.length; i++) {
      var move = correctNextArr[i];
      if (move.point) {
        correctNextMap[move.point.toString()] = move;
      }
    }
  }
  return correctNextMap;
};

goog.provide('glift.flattener.board');
goog.provide('glift.flattener.Board');
goog.provide('glift.flattener.BoardDiffPt');

glift.flattener.board = {
  /**
   * Constructs a board object: a 2D array of intersections.
   *
   * @param {!glift.orientation.Cropbox} cropping A cropping object, which says
   *    how to crop the board.
   * @param {!Object<!glift.rules.Move>} stoneMap A map from pt-string to
   *    move.
   * @param {!Object<glift.flattener.symbols>} markMap A map from pt-string to
   *    mark symbol.
   * @param {!Object<string>} labelMap A map from pt-string to label string
   *
   * @return {!glift.flattener.Board<Intersection>}
   */
  create: function(cropping, stoneMap, markMap, labelMap) {
    var point = glift.util.point;
    var board = [];
    var bbox = cropping.bbox;
    for (var y = bbox.top(); y <= bbox.bottom(); y++) {
      var row = [];
      for (var x = bbox.left(); x <= bbox.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var stoneColor = stone ? stone.color : glift.enums.states.EMPTY;
        var mark = markMap[ptStr];
        var label = labelMap[ptStr]
        row.push(glift.flattener.intersection.create(
            pt, stoneColor, mark, label, cropping.size));
      }
      board.push(row);
    }
    return new glift.flattener.Board(board, bbox, cropping.size);
  }
};

/**
 * Board object.  Meant to be created with the static constuctor method 'create'.
 *
 * @param {!Array<!Array<!T>>} boardArray A matrix of
 *    intersection object of type T.
 * @param {!glift.orientation.BoundingBox} bbox The bounding box of the board
 *    (using board points).
 * @param {number} maxBoardSize Integer number denoting the max board size
 *    (i.e., usually 9, 13, or 19).
 *
 * @template T
 *
 * @constructor @final @struct
 */
glift.flattener.Board = function(boardArray, bbox, maxBoardSize) {
  /**
   * 2D Array of intersections. Generally, this is an array of intersections,
   * but could be backed by a different underlying objects based on a
   * transformation.
   *
   * @private {!Array<!Array<!T>>}
   */
  this.boardArray_ = boardArray;

  /**
   * Bounding box for the crop box.
   *
   * @private {!glift.orientation.BoundingBox}
   */
  this.bbox_ = bbox;

  /**
   * Maximum board size.  Generally 9, 13, or 19.
   *
   * @private {number}
   */
  this.maxBoardSize_ = maxBoardSize;
};

glift.flattener.Board.prototype = {
  /**
   * Provide a SGF Point (indexed from upper left) and retrieve the relevant
   * intersection.  This  takes into account cropping that could be indicated by
   * the bounding box.
   *
   * In other words, in many diagrams, we may wish to show only
   * a small fraction of the board. Thus, this board will be cropping
   * accordingly.  However, getIntBoardPt allows the user to pass in the normal
   * board coordinates, but indexed from the upper left as SGF coordinates are.
   *
   * Example: For
   * [[ a, b, c, d],
   *  [ e, f, g, h],
   *  [ i, j, k, l]]
   * and this is the upper-right corner of a 19x19, if we getIntBoardPt(17, 2),
   * this would return 'k'. (17=2nd to last column, 2=3rd row down);
   *
   * @param {!glift.Point|number} ptOrX a Point object or, optionaly, a number.
   * @param {number=} opt_y If the first param is a number.
   *
   * @return {T} Intersection or null if the
   *    coordinate is out of bounds.
   */
  // TODO(kashomon): Replace with getBoardPt. It's too confusing to have getInt
  // and getBoardPt (and that is already extremely confusing).
  getIntBoardPt: function(ptOrX, opt_y) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(opt_y) === 'number') {
      var pt = glift.util.point(
          /** @type {number} */ (ptOrX), /** @type {number} */ (opt_y));
    } else {
      var pt = ptOrX;
    }
    return this.getInt(this.boardPtToPt(pt));
  },

  /**
   * Get an intersection from the board array. Uses the absolute array
   * positioning. Returns null if the pt doesn't exist on the board.
   *
   * If other words, the first parameter is a column (x), the second parameter
   * is the row (y). Optionally, a glift.Point can be passed in instead of the
   * first parameter
   *
   * Example: getInt(1,2) for
   * [[ a, b, c, d],
   *  [ e, f, g, h],
   *  [ i, j, k, l]]
   * returns j
   *
   * @param {!glift.Point|number} ptOrX a Point object or, optionaly, a number.
   * @param {number=} opt_y If the first param is a number.
   *
   * @return {T}
   */
  getInt: function(ptOrX, opt_y) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(opt_y) === 'number') {
      var pt = glift.util.point(
          /** @type {number} */ (ptOrX), /** @type {number} */ (opt_y));
    } else {
      var pt = ptOrX;
    }
    var row = this.boardArray_[pt.y()];
    if (!row) { return null };
    return row[pt.x()] || null;
  },

  /**
   * Turns a 0 indexed pt to a point that's board-indexed (i.e., that's offset
   * according to the bounding box).
   *
   * @param {!glift.Point} pt
   * @return {!glift.Point} The translated point
   */
  ptToBoardPt: function(pt) {
    return pt.translate(this.bbox_.left(), this.bbox_.top());
  },

  /**
   * Turns a 0 indexed pt to a point that's board-indexed. What this means, is
   * that we take into account the cropping that could be provided by the
   * bounding box. This could return the IntPt, but it could be different.
   *
   * @param {!glift.Point} pt
   * @return {!glift.Point} The translated point
   */
  boardPtToPt: function(pt) {
    return pt.translate(-this.bbox_.left(), -this.bbox_.top());
  },

  /**
   * Returns the board array.
   * @return {!Array<!Array<!T>>}
   */
  boardArray: function() {
    return this.boardArray_;
  },

  /**
   * Returns the size of the board. Usually 9, 13 or 19.
   * @return {number}
   */
  maxBoardSize: function() {
    return this.maxBoardSize_;
  },

  /**
   * Returns the height of the Go board. Note that this won't necessarily be the
   * length of the board - 1 due to cropping.
   * @return {number}
   */
  height: function() {
    return this.boardArray_.length;
  },

  /**
   * Returns the width of the Go board. Note that this won't necessarily be the
   * length of the board - 1 due to cropping.
   * @return {number}
   */
  width: function() {
    // Here we assume that the Go board is rectangular.
    return this.boardArray_[0].length;
  },

  /**
   * Transforms the intersections into a board instance based on the
   * transformation function.
   *
   * Generally, expects a function of the form:
   *    fn(intersection, x, y);
   *
   * Where X and Y are indexed from the top left and range from 0 to the
   * cropping box width / height respectively.  Equivalently, you can think of x
   * and y as the column and row, although I find this more confusing.
   *
   * @param {function(T, number, number): U} fn Function that takes an
   *    Intersection, an x, and a y, and returns a new Intersection.
   * @return {!glift.flattener.Board<U>} A new board object.
   *
   * @template U
   */
  transform: function(fn) {
    var outArray = [];
    for (var y = 0; y < this.boardArray_.length; y++) {
      var row = [];
      // Assumes a rectangular double array but this should always be the case.
      for (var x = 0; x < this.boardArray_[0].length; x++) {
        var intersect = this.boardArray_[y][x];
        row.push(fn(intersect, x, y));
      }
      outArray.push(row);
    }
    return new glift.flattener.Board(outArray, this.bbox_, this.maxBoardSize_);
  },

  /**
   * Create a diff between this board and another board. Obviously for the board
   * diff to make sense, the boards must have the same type
   *
   * It is required that the boards be the same dimensions, or else an error is
   * thrown.
   *
   * @param {!glift.flattener.Board<T>} newBoard
   * @return {!Array<!glift.flattener.BoardDiffPt<T>>}
   */
  diff: function(newBoard) {
    if (!newBoard|| !newBoard.boardArray_ || !newBoard.bbox_ || !newBoard.maxBoardSize_) {
      throw new Error('Diff board not defined or not a flattener board');
    }
    if (this.height() !== newBoard.height() || this.width() !== newBoard.width()) {
      throw new Error('Boards do not have the same dimensions.' +
        ' This: h:' + this.height() + ' w:' + this.width() +
        ' That: h:' + newBoard.height() + ' w:' + newBoard.width());
    }
    var out = [];
    for (var i = 0; i < this.boardArray_.length; i++) {
      var row = this.boardArray_[i];
      var thatrow = newBoard.boardArray_[i];

      for (var j = 0; j < row.length; j++) {
        var intp = row[j];
        var newIntp = thatrow[j];
        if (!newIntp) { break; }

        var ptsEqual = false;
        if (intp.equals && typeof intp.equals === 'function') {
          // Equals is defined, let's use it.
          ptsEqual = intp.equals(newIntp);
        } else {
          // Use regular ===, since equals isn't defined
          ptsEqual = intp === newIntp;
        }
        if (!ptsEqual) {
          var pt = new glift.Point(j, i);
          out.push(new glift.flattener.BoardDiffPt(
            intp, newIntp, pt, this.ptToBoardPt(pt)));
        }
      }
    }
    return out;
  }
};

/**
 * Container that indicates a place in the board where there was a difference
 * between two different boards.
 *
 * @param {T} prevValue
 * @param {T} newValue
 * @param {!glift.Point} colRowPt. A pt from the original array, where the x and
 *    and y are the col and row respectively.
 * @param {!glift.Point} boardPt. A point that's board-indexed (i.e., that's
 *    offset according to the bounding box).
 *
 * @template T
 *
 * @constructor @final @struct
 */
glift.flattener.BoardDiffPt = function(prevValue, newValue, colRowPt, boardPt) {
  this.prevValue = prevValue;
  this.newValue = newValue;
  this.colRowPt = colRowPt;
  this.boardPt = boardPt;
};

goog.provide('glift.flattener.Flattened');
goog.provide('glift.flattener.FlattenedParams');

/**
 * The Flattened object is complex. We pass in a strongly parameter object for
 * convenience.
 *
 * @typedef {{
 *  board: !glift.flattener.Board,
 *  collisions: !Array<!glift.flattener.Collision>,
 *  comment: string,
 *  isOnMainPath: boolean,
 *  baseMoveNum: number,
 *  startingMoveNum: number,
 *  endMoveNum: number,
 *  mainlineMoveNum: number,
 *  mainlineMove: ?glift.rules.Move,
 *  nextMainlineMove: ?glift.rules.Move,
 *  stoneMap: !Object<glift.PtStr, !glift.rules.Move>,
 *  markMap: !Object<glift.PtStr, !glift.flattener.symbols>,
 *  labelMap: !Object<glift.PtStr, string>,
 *  ko: ?glift.Point,
 *  correctNextMoves: !Object<glift.PtStr, !glift.rules.Move>,
 *  problemResult: ?glift.enums.problemResults
 * }}
 */
glift.flattener.FlattenedParams;


/** @private {!Object<number, !glift.flattener.Flattened>} */
glift.flattener.emptyFlattenedCache_ = {};

/**
 * Public method for returning an empty flattened object of a specific size.
 * Sometimes it's useful to have an empty flattened board, especially if one is
 * doing a 'diff' operation.
 *
 * @param {number} size
 * @return {!glift.flattener.Flattened}
 */
glift.flattener.emptyFlattened = function(size) {
  if (glift.flattener.emptyFlattenedCache_[size]) {
    return glift.flattener.emptyFlattenedCache_[size];
  }
  var mt = glift.rules.movetree.getInstance(size);
  var flattened = glift.flattener.flatten(mt);
  glift.flattener.emptyFlattenedCache_[size] = flattened;
  return flattened;
};

/**
 * Data used to populate either a display or diagram.
 *
 * @param {!glift.flattener.FlattenedParams} params
 * @constructor @final @struct
 */
glift.flattener.Flattened = function(params) {
  /**
   * Board wrapper. Essentially a double array of intersection objects.
   * @private {!glift.flattener.Board}
   */
  this.board_ = params.board;

  /**
   * @private {!Array<glift.flattener.Collision>}
   * @const
   */
  this.collisions_ = params.collisions;

  /**
   * @private {string}
   * @const
   */
  this.comment_ = params.comment;

  /**
   * Whether or not the position is on the 'top' (zeroth) variation.
   * @private {boolean}
   * @const
   */
  this.isOnMainPath_ = params.isOnMainPath;

  /**
   * The base move number before applying the next moves path. Equivalent to the
   * nodeNum of the movetree before applying the next move path.
   *
   * @private {number}
   * @const
   */
  this.baseMoveNum_ = params.baseMoveNum;

  /**
   * The starting and ending move numbers. These should be used for labeling
   * diagrams, and is only relevant in the context of a next-moves-path diagram.
   *
   * @private {number}
   * @const
   */
  this.startMoveNum_ = params.startingMoveNum;

  /** @const @private {number} */
  this.endMoveNum_ = params.endMoveNum;

  /**
   * The move number of the first mainline move in the parent-chain. Can be
   * useful for print-diagram creation, when referencing the mainlinemove.
   * @const @private {number}
   */
  this.mainlineMoveNum_ = params.mainlineMoveNum;

  /**
   * The move -- {color: <color>, point: <pt>} at the first mainline move in the
   * parent tree. Can be null if no move exists at the node.
   * @private {?glift.rules.Move}
   * @const
   */
  this.mainlineMove_ = params.mainlineMove;

  /**
   * The next mainline move after the mainline move above.. Usually variations
   * are variations on the _next_ move, so it's usually useful to reference the
   * next move.
   * @private {?glift.rules.Move}
   * @const
   */
  this.nextMainlineMove_ = params.nextMainlineMove;

  /**
   * All the stones for O(1) convenience =D.
   * @private {!Object<glift.PtStr, !glift.rules.Move>}
   * @const
   */
  this.stoneMap_ = params.stoneMap;

  /**
   * All the marks!
   * @private {!Object<glift.PtStr, !glift.flattener.symbols>}
   * @const
   */
  this.markMap_ = params.markMap;

  /**
   * All the labels!
   * @private {!Object<glift.PtStr, string>}
   * @const
   */
  this.labelMap_ = params.labelMap;

  /**
   * The Ko point. Will be null if there is currently no Ko.
   * @private {?glift.Point}
   * @const
   */
  this.ko_ = params.ko;

  /**
   * The variations that, according to the problem conditions supplied are
   * correct. By default, variations are considered incorrect.
   * @private {!Object<glift.PtStr, !glift.rules.Move>}
   * @const
   */
  this.correctNextMoves_ = params.correctNextMoves;

  /**
   * Problem result. Whether or not a particular problem position should be
   * considered correct or incorret.
   * @private {?glift.enums.problemResults}
   */
  this.problemResult_ = params.problemResult;
};

glift.flattener.Flattened.prototype = {
  /**
   * Return the constructed board.
   * @return {!glift.flattener.Board}
   */
  board: function() { return this.board_; },

  /**
   * The comment for the position.
   * @return {string}
   */
  comment: function() { return this.comment_; },

  /**
   * Returns the Ko point, if it exists, and null otherwise.
   *
   * Note that Ko will not be specified when the flattened object was created
   * with a nextMovesTreepath, since this means a stone must have been captured
   * at the ko point.
   * @return {?glift.Point}
   */
  ko: function() { return this.ko_; },

  /**
   * A structure illustrating the board collisions. Only relevant for positions
   * with a next moves path.
   *
   * Array of collisions objects.  In other words, we record stones that
   * couldn't be placed on the board.
   *
   * Each object in the collisions array looks like:
   *    {color: <color>, mvnum: <number>, label: <label>}
   * (although the source of truth is in the typedef).
   *
   * @return {!Array<!glift.flattener.Collision>}
   */
  collisions: function() { return this.collisions_; },

  /**
   * Whether or not this position is on the main line or path variation.  For
   * game review diagrams, it's usually nice to distinguish between diagrams for
   * the real game and diagrams for exploratory variations.
   *
   * @return {boolean}
   */
  isOnMainPath: function() { return this.isOnMainPath_; },

  /**
   * Returns the base move number before applying the next moves path. In an
   * interactive viewer, this would be considered the current move number.
   *
   * @return {number}
   */
  baseMoveNum: function() { return this.baseMoveNum_; },

  /**
   * Returns the starting move number. Should only be used in the context of a
   * next-moves-path diagram.
   *
   * Note that the starting move number (and ending move numbers) are labeled
   * based on whether or not the variation is on the 'main path'. If on the main
   * path, the starting/ending move numbers are equivalent to the move-node
   * number. If on a variation, counting starts over based from 1, where 1 is
   * the first move off the main line.
   *
   * @return {number}
   */
  startingMoveNum: function() { return this.startMoveNum_; },

  /**
   * Returns the ending move number. Should be tha same as the starting move
   * number if no nextMovesTreepath is specified.
   *
   * @return {number}
   */
  endingMoveNum: function() { return this.endMoveNum_; },

  /**
   * Returns the first mainline move number in the parent-chain. This will be
   * equal to the startingMoveNum if isOnMainPath = true.
   *
   * @return {number}
   */
  mainlineMoveNum: function() { return this.mainlineMoveNum_; },

  /**
   * Returns the move number of the nextMainlineMove (regardless of whether or
   * not it exists.
   *
   * @return {number}
   */
  nextMainlineMoveNum: function() { return this.mainlineMoveNum() + 1; },

  /**
   * Returns the first mainline move in the parent-chain. Can be null if no move
   * exists and has the form {color: <color>, pt: <pt>} if defined.
   *
   * @return {?glift.rules.Move}
   */
  mainlineMove: function() { return this.mainlineMove_; },

  /**
   * Returns the next mainline move after the mainline move in the parent-chain.
   * Can be null if no move exists and has the form {color: <color>, pt: <pt>}
   * if defined.
   *
   * @return {?glift.rules.Move}
   */
  nextMainlineMove: function() { return this.nextMainlineMove_; },

  /**
   * Returns the stone map. An object with the following structure:
   *
   * @return {!Object<glift.PtStr, !glift.rules.Move>}
   */
  stoneMap: function() { return this.stoneMap_; },

  /**
   * Returns the labels map. An object with the following structure:
   *
   * @return {!Object<glift.PtStr, string>}
   */
  labelMap: function() {
    return this.labelMap_;
  },

  /**
   * Returns the marks map. An object with the following structure:
   * where the numbers correspond to an entry in glift.flattener.symbols.
   *
   * Note: This will include the TEXTLABEL symbol, even though the labels map
   * duplicates this information to some degree.
   *
   * @return {!Object<glift.PtStr, glift.flattener.symbols>}
   */
  markMap: function() {
    return this.markMap_;
  },

  /**
   * Currently, the flattener does not compute problem correctness, so it is up
   * to the user to manually set problem correctness.
   *
   * @param {glift.enums.problemResults} result
   */
  // TODO(kashomon): Remove once this is set from the flattener.
  setProblemResult: function(result) {
    this.problemResult_ = result;
  },

  /**
   * The problem-status. One of correct, incorrect, or indeterminate, if
   * specified; null, otherwise.
   *
   * @return {?glift.enums.problemResults} The problem correctness.
   */
  problemResult: function() { return this.problemResult_ },

  /**
   * Helper for truncating labels if the labels are numbers > 100, which
   * is typically helpful for diagram-display. A no-op for all other labels
   * This used to be done automatically, but there are cases where users may
   * wish to preserve full 3 digit labels.
   *
   * Note: This helper only truncates when branchLength = endNum - startNum <
   * 100.
   *
   * @param {(number|string)} numOrString: The number represented either as a
   *    string or a number (probably the former, but who are we to judge?).
   * @return {string} The processed string label.
   */
  autoTruncateLabel: function(numOrString) {
    var num = numOrString;
    if (typeof numOrString === 'number') {
      // noop
    } else if (typeof numOrString === 'string' && /\d+/.test(numOrString)) {
      num = parseInt(numOrString, 10);
    } else {
      return numOrString;
    }
    var branchLength = this.endingMoveNum() - this.startingMoveNum();
    if (num > 100 && branchLength < 100 && num % 100 !== 0) {
      // Truncation time!
      num = num % 100;
    }
    return num + '';
  }
};

goog.provide('glift.flattener.intersection');
goog.provide('glift.flattener.Intersection');

glift.flattener.intersection = {
  /**
   * Creates an intersection obj.
   *
   * @param {!glift.Point} pt 0-indexed and bounded by the number
   *    of intersections.  Thus, typically between 0 and 18. Note, the zero for
   *    this point is the top-left rather than the more traditional
   *    bottom-right, as it is for kifus.
   * @param {glift.enums.states} stoneColor EMPTY here is used to indicate that
   *    we don't want to set the stone.
   * @param {!glift.flattener.symbols} mark Mark for the stone
   * @param {string} textLabel text label for the stone. Should really only be
   *    set when the mark is TEXTLABEL.
   * @param {number} maxInts The maximum number of intersections on the board.
   *    Typically 9, 13 or 19.
   *
   * @return {!glift.flattener.Intersection}
   */
  create: function(pt, stoneColor, mark, textLabel, maxInts) {
    var sym = glift.flattener.symbols;
    var intsect = new glift.flattener.Intersection(pt);

    if (pt.x() < 0 || pt.y() < 0 ||
        pt.x() >= maxInts || pt.y() >= maxInts) {
      throw new Error('Pt (' + pt.x() + ',' + pt.y() + ')' + ' is out of bounds.');
    }

    var intz = maxInts - 1;
    var baseSymb = sym.EMPTY;
    if (pt.x() === 0 && pt.y() === 0) {
      baseSymb = sym.TL_CORNER;
    } else if (pt.x() === 0 && pt.y() === intz) {
      baseSymb = sym.BL_CORNER;
    } else if (pt.x() === intz && pt.y() === 0) {
      baseSymb = sym.TR_CORNER;
    } else if (pt.x() === intz && pt.y() === intz) {
      baseSymb = sym.BR_CORNER;
    } else if (pt.y() === 0) {
      baseSymb = sym.TOP_EDGE;
    } else if (pt.x() === 0) {
      baseSymb = sym.LEFT_EDGE;
    } else if (pt.x() === intz) {
      baseSymb = sym.RIGHT_EDGE;
    } else if (pt.y() === intz) {
      baseSymb = sym.BOT_EDGE;
    } else if (this.isStarpoint_(pt, maxInts)) {
      baseSymb = sym.CENTER_STARPOINT;
    } else {
      baseSymb = sym.CENTER;
    }
    intsect.setBase(baseSymb);

    if (stoneColor === glift.enums.states.BLACK) {
      intsect.setStone(sym.BSTONE);
    } else if (stoneColor === glift.enums.states.WHITE) {
      intsect.setStone(sym.WSTONE);
    }

    if (mark !== undefined) {
      intsect.setMark(mark);
    }

    if (textLabel !== undefined) {
      intsect.setTextLabel(textLabel);
    }

    return intsect;
  },

  // TODO(kashomon): Should arbitrary sized go boards be supported?
  _starPointSets: {
    9 : [{4:true}],
    13 : [{3:true, 9:true}, {6:true}],
    19 : [{3:true, 9:true, 15:true}]
  },

  /**
   * Determine whether a pt is a starpoint.  Intersections is 1-indexed, but the
   * pt is 0-indexed.
   *
   * @param {!glift.Point} pt
   * @param {!number} maxInts
   * @return {boolean} whether the point should be a star point.
   * @private
   */
  isStarpoint_: function(pt, maxInts) {
    var starPointSets = glift.flattener.intersection._starPointSets[maxInts];
    for (var i = 0; i < starPointSets.length; i++) {
      var set = starPointSets[i];
      if (set[pt.x()] && set[pt.y()]) {
        return true;
      }
    }
    return false;
  }
};

/**
 * Represents a flattened intersection. Separated into 3 layers: 
 *  - Base layer (intersection abels)
 *  - Stone layer (black, white, or empty)
 *  - Mark layer (shapes, text labels, etc.)
 *
 * Shouldn't be constructed directly outside of this file.
 *
 * @param {!glift.Point} pt
 *
 * @constructor @final @struct
 */
glift.flattener.Intersection = function(pt) {
  var EMPTY = glift.flattener.symbols.EMPTY;

  /** @private {!glift.Point} */
  this.pt_ = pt;
  /** @private {glift.flattener.symbols} */
  this.baseLayer_ = EMPTY;
  /** @private {glift.flattener.symbols} */
  this.stoneLayer_ = EMPTY;
  /** @private {glift.flattener.symbols} */
  this.markLayer_ = EMPTY;

  /**
   * Optional text label. Should only be set when the mark layer symbol is some
   * sort of text-symbol (e.g., TEXTLABEL, NEXTVARIATION)
   * @private {?string}
   */
  this.textLabel_ = null;
};

glift.flattener.Intersection.prototype = {
  /**
   * @param {glift.flattener.symbols} s Symbol to validate
   * @param {string} layer
   * @private
   */
  validateSymbol_: function(s, layer) {
    var sym = glift.flattener.symbols;
    var layerMapping = {
      base: {
        EMPTY: true, TL_CORNER: true, TR_CORNER: true, BL_CORNER: true,
        BR_CORNER: true, TOP_EDGE: true, BOT_EDGE: true, LEFT_EDGE: true,
        RIGHT_EDGE: true, CENTER: true, CENTER_STARPOINT: true
      },
      stone: {
        EMPTY: true, BSTONE: true, WSTONE: true
      },
      mark: {
        EMPTY: true, TRIANGLE: true, SQUARE: true, CIRCLE: true, XMARK: true,
        TEXTLABEL: true, LASTMOVE: true, NEXTVARIATION: true
      }
    };
    if (!glift.flattener.symbolStr(s)) {
      throw new Error('Symbol Val: ' + s + ' is not a defined symbol.');
    }
    var str = glift.flattener.symbolStr(s);
    if (!layerMapping[layer][str]) {
      throw new Error('Incorrect layer for: ' + str + ',' + s +
          '. Layer was ' + layer);
    }
    return s;
  },

  /**
   * Test whether this intersection is equal to another intersection.
   * @param {!Object} thatint
   * @return {boolean}
   */
  equals: function(thatint) {
    if (thatint == null) {
      return false;
    }
    var that = /** @type {!glift.flattener.Intersection} */ (thatint);
    return this.pt_.equals(that.pt_) &&
        this.baseLayer_ === that.baseLayer_ &&
        this.stoneLayer_ === that.stoneLayer_ &&
        this.markLayer_ === that.markLayer_ &&
        this.textLabel_ === that.textLabel_;
  },

  /** @return {glift.flattener.symbols} Returns the base layer. */
  base: function() { return this.baseLayer_; },

  /** @return {glift.flattener.symbols} Returns the stone layer. */
  stone: function() { return this.stoneLayer_; },

  /** @return {glift.flattener.symbols} Returns the mark layer. */
  mark: function() { return this.markLayer_; },

  /** @return {?string} Returns the text label. */
  textLabel: function() { return this.textLabel_; },

  /**
   * Sets the base layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setBase: function(s) {
    this.baseLayer_ = this.validateSymbol_(s, 'base');
    return this;
  },

  /**
   * Sets the stone layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setStone: function(s) {
    this.stoneLayer_ = this.validateSymbol_(s, 'stone');
    return this;
  },

  /**
   * Sets the mark layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setMark: function(s) {
    this.markLayer_ = this.validateSymbol_(s, 'mark');
    return this;
  },

  /**
   * Sets the text label.
   * @param {string} t
   * @return {!glift.flattener.Intersection} this
   */
  setTextLabel: function(t) {
    this.textLabel_ = t + '';
    return this;
  },

  /**
   * Clears the text label
   * @return {!glift.flattener.Intersection} this
   */
  clearTextLabel: function() {
    this.textLabel_ = null;
    return this;
  }
};

goog.provide('glift.flattener.symbols');

/**
 * Symbolic representation of a Go Board display.
 * @enum {number}
 */
glift.flattener.symbols = {
  // Empty location.  Useful for creating dense arrays.  Can be used for any of
  // the three layers. Assigned to 0 for the usefulness of truthiness.
  EMPTY: 0,

  //
  // Board symbols.  This comprises the first layer.
  //
  TL_CORNER: 2,
  TR_CORNER: 3,
  BL_CORNER: 4,
  BR_CORNER: 5,
  TOP_EDGE: 6,
  BOT_EDGE: 7,
  LEFT_EDGE: 8,
  RIGHT_EDGE: 9,
  CENTER: 10,
  // Center + starpoint. Maybe should just be starpoint, but this is more clear.
  CENTER_STARPOINT: 11,

  //
  // Stone symbols. This comprises the second layer.
  //
  BSTONE: 20,
  WSTONE: 21,

  //
  // Labels and marks. This comprises the third layer.
  //
  TRIANGLE: 30,
  SQUARE: 31,
  CIRCLE: 32,
  XMARK: 33,

  // Text Labeling (numbers or letters)
  TEXTLABEL: 34,

  // Extra marks, used for display.  These are not specified by the SGF
  // specification, but they are often useful.
  LASTMOVE: 35,

  // It's useful to destinguish between standard TEXTLABELs and NEXTVARIATION
  // labels.
  NEXTVARIATION: 36
};

/**
 * Mapping between flattener stone symbol and a glift color-state enum.
 * @type {!Object<glift.flattener.symbols, glift.enums.states>}
 */
glift.flattener.symbolStoneToState = {
  0: glift.enums.states.EMPTY,
  20: glift.enums.states.BLACK,  // BSTONE,
  21: glift.enums.states.WHITE, // WSTONE
};

/**
 * Mapping between flattener mark symbol and a glift mark enum.
 * @type {!Object<glift.flattener.symbols, glift.enums.marks>}
 */
glift.flattener.symbolMarkToMark = {
  30: glift.enums.marks.TRIANGLE,
  31: glift.enums.marks.SQUARE,
  32: glift.enums.marks.CIRCLE,
  33: glift.enums.marks.XMARK,

  34: glift.enums.marks.LABEL, // TEXTLABEL

  35: glift.enums.marks.STONE_MARKER, // LASTMOVE
  36: glift.enums.marks.VARIATION_MARKER, // NEXTVARIATION
};

/**
 * Look-up map that allows us to determine a string key for a symbol number.
 * Lazily initialized via symbolStr.
 *
 * @private {Object<number, string>}
 */
glift.flattener.reverseSymbol_ = null;

/**
 * Convert a symbol number to a symbol string.
 * @param {number} num Symbol number
 * @return {string} Symbol name
 */
glift.flattener.symbolStr = function(num) {
  if (glift.flattener.reverseSymbol_ == null) {
    // Create and store a reverse mapping.
    var reverse = {};
    var symb = glift.flattener.symbols;
    for (var key in glift.flattener.symbols) {
      reverse[symb[key]] = key;
    }
    glift.flattener.reverseSymbol_ = reverse;
  }
  return glift.flattener.reverseSymbol_[num];
};

goog.provide('glift.widgets');

/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {};

goog.provide('glift.widgets.BaseWidget');

/**
 * The base web UI widget.
 *
 * @param {string} divId
 * @param {!glift.api.SgfOptions} sgfOptions
 * @param {!glift.api.DisplayOptions} displayOptions
 * @param {!glift.api.IconActions} iconActions
 * @param {!glift.api.StoneActions} stoneActions
 * @param {!glift.widgets.WidgetManager} manager
 * @param {!glift.api.HookOptions} hooks
 *
 * @constructor @final @struct
 */
glift.widgets.BaseWidget = function(
    divId, sgfOptions, displayOptions, iconActions, stoneActions, manager, hooks) {
  /** @type {string} */
  // We split the wrapper div, but here we record the original reference.
  this.wrapperDivId = divId;

  /**
   * The internal wrapper is a box nested just inside the wrapperDivId with the
   * intention of adding a glift-specific class and position: relative.
   * @type {string}
   */
  this.internalWrapperDivId = divId + '-internal-wrapper';

  /** @type {!glift.api.SgfOptions} */
  this.sgfOptions = sgfOptions;

  /** @type {!glift.api.IconActions} */
  this.displayOptions = displayOptions;

  /** @type {!glift.api.IconActions} */
  this.iconActions = iconActions;

  /** @type {!glift.api.StoneActions} */
  this.stoneActions = stoneActions;

  /** @type {!glift.widgets.WidgetManager} */
  this.manager = manager;

  /** @type {!glift.api.HookOptions} */
  this.externalHooks = hooks;

  // These variables are initialized by draw
  this.controller = undefined;
  this.boardRegion = undefined;

  // The four major components. Also initialized by draw.
  this.display = undefined;
  this.statusBar = undefined;
  this.commentBox = undefined;
  this.iconBar = undefined;

  // Used for problems, exclusively.
  // TODO(kashomon): Factor these out into some sort of problemState.
  this.initialMoveNumber = undefined;
  this.initialPlayerColor = undefined;
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;
};

glift.widgets.BaseWidget.prototype = {
  /** Draws the widget. */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    this.initialMoveNumber = this.controller.currentMoveNumber();
    this.initialPlayerColor = this.controller.getCurrentPlayer();
    glift.util.majorPerfLog('Created controller');

    var intersections = this.controller.getIntersections();
    var boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? this.controller.getQuadCropFromBeginning()
        : this.sgfOptions.boardRegion;
    glift.util.majorPerfLog('Calculated board regions');

    this.createInternalWrapperDiv_();
    // This should be the only time we get the base width and height, until the
    // entire widget is re-drawn.
    var parentDivBbox = glift.displays.bboxFromDiv(this.internalWrapperDivId);
    if (parentDivBbox.width() === 0 || parentDivBbox.height() === 0) {
      throw new Error('Div for Glift has has invalid dimensions. ' +
          'Bounding box had ' +
          'width: ' + parentDivBbox.width() +
          ', height: ' + parentDivBbox.height());
    }

    var positioning = glift.displays.position.positioner(
        parentDivBbox,
        boardRegion,
        intersections,
        this.getUiComponents_(this.sgfOptions),
        this.displayOptions.oneColumnSplits,
        this.displayOptions.twoColumnSplits).calcWidgetPositioning();

    var divIds = this.createDivsForPositioning_(
        positioning, this.internalWrapperDivId);
    glift.util.majorPerfLog('Created divs');

    var displayTheme = glift.themes.get(this.displayOptions.theme);

    if (this.displayOptions.goBoardBackground) {
      glift.themes.setGoBoardBackground(
          displayTheme, this.displayOptions.goBoardBackground);
    }

    this.display = glift.displays.create(
        divIds[glift.enums.boardComponents.BOARD],
        positioning.mustGetBbox(glift.enums.boardComponents.BOARD),
        displayTheme,
        boardRegion,
        intersections,
        this.sgfOptions.rotation,
        this.displayOptions.drawBoardCoords);
    glift.util.majorPerfLog('Finish creating display');

    if (divIds[glift.enums.boardComponents.COMMENT_BOX]) {
      this.commentBox = glift.displays.commentbox.create(
          divIds[glift.enums.boardComponents.COMMENT_BOX],
          positioning.mustGetBbox(glift.enums.boardComponents.COMMENT_BOX),
          displayTheme,
          this.displayOptions.useMarkdown);
    }
    glift.util.majorPerfLog('CommentBox');

    if (divIds[glift.enums.boardComponents.ICONBAR]) {
      /** @type {!Array<string>} */
      var icons = glift.util.simpleClone(this.sgfOptions.icons || []);
      if (this.manager.hasNextSgf()) {
        icons.push(this.displayOptions.nextSgfIcon);
      }
      if (this.manager.hasPrevSgf()) {
        icons.unshift(this.displayOptions.previousSgfIcon);
      }
      this.iconBar = glift.displays.icons.bar({
          divId: divIds[glift.enums.boardComponents.ICONBAR],
          positioning: positioning.mustGetBbox(glift.enums.boardComponents.ICONBAR),
          icons: icons,
          parentBbox: parentDivBbox,
          theme: displayTheme,
          allDivIds: divIds,
          allPositioning: positioning,
      }).draw();
    }
    glift.util.majorPerfLog('IconBar');
    divIds.ICONBAR && this.iconBar.initIconActions(this, this.iconActions);

    if (divIds[glift.enums.boardComponents.STATUS_BAR]) {
      // TODO(kashomon): Move this logic into a helper.
      /** @type {!Array<string>} */
      var statusBarIcons = glift.util.simpleClone(this.sgfOptions.statusBarIcons);
      if (this.manager.fullscreenDivId) {
        glift.array.replace(statusBarIcons, 'fullscreen', 'unfullscreen');
      }
      if (this.manager.sgfCollection.length > 1) {
        statusBarIcons.splice(0, 0, 'widget-page');
      }
      var statusBarIconBar = glift.displays.icons.bar({
          divId: divIds[glift.enums.boardComponents.STATUS_BAR],
          positioning: positioning.mustGetBbox(
              glift.enums.boardComponents.STATUS_BAR),
          icons: statusBarIcons,
          parentBbox: parentDivBbox,
          theme: displayTheme,
          allDivIds: divIds,
          allPositioning: positioning
      });
      this.statusBar = glift.displays.statusbar.create({
          iconBarPrototype: statusBarIconBar,
          theme: displayTheme,
          allPositioning: positioning,
          widget: this
      }).draw();
    }
    glift.util.majorPerfLog('StatusBar');
    divIds.STATUS_BAR && this.statusBar.iconBar.initIconActions(
        this, this.iconActions);

    glift.util.majorPerfLog('Before stone event creation');
    this.initStoneActions_(this.stoneActions);
    this.initKeyHandlers_();
    glift.util.majorPerfLog('After stone event creation');

    this.initProblemData_();
    this.applyBoardData(this.controller.flattenedState());
    return this;
  },

  /**
   * Gets the UI icons to use
   * @param {!glift.api.SgfOptions} sgfOptions
   * @return {!Array<glift.enums.boardComponents>}
   * @private
   */
  getUiComponents_: function(sgfOptions) {
    /** @type {!Array<glift.enums.boardComponents>} */
    var base = sgfOptions.uiComponents;
    base = base.slice(0, base.length); // make a shallow copy.
    /**
     * Helper to remove items from the array.
     * @param {!Array<glift.enums.boardComponents>} arr
     * @param {glift.enums.boardComponents} key
     */
    var rmItem = function(arr, key) {
      var idx = arr.indexOf(key);
      if (idx > -1) {
        arr.splice(idx, 1);
      }
    }
    var bc = glift.enums.boardComponents
    sgfOptions.disableStatusBar && rmItem(base, bc.STATUS_BAR);
    sgfOptions.disableBoard && rmItem(base, bc.BOARD);
    sgfOptions.disableCommentBox && rmItem(base, bc.COMMENT_BOX);
    sgfOptions.disableIconBar && rmItem(base, bc.ICONBAR);
    return base;
  },


  /**
   * Create an internal wrapper div to contain the whole go board. This sets
   * position relative on the internal div.
   * @private
   */
  createInternalWrapperDiv_: function() {
    var wrapDiv = glift.dom.newDiv(this.internalWrapperDivId);
    var cssObj = {
      height: '100%',
      width: '100%',
      position: 'relative'
    };
    wrapDiv.css(cssObj);
    glift.dom.elem(this.wrapperDivId).append(wrapDiv);
  },

  /**
   * Create divs from positioning (WidgetBoxes) and the wrapper div id.
   * @return {!Object<glift.enums.boardComponents, string>} a map from component
   *    name to the div Id.
   * @private
   */
  createDivsForPositioning_: function(positioning, intWrapperDivId) {
    // Map from component to ID.
    var out = {};
    var createDiv = function(bbox) {
      var newId = intWrapperDivId + '_internal_div_' + glift.util.idGenerator.next();
      var newDiv = glift.dom.newDiv(newId);
      var cssObj = {
        top: bbox.top() + 'px',
        left: bbox.left() + 'px',
        width: bbox.width() + 'px',
        height: bbox.height() + 'px',
        position: 'absolute',
        cursor: 'default'
      };
      newDiv.css(cssObj);
      glift.dom.elem(intWrapperDivId).append(newDiv);
      glift.dom.ux.setNotSelectable(newId);
      return newId;
    };
    positioning.map(function(key, bbox) {
      out[key] = createDiv(bbox);
    });
    return out;
  },

  /**
   * Initialize the stone actions.
   * @param {!glift.api.StoneActions} baseActions
   * @private
   */
  initStoneActions_: function(baseActions) {
    var actions = {};
    actions.mouseover = baseActions.mouseover;
    actions.mouseout = baseActions.mouseout;
    actions.click = this.sgfOptions.stoneClick;
    if (this.sgfOptions.stoneMouseover) {
      actions.mouseover = this.sgfOptions.stoneMouseover;
    }
    if (this.sgfOptions.stoneMouseout) {
      actions.mouseout = this.sgfOptions.stoneMouseout;
    }

    var wrapAction = function(func) {
      return function(event, pt) {
        this.manager.setActive();
        func(event, this, pt);
      }.bind(this);
    }.bind(this);
    if (actions.mouseover &&
        actions.mouseout &&
        !glift.platform.isMobile()) {
      this.display.intersections().setHover(
          wrapAction(actions.mouseover),
          wrapAction(actions.mouseout));
    }
    if (actions.click) {
      var actionName = 'click';
      if (glift.platform.isMobile()) {
        // Kinda a hack, but necessary to avoid the 300ms delay.
        actionName = 'touchend';
      }
      this.display.intersections().setEvent(
          actionName, wrapAction(actions.click));
    }
  },

  /*
   * Assign Key actions to some other action.
   * @private
   */
  initKeyHandlers_: function() {
    if (!this.displayOptions.enableKeyboardShortcuts) {
      return;
    }

    var keyMappings = glift.util.simpleClone(this.sgfOptions.keyMappings);
    if (this.manager.fullscreenDivId) {
      // We're fullscreened.  Add ESC to escape =)
      keyMappings['ESCAPE'] = 'iconActions.unfullscreen.click';
    }

    for (var keyName in keyMappings) {
      var iconPathOrFunc = keyMappings[keyName];
      glift.keyMappings.registerKeyAction(
          this.manager.id,
          keyName,
          iconPathOrFunc);
    }
    // Lazy initialize the key mappings. Only really runs once.
    glift.keyMappings.initKeybindingListener();
  },

  /**
   * Initialize properties based on problem type.
   * @private
   */
  initProblemData_: function() {
    if (this.sgfOptions.widgetType ===
        glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM) {
      var correctNext = this.controller.getCorrectNextMoves();
      // A Set: i.e., a map of points to true
      this.correctNextSet = this.correctNextSet || {};
      this.numCorrectAnswers = this.numCorrectAnswers || 0;
      this.totalCorrectAnswers = this.totalCorrectAnswers
          || this.sgfOptions.totalCorrectVariationsOverride
          || correctNext.length;
      // TODO(kashomon): Remove this hack: The icon should be specified with
      // some sort of options.
      this.iconBar.addTempText(
          'multiopen-boxonly',
          this.numCorrectAnswers + '/' + this.totalCorrectAnswers,
          { fill: 'black', stroke: 'black'});
    }
  },

  /**
   * Gets the initialized hooks or set them.
   * @return {!glift.api.HookOptions} the hooks.
   */
  hooks: function() {
    return this.externalHooks;
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   *
   * @param {?glift.flattener.Flattened} flattened The flattened representation
   *    of the board.
   */
  applyBoardData: function(flattened) {
    if (flattened) {
      this.setCommentBox(flattened.comment());
      this.statusBar &&
          this.statusBar.setMoveNumber(flattened.baseMoveNum())
      this.display.updateBoard(flattened);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   * @param {string} text To set on the comment box.
   * @return {!glift.widgets.BaseWidget} the current instance.
   */
  setCommentBox: function(text) {
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text) {
      this.commentBox.setText(text);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  /**
   * Reload the problem.  Note: This is too problem specific and probably needs
   * to be rethought.
   */
  reload: function() {
    if (this.correctness !== undefined) {
      this.correctNextSet = undefined;
      this.numCorrectAnswers = undefined;
      this.totalCorrectAnswers = undefined;
    }
    this.redraw();
  },

  /**
   * Gets the current state of the widget, so what we can accurately redraw the
   * widget.
   */
  getCurrentState: function() {
    return {
      currentTreepath: this.controller.pathToCurrentPosition()
    };
  },

  /**
   * Set the widget state from a state object and redraws.
   */
  applyState: function(stateObj) {
    var types = glift.enums.widgetTypes;
    if (this.sgfOptions.widgetType === types.REDUCED_GAME_VIEWER ||
        this.sgfOptions.widgetType === types.GAME_VIEWER) {
      var treepath = stateObj.currentTreepath;
      this.controller.initialize(treepath);
      this.applyBoardData(this.controller.flattenedState());
    }
    // TODO(kashomon): Support problems here.
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  redraw: function() {
    this.destroy();
    var state = this.getCurrentState();
    this.draw();
    this.applyState(state);
  },

  /** remove the widget and do various cleanups. */
  destroy: function() {
    var managerId = this.manager.id;
    glift.keyMappings.unregisterInstance(managerId);
    glift.dom.elem(this.wrapperDivId) &&
        glift.dom.elem(this.wrapperDivId).empty();
    this.correctness = undefined;
    this.display = undefined;
  }
};

goog.provide('glift.widgets.WidgetManager');

/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 *
 * @param {glift.api.Options} options Options Template for Glift API Options.
 *
 * @constructor @final @struct
 */
glift.widgets.WidgetManager = function(options) {

  // Globally unique ID, at least across all glift instances in the current
  // page. In theory, the divId should be globally unique, but might as well be
  // absolutely sure.
  this.id = options.divId + '-glift-' + glift.util.idGenerator.next();

  // Register the instance. Maybe should be its own method.
  glift.global.instanceRegistry[this.id] = this;

  // Set as active, if the active instance hasn't already been set. You can only
  // have one Glift instance per page that's active.
  !glift.global.activeInstanceId && this.setActive();

  /**
   * The original div id.
   * @type {string}
   */
  this.divId = options.divId;

  /**
   * The fullscreen div id. Only set via the fullscreen button. Necessary to
   * have for problem collections.
   * @type {?string}
   */
  this.fullscreenDivId = null;
  /**
   * The fullscreen div will always be at the top. So we jump up to the top
   * during fullscreen and jump back afterwards.
   * @type {?number}
   */
  this.prevScrollTop = null;
  /**
   * If we set the window resize (done, for ex. in the case of full-screening),
   * we track the window-resizing function.
   * @type {?function(?Event)}
   */
  this.oldWindowResize = null;

  /**
   * Note: At creation time of the manager, The param sgfCollection may either
   * be an array or a string representing a URL.  If the sgfCollection is a
   * string, then the JSON is requsted at draw-time and passed to
   * this.sgfCollection
   *
   * @type {!Array<!glift.api.SgfOptions|string>}
   */
  this.sgfCollection = [];

  /**
   * URL for getting the entire SGF collection.
   * @type {?string}
   */
  this.sgfCollectionUrl = null;

  // Performs collection initialization (pre ajax-loading).
  this.initSgfCollection_(options);

  /**
   * Cache of SGFs.  Useful for reducing the number AJAX calls.
   * Map from SGF name to String contents.
   *
   * @type {!Object<string>}
   */
  this.sgfCache = options.sgfMapping;

  /**
   * Index into the SGF Collection, if it exists.
   * @type {number}
   */
  this.sgfColIndex = options.initialIndex;

  /** @type {boolean} */
  this.allowWrapAround = options.allowWrapAround

  /**
   * The SGF Defaults template.
   * @type {!glift.api.SgfOptions}
   */
  this.sgfDefaults = options.sgfDefaults;
  /**
   * Display options
   * @type {!glift.api.DisplayOptions}
   */
  this.displayOptions = options.display;

  /**
   * Actions for the Icons
   * @type {!glift.api.IconActions}
   */
  this.iconActions = options.iconActions;

  /**
   * Actions for the Stones
   * @type {!glift.api.StoneActions}
   */
  this.stoneActions = options.stoneActions;

  /**
   * Whether to load SGFs in the background.
   * @type {boolean}
   */
  this.loadColInBack = options.loadCollectionInBackground;
  /**
   * Whether or not the background loading has begun.
   * @type {boolean}
   */
  this.initBackgroundLoading = false;

  /**
   * The main workhorse: The base glift widget. This is the object that handles
   * all the relevant SGF, controller, and display state.
   * @type {!glift.widgets.BaseWidget|undefined}
   */
  this.currentWidget = undefined;
  /**
   * Sometimes it's useful to create a temporary widget and hide the current
   * widget. The usecase for this is problems, where we define a temporary
   * results window.
   * @type {!glift.widgets.BaseWidget|undefined}
   */
  this.temporaryWidget = undefined

  /**
   * Global metadata for this manager instance.
   * @type {!Object|undefined}
   */
  this.metadata = options.metadata;

  /**
   * External hooks provided by users.
   *
   * A map of hook-name to hook-function.
   * @type {!glift.api.HookOptions}
   */
  this.hooks = options.hooks;
};

glift.widgets.WidgetManager.prototype = {
  /**
   * Creates a BaseWidget instance, and calls draw on the base widget.
   * @return {!glift.widgets.WidgetManager} The manager object.
   */
  draw: function() {
    var that = this;
    var afterCollectionLoad = function() {
      if (!this.initBackgroundLoading && this.loadColInBack) {
        // Only start background loading once.
        this.initBackgroundLoading = true;
        this.backgroundLoad();
      }
      var curObj = this.getCurrentSgfObj();
      this.loadSgfString(curObj, function(sgfObj) {
        // Prevent flickering by destroying the widget after loading the SGF.
        this.destroy();
        this.currentWidget = this.createWidget(sgfObj).draw();
      }.bind(this));
    }.bind(this);

    if (this.sgfCollection.length === 0 && this.sgfCollectionUrl) {
      glift.ajax.get(this.sgfCollectionUrl, function(data) {
        this.sgfCollection = /** @type {!Array<string|!glift.api.SgfOptions>} */ (
            JSON.parse(data));
        afterCollectionLoad();
      }.bind(this));
    } else {
      afterCollectionLoad();
    }
    return this;
  },

  /** Redraws the current widget. */
  redraw: function() {
    if (this.getCurrentWidget()) {
      this.getCurrentWidget().redraw();
    }
  },

  /** Set as the active widget in the global registry. */
  setActive: function() { glift.global.activeInstanceId = this.id; },

  /** Gets the current widget object. */
  getCurrentWidget: function() {
    if (this.temporaryWidget) {
      return this.temporaryWidget;
    } else {
      return this.currentWidget;
    }
  },

  /**
   * Initialize the SGF collection / collection URL
   * @param {!glift.api.Options} options The input-options.
   * @private
   */
  initSgfCollection_: function(options) {
    // Process explicitly defined collection arrays.
    if (glift.util.typeOf(options.sgfCollection) === 'array') {
      var coll = /** @type {!Array<!glift.api.SgfOptions|string>} */ (
          options.sgfCollection);
      for (var i = 0; i < coll.length; i++) {
        this.sgfCollection.push(coll[i]);
      }
      if (options.sgf && options.sgfCollection.length > 0) {
        throw new Error('Illegal options configuration: you cannot define both ' +
            'sgf and sgfCollection')
      } else if (options.sgf && options.sgfCollection.length === 0) {
        // Move the single SGF into the SGF collection.
        this.sgfCollection.push(options.sgf);
      } else if (!options.sgf && this.sgfCollection.length === 0) {
        // Allow the possibility of specifying no sgf to indicate a blank SGF.
        this.sgfCollection = [{}];
      }
    } else if (glift.util.typeOf(options.sgfCollection) === 'string') {
      // If it's a string, we assume the SGF collection should be loaded via
      // AJAX.
      this.sgfCollectionUrl = /** @type {string} */ (options.sgfCollection);
    }
  },

  /**
   * Gets the current SGF Object from the SGF collection. 
   */
  getCurrentSgfObj: function() { return this.getSgfObj(this.sgfColIndex); },

  /** @return {boolean} Whether there's a 'next' sgf */
  hasNextSgf: function() {
    if (this.sgfCollection.length &&
        this.sgfColIndex >= 0 &&
        this.sgfColIndex < this.sgfCollection.length - 1) {
      return true;
    } else if (
        this.sgfCollection.length &&
        this.sgfColIndex === this.sgfCollection.length - 1 &&
        this.allowWrapAround) {
      return true;
    } else {
      return false;
    }
  },

  /** @return {boolean} Whether there's a previous sgf */
  hasPrevSgf: function() {
    if (this.sgfCollection.length &&
        this.sgfColIndex > 0 &&
        this.sgfColIndex <= this.sgfCollection.length - 1) {
      return true;
    } else if (
        this.sgfCollection.length &&
        this.sgfColIndex === 0 &&
        this.allowWrapAround) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Get the current SGF Object from the sgfCollection. Note: If the item in the
   * array is a string, then we try to figure out whether we're looking at an
   * SGF or a URL and then we manufacture a simple sgf object.
   *
   * @return {!glift.api.SgfOptions}
   */
  getSgfObj: function(index) {
    if (index < 0 || index > this.sgfCollection.length) {
      throw new Error("Index [" + index +  " ] out of bounds."
          + " List size was " + this.sgfCollection.length);
    }
    var curSgfObj = this.sgfCollection[index];
    if (glift.util.typeOf(curSgfObj) === 'string') {
      var str = /** @type {string} */ (curSgfObj);
      var out = {};
      if (/^\s*\(;/.test(str)) {
        // We assume that this is a standard SGF String.
        out.sgfString = str;
      } else {
        // Assume a URL.
        out.url = str;
      }
      var toProc = out;
    } else {
      var toProc = /** @type {!Object} */ (curSgfObj);
    }
    return this.sgfDefaults.createSgfObj(toProc);
  },

  /**
   * Get the SGF string.  Since these can be loaded with ajax, the data needs to
   * be returned with a callback.
   *
   * sgfObj: A standard SGF Object.
   */
  loadSgfString: function(sgfObj, callback) {
    var alias = sgfObj.alias;
    var url = sgfObj.url;
    if (alias && this.sgfCache[alias]) {
      // First, check the cache for aliases.
      sgfObj.sgfString = this.sgfCache[alias];
      callback(sgfObj);
    } else if (url && this.sgfCache[url]) {
      // Next, check the cache for urls.
      sgfObj.sgfString = this.sgfCache[url];
      callback(sgfObj);
    } else if (sgfObj.url) {
      // Check if we need to do an AJAX request.
      this.loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      // Lastly: Just send the SGF object back.  Typically, this will be because
      // either:
      //  1. The SGF has been aliased.
      //  2. We want to start with a blank state (i.e., in the case of the
      //     editor).
      if (sgfObj.alias && sgfObj.sgfString) {
        // Create a new cache entry.
        this.sgfCache[sgfObj.alias] = sgfObj.sgfString;
      }
      callback(sgfObj);
    }
  },

  /**
   * Like the above function, but doesn't do XHR -- returns the input SGF object
   * if no SGF exists in the sgf cache. Convenient for contexts where you are
   * certain that the SGF has already been loaded.
   * @param {!glift.api.SgfOptions} sgfObj
   * @return {!glift.api.SgfOptions} Now we ensure that the SGF object has the
   *    sgf finished.
   */
  loadSgfStringSync: function(sgfObj) {
    var alias = sgfObj.alias;
    var url = sgfObj.url;
    if (alias && this.sgfCache[alias]) {
      // First, check the cache for aliases.
      sgfObj.sgfString = this.sgfCache[alias];
      return sgfObj;
    } else if (url && this.sgfCache[url]) {
      // Next, check the cache for urls.
      sgfObj.sgfString = this.sgfCache[url];
      return sgfObj;
    } else {
      return sgfObj;
    }
  },

  /**
   * Get the currentDivId. This is only interesting because the 
   * @return {string}
   */
  getDivId: function() {
    if (this.fullscreenDivId) {
      return this.fullscreenDivId;
    } else {
      return this.divId;
    }
  },

  /**
   * Create a Sgf Widget that actually does the work of fitting together the
   * board and icons.
   * @param {!glift.api.SgfOptions} sgfObj
   * @return {!glift.widgets.BaseWidget} The construct widget. Note: at this
   *    point, the widget has not yet been 'drawn'.
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(
        this.getDivId(), sgfObj, this.displayOptions, this.iconActions,
        this.stoneActions, this, this.hooks);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   * @param {!glift.api.SgfOptions} sgfObj
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget && this.currentWidget.destroy();
    var obj = this.sgfDefaults.createSgfObj(sgfObj);
    this.temporaryWidget = this.createWidget(obj).draw();
  },

  /** Returns from the temporary widget to the original widget. */
  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /**
   * Internal implementation of nextSgf/previous sgf.
   * @param {number} indexChange
   * @private
   */
  nextSgfInternal_: function(indexChange) {
    if (!this.sgfCollection.length > 1) {
      return; // Nothing to do
    }
    if (this.allowWrapAround) {
      this.sgfColIndex = (this.sgfColIndex + indexChange + this.sgfCollection.length)
          % this.sgfCollection.length;
    } else {
      this.sgfColIndex = this.sgfColIndex + indexChange;
      if (this.sgfColIndex < 0) {
        this.sgfColIndex = 0;
      } else if (this.sgfColIndex >= this.sgfCollection.length) {
        this.sgfColIndex = this.sgfCollection.length - 1;
      }
    }
    this.draw();
  },

  /** Get the next SGF.  Requires that the list be non-empty. */
  nextSgf: function() { this.nextSgfInternal_(1); },

  /** Get the next SGF.  Requires that the list be non-empty. */
  prevSgf: function() { this.nextSgfInternal_(-1); },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   * @param {string} url
   * @param {!glift.api.SgfOptions} sgfObj
   * @param {!function(glift.api.SgfOptions)} callback For when the ajax request
   *    completes.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    glift.ajax.get(url, function(data) {
      this.sgfCache[url] = data;
      sgfObj.sgfString = data;
      callback(sgfObj);
    }.bind(this));
  },

  /**
   * Load the SGFs in the background.  Try once every 250ms until we get to the
   * end of the SGF collection.
   */
  backgroundLoad: function() {
    var loader = function(idx) {
      if (idx < this.sgfCollection.length) {
        var curObj = this.getSgfObj(idx);
        this.loadSgfString(curObj, function() {
          setTimeout(function() {
            loader(idx + 1);
          }.bind(this), 250); // 250ms
        });
      }
    }.bind(this);
    loader(this.sgfColIndex + 1);
  },

  /**
   * Whether or not the widget is currently fullscreened.
   * @return {boolean}
   */
  isFullscreen: function() {
    return !!this.fullscreenDivId;
  },

  /** Enable auto-resizing of the glift instance. */
  enableFullscreenAutoResize: function() {
    if (window.onresize) { this.oldWindowResize = window.onresize; }
    window.onresize = function() { this.redraw(); }.bind(this);
  },

  /** Disable auto-resizing of the glift instance. */
  disableFullscreenAutoResize: function() {
    window.onresize = this.oldWindowResize;
    this.oldWindowResize = null;
  },

  /** Undraw the most recent widget and remove references to it. */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    return this;
  }
};

goog.provide('glift.api');

/**
 * Namespace for API-related methods. Not all of these are meant to be exposed
 * as public methods.
 */
glift.api = {
  /**
   * Returns a widgetManager and draw the widget. Users should not use this
   * method directly, instead peferring 'glift.create(<options>)'.
   *
   * @package
   * @param {!Object} inOptions A Glift's options obj (typically specified as an object
   *    literal). See glift.api.Options. We don't technically specify the type
   *    her as glift.api.Options because the expectation is that the object will
   *    be an object literal rather than a constructed obj.
   * @return {glift.widgets.WidgetManager}
   */
  create: function(inOptions) {
    glift.util.perfInit();
    var manager = glift.api.createNoDraw(inOptions);

    glift.init(
        manager.displayOptions.disableZoomForMobile,
        manager.divId);

    glift.util.majorPerfLog('Finish creating manager');
    manager.draw();
    glift.util.majorPerfLog('Finish drawing manager');
    glift.util.perfDone();
    return manager;
  },

  /**
   * Create a widgetManager without performing 'draw'.  This also has the
   * side effect of avoiding init code.
   *
   * This is public because it's sometimes useful to create a Glift instance
   * this way.
   *
   * @param {!Object} inOptions
   * @return {glift.widgets.WidgetManager}
   */
  createNoDraw: function(inOptions) {
    var options = new glift.api.Options(
        /** @type {!glift.api.Options} */ (inOptions));
    return new glift.widgets.WidgetManager(options);
  }
};


/**
 * The primary entry point for Glift. Creates and draws a glift instance.
 *
 * api:1.0
 */
glift.create = glift.api.create;

goog.provide('glift.api.DisplayOptions');


/**
 * Miscellaneous options for display.
 * api:1.0
 *
 * @param {glift.api.DisplayOptions=} opt_o Optional display options obj.
 *
 * @constructor @final @struct
 */
glift.api.DisplayOptions = function(opt_o) {
  var o = opt_o || {};

  /**
   * Specify a background image for the go board.  You can specify an absolute
   * or a relative path.  As you may expect, you cannot do cross domain
   * requests.
   *
   * Examples:
   *  'images/kaya.jpg'
   *  'http://www.mywebbie.com/images/kaya.jpg'
   *
   * api:1.0
   *
   * @type {string}
   */
  this.goBoardBackground = o.goBoardBackground || '';

  /**
   * The name of the theme to be used for this instance. Other themes include:
   *  - DEPTH (stones with shadows)
   *  - MOODY (gray background, no stone outlines)
   *  - TRANSPARENT (board is transparent)
   *  - TEXTBOOK (Everything black and white)
   * api:1.0
   *
   * @type {string}
   */
  // TODO(kashomon): Make a proper enum for this.
  this.theme = o.theme || 'DEFAULT';

  /**
   * On the edges of the board, draw the board coordinates.
   * - On the left, use the numbers 1-19
   * - On the bottom, use A-T (all letters minus I)
   * api:1.0
   *
   * @type {boolean}
   */
  this.drawBoardCoords = !!o.drawBoardCoords || false;

  /**
   * Split percentages to use for a one-column widget format.
   *
   * @type {!Object}
   */
  // TODO(kashomon): Define proper type for this.
  this.oneColumnSplits = o.oneColumnSplits || {
    first: [
      { component: 'STATUS_BAR',   ratio: 0.06 },
      { component: 'BOARD',       ratio: 0.67 },
      { component: 'COMMENT_BOX', ratio: 0.18 },
      { component: 'ICONBAR',     ratio: 0.09 }
    ]
  };

  /**
   * Split percentages to use for a two-column widget format.
   *
   * @type {!Object}
   */
  // TODO(kashomon): Define a proper type for this.
  this.twoColumnSplits = o.twoColumnSplits || {
    first: [
      { component: 'BOARD', ratio: 1 }
    ],
    second: [
      { component: 'STATUS_BAR',     ratio: 0.07 },
      { component: 'COMMENT_BOX',   ratio: 0.83 },
      { component: 'ICONBAR',       ratio: 0.10 }
    ]
  };

  /**
   * Previous SGF icon.
   * @type {string}
   */
  this.previousSgfIcon = o.previousSgfIcon || 'chevron-left';

  /**
   * Next SGF Icon.
   * @type {string}
   */
  this.nextSgfIcon = o.nextSgfIcon || 'chevron-right';

  /**
   * For convenience: Disable zoom for mobile users.
   * @type {boolean}
   */
  this.disableZoomForMobile = !!o.disableZoomForMobile || false;

  /**
   * Whether or not to enable keyboard shortcuts. This currently binds
   * keypress events to document.body, so it's not unlikely this could
   * conflict with other applications' keybindings.
   * @type {boolean}
   */
  this.enableKeyboardShortcuts =
      o.enableKeyboardShortcuts !== undefined ?
      !!o.enableKeyboardShortcuts : true;

  /**
   * Use Markdown for the comment box.  This requires that marked.js be
   * installed in the global scope. (https://github.com/chjj/marked)
   * @api(experimental)
   *
   * @type {boolean}
   */
  this.useMarkdown = !!o.useMarkdown || false;
};

goog.provide('glift.api.HookOptions');

/**
 * Hooks/callbacks for integrating with glift.
 *
 * @param {!glift.api.HookOptions=} opt_o Optional options.
 *
 * @constructor @final @struct
 */
glift.api.HookOptions = function(opt_o) {
  var o = opt_o || {};

  /**
   * Instead of an SGF collection, users can provide a getNextSgf function.
   * This means that the SGFs in a are stored external to Glift (e.g., on a
   * problem-server).
   *
   * Has the format: function(callback)
   *
   * The call back always expects an sgf object, which has the form:
   *  {
   *    sgfString: <string-sgf contents>
   *    alias: <string for cache-hits>
   *  }
   *
   * @type {(function()|undefined)}
   */
  this.getNextSgf = o.getNextSgf || undefined;

  /**
   * Fires when user gets a problem correct. This is a notification function
   * only.
   *
   * @type {(function()|undefined)}
   */
  this.problemCorrect = o.problemCorrect || undefined;

  /**
   * Fires when user gets a problem wrong.
   *
   * @type {(function()|undefined)}
   */
  this.problemIncorrect = o.problemIncorrect || undefined;
};

goog.provide('glift.api.IconActions');
goog.provide('glift.api.IconDef');
goog.provide('glift.api.IconFn');

/**
 * A typedef representing an action performed on the Go Board itself (clicking,
 * hovering, etc.)
 *
 * @typedef {function(
 *  !Event,
 *  !glift.widgets.BaseWidget,
 *  !glift.displays.icons.WrappedIcon,
 *  !glift.displays.icons.IconBar)
 * }
 */
glift.api.IconFn;

/**
 * An icon definition.
 * @typedef {{
 *  click: (!glift.api.IconFn|undefined),
 *  tooltip: (string|undefined)
 * }}
 */
glift.api.IconDef;

/**
 * A collection of Icon Actions.
 * @typedef {!Object<string, glift.api.IconDef>}
 */
glift.api.IconActions;

/**
 * The actions for the icons (see glift.displays.svg.icons).
 * @type {!glift.api.IconActions}
 */
glift.api.iconActionDefaults = {
  start: {
    click: function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.toBeginning());
    },
    tooltip: 'Go to the beginning'
  },

  end: {
    click:  function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.toEnd());
    },
    tooltip: 'Go to the end'
  },

  arrowright: {
    click: function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.nextMove());
    },
    tooltip: 'Next move'
  },

  arrowleft: {
    click:  function(event, widget, icon, iconBar) {
      widget.applyBoardData(widget.controller.prevMove());
    },
    tooltip: 'Previous move'
  },

  // Get next problem.
  'chevron-right': {
    click: function(event, widget, icon, iconBar) {
      widget.manager.nextSgf();
    },
    tooltip: 'Next panel'
  },

  // Get the previous problem.
  'chevron-left': {
    click: function(event, widget, icon, iconBar) {
      widget.manager.prevSgf();
    },
    tooltip: 'Previous panel'
  },

  // Try again
  refresh: {
    click: function(event, widget, icon, iconBar) {
      widget.reload();
    },
    tooltip: 'Try the problem again'
  },

  // Undo for just problems (i.e., back one move).
  'undo-problem-move': {
    click:  function(event, widget, icon, iconBar) {
      if (widget.controller.movetree.node().getNodeNum() <=
          widget.initialMoveNumber) {
        return;
      }

      if (widget.initialPlayerColor === widget.controller.getCurrentPlayer()) {
        // If it's our move, then the last move was by the opponent -- we need
        // an extra move backwards.
        widget.applyBoardData(widget.controller.prevMove());
      }

      widget.applyBoardData(widget.controller.prevMove());
      if (widget.initialMoveNumber ===
          widget.controller.movetree.node().getNodeNum()) {
        // We're at the root.  We can assume correctness, so reset the widget.
        widget.reload();
      } else {
        var problemResults = glift.enums.problemResults;
        var correctness = widget.controller.correctnessStatus();
        widget.iconBar.destroyTempIcons();
        if (correctness === problemResults.CORRECT) {
            widget.iconBar.setCenteredTempIcon(
                'multiopen-boxonly', 'check', '#0CC');
            widget.correctness = problemResults.CORRECT;
        } else if (correctness === problemResults.INCORRECT) {
          widget.iconBar.destroyTempIcons();
          widget.iconBar.setCenteredTempIcon(
              'multiopen-boxonly', 'cross', 'red');
          widget.correctness = problemResults.INCORRECT;
        }
      }
    },
    tooltip: 'Undo last move attempt'
  },

  undo: {
    click: function(event, widget, icon, iconBar) {
      widget.manager.returnToOriginalWidget();
    },
    tooltip: 'Return to the parent widget'
  },

  'jump-left-arrow': {
    click: function(event, widget, icon, iconBar) {
      var maxMoves = 20;
      widget.applyBoardData(widget.controller.previousCommentOrBranch(maxMoves));
    },
    tooltip: 'Previous branch or comment'
  },

  'jump-right-arrow': {
    click: function(event, widget, icon, iconBar) {
      var maxMoves = 20;
      widget.applyBoardData(widget.controller.nextCommentOrBranch(maxMoves));
    },
    tooltip: 'Previous branch or comment'
  },

  // Go to the explain-board for a problem.
  // (was roadmap)
  'problem-explanation': {
    click: function(event, widget, icon, iconBar) {
      var manager = widget.manager;
      var sgfObj = {
        widgetType: glift.enums.widgetTypes.GAME_VIEWER,
        initialPosition: widget.controller.initialPosition,
        sgfString: widget.controller.originalSgf(),
        showVariations: glift.enums.showVariations.ALWAYS,
        problemConditions: glift.util.simpleClone(
            widget.sgfOptions.problemConditions),
        icons: [
          'jump-left-arrow',
          'jump-right-arrow',
          'arrowleft',
          'arrowright',
          'undo'
        ],
        rotation: widget.sgfOptions.rotation,
        boardRegion: widget.sgfOptions.boardRegion
      }
      manager.createTemporaryWidget(sgfObj);
    },
    tooltip: 'Explore the solution'
  },

  multiopen: {
    click: function(event, widget, icon, iconBar) {
      var ic = glift.displays.icons.iconSelector(
          widget.wrapperDivId,
          iconBar.divId,
          icon);
      ic.setIconEvents('click', function(event, wrappedIcon) {
        var multi = iconBar.getIcon('multiopen')
        multi.setActive(wrappedIcon.iconName);
        iconBar.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
      });
    }
  },

  'multiopen-boxonly': {
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    tooltip: 'Shows if the problem is solved'
  },

  //////////////////////
  // Status Bar Icons //
  //////////////////////

  'game-info': {
    click: function(event, widget, icon, iconBar) {
      widget.statusBar &&
      widget.statusBar.gameInfo(
          widget.controller.getGameInfo(),
          widget.controller.getCaptureCount());
    },
    tooltip: 'Show the game info'
  },

  // TODO(kashomon): The 'move-indicator' is harded somewhere and needs to be
  // fixed.
  'move-indicator': {
    click: function() {},
    mouseover: function() {},
    mouseout: function() {},
    tooltip: 'Shows the current move number'
  },

  fullscreen: {
    click: function(event, widget, icon, iconBar) {
      widget.statusBar && widget.statusBar.fullscreen();
    },
    tooltip: 'Expand display to fill entire screen.'
  },

  unfullscreen: {
    click: function(event, widget, icon, iconBar) {
      // We need to stop event propagation because often the un-fullscreen
      // button will be over some other clickable element.
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
      widget.statusBar && widget.statusBar.unfullscreen();
    },
    tooltip: 'Return display original size.'
  },

  'settings-wrench': {
    click: function() {},
    tooltip: 'Show Glift Settings'
  }
};

goog.provide('glift.api.Options');

/**
 * Option defaults. Sometimes I will refer to the a subset of these options as a
 * Glift Spec.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options having to do with managing widgets.  These
 *    are generally at the top level.
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. SGF Options. Options having to do specifically with each SGF.
 *
 * Terminology:
 *  - I use SGF through this file and in Glift to refer to a go-data-file.  This
 *    is largely due to myopia early in the dev process. With the @api(1.X) in
 *    full sway, it's not easy to change this distinction. Regardless, it is
 *    possible that in the future, SGF strings and SGF URLs will grow to
 *    encompass other types go-data, like the Tygem .gib filetypes.
 *
 * API annotations:
 *
 *  - api:1.X Indicates an option supported for the lifetime of the 1.X
 *    release.
 *  - api:beta Indicates an option currently slated to become a 1.X option.
 *  - api:experimental Indicates an option in testing.
 *
 * @param {!glift.api.Options=} opt_o
 *
 * @constructor @final @struct
 */
glift.api.Options = function(opt_o) {
  var o = opt_o || {};

  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object, with parameters specified in SGF Defaults
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to an SGF. see sgfDefaults for va
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   *
   * Practically speaking, this value will always be undefined after the
   * glift.api.Options object construction since the 'SGF' will get stuffed into
   * the SGF Collection immediately and set to undefined.
   *
   * api:1.0
   *
   * @type {(string|glift.api.SgfOptions|undefined)}
   */
  this.sgf = o.sgf || undefined;

  /**
   * See: glift.api.sgfOptionDefaults and glift.api.SgfOptions
   * api:1.0
   *
   * @const
   * @type {!glift.api.SgfOptions}
   */
  this.sgfDefaults = new glift.api.SgfOptions(o.sgfDefaults);

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   * api:1.0
   *
   * @const
   * @type {string}
   */
  this.divId = o.divId || 'glift_display';

  /**
   * The SGF collection represents a set of SGFs. Like the Sgf parameter, this
   * can take one of three values:
   * - An array of SGF objects. If the SGF param above is defined, the sgf
   *   collection will automatically become an array of size one containing the
   *   SGF element above.
   * - A URL (to load the collection asynchronously).  The received data must be
   *   a JSON array, containing a list of serialized SGF objects.
   *
   * Once an SGF Collection is loaded, Glift looks through each entry in the
   * collection.  If an SGF URL is found, the SGF is loaded in the background
   * and cached.
   * api:1.0
   *
   * @const
   * @type {!Array<!glift.api.SgfOptions|string>|string}
   */
  this.sgfCollection = o.sgfCollection || [];

  /**
   * An experimental feature. Create an association between.  This defines the
   * basis of the manager SGF cache.
   *
   * Expects the structure:
   *  {
   *    [name/alias]: <sgf string>
   *  }
   *
   * api:experimental
   *
   * @type {!Object<string>}
   */
  this.sgfMapping = o.sgfMapping || {};

  /**
   * Index into the above collection.  This is mostly useful for remembering
   * someone's position in the sgf collection.
   *
   * api:1.0
   *
   * @type {number}
   */
  this.initialIndex = o.initialIndex || 0;

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   *
   * api:experimental
   *
   * @type {boolean}
   */
  this.allowWrapAround = !!o.allowWrapAround || false;

  /**
   * Wether or not to load the the collection in the background via XHR requests.
   *
   * api:beta
   *
   * @type {boolean}
   */
  this.loadCollectionInBackground =
      o.loadCollectionInBackground !== undefined ?
      !!o.loadCollectionInBackground : true;

  /**
   * Global metadata for this set of options or SGF collection.  These is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   *
   * Note: This was created to be used by GPub.
   *
   * api:experimental
   *
   * @type {!Object|undefined}
   */
  this.metadata = o.metadata || undefined;

  /**
   * Hooks are places where users can provide custom functions to 'hook' into
   * Glift behavior.
   *
   * api:experimental
   *
   * @type {!glift.api.HookOptions}
   */
  this.hooks = new glift.api.HookOptions(o.hooks);

  /**
   * Miscellaneous options for display.
   * api:1.0
   *
   * @type {!glift.api.DisplayOptions}
   */
  this.display = new glift.api.DisplayOptions(o.display);

  /**
   * Default actions for stones.
   * api:1.0
   *
   * @type {!glift.api.StoneActions}
   */
  this.stoneActions = new glift.api.StoneActions(o.stoneActions);

  /**
   * The actions for the icons.  See glift.api.iconActionDefaults.
   * api:1.0
   *
   * @type {!glift.api.IconActions}
   */
  this.iconActions = o.iconActions || {};
  for (var iconName in glift.api.iconActionDefaults) {
    if (!this.iconActions[iconName]) {
      this.iconActions[iconName] = glift.api.iconActionDefaults[iconName];
    }
  }
};

goog.provide('glift.api.SgfOptions');
goog.provide('glift.api.WidgetTypeOptions');

/**
 * SGF Options specifically overridden from a specific widget type.
 *
 * See glift.api.SgfOptions for more details
 *
 * Notes:
 * - The first four params are optional.
 * - The the rest are required.
 *
 * @typedef {{
 *  keyMappings: (!Object<string>|undefined),
 *  markLastMove: (boolean|undefined),
 *  problemConditions: (!glift.rules.ProblemConditions|undefined),
 *  controllerFunc: !glift.controllers.ControllerFunc,
 *  icons: !Array<string>,
 *  showVariations: glift.enums.showVariations,
 *  statusBarIcons: !Array<string>,
 *  stoneClick: !glift.api.StoneFn,
 *  stoneMouseover: (glift.api.StoneFn|undefined),
 *  stoneMouseout: (glift.api.StoneFn|undefined)
 * }}
 */
glift.api.WidgetTypeOptions;

/**
 * The defaults for SGF objects. These are equivalent to the options used for
 * each SGF.  In other words, you can set these options either in each
 * individual SGF, or you may set these options in the SGF defaults. Some
 * options are specified here, but should only be specified in the individual
 * SGF (sgfString, url).
 *
 * @constructor @final @struct
 *
 * @param {glift.api.SgfOptions=} opt_o Options which may be partially filled
 *    out.
 */
glift.api.SgfOptions = function(opt_o) {
  var o = opt_o || {};

  /**
   * A literal SGF String. This is often overwritten when the SGF String is
   * retrived via an AJAX call and so thus cannot be const.
   *
   * @type {string|undefined}
   */
  this.sgfString = o.sgfString !== undefined ? o.sgfString : undefined;

  /**
   * URL (usually relative) to an SGF. Once loaded, the resulting data is
   * cached to speed recall time.
   * api:1.0
   *
   * @type {string|undefined}
   * @const
   */
  this.url = o.url !== undefined ? o.url : undefined;

  /**
   * A name to by which an SGF String can be referred to later.  This is only
   * necessary for SGF Strings -- URLs are their own aliases.
   *
   * Note: If this feature is used, the SGF should be supplied in a SGF Mapping.
   * api:experimental
   *
   * @type {string|undefined}
   * @const
   */
  this.alias = o.alias !== undefined ? o.alias : undefined;

  /**
   * Parsing type.  Defaults to SGF. Supports:
   *  SGF
   *  TYGEM
   *  PANDANET
   *
   * api:beta
   *
   * @type {glift.parse.parseType}
   * @const
   */
  this.parseType = o.parseType || glift.parse.parseType.SGF;

  /**
   * The default widget type. Specifies what type of widget to create.
   *
   * api:1.0
   *
   * @type {glift.enums.widgetTypes}
   * @const
   */
  this.widgetType = o.widgetType || glift.enums.widgetTypes.GAME_VIEWER;

  /**
   * Defines where to start on the go board. An empty string implies the very
   * beginning, which is equally equivalent to 0 or [0].
   *
   * Rather than describe how you can detail the paths, here are some examples
   * of ways to specify an initial position.
   * 0         - Start at the 0th move (the root node)
   * 1         - Start at the 1st move.
   * 53        - Start at the 53rd move, taking the primary (main-line) path
   * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
   * 3         - Start at the 3rd move, going through all the top variations
   * 2.0       - Start at the 3rd move, going through all the top variations
   * 0.0.0.0   - Start at the 3rd move, going through all the top variations
   * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by
   *             traveling through the 3rd varition on the 2nd move
   * 0+        - Go to the end of the game
   * 2.3+      - Start at the 3rd variation on move 2, and go to the end
   *
   * api:1.0
   *
   * @type {string|!Array<number>}
   * @const
   */
  this.initialPosition = o.initialPosition || '';

  /**
   * The next moves path indicates moves that should be played past the
   * initial position. This should only be used for 'EXAMPLE' types and is
   * meant to simulate print diagriams.
   *
   * The next moves path is a path similar to the initial position in that it
   * specifies a path.  However, it's more restricted because we can't specify
   * move numbers -- only variation numbers -- since a next moves path is a
   * path fragment. Moreover, the first number is interpreted as a variation
   * number rather than a move number, as is the case for the initial
   * position.
   *
   * In otherwords, these are allowed:
   *  1         - Go through the 1st variation
   *  0.0.0.0   - Go through the 0th varation 4 times
   *  2.3       - Go through the 2nd variation and the 3rd variation
   *  2.0+      - Go through the 2nd variation and go to the end.
   *
   * These are not:
   *  2-3
   *
   * api:1.1
   *
   * @type {string|!Array<number>}
   * @const
   */
  this.nextMovesPath = o.nextMovesPath || '';

  /**
   * The board region to display.  The boardRegion will be 'guessed' if it's set
   * to 'AUTO'.
   *
   * api:1.0
   *
   * @type {glift.enums.boardRegions}
   * @const
   */
  this.boardRegion = o.boardRegion || glift.enums.boardRegions.AUTO;

  /**
   * What rotation to apply to -just- the display of the stones. Any of:
   * NO_ROTATION, CLOCKWISE_90, CLOCKWISE_180, CLOCKWISE_270, or undefined;
   *
   * api:beta
   *
   * @type {glift.enums.rotations}
   * @const
   */
  this.rotation = o.rotation || glift.enums.rotations.NO_ROTATION;

  /**
   * The UI Components to use for this display.
   *
   * api:1.0
   *
   * @type {!Array<glift.enums.boardComponents>}
   * @const
   */
  this.uiComponents = o.uiComponents || [
    glift.enums.boardComponents.BOARD,
    glift.enums.boardComponents.COMMENT_BOX,
    glift.enums.boardComponents.STATUS_BAR,
    glift.enums.boardComponents.ICONBAR
  ];

  /**
   * Convenience variables for disabling ui components.
   *
   * api:experimental
   * @type {boolean}
   * @const
   */
  this.disableStatusBar = !!o.disableStatusBar || false;
  /**
   * @type {boolean}
   * @const
   */
  this.disableBoard = !!o.disableBoard || false;
  /**
   * @type {boolean}
   * @const
   */
  this.disableCommentBox = !!o.disableCommentBox || false;
  /**
   * @type {boolean}
   * @const
   */
  this.disableIconBar = !!o.disableIconBar || false;

  /**
   * Metadata for this SGF.  Like the global metadata, this option is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   *
   * api:experimental
   *
   * @type {!Object|undefined}
   * @const
   */
  this.metadata = o.metadata || undefined;

  /**
   * For all correct, there are multiple correct answers that a user must get.
   * This allows us to specify (in ms) how long the user has until the problem
   * is automatically reset.
   *
   * Should be overridden by the widget options.
   *
   * @type {number|undefined}
   * @const
   */
  this.correctVariationsResetTime =
      o.correctVariationsResetTime !== undefined ?
      o.correctVariationsResetTime : 750; // ms

  /**
   * You can, if you wish, override the total number of correct variations
   * that a user must get correct. Currently only applies to
   * CORRECT_VARIATIONS_PROBLEM.
   *
   * @type {number|undefined}
   * @const
   */
  this.totalCorrectVariationsOverride =
      o.totalCorrectVariationsOverride || undefined;

  //-------------------------------------------------------------------------
  // These options must always be overriden by the widget type overrides.
  //
  // This could easily be changed, but right now this exists as a reminder to
  // the widget creator that they should override these options. In practice,
  // it seems that these particular options need to be set on a per-widget
  // basis anyway.
  //-------------------------------------------------------------------------

  /**
   * Icons to use in the status bar.
   *
   * Note: These should be defined by the type-specific options.
   *
   * An example of what this looks like in practice:
   *
   * [
   *   'game-info',
   *   'move-indicator',
   *   'fullscreen'
   *   'settings-wrench'
   * ],
   *
   * api:1.0
   *
   * @type {!Array<string>|undefined}
   * @const
   */
  this.statusBarIcons = o.statusBarIcons || undefined;

  /**
   * Experiment for using the flattener in the controller.
   * @const {boolean}
   */
  this.flattenerExperiment = o.flattenerExperiment || false;

  /**
   * Specifies what action to perform based on a particular keystroke.  In
   * otherwords, a mapping from key-enum to action path.
   * See glift.keyMappings
   *
   * api:beta
   *
   * @type {!Object<string>}
   * @const
   */
  this.keyMappings = o.keyMappings || {
    ARROW_LEFT: 'iconActions.chevron-left.click',
    ARROW_RIGHT: 'iconActions.chevron-right.click'
  };

  /**
   * Conditions for determing whether a branch of a movetree is correct.  A
   * map from property-keys, to an array of substring values.  If the array is
   * empty, then we only test to see if the property exists at the current
   * positien.
   *
   * The default tests whether there is a 'GB' property or a 'C' (comment)
   * property containing 'Correct' or 'is correct'.
   *
   * api:1.0
   *
   * @type {!glift.rules.ProblemConditions}
   * @const
   */
  this.problemConditions = o.problemConditions || {
    GB: [],
    C: ['Correct', 'is correct', 'is the correct']
  };

  /**
   * Whether or not to show variations.  See glift.enums.showVariations
   * Values: NEVER, ALWAYS, MORE_THAN_ONE
   *
   * @type {glift.enums.showVariations}
   * @const
   */
  this.showVariations = o.showVariations ||
      glift.enums.showVariations.MORE_THAN_ONE;

  /**
   * Whether or not to mark the last move played.  Either true or false, but
   * defaults to true.
   *
   * @type {boolean}
   * @const
   */
  this.markLastMove = o.markLastMove !== undefined ?
      o.markLastMove : true;

  /**
   * The function that creates the controller at widget-creation time.
   * See glift.controllers for more detail
   *
   * api:1.0
   *
   * @type {!glift.controllers.ControllerFunc|undefined}
   * @const
   */
  this.controllerFunc = o.controllerFunc || undefined;

  /**
   * The names of the icons to use in the icon-bar.  This is a list of
   * icon-names, which must be spceified in glift.displays.icons.svg.
   *
   * api:1.0
   *
   * @type {!Array<string>|undefined}
   * @const
   */
  this.icons = o.icons || undefined;

  /**
   * The action that is performed when a sure clicks on an intersection.
   *
   * api:1.0
   *
   * @type {!glift.api.StoneFn|undefined}
   * @const
   */
  this.stoneClick = o.stoneClick || undefined;

  /**
   * Mouseover/mouseout override for stones.
   * @type {!glift.api.StoneFn}
   * @const
   */
  this.stoneMouseover = o.stoneMouseover || undefined;
  /**
   * @type {!glift.api.StoneFn}
   * @const
   */
  this.stoneMouseout = o.stoneMouseout || undefined;
};

glift.api.SgfOptions.prototype = {
  /**
   * Set some defaults in the sgf object.  This does two passes of 'option'
   * settings.  First we apply the sgfOptions. Then, we apply the
   * widgetOverrides to any options not already filled in.
   *
   * sgf: An object {...} with some settings specified by sgfDefaults.
   * sgfDefaults: Processed SGF defaults.
   *
   * @param {!Object} sgf The raw SGF object.
   *
   * @retun {!glift.api.SgfOptions} The completed SGF options, which can be then
   * used by the widget manager and the controller.
   */
  createSgfObj: function(sgf) {
    if (glift.util.typeOf(sgf) !== 'object') {
      throw new Error('SGF must be of type object, was: '
          + glift.util.typeOf(sgf) + ', for ' + sgf);
    }

    var widgetType = sgf.widgetType || this.widgetType;
    var widgetOverrides = glift.api.widgetopt[widgetType];
    for (var key in widgetOverrides) {
      if (!sgf[key] && widgetOverrides[key] !== undefined) {
        sgf[key] = glift.util.simpleClone(widgetOverrides[key]);
      }
    }

    var sdef = /** @type {!Object} */ (this);
    for (var key in sdef) {
      if (!sgf[key] && sdef[key] !== undefined && key !== 'createSgfObj') {
        sgf[key] = sdef[key];
      }
    }

    return new glift.api.SgfOptions(/** @type {!glift.api.SgfOptions} */ (sgf));
  }
};

goog.provide('glift.api.StoneActions');
goog.provide('glift.api.StoneFn');


/**
 * A typedef representing an action that can be performed by clic
 *
 * @typedef {function(
 *  !Event,
 *  !glift.widgets.BaseWidget,
 *  !glift.Point)
 * }
 */
glift.api.StoneFn;

/**
 * Actions for stones.  If the user specifies his own actions, then the
 * actions specified by the user will take precedence.
 *
 * @param {glift.api.StoneActions=} opt_o
 *
 * @constructor @final @struct
 */
glift.api.StoneActions = function(opt_o) {
  var o = opt_o || {};

  // Note: We don't add a click function here because a default-click handler
  // doesn't make sense across widget types.

  /**
   * Add ghost-stone for cursor hovering.
   *
   * @type {!glift.api.StoneFn}
   */
  this.mouseover = o.mouseover || function(event, widget, pt) {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display.intersections()
          .setStoneColor(pt, hoverColors[currentPlayer]);
    }
  };

  /**
   * Ghost-stone removal for cursor hovering.
   *
   * @type {!glift.api.StoneFn}
   */
  this.mouseout = o.mouseout || function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display && widget.display.intersections()
          .setStoneColor(pt, 'EMPTY');
    }
  };

  /**
   * A basic touchend function that defaults to the normal stone-click handler.
   * It's possible we may wish to expand this to include guide-lines.
   *
   * @type {!glift.api.StoneFn}
   */
  // TODO(kashomon): It's not clear if we want this. Revisit later.
  this.touchend = o.touchend || function(event, widget, pt) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    widget.sgfOptions.stoneClick(event, widget, pt);
  };
};

goog.provide('glift.api.widgetopt');

/**
 * A collection of widget options keyed by widget types.
 *
 * @type {!Object<glift.enums.widgetTypes, glift.api.WidgetTypeOptions>}
 */
glift.api.widgetopt = {};

(function() {

/**
 * Board Editor options.
 */
glift.api.widgetopt[glift.enums.widgetTypes.BOARD_EDITOR] = {
  // TODO(kashomon): Move these options to local vars above.
  _markMap: {
    bstone_a: glift.enums.marks.LABEL_ALPHA,
    bstone_1: glift.enums.marks.LABEL_NUMERIC,
    bstone_square: glift.enums.marks.SQUARE,
    bstone_triangle: glift.enums.marks.TRIANGLE
  },

  // Map from icon name to color.
  _placementMap: {
    bstone: glift.enums.states.BLACK,
    wstone: glift.enums.states.WHITE
  },

  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {},

  controllerFunc: glift.controllers.boardEditor,

  icons: ['start', 'end', 'arrowleft', 'arrowright',
      [ // Icons for changing click behavior
        'twostones', // normal move
        'bstone', // black placement
        'wstone', // white placement
        'bstone_a', // Label with A-Z
        'bstone_1', // Label with 1+
        'bstone_triangle', // Label with Triangle
        'bstone_square', // Label with square
        'nostone-xmark' // erase
        // TODO(kashomon): Erase, circle
      ]],

  showVariations: glift.enums.showVariations.ALWAYS,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    widget.display.intersections().clearTempMarks();
    var placementMap = glift.widgets.options.BOARD_EDITOR._placementMap;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    var currentPlayer = widget.controller.getCurrentPlayer();

    if (placementMap[iconName]) {
      var color = placementMap[iconName];
      var partialData = widget.controller.addPlacement(pt, color);
      widget.applyBoardData(partialData);
    } else if (iconToMark[iconName]) {
      var partialData = widget.controller.addMark(pt, iconToMark[iconName]);
      if (partialData) {
        widget.applyBoardData(partialData);
      }
    } else if (iconName === 'twostones') {
      var partialData = widget.controller.addStone(pt, currentPlayer);
      if (partialData) {
        widget.applyBoardData(partialData);
      }
    }
    // TODO(kashomon): handle 'nostone-xmark' -- i.e., clearing an intersection.
  },

  stoneMouseover: function(event, widget, pt) {
    var marks = glift.enums.marks;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var placementMap = glift.widgets.options.BOARD_EDITOR._placementMap;
    var hoverColors = { 'BLACK': 'BLACK_HOVER', 'WHITE': 'WHITE_HOVER' };
    var currentPlayer = widget.controller.getCurrentPlayer();
    var intersections = widget.display.intersections();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;

    if (placementMap[iconName] !== undefined) {
      var colorKey = placementMap[iconName];
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, hoverColors[colorKey]);
      }
    } else if (iconName === 'twostones') {
      var colorKey = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, hoverColors[colorKey]);
      }
    } else if (iconToMark[iconName] && !intersections.hasMark(pt)) {
      var markType = iconToMark[iconName];
      if (markType === marks.LABEL_NUMERIC) {
        intersections.addTempMark(
            pt, markType, widget.controller.currentNumericMark());
      } else if (markType === marks.LABEL_ALPHA) {
        intersections.addTempMark(
            pt, markType, widget.controller.currentAlphaMark());
      } else {
        intersections.addTempMark(pt, markType);
      }
    }
  },

  stoneMouseout: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    var intersections = widget.display.intersections();
    if (iconName === 'twostones' ||
        iconName === 'bstone' ||
        iconName === 'wstone') {
      currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, 'EMPTY');
      }
    }
    intersections.clearTempMarks();
  },
};

})();

/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: undefined, // rely on defaults

  controllerFunc: glift.controllers.staticProblem,

  icons: [
    'refresh',
    'problem-explanation',
    'multiopen-boxonly'
  ],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var flattened = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (flattened.problemResult() === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    var hooks = widget.hooks();
    widget.applyBoardData(flattened);

    if (widget.correctness === undefined) {
      if (flattened.problemResult()=== problemResults.CORRECT) {
        widget.iconBar.destroyTempIcons();
        if (widget.correctNextSet[pt.toString()] === undefined) {
          widget.correctNextSet[pt.toString()] = true;
          widget.numCorrectAnswers++;
          if (widget.numCorrectAnswers === widget.totalCorrectAnswers) {
            widget.correctness = problemResults.CORRECT;
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                { fill: '#0CC', stroke: '#0CC'});
            hooks.problemCorrect && hooks.problemCorrect();
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                { fill: '#000', stroke: '#000'});
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.flattenedState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (flattened.problemResult() == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.iconBar.clearTempText('multiopen-boxonly');
        widget.correctness = problemResults.INCORRECT;
        hooks.problemIncorrect && hooks.problemIncorrect();
      }
    }
  },

  stoneMouseover: undefined, // rely on defaults
  stoneMouseout: undefined, // rely on defaults
};

/**
 * Additional Options for EXAMPLEs
 */
glift.api.widgetopt[glift.enums.widgetTypes.EXAMPLE] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer,

  icons: [],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    // 'game-info',
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {},
  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},
};

/**
 * Game Figure type.
 */
// TODO(kashomon):  Temporary testing type. Complete or delete. Should probably
// be combined with example or deleted.
glift.api.widgetopt[glift.enums.widgetTypes.GAME_FIGURE] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {}, // Disable problem evaluations

  controllerFunc: glift.controllers.gameFigure,

  icons: [],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {},
  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},
};

/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.enums.widgetTypes.GAME_VIEWER] = {
  markLastMove: true,

  keyMappings: {
    ARROW_LEFT: 'iconActions.arrowleft.click',
    ARROW_RIGHT: 'iconActions.arrowright.click',
    ',': 'iconActions.arrowleft.click',
    '.': 'iconActions.arrowright.click',
    '<': 'iconActions.jump-left-arrow.click',
    '>': 'iconActions.jump-right-arrow.click',
    /** Toggle the selected variation. */
    ']': function(widget) {
      widget.controller.moveUpVariations();
      widget.applyBoardData(widget.controller.flattenedState())
    },
    /** Toggle the selected variation. */
    '[': function(widget) {
      widget.controller.moveDownVariations();
      widget.applyBoardData(widget.controller.flattenedState())
    }
  },

  problemConditions: {}, // Disable problem evaluations

  controllerFunc: glift.controllers.gameViewer,

  icons: ['jump-left-arrow', 'jump-right-arrow', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },
  stoneMouseover: undefined, // rely on defaults
  stoneMouseout: undefined, // rely on defaults
};

/**
 * Game Viewer options for when used as part of a widget
 */
glift.api.widgetopt[glift.enums.widgetTypes.REDUCED_GAME_VIEWER] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer,

  icons: ['arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  stoneMouseover: undefined, // rely on defaults
  stoneMouseout: undefined, // rely on defaults
};

/**
 * Additional options for the standard problems, where the entire problem is
 * stored client-side.
 */
glift.api.widgetopt[glift.enums.widgetTypes.STANDARD_PROBLEM] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: undefined, // rely on defaults, which are set up to work
      // for the Standard problem.

  controllerFunc: glift.controllers.staticProblem,

  // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
  icons: [
    'undo-problem-move',
    'problem-explanation',
    'multiopen-boxonly'
  ],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var hooks = widget.hooks();
    var currentPlayer = widget.controller.getCurrentPlayer();
    var flattened = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (flattened.problemResult() === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(flattened);
    if (flattened.problemResult()  === problemResults.CORRECT) {
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
        widget.correctness = problemResults.CORRECT;
        hooks.problemCorrect && hooks.problemCorrect(pt, currentPlayer);
    } else if (flattened.problemResult()  === problemResults.INCORRECT) {
      widget.iconBar.destroyTempIcons();
      widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
      widget.correctness = problemResults.INCORRECT;
      hooks.problemIncorrect && hooks.problemIncorrect(pt, currentPlayer);
    }
  },

  stoneMouseover: undefined,
  stoneMouseout: undefined,
};
