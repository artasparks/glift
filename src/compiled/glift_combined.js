/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * @version 1.0.5
 * --------------------------------------
 */
(function(w) {
var glift = glift || w.glift || {};
if (w) {
  // expose Glift as a global.
  w.glift = glift;
}
})(window);
/**
 * Useful global variables related to all glift instances on the page.
 */
glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently in alpha.
   */
  version: '1.0.5',

  /** Indicates whether or not to store debug data. */
  // TODO(kashomon): Remove this hack.
  debugMode: false,

  /**
   * Options for performanceDebugLevel: NONE, INFO
   */
  performanceDebugLevel: 'NONE',

  /**
   * Map of performance timestamps.
   * TODO(kashomon): Indicate that this is private and what it's used for.
   */
  perf: {},

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
 * Initialization function to be run on glift creation.  Things performed:
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
    var head = glift.dom.elem(document.head);
    var newMeta = glift.dom.elem(document.createElement('meta'));
    newMeta.attr('name', 'viewport');
    newMeta.attr('content', noZoomContent);
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
glift.util = {
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
/**
 * Various constants used throughout glift.
 */
glift.enums = {
  /**
   * Camel cases an enum. Can be useful for things that have functions or
   * packages named from enum names.
   */
  toCamelCase: function(input) {
    return input.toLowerCase().replace(/_(.)?/g, function(match, group1) {
      return group1 ? group1.toUpperCase() : '';
    });
  },

  // Also sometimes referred to as colors. Might be good to change back
  states: {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
    EMPTY: 'EMPTY'
  },

  boardAlignments: {
    TOP: "TOP",
    RIGHT: "RIGHT",
    CENTER: "CENTER"
  },

  directions: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
  },

  boardRegions: {
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
  },


  controllerMessages: {
    CONTINUE: 'CONTINUE',
    DONE: 'DONE',
    FAILURE: 'FAILURE'
  },

  marks: {
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
  },

  problemResults: {
    CORRECT: 'CORRECT',
    INCORRECT: 'INCORRECT',
    INDETERMINATE: 'INDETERMINATE',
    FAILURE: 'FAILURE' // i.e., none of these (couldn't place stone).
  },

  displayDataTypes: {
    PARTIAL: 'PARTIAL',
    FULL: 'FULL'
  },

  /**
   * Used to create svg element Ids.  The enum values are slightly modified to
   * be compatible with being class / id names.
   */
  svgElements: {
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

    // Icon-bar specific enums
    ICON: 'icon',
    ICON_CONTAINER: 'icon_container',
    TEMP_ICON: 'temp_icon',
    TEMP_TEXT: 'temp_text',
    TEMP_ICON_CONTAINER: 'temp_icon_container'
  },

  showVariations: {
    ALWAYS: 'ALWAYS',
    NEVER: 'NEVER',
    MORE_THAN_ONE: 'MORE_THAN_ONE'
  },

  /**
   * Widget types.  These tell the widget manager what widgets to create.
   */
  widgetTypes: {
    CORRECT_VARIATIONS_PROBLEM: 'CORRECT_VARIATIONS_PROBLEM',
    EXAMPLE: 'EXAMPLE',
    GAME_VIEWER: 'GAME_VIEWER',
    REDUCED_GAME_VIEWER: 'REDUCED_GAME_VIEWER',
    STANDARD_PROBLEM: 'STANDARD_PROBLEM',
    BOARD_EDITOR: 'BOARD_EDITOR'
  },

  boardComponents: {
    BOARD: 'BOARD',
    COMMENT_BOX: 'COMMENT_BOX',
    EXTRA_ICONBAR: 'EXTRA_ICONBAR',
    ICONBAR: 'ICONBAR',
    STATUS_BAR: 'STATUS_BAR'
  },

  dubug: {
    NONE: 'NONE',
    INFO: 'INFO'
  },

  // Intended to be for points
  rotations: {
    NO_ROTATION: 'NO_ROTATION',
    CLOCKWISE_90: 'CLOCKWISE_90',
    CLOCKWISE_180: 'CLOCKWISE_180',
    CLOCKWISE_270: 'CLOCKWISE_270'
  }
};
(function() {
glift.errors = {};

glift.errors.ParseError = function(message) {
  this.name = "ParseError";
  this.message = message || "";
};
glift.errors.ParseError.prototype = new Error();

})();
glift.util._IdGenerator = function(seed) {
  this.seed  = seed || 0;
};

glift.util._IdGenerator.prototype = {
  next: function() {
    var out = this.seed + "";
    this.seed += 1
    return out;
  }
};

glift.util.idGenerator = new glift.util._IdGenerator(0);
glift.keyMappings = {
  /**
   * Some keys must be bound with 'keydown' rather than key code
   * mappings.
   */
  _nameToCodeKeyDown: {
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
        return glift.keyMappings._nameToCodeKeyDown[name] || null
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
      for (var name in glift.keyMappings._nameToCodeKeyDown) {
        var keycode = glift.keyMappings._nameToCodeKeyDown[name]
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
        if (event.preventDefault) event.preventDefault();
        else  event.returnValue = false; // IE
      }
    } else if (argType === 'string') {
      // Assume it's an icon-action-path
      // icon namespaces look like: icons.arrowleft.mouseup
      var actionNamespace = funcOrIcon.split('.');
      var action = widget.actions[actionNamespace[0]];
      for (var i = 1; i < actionNamespace.length; i++) {
        action = action[actionNamespace[i]];
      }
      action(keyEvent, widget);
      if (manager.isFullscreen()) {
        // We don't want the widget interacting with anything else while
        // full-screen.
        if (event.preventDefault) event.preventDefault();
        else  event.returnValue = false; // IE
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
(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

glift.util.coordToString = function(x, y) {
  return x + ',' + y;
};

glift.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0]);
    var y = parseInt(split[1]);
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
 */
glift.util.pointFromSgfCoord = function(str) {
  if (str.length != 2) {
    throw 'Unknown SGF Coord length: ' + str.length +
        'for property ' + str;
  }
  var a = 'a'.charCodeAt(0)
  return glift.util.point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
};


/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 */
var GliftPoint = function(xIn, yIn) {
  this._x = xIn;
  this._y = yIn;
};

GliftPoint.prototype = {
  x: function() { return this._x },
  y: function() { return this._y },
  equals: function(pt) {
    return this._x === pt.x() && this._y === pt.y();
  },

  clone: function() {
    return glift.util.point(this.x(), this.y());
  },

  /**
   * Returns an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(this.x() + a) +
        String.fromCharCode(this.y() + a);
  },

  /**
   * Create the form used as a key in objects.
   * TODO(kashomon): Replace with string form.  The term hash() is confusing and
   * it makes it seem like I'm converting it to an int (which I was, long ago).
   */
  hash: function() {
    return this.toString();
  },

  /**
   * Return a string representation of the coordinate.  I.e., "12,3".
   */
  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * Return a new point that's a translation from this one
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  /**
   * Rotate an (integer) point based on the board size.
   * boardsize: Typically 19, but 9 and 13 are possible.  Note that points are
   * typically 0-indexed.
   *
   * Note: This is an immutable on points.
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

  log: function() {
    glift.util.logz(this.toString());
  }
};

})();
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
glift.testUtil = {
  ptlistToMap: function(list) {
    var outMap = {};
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.value !== undefined) {
        outMap[item.point.hash()] = item; // LABEL
      } else {
        outMap[item.hash()] = item; // point
      }
    }
    return outMap;
  },

  assertFullDiv: function(divId) {
    // really this is just non-empty...
    ok(glift.dom.elem(divId).html().length > 0, "Div should contain contents."
       + "  Was: " + glift.dom.elem(divId).html());
  },

  assertEmptyDiv: function(divId) {
    var contents = glift.dom.elem(divId).html();
    ok(contents.toString().length === 0,
        'Div should not contain contents. Instead was [' + contents + ']');
  }
};
glift.dom = {
  /**
   * Constructs a glift dom element. If arg is a string, assume an ID is being
   * passed in. If arg is an object and has nodeType and nodeType is 1
   * (ELEMENT_NODE), 
   */
  elem: function(arg) {
    var argtype = glift.util.typeOf(arg);
    if (argtype === 'string') {
      // Assume an element ID.
      var el = document.getElementById(arg);
      if (el === null) { return null; }
      else { return new glift.dom.Element(el, arg); };
    } else if (argtype === 'object' && arg.nodeType && arg.nodeType === 1) {
      // Assume an HTML node.
      // Note: nodeType of 1 => ELEMENT_NODE.
      return new glift.dom.Element(arg);
    }
    return null;
  },

  /** Creates a new div dom element with the relevant id. */
  newDiv: function(id) {
    var elem = glift.dom.elem(document.createElement('div'));
    elem.attr('id', id);
    return elem;
  },

  /**
   * Convert some text to some dom elements.
   * text: The input raw text
   * optCss: optional CSS object to apply to the lines.
   */
  convertText: function(text, useMarkdown, optCss) {
    text = glift.dom.sanitize(text);
    if (useMarkdown) {
      text = glift.markdown.render(text);
    }
    var wrapper = glift.dom.newElem('div');
    wrapper.attr('class', glift.dom.classes.commentBox);

    if (useMarkdown) {
      wrapper.html(text);
    } else {
      var textSegments = text.split('\n');
      for (var i = 0; i < textSegments.length; i++) {
        var seg = textSegments[i];
        var baseCss = { margin: 0, padding: 0, 'min-height': '1em' };
        if (optCss) {
          for (var key in optCss) {
            baseCss[key] = optCss[key];
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

  /** Convert a string. */
  newElem: function(type) {
    return type ? glift.dom.elem(document.createElement(type + '')) : null;
  },

  /**
   * A simple wrapper for a plain old dom element. Note, id can be null if the
   * Element is constructed directly from elem.
   */
  Element: function(el, id) {
    this.el = el;
    this.id = id || null;
  }
};

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
   * Gets or set an attribute on the HTML, JQuery Style.
   */
  attr: function(key, value) {
    if (key == null) { return null; }

    var keyType = glift.util.typeOf(key);
    if (keyType === 'object') {
      var attrObj = key;
      for (var attrObjKey in attrObj) {
        var attrObjVal = attrObj[attrObjKey];
        this.el.setAttribute(attrObjKey, attrObjVal);
      }
    }

    if (keyType === 'string') {
      if (value == null) {
        return this.el.getAttribute(key);
      } else {
        this.el.setAttribute(key, value);
        if (key === 'id' && glift.util.typeOf(value) === 'string') {
          this.id = value;
        }
      }
    }
    return null;
  },

  /** Gets all the attributes of the element, but as an object. */
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
    this.el.parentElement && this.el.parentElement.removeChild(this.el);
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
/**
 * Built-in clases used to style Glift.
 */
// TODO(kashomon): Move to a more appropriate API location.
glift.dom.classes = {
  COMMENT_BOX: 'glift-comment-box'
};
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
   */
  get: function(id) {
    var registered = glift.themes.registered;
    var rawTheme = !(id in registered) ? null : registered[id];
    if (rawTheme) {
      return glift.themes.deepCopy({}, rawTheme, registered.DEFAULT);
    } else {
      return rawTheme; // null;
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

  /** Accepts a (case sensitive) theme ID and true if the theme exists and false
   * otherwise.
   */
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  /** Set the 'fill' for the go board to be an image
   * For a theme object. This generally assumes you're called 'get' so that you
   * have a copy of the base theme.
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
glift.themes.registered.COLORFUL = {
  board: {
    fill: "#f5be7e"
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
/**
 * The base theme.  All possible theme options must be specified here.
 */
glift.themes.registered.DEFAULT = {
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
    'font-family': 'sans-serif'
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "none"
    },

    marks: {
      'font-family' : 'sans-serif'
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
/**
 * Marked is dumped into this namespace. Just for reference
 * https://github.com/chjj/marked
 */
// glift.marked = {};

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


/** Wrapper object for the abstract syntax tree. */
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
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
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
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
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

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  var escape = function(text) {
    return text;
  }

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
 */

function Renderer(options) {
  this.options = options || {};
}

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
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
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
 * Parse Current Token
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
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
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
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

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
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
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
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

this.marked = marked;

}).call(function() {
  return glift;
}());
glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which creates an SVG
   * based Go Board.
   */
  create: function(divId, boardBox, theme, options) {
    glift.util.majorPerfLog("Before environment creation");

    var env = glift.displays.environment.get(divId, boardBox, options);

    glift.util.majorPerfLog("After environment creation");
    return glift.displays.board.create(env, theme, options.rotation);
  }
};
glift.displays.bbox = {
  /** Return a new bounding box with two points. */
  fromPts: function(topLeftPt, botRightPt) {
    return new glift.displays._BoundingBox(topLeftPt, botRightPt);
  },

  /** Return a new bounding box with a top left point, a width, and a height. */
  fromSides: function(topLeft, width, height) {
    return new glift.displays._BoundingBox(
        topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
  },

  /** Return the bounding box for a div. */
  fromDiv: function(divId) {
    var elem = glift.dom.elem(divId);
    return glift.displays.bbox.fromSides(
        glift.util.point(0,0), elem.width(), elem.height());
  }
};

/**
 * A bounding box, represented by a top left point and bottom right point.
 * This is how we represent space in glift, from GoBoards to sections allocated
 * for widgets.
 */
glift.displays._BoundingBox = function(topLeftPtIn, botRightPtIn) {
  this._topLeftPt = topLeftPtIn;
  this._botRightPt = botRightPtIn;
};

glift.displays._BoundingBox.prototype = {
  topLeft: function() { return this._topLeftPt; },
  botRight: function() { return this._botRightPt; },
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
   */
  contains: function(point) {
   return point.x() >= this.topLeft().x()
      && point.x() <= this.botRight().x()
      && point.y() >= this.topLeft().y()
      && point.y() <= this.botRight().y();
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
    return glift.displays.bbox.fromSides(newTopLeft, newWidth, newHeight);
  },

  toString: function() {
    return this.topLeft().toString() + ',' +  this.botRight().toString();
  },

  translate: function(dx, dy) {
    return glift.displays.bbox.fromPts(
        glift.util.point(this.topLeft().x() + dx, this.topLeft().y() + dy),
        glift.util.point(this.botRight().x() + dx, this.botRight().y() + dy));
  },

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
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
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
      outBboxes.push(glift.displays.bbox.fromPts(currentTopLeft, nextBotRight));
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
(function() {
/**
 * Construct the board points from a linebox.
 */
glift.displays.boardPoints = function(
    linebox, maxIntersects, drawBoardCoords) {

  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      leftExtAmt = linebox.extensionBox.left() * spacing,
      rightExtAmt = linebox.extensionBox.right() * spacing,
      left = linebbox.left() + leftExtAmt,

      topExtAmt = linebox.extensionBox.top() * spacing,
      botExtAmt = linebox.extensionBox.bottom() * spacing,
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
          points[intPt.hash()] = {
            intPt: intPt,
            coordPt: coordPt,
            bbox: glift.displays.bbox.fromPts(
                glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
                glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
          };
        }
      } else {
        // Default case: Don't draw coordinates
        points[intPt.hash()] = {
          intPt: intPt,
          coordPt: coordPt,
          bbox: glift.displays.bbox.fromPts(
              glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
              glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
        };
      }
    }
  }
  return new BoardPoints(
      points, spacing, maxIntersects, edgeCoords);
};

/** An edge coordinate label (i.e., A-T, 1-19, depending on side). */
var EdgeCoordinate = function(pt, label) {
  this.point = pt;
  this.label = label;
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
 */
var BoardPoints = function(points, spacing, numIntersections, edgeLabels) {
  this.points = points; // int hash is 0 indexed, i.e., 0->18.
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
  this.edgeCoordLabels = edgeLabels;
  this.dataCache = undefined;
};

BoardPoints.prototype = {
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
    return this.points[pt.hash()];
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
    return this.points[pt.hash()] !== undefined;
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
})();
glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  /**
   * Creates a cropbox based on a region, the number of intersections, and a
   * true/false flag for drawing the board coordinates.
   */
  getFromRegion: function(region, intersects, drawBoardCoords) {
    var util = glift.util,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        drawBoardCoords = drawBoardCoords || false,
        // We add an extra position around the edge for labels, so we need a
        // label modifier. 1 or 0.
        lblMod = drawBoardCoords ? 1 : 0,
        // So that we can 0 index, we subtract one.
        maxIntersects = drawBoardCoords ? intersects + 1 : intersects - 1,
        minIntersects = 0,
        defaultExtension = 0,
        lineExtension = .5,
        halfInts = Math.ceil(maxIntersects / 2),

        // Assign Defualts
        top = minIntersects,
        left = minIntersects,
        bot = maxIntersects,
        right = maxIntersects,
        topExtension = this.DEFAULT_EXTENSION,
        leftExtension = this.DEFAULT_EXTENSION,
        botExtension = this.DEFAULT_EXTENSION,
        rightExtension = this.DEFAULT_EXTENSION;

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL: break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      default:
          // Note: this can happen if we've let AUTO or MINIMAL slip in here
          // somehow.
          throw new Error('Unknown board region: ' + region);
    };

    var cbox = glift.displays.bbox.fromPts(
        util.point(left, top), util.point(right, bot));
    var extBox = glift.displays.bbox.fromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension));
    return new glift.displays._CropBox(cbox, extBox, intersects);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 */
glift.displays._CropBox = function(cbox, extBox, maxIntersects) {
  this._cbox = cbox;
  this._extBox = extBox;
  this._maxInts = maxIntersects;
};

glift.displays._CropBox.prototype = {
  /**
   * Returns the cbox. The cbox is a bounding box that describes what points on
   * the go board should be displayed. Generally, both the width and height of
   * the cbox must be between 0 (exclusive) and maxIntersects (inclusive)
   */
  cbox: function() { return this._cbox; },

  /**
   * Returns the maximum board size.  Often referred to as max intersections
   * elsewhere.  Typically 9, 13 or 19.
   */
  maxBoardSize: function() { return this._maxInts; },

  /**
   * The extension box is a special bounding box for cropped boards.  Due to
   * some quirks of the way the board is drawn, it's convenient to add this here
   * to indicate an extra amount around the edge necessary for the overflow
   * lines (the ragged crop-edge).
   */
  extBox: function() { return this._extBox; },

  /**
   * Number of x points (or columns) for the cropped go board.
   */
  xPoints: function() { return this.cbox().width(); },

  /**
   * Number of y points (or rows) for the cropped go board.
   */
  yPoints: function() { return this.cbox().height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   *    -
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().width() + this.extBox().topLeft().x()
        + this.extBox().botRight().x() + OVERFLOW;
  },

  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().height() + this.extBox().topLeft().y()
        + this.extBox().botRight().y() + OVERFLOW;
  }
};
(function() {
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
  get: function(divId, boardBox, options) {
    if (!divId) {
      throw new Error('No DivId Specified!')
    }

    // For speed and isolation purposes, it's preferred to define the boardBox
    // rather than to calculate the h/w by inspecting the div here.
    if (divId && !boardBox) {
      boardBox = glift.displays.bbox.fromDiv(divId);
    }

    if (!boardBox) {
      throw new Error('No Bounding Box defined for display environment!')
    }
    return new GuiEnvironment(divId, boardBox, options);
  }
};

var GuiEnvironment = function(divId, bbox, options) {
  this.divId = divId;
  this.bbox = bbox; // required
  this.divHeight = bbox.height();
  this.divWidth = bbox.width();
  this.boardRegion = options.boardRegion || glift.enums.boardRegions.ALL;
  this.intersections = options.intersections || 19;
  this.drawBoardCoords = options.drawBoardCoords || false;

  var cropNamespace = glift.displays.cropbox;
  this.cropbox = glift.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections, this.drawBoardCoords);
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
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
        divBox = displays.bbox.fromPts(
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
})();
/**
 * Collection of ID utilities, mostly for SVG.
 */
glift.displays.ids = {
  /**
   * Create an ID generator.
   */
  generator: function(divId) {
    return new glift.displays.ids._Generator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  element: function(divId, type, extraData) {
    var base = divId + "_" + type;
    if (extraData !== undefined) {
      if (extraData.x !== undefined) {
        return base + '_' + extraData.x() + "_" + extraData.y();
      } else {
        return base + '_' + extraData.toString();
      }
    } else {
      return base;
    }
  },

  _Generator: function(divId) {
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
    this._tempMarkGroup = this._eid(this.divId, this._enum.TEMP_MARK_CONTAINER);
  }
};

glift.displays.ids._Generator.prototype = {
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
  button: function(pt) {
    return this._eid(this.divId, this._enum.BUTTON, pt);
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
  var lineBoxBoundingBox = glift.displays.bbox.fromPts(
      glift.util.point(left + leftBase, top + topBase),
      glift.util.point(right + leftBase, bot + topBase));

  var out = new glift.displays._LineBox(
      lineBoxBoundingBox, xSpacing, cropbox);
  return out;
};

glift.displays._LineBox = function(boundingBox, spacing, cropbox) {
  this.bbox = boundingBox;
  this.spacing = spacing;
  this.extensionBox = cropbox.extBox();
  this.pointTopLeft = cropbox.cbox().topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};
/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 */
glift.displays.getResizedBox = function(divBox, cropbox, alignment) {
  var aligns = glift.enums.boardAlignments,
      alignment = alignment || aligns.CENTER,
      util = glift.util,
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
      newBox = glift.displays.bbox.fromSides(
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

// Change the dimensions of the box (the height and width) to have the same
// proportions as cropHeight / cropWidth;
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
glift.displays.board = {
  create: function(env, theme, rotation) {
    return new glift.displays.board.Display(env, theme, rotation).draw();
  }
};

/**
 * The core Display object returned to the user.
 */
glift.displays.board.Display = function(inEnvironment, theme, rotation) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._environment = inEnvironment;
  this._theme = theme;

  // Rotation indicates whether we should rotate by stones/marks in the display
  // by 90, 180, or 270 degrees,
  this._rotation = rotation || glift.enums.rotations.NO_ROTATION;
  this._svgBase = undefined; // defined in draw.
  this._svg = undefined; // defined in draw.
  this._intersections = undefined // defined in draw;
  this._buffer = []; // All objects are stuffed into the buffer and are only added
};

glift.displays.board.Display.prototype = {
  boardPoints: function() { return this._environment.boardPoints; },
  boardRegion: function() { return this._environment.boardRegion; },
  divId: function() { return this._environment.divId },
  intersectionPoints: function() { return this._environment.intersections; },
  intersections: function() { return this._intersections; },
  rotation: function() { return this._rotation; },
  width: function() { return this._environment.goBoardBox.width() },
  height: function() { return this._environment.goBoardBox.height() },

  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.
      this._svg = glift.displays.svg.svg({
        height: '100%',
        width: '100%',
        position: 'float',
        top: 0,
        id: this.divId() + '_svgboard'
      });
    }
    this._environment.init();
    return this;
  },

  /**
   * Draw the GoBoard!
   */
  draw:  function() {
    this.init();
    var board = glift.displays.board,
        env = this._environment,
        boardPoints = env.boardPoints,
        theme = this._theme,
        svg = this._svg,
        divId = this.divId(),
        svglib = glift.displays.svg,
        idGen = glift.displays.ids.generator(divId);

    board.boardBase(svg, idGen, env.goBoardBox, theme);
    board.initBlurFilter(divId, svg); // in boardBase.  Should be moved.

    var intGrp = svglib.group().attr('id', idGen.intersections());
    svg.append(intGrp);

    board.boardLabels(intGrp, idGen, boardPoints, theme);

    board.lines(intGrp, idGen, boardPoints, theme);
    board.starpoints(intGrp, idGen, boardPoints, theme);

    board.shadows(intGrp, idGen, boardPoints, theme);
    board.stones(intGrp, idGen, boardPoints, theme);
    board.markContainer(intGrp, idGen, boardPoints, theme);
    board.buttons(intGrp, idGen, boardPoints);

    this._intersections = new glift.displays.board._Intersections(
        divId, intGrp, boardPoints, theme, this.rotation());
    glift.util.majorPerfLog("After display object creation");

    this.flush();
    glift.util.majorPerfLog("After flushing to display");
    return this; // required
  },

  flush: function() {
    this._svg.attachToParent(this.divId());
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    glift.dom.elem(this.divId()).empty();
    this._svg = undefined;
    this._svgBase = undefined;
    this._intersections = undefined;
    return this;
  }
};
/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  var svglib = glift.displays.svg;
  if (theme.board.imagefill) {
    svg.append(svglib.image()
      .attr('x', goBox.topLeft().x())
      .attr('y', goBox.topLeft().y())
      .attr('width', goBox.width())
      .attr('height', goBox.height())
      .attr('xlink:href', theme.board.imagefill)
      .attr('preserveAspectRatio', 'none'));
  }

  svg.append(svglib.rect()
    .attr('x', goBox.topLeft().x() + 'px')
    .attr('y', goBox.topLeft().y() + 'px')
    .attr('width', goBox.width() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
    .attr('stroke', theme.board.stroke)
    .attr('stroke-width', theme.board['stroke-width'])
    .attr('id', idGen.board()));
};

glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .attr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .attr("stdDeviation", 2);
};
glift.displays.board.boardLabels = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.boardCoordLabelGroup());
  svg.append(container);
  var labels = boardPoints.edgeCoordLabels;
  for (var i = 0, ii = labels.length; i < ii; i++) {
    var lbl = labels[i];
    container.append(svglib.text()
        .text(lbl.label)
        .attr('fill', theme.boardCoordLabels.fill)
        .attr('stroke', theme.boardCoordLabels.stroke)
        .attr('opacity', theme.boardCoordLabels.opacity)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', lbl.coordPt.x()) // x and y are the anchor points.
        .attr('y', lbl.coordPt.y())
        .attr('font-family', theme.boardCoordLabels['font-family'])
        .attr('font-size', boardPoints.spacing * 0.6));
  }
};
/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  var len = data.length
  var tl = data[0];
  var br = data[len - 1];
  var data = { tl: tl, br: br, spacing: boardPoints.spacing };
  container.append(svglib.rect()
    .data(data)
    .attr("x", tl.coordPt.x() - boardPoints.radius)
    .attr("y", tl.coordPt.y() - boardPoints.radius)
    .attr("width", br.coordPt.x() - tl.coordPt.x() + boardPoints.spacing)
    .attr("height", br.coordPt.y() - tl.coordPt.y() + boardPoints.spacing)
    .attr('opacity', 0)
    .attr('fill', 'red')
    .attr('stroke', 'red')
    .attr('stone_color', 'EMPTY')
    .attr('id', idGen.fullBoardButton()));
};
/**
 * The backing data for the display.
 */
glift.displays.board._Intersections = function(
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

glift.displays.board._Intersections.prototype = {
  /**
   * Sets the color of a stone.  Note: the 'color' is really a key into the
   * Theme, so it should always be BLACK or WHITE, which can then point to any
   * color.
   */
  setStoneColor: function(pt, color) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var key = pt.hash();
    if (this.theme.stones[color] === undefined) {
      throw 'Unknown color key [' + color + ']';
    }

    var stoneGroup = this.svg.child(this.idGen.stoneGroup());
    var stone = stoneGroup.child(this.idGen.stone(pt));
    if (stone !== undefined) {
      var stoneColor = this.theme.stones[color];
      stone.attr('fill', stoneColor.fill)
        .attr('stroke', stoneColor.stroke || 1)
        .attr('stone_color', color)
        .attr('opacity', stoneColor.opacity);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup  !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        if (stoneColor.opacity === 1) {
          stoneShadow.attr('opacity', 1);
        } else {
          stoneShadow.attr('opacity', 0);
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
      glift.dom.elem(stone.attr('id')).attr(stone.attrObj());
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        glift.dom.elem(stoneShadow.attr('id')).attr(stoneShadow.attrObj());
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
      starpoint.attr('opacity', 0);
    }
    this.svg.child(this.idGen.lineGroup())
        .child(this.idGen.line(pt))
        .attr('opacity', 0);
    return this;
  },

  _flushMark: function(pt, mark, markGroup) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (this._reqClearForMark(pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        glift.dom.elem(starp.attr('id')).attr('opacity', starp.attr('opacity'));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      glift.dom.elem(linept.attr('id')).attr('opacity', linept.attr('opacity'));
    }
    markGroup.child(idGen.mark(pt)).attachToParent(markGroup.attr('id'));
    this.markPts.push(pt);
    return this;
  },

  clearMarks: function(markGroup) {
    markGroup = markGroup || this.svg.child(this.idGen.markGroup());
    var idGen = this.idGen;
    var children = markGroup.children();
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i]
      var pt = child.data();
      var starpoint =
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starpoint) {
        starpoint.attr('opacity', 1).updateAttrInDom('opacity');
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(pt))
      if (line) {
        line.attr('opacity', 1).updateAttrInDom('opacity');
      }
    }
    markGroup.emptyChildren();
    glift.dom.elem(markGroup.attr('id')).empty();
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
      .attr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .attr('stroke-width', 3)
      .attr('stroke', 'blue')
      .attr('id', this.idGen.guideLine()))
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
          children[i].attr(key, attrObj[key]);
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
      glift.dom.elem(stones[i].attr('id')).attr(stoneAttrs);
    }

    var shadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (shadowGroup) {
      var shadows = shadowGroup.children();
      for (var i = 0, len = shadows.length; i < len; i++) {
        glift.dom.elem(shadows[i].attr('id')).attr(shadowAttrs);
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
        .attr('id');
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
        .attr('id');
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
      var pageOffsetX = e.changedTouches[0].pageX;
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
      var pageOffsetY = e.changedTouches[0].pageY;
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
/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 */
glift.displays.board.lines = function(svg, idGen, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var elementId = glift.displays.gui.elementId;
  var svglib = glift.displays.svg;

  var container = svglib.group().attr('id', idGen.lineGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.path()
      .attr('d', glift.displays.board.intersectionLine(
          pt, boardPoints.radius, boardPoints.numIntersections))
      .attr('stroke', theme.lines.stroke)
      .attr('stroke-width', theme.lines['stroke-width'])
      .attr('stroke-linecap', 'round')
      .attr('id', idGen.line(pt.intPt)));
  }
};

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
  svg.append(glift.displays.svg.group().attr('id', idGen.markGroup()));
  svg.append(glift.displays.svg.group().attr('id', idGen.tempMarkGroup()));
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
        .text(label)
        .data(pt)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', coordPt.x()) // x and y are the anchor points.
        .attr('y', coordPt.y())
        .attr('font-family', stonesTheme.marks['font-family'])
        .attr('font-size', boardPoints.spacing * 0.7)
        .attr('id', markId));

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    container.append(svglib.rect()
        .data(pt)
        .attr('x', coordPt.x() - halfWidth)
        .attr('y', coordPt.y() - halfWidth)
        .attr('width', 2 * halfWidth)
        .attr('height', 2 * halfWidth)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    container.append(svglib.path()
        .data(pt)
        .attr('d',
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topRight) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botRight))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.CIRCLE) {
    container.append(svglib.circle()
        .data(pt)
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = stonesTheme.marks['STONE_MARKER'];
    container.append(svglib.circle()
        .data(pt)
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('opacity', marksTheme.STONE_MARKER.opacity)
        .attr('fill', marksTheme.STONE_MARKER.fill)
        .attr('id', markId));
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    container.append(svglib.path()
        .data(pt)
        .attr('fill', 'none')
        .attr('d',
            svgpath.movePt(topNode) + ' ' +
            svgpath.lineAbsPt(leftNode) + ' ' +
            svgpath.lineAbsPt(rightNode) + ' ' +
            svgpath.lineAbsPt(topNode))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
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
  var container = svglib.group().attr('id', idGen.starpointGroup());
  svg.append(container);

  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  for (var i = 0, ii = starPointData.length; i < ii; i++) {
    var pt = starPointData[i];
    var coordPt = boardPoints.getCoord(pt).coordPt;
    container.append(svglib.circle()
      .attr('cx', coordPt.x())
      .attr('cy', coordPt.y())
      .attr('r', size)
      .attr('fill', theme.starPoints.fill)
      .attr('opacity', 1)
      .attr('id', idGen.starpoint(pt)));
  }
};
/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.stoneGroup());
  svg.append(container);
  var data = boardPoints.data()
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr('cx', pt.coordPt.x())
      .attr('cy', pt.coordPt.y())
      .attr('r', boardPoints.radius - .4) // subtract for stroke
      .attr('opacity', 0)
      .attr('stone_color', 'EMPTY')
      .attr('fill', 'blue') // dummy color
      .attr('class', glift.enums.svgElements.STONE)
      .attr('id', idGen.stone(pt.intPt)));
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
  var container = svglib.group().attr('id', idGen.stoneShadowGroup());
  svg.append(container);
  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr('cx', pt.coordPt.x() + boardPoints.radius / 7)
      .attr('cy', pt.coordPt.y() + boardPoints.radius / 7)
      .attr('r', boardPoints.radius - 0.4)
      .attr('opacity', 0)
      .attr('fill', theme.stones.shadows.fill)
      // .attr('stroke', theme.stones.shadows.stroke)
      // .attr('filter', 'url(#' + divId + '_svg_blur)')
      .attr('class', glift.enums.svgElements.STONE_SHADOW)
      .attr('id', idGen.stoneShadow(pt.intPt)));
  }
};
glift.displays.commentbox = {};
/**
 * Create a comment box with:
 *
 * divId: The div in which the comment box should live
 * posBbox: The bounding box of the div (expensive to recompute)
 * theme: The theme object.
 */
glift.displays.commentbox.create = function(
    divId, posBbox, theme, useMarkdown) {
  var useMarkdown = useMarkdown || false;
  if (!theme) {
    throw new Error('Theme must be defined. was: ' + theme);
  }
  return new glift.displays.commentbox._CommentBox(
      divId, posBbox, theme, useMarkdown).draw();
};

glift.displays.commentbox._CommentBox = function(
    divId, positioningBbox, theme, useMarkdown) {
  this.divId = divId;
  this.bbox = glift.displays.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(positioningBbox.width(), positioningBbox.height()));
  this.theme = theme;
  this.useMarkdown = useMarkdown;
  this.el = undefined;
};

glift.displays.commentbox._CommentBox.prototype = {
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
    this.commentBoxObj.empty();
  }
};
/**
 * Extra GUI methods and data.  This also contains pieces used by widgets.
 */
glift.displays.gui = {};
/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box.
 *
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *    unfitTransforms: [...]
 *  }
 *
 * Note: The returned items are guaranteed to be in the order they appeared as
 * inputs.
 */
glift.displays.gui.rowCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'h');
};

glift.displays.gui.columnCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'v');
};

/**
 * Perform linearCentering either vertically or horizontally.
 */
// TODO(kashomon): Rework this method. It's very complicated and hard to reason
// about.
glift.displays.gui._linearCentering = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing, dir) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      // TODO(kashomon): Min spacing is totally broken and has no tests.
      // Probably should just remove it.
      minSpacing = minSpacing || 0,
      maxSpacing = maxSpacing || 0,
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [];
  var dir = (dir === 'v' || dir === 'h') ? dir : 'h';
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
    var partialTransform = { scale: scale };
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

  return { transforms: transforms, bboxes: finishedBoxes, unfit: unfitBoxes };
};

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
  var transform = {
    xMove: left - newBbox.left(),
    yMove: top - newBbox.top(),
    scale: scale
  };
  newBbox = newBbox.translate(transform.xMove, transform.yMove);
  return { transform: transform, bbox: newBbox};
};
/**
 * Objects and methods having to do with icons.
 */
glift.displays.icons = {};
/**
 * Options:
 *    - divId: the divId for this object
 *    - positioning: bounding box for the bar
 *    - parentBox: bounding box for the parent widget
 *    - icons: an array of icon names)
 *    - vertMargin: in pixels
 *    - horzMargin: in pixels
 *    - theme: The theme. default is the DEFAULT theme, of course
 */
glift.displays.icons.bar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      theme = options.theme,
      pbox = options.parentBbox,
      position = options.positioning,
      allDivIds = options.allDivIds,
      allPositioning = options.allPositioning;
  if (!theme) {
    throw new Error("Theme undefined in iconbar");
  }
  if (!divId) {
    throw new Error("Must define an options 'divId' as an option");
  }
  return new glift.displays.icons._IconBar(
      divId, position, icons, pbox, theme, allDivIds, allPositioning);
};

glift.displays.icons._IconBar = function(
    divId, position, iconsRaw, parentBbox, theme,
    allDivIds, allPositioning) {
  this.divId = divId;
  this.position = position;
  this.divBbox = glift.displays.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(position.width(), position.height()));
  this.theme = theme;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = parentBbox;
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(iconsRaw);

  // The positioning information for all divs.
  this.allDivIds = allDivIds;
  this.allPositioning = allPositioning;

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
  this._initIconIds(); // Set the ids for the icons above.
  this._initNameMapping(); // Init the name mapping.
};

glift.displays.icons._IconBar.prototype = {
  _initNameMapping: function() {
    this.forEachIcon(function(icon) {
      this.nameMapping[icon.iconName] = icon;
    }.bind(this));
  },

  _initIconIds: function() {
    this.forEachIcon(function(icon) {
      icon.setElementId(this.idGen.icon(icon.iconName));
    }.bind(this));
  },

  draw: function() {
    this.destroy();
    var svglib = glift.displays.svg;
    var divBbox = this.divBbox,
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svglib.svg()
      .attr('width', '100%')
      .attr('height', '100%');
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
    var container = svglib.group().attr('id', this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(svglib.group().attr('id', this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      var path = svglib.path()
        .attr('d', icon.iconStr)
        .attr('id', icon.elementId)
        .attr('transform', icon.transformString());
      for (var key in this.theme.icons.DEFAULT) {
        path.attr(key, this.theme.icons.DEFAULT[key]);
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
    var container = svglib.group().attr('id', this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, len = this.icons.length; i < len; i++) {
      var icon = this.icons[i];
      container.append(svglib.rect()
        .data(icon.iconName)
        .attr('x', icon.bbox.topLeft().x())
        .attr('y', icon.bbox.topLeft().y())
        .attr('width', icon.bbox.width())
        .attr('height', icon.bbox.height())
        .attr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .attr('opacity', 0)
        .attr('id', this.idGen.button(icon.iconName)));
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
   */
  setCenteredTempIcon: function(
      parentIconNameOrIndex, tempIcon, color, vMargin, hMargin) {
    // Move these defaults into the Theme.
    var svglib = glift.displays.svg;
    var hm = hMargin || 2,
        vm = vMargin || 2;
    var parentIcon = this.getIcon(parentIconNameOrIndex);
    if (glift.util.typeOf(tempIcon) === 'string') {
      tempIcon = glift.displays.icons.wrappedIcon(tempIcon);
    } else {
      tempIcon = tempIcon.rewrapIcon();
    }
    var tempIconId = this.idGen.tempIcon(parentIcon.iconName);

    // Remove if it exists.
    glift.dom.elem(tempIconId) && glift.dom.elem(tempIconId).remove();

    if (parentIcon.subboxIcon !== undefined) {
      tempIcon = parentIcon.centerWithinSubbox(tempIcon, vm, hm);
    } else {
      tempIcon = parentIcon.centerWithinIcon(tempIcon, vm, hm);
    }

    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.path()
      .attr('d', tempIcon.iconStr)
      .attr('fill', color) // theme.icons.DEFAULT.fill
      .attr('id', tempIconId)
      .attr('transform', tempIcon.transformString()));
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
      .text(text)
      .attr('class', 'tempIcon')
      .attr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .attr('font-size', fontSize + 'px')
      .attr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .attr('y', bbox.center().y()) //+ fontSize)
      .attr('dy', '.33em') // Move down, for centering purposes
      .attr('style', 'text-anchor: middle; vertical-align: middle;')
      .attr('id', this.idGen.tempIconText(iconName))
      .attr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    for (var key in attrsObj) {
      textObj.attr(key, attrsObj[key]);
    }
    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(textObj);
    return this;
  },

  clearTempText: function(iconName) {
    this.svg.rmChild(this.idGen.tempIconText(iconName));
    var el = glift.dom.elem(this.idGen.tempIconText(iconName));
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
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
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
              elem.attr(key, theme.DEFAULT_HOVER[key]);
            }
          };
        actionsForIcon.mouseout = iconActions[iconName].mouseout ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId)
            if (elem) { // elem can be null during transitions.
              var theme = widgetRef.iconBar.theme.icons;
              for (var key in theme.DEFAULT) {
                elem.attr(key, theme.DEFAULT[key]);
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
   * Convenience mothod for adding hover events.  Equivalent to adding mouseover
   * and mouseout.
   */
  setHover: function(name, hoverin, hoverout) {
    this.setEvent(name, 'mouseover', hoverin);
    this.setEvent(name, 'mouseout', hoverout);
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
/**
 * Row-Center an array of wrapped icons.
 */
glift.displays.icons.rowCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing) {
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing, 'h');
}

/**
 * Column-Center an array of wrapped icons.
 */
glift.displays.icons.columnCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing) {
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing, 'v');
}

/**
 * Center an array of wrapped icons.
 */
glift.displays.icons._centerWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing, direction) {
  var bboxes = [];
  if (direction !== 'h' && direction !== 'v') {
    direction = 'h'
  }
  for (var i = 0; i < wrappedIcons.length; i++) {
    bboxes.push(wrappedIcons[i].bbox);
  }

  var minSpacing = minSpacing || 0;

  // Row center returns: { transforms: [...], bboxes: [...] }
  if (direction === 'h') {
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
glift.displays.icons.iconSelector = function(parentDivId, iconBarDivId, icon) {
  return new glift.displays.icons._IconSelector(parentDivId, iconBarDivId, icon)
      .draw();
};

glift.displays.icons._IconSelector = function(parentDivId, iconBarId, icon) {
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

glift.displays.icons._IconSelector.prototype = {
  draw: function() {
    // TODO(kashomon): This needs to be cleaned up. It's currently quite the
    // mess.
    this.destroy();
    var that = this;
    var svglib = glift.displays.svg;
    var parentBbox = glift.displays.bbox.fromDiv(this.parentDivId);

    var barElem = glift.dom.elem(this.iconBarId);
    var barPosLeft = barElem.boundingClientRect().left;

    var iconBarBbox = glift.displays.bbox.fromDiv(this.iconBarId);
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

      var columnBox = glift.displays.bbox.fromDiv(columnId);
      var transforms = glift.displays.icons.columnCenterWrapped(
          columnBox, rewrapped, paddingPx, paddingPx);

      var svgId = columnId + '_svg';
      var svg = svglib.svg()
          .attr('id', columnId + '_svg')
          .attr('height', '100%')
          .attr('width', '100%');
      var idGen = glift.displays.ids.generator(columnId);
      var container = svglib.group().attr('id', idGen.iconGroup());
      svg.append(container);
      for (var i = 0, len = transforms.length; i < len; i++) {
        var icon = rewrapped.shift();
        var id = svgId + '_' + icon.iconName;
        icon.setElementId(id);
        this.iconList[columnIndex].push(icon);
        container.append(svglib.path()
            .attr('d', icon.iconStr)
            .attr('fill', 'black') // replace with theme
            .attr('id', icon.elementId)
            .attr('transform', icon.transformString()));
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
      var container = svglib.group().attr('id', idGen.buttonGroup());
      svg.append(container);
      for (var j = 0; j < iconColumn.length; j++) {
        var icon = iconColumn[j]
        container.append(svglib.rect()
          .data(icon.iconName)
          .attr('x', icon.bbox.topLeft().x())
          .attr('y', icon.bbox.topLeft().y())
          .attr('width', icon.bbox.width())
          .attr('height', icon.bbox.height())
          .attr('fill', 'blue') // color doesn't matter, but need a fill
          .attr('opacity', 0)
          .attr('id', idGen.button(icon.iconName)));
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
  'move-indicator': {
    string: "M256,50C142.23,50,50,142.23,50,256s92.23,206,206,206s206-92.23,206-206S369.77,50,256,50z M256.001,124.6c72.568,0,131.399,58.829,131.399,131.401c0,72.568-58.831,131.398-131.399,131.398 c-72.572,0-131.401-58.83-131.401-131.398C124.6,183.429,183.429,124.6,256.001,124.6z M70,256 c0-49.682,19.348-96.391,54.479-131.521S206.318,70,256,70v34.6c-83.482,0.001-151.4,67.918-151.4,151.401 c0,41.807,17.035,79.709,44.526,107.134l-24.269,24.757c-0.125-0.125-0.254-0.245-0.379-0.37C89.348,352.391,70,305.682,70,256z",
    bbox: {"x":50,"y":50,"x2":462,"y2":462,"width":412,"height":412}
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
/**
 * Create a wrapper icon.
 */
glift.displays.icons.wrappedIcon = function(iconName) {
  return new glift.displays.icons._WrappedIcon(iconName);
};

/**
 * Wrap an array of iconNames.
 */
glift.displays.icons.wrapIcons = function(iconsRaw) {
  var out = [];
  for (var i = 0; i < iconsRaw.length; i++) {
    var item = iconsRaw[i];
    if (glift.util.typeOf(item) === 'string') {
      out.push(glift.displays.icons.wrappedIcon(item));
    } else if (glift.util.typeOf(item) === 'array') {
      var subIcons = item;
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
 */
glift.displays.icons.validateIcon = function(iconName) {
  if (iconName === undefined ||
      glift.displays.icons.svg[iconName] === undefined) {
    throw "Icon unknown: [" + iconName + "]";
  }
  return iconName;
};

/**
 * Icon wrapper for convenience.  All you need is:
 *  - The name of the icon
 */
glift.displays.icons._WrappedIcon = function(iconName) {
  this.iconName = glift.displays.icons.validateIcon(iconName);
  var iconData = glift.displays.icons.svg[iconName];
  this.iconStr = iconData.string;
  this.originalBbox = glift.displays.bbox.fromPts(
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
glift.displays.icons._WrappedIcon.prototype = {
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
/**
 * SVG utilities.
 */
glift.displays.svg = {};
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
glift.displays.svg.createObj = function(type, attrObj) {
   return new glift.displays.svg.SvgObj(type, attrObj);
};

glift.displays.svg.svg = function(attrObj) {
  return new glift.displays.svg.SvgObj('svg', attrObj)
      .attr('version', '1.1')
      .attr('xmlns', 'http://www.w3.org/2000/svg');
};

glift.displays.svg.circle = function(attrObj) {
  return new glift.displays.svg.SvgObj('circle', attrObj);
};

glift.displays.svg.path = function(attrObj) {
  return new glift.displays.svg.SvgObj('path', attrObj);
};

glift.displays.svg.rect = function(attrObj) {
  return new glift.displays.svg.SvgObj('rect', attrObj);
};

glift.displays.svg.image = function(attrObj) {
  return new glift.displays.svg.SvgObj('image', attrObj);
};

glift.displays.svg.text = function(attrObj) {
  return new glift.displays.svg.SvgObj('text', attrObj);
};

glift.displays.svg.group = function() {
  return new glift.displays.svg.SvgObj('g');
};

glift.displays.svg.SvgObj = function(type, attrObj) {
  this._type = type;
  this._attrMap =  attrObj || {};
  this._children = [];
  this._idMap = {};
  this._text = '';
  this._data = undefined;
};

glift.displays.svg.SvgObj.prototype = {
  /**
   * Attach content to a div.
   */
  attachToParent: function(divId) {
    var svgContainer = document.getElementById(divId);
    if (svgContainer) {
      svgContainer.appendChild(this.asElement());
    }
  },

  /**
   * Remove from the element from the DOM.
   */
  removeFromDom: function() {
    if (this.attr('id')) {
      var elem = document.getElementById(this.attr('id'));
      if (elem) { elem.parentNode.removeChild(elem); }
    }
    return this;
  },

  /**
   * Turn this node (and all children nodes) into SVG elements.
   */
  asElement: function() {
    var elem = document.createElementNS(
        "http://www.w3.org/2000/svg", this._type);
    for (var attr in this._attrMap) {
      if (attr === 'xlink:href') {
        elem.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'href', this._attrMap[attr]);
      } else {
        elem.setAttribute(attr, this._attrMap[attr]);
      }
    }
    if (this._type === 'text') {
      var textNode = document.createTextNode(this._text);
      elem.appendChild(textNode);
    }
    for (var i = 0, len = this._children.length; i < len; i++) {
      elem.appendChild(this._children[i].asElement());
    }
    return elem;
  },

  /**
   * Return the string form of the svg object.
   */
  render: function() {
    var base = '<' + this._type;
    for (var key in this._attrMap) {
      base += ' ' + key + '="' + this._attrMap[key] + '"';
    }
    base += '>' + this._text;
    if (this._children.length > 0) {
      var baseBuffer = [base];
      for (var i = 0, ii = this._children.length; i < ii; i++) {
        baseBuffer.push(this._children[i].render());
      }
      baseBuffer.push('</' + this._type + '>');
      base = baseBuffer.join("\n");
    } else {
      base += '</' + this._type + '>';
    }
    return base;
  },

  /**
   * Set or get an SVG attribute.
   */
  attr: function(key, value) {
    if (value !== undefined) {
      this._attrMap[key] = value;
      return this;
    } else {
      return this._attrMap[key];
    }
  },

  /**
   * Set or get all the an SVG attributes.
   */
  attrObj: function(obj) {
    if (obj !== undefined && glift.util.typeOf(obj) === 'object') {
      this._attrMap = obj;
      return this;
    } else {
      return this._attrMap;
    }
  },

  /**
   * Update a particular attribute in the DOM.
   */
  updateAttrInDom: function(attr) {
    var elem = document.getElementById(this.attr('id'))
    if (elem && attr && this.attr(attr)) {
      elem.setAttribute(attr, this.attr(attr));
    }
    return this;
  },

  /**
   * Set some internal data. Note: this data is not attached when the element is
   * generated.
   */
  data: function(data) {
    if (data !== undefined) {
      this._data = data;
      return this;
    } else {
      return this._data
    }
  },

  /**
   * Append some text. Ususally only for the 'text' element.
   */
  text: function(text) {
    if (text !== undefined) {
      this._text = "" + text
      return this;
    } else {
      return this._text;
    }
  },

  /**
   * Get child from an Id.
   */
  child: function(id) {
    return this._idMap[id];
  },

  /**
   * Remove child, based on id.
   */
  rmChild: function(id) {
    delete this._idMap[id];
    return this;
  },

  /**
   * Get all the Children.
   */
  children: function() {
    return this._children;
  },

  /** Empty out all the children. */
  emptyChildren: function() {
    this._children = [];
    return this;
  },

  /** Empty out all the children and update. */
  emptyChildrenAndUpdate: function() {
    this.emptyChildren();
    var elem = document.getElementById(this.attr('id'))
    while (elem && elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
    return this;
  },

  /**
   * Add an already existing child.
   *
   * Returns the object
   */
  append: function(obj) {
    if (obj.attr('id') !== undefined) {
      this._idMap[obj.attr('id')] = obj;
    }
    this._children.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   */
  appendNew: function(type, attrObj) {
    var obj = glift.displays.svg.createObj(type, attrObj);
    return this.append(obj);
  },

  /**
   * Append an SVG element and attach to the DOM.
   */
  appendAndAttach: function(obj) {
    this.append(obj);
    if (this.attr('id')) {
      obj.attachToParent(this.attr('id'))
    }
  },

  copyNoChildren: function() {
    var newAttr = {};
    for (var key in this._attrMap) {
      newAttr[key] = this._attrMap[key];
    }
    return glift.displays.svg.createObj(this._type, newAttr);
  }
};
glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   */
  create: function(options) {
    return new glift.displays.statusbar._StatusBar(
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
 */
glift.displays.statusbar._StatusBar = function(
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

/** TitleBar methods. */
glift.displays.statusbar._StatusBar.prototype = {
  draw: function() {
    this.iconBar.draw();
    this.setPageNumber(this.pageIndex, this.totalPages);
    return this;
  },

  /** Sets the move number for the current move */
  setMoveNumber: function(number) {
    if (!this.iconBar.hasIcon('move-indicator')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    var mod = num.length > 2 ? 0.35 : null;
    this.iconBar.addTempText(
        'move-indicator',
        num,
        { fill: color, stroke: color },
        mod);
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
/**
 * Makes Glift full-screen. Sort of. True fullscreen isn't supported yet.
 *
 * Note: Key bindings are set in the base_widget.
 */
glift.displays.statusbar._StatusBar.prototype.fullscreen = function() {
  // TODO(kashomon): Support true fullscreen: issues/69
  var widget = this.widget,
      wrapperDivId = widget.wrapperDivId,
      newDivId = wrapperDivId + '_fullscreen',
      newDiv = glift.dom.newDiv(newDivId),
      body = glift.dom.elem(document.body),
      state = widget.getCurrentState(),
      manager = widget.manager;

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
glift.displays.statusbar._StatusBar.prototype.unfullscreen = function() {
  if (!this.widget.manager.isFullscreen()) {
    return;
  }
  var widget = this.widget,
      wrapperDivEl = glift.dom.elem(widget.wrapperDivId),
      state = widget.getCurrentState(),
      manager = widget.manager,
      prevScrollTop = manager.prevScrollTop,
      body = glift.dom.elem(document.body),
      state = widget.getCurrentState();
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
/**
 * Create a game info object. Takes a array of game info data.
 *
 * Note: Key bindings are set in the base_widget.
 */
glift.displays.statusbar._StatusBar.prototype.gameInfo =
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
  return new glift.displays.statusbar._InfoWindow(wrapperDivEl, newDiv, textDiv);
};

/**
 * Info Window wrapper class.
 */
glift.displays.statusbar._InfoWindow = function(
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

glift.displays.statusbar._InfoWindow.prototype = {
  /** Finishes the Info Window by attaching all the elements. */
  finish: function() {
    this.baseStatusDiv_.append(this.textDiv);
    this.wrapperDiv_.prepend(this.baseStatusDiv_);
  }
};


glift.displays.position = {};
/**
 * Container for the widget boxes. Everything starts undefined,
 */
glift.displays.position.WidgetBoxes = function() {
  this._first = undefined;
  this._second = undefined;
};

glift.displays.position.WidgetBoxes.prototype = {
  /** Init or get the first column. */
  first: function(f) {
    if (f) {
      this._first = f;
    } else {
      return this._first;
    }
  },

  /** Init or get the second column. */
  second: function(f) {
    if (f) {
      this._second = f;
    } else {
      return this._second;
    }
  },

  /** Get a component by ID. */
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
    var colKeys = ['_first', '_second'];
    for (var i = 0; i < colKeys.length; i++) {
      var col = this[colKeys[i]];
      if (col !== undefined) {
        var ordering = col.ordering;
        for (var j = 0; j < ordering.length; j++) {
          var key = ordering[j];
          fn(key, col.mapping[key]);
        }
      }
    }
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
      return glift.displays.bbox.fromPts(
          glift.util.point(left, top), glift.util.point(right, bottom));
    } else  {
      return null;
    }
  }
};

/**
 * Data container for information about how the widegt is positioned.
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

  /** Get the bbox of a component or return null */
  getBbox: function(component) {
    return this.mapping[component] || null;
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
  return new glift.displays.position._WidgetPositioner(divBox, boardRegion,
      intersections, componentsToUse, oneColSplits, twoColSplits);
};


/** Internal widget positioner object */
glift.displays.position._WidgetPositioner = function(
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
glift.displays.position._WidgetPositioner.prototype = {
  /**
   * Calculate the Widget Positioning.  This uses heuristics to determine if the
   * orientation should be horizontally oriented or vertically oriented.
   *
   * Returns a WidgetBoxes instance.
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
   */
  calcVertPositioning: function() {
    var recalCol = this.recalcSplits(this.oneColSplits).first;
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.first(this.calculateColumn(
        recalCol, this.divBox, glift.enums.boardAlignments.TOP));
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
   */
  calcHorzPositioning: function() {
    var splits = this.recalcSplits(this.twoColSplits);
    var horzSplits = this.splitDivBoxHoriz();
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.first(this.calculateColumn(
        splits.first,
        horzSplits[0],
        glift.enums.boardAlignments.RIGHT,
        0 /* startTop */));
    boxes.second(this.calculateColumn(
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

    var top = startTop || 0;
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
      var bbox = glift.displays.bbox.fromSides(
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
    var baseRightCol = glift.displays.bbox.fromPts(
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
/**
 * Objects and methods that enforce the basic rules of Go.
 */
glift.rules = {};
/**
 * Autonumber the shit out of the movetree.
 *
 * NOTE! This removes all numeric labels and replaces them with the labels
 * constructed here, but that's sort of the point.
 *
 * Modifies the current movtree.
 */
glift.rules.autonumber = function(movetree) {
  var digitregex = /\d+/;
  var singledigit = /0\d/;
  movetree.recurseFromRoot(function(mt) {
    if (!mt.properties().contains('C') ||
        mt.properties().getOneValue('C') === '') {
      return; // Nothing to do.  We only autonumber on comments.
    }
    // First, clear all numeric labels
    var labels = mt.properties().getAllValues('LB');
    var lblMap = {}; // map from SGF point to label
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
      mt.properties().remove('LB');
    } else {
      mt.properties().set('LB', newlabels);
    }

    glift.rules.removeCollidingLabels(mt, lblMap);
  });
};

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

glift.rules.clearnumbers = function(movetree) {
  var digitregex = /\d+/;
  movetree.recurseFromRoot(function(mt) {
    // Clear all numeric labels
    if (!mt.properties().contains('LB')) {
      return; // no labels to clear;
    }
    var labels = mt.properties().getAllValues('LB');
    var newLbls = []; // map from SGF point to label
    for (var i = 0; labels && i < labels.length; i++) {
      var lblData = labels[i].split(':')
      if (digitregex.test(lblData[1])) {
        // Clear out digits
      } else {
        newLbls.push(labels[i]);
      }
    }
    if (newLbls.length === 0) {
      mt.properties().remove('LB');
    } else {
      mt.properties().set('LB', newLbls);
    }
  });
};
(function(){
glift.rules.goban = {
  /**
   * Creates a Goban instance, just with intersections.
   */
  getInstance: function(intersections) {
    var ints = intersections || 19;
    return new Goban(ints);
  },

  /**
   * Creates a goban, from a move tree and (optionally) a treePath, which defines
   * how to get from the start to a given location.  Usually, the treePath is
   * the initialPosition, but not necessarily.  If the treepath is undefined, we
   * craft a treepath to the current location in the movetree.
   *
   * NOTE: This leaves the movetree in a modified state.
   *
   * returns:
   *  {
   *    goban: Goban,
   *    captures: [<captures>, <capture>, ...]
   *  }
   *
   * where a capture object looks like:
   *  { White: [...], Black: [..] }
   */
  getFromMoveTree: function(mt, treepath) {
    var goban = new Goban(mt.getIntersections()),
        treepath = treepath || mt.treepathToHere(),
        movetree = mt.getTreeFromRoot(),
        captures = []; // array of captures.
    goban.loadStonesFromMovetree(movetree); // Load root placements.
    for (var i = 0; i < treepath.length; i++) {
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
 * The Goban tracks the state of the stones.
 *
 * Note that, for our purposes,
 * x: refers to the column.
 * y: refers to the row.
 *
 * Thus, to get a particular "stone" you must do
 * stones[y][x]. Also, stones are 0-indexed.
 *
 * 0,0    : Upper Left
 * 0,19   : Lower Left
 * 19,0   : Upper Right
 * 19,19  : Lower Right
 *
 * As a historical note, this is the oldest part of Glift.
 */
var Goban = function(ints) {
  if (!ints || ints <= 0) {
    throw "Invalid Intersections. Was: " + ints
  }
  this.ints = ints || 19;
  this.stones = initStones(ints);
};

Goban.prototype = {
  intersections: function() {
    return this.ints;
  },

  /**
   * getStone helps abstract the nastiness and trickiness of having to use the x/y
   * indices in the reverse order.
   *
   * Returns: a Color from glift.enums.states.
   */
  getStone: function(point) {
    return this.stones[point.y()][point.x()];
  },

  /**
   * Get all the placed stones on the board (BLACK or WHITE)
   * Returns an array of the form:
   *  [ {point:<point>, color:<color>}, {...}, ...]
   */
  getAllPlacedStones: function() {
    var out = [];
    for (var i = 0; i < this.stones.length; i++) {
      var row = this.stones[i];
      for (var j = 0; j < row.length; j++) {
        var point = glift.util.point(j, i);
        var color = this.getStone(point);
        if (color === glift.enums.states.BLACK ||
            color === glift.enums.states.WHITE) {
          out.push({point:point, color:color});
        }
      }
    }
    return out;
  },

  // Returns true or false:
  // True = stone can be placed
  // False = can't
  placeable: function(point, color) {
    // Currently, color is unused, but there are plans to use it because
    // self-capture is disallowed.
    return this.inBounds(point)
        && this.getStone(point) === glift.enums.states.EMPTY;
  },

  // Returns true if out-of-bounds.  False, otherwise
  outBounds: function(point) {
    return glift.util.outBounds(point.x(), this.ints)
        || glift.util.outBounds(point.y(), this.ints);
  },

  // Returns true if in-bounds. False, otherwise
  inBounds: function(point) {
    return glift.util.inBounds(point.x(), this.ints)
        && glift.util.inBounds(point.y(), this.ints);
  },

  // Simply set the intersection back to EMPTY
  clearStone: function(point) {
    this._setColor(point, glift.enums.states.EMPTY);
  },

  clearSome: function(points) {
    for (var i = 0; i < points.length; i++) {
      this.clearStone(points[i]);
    }
  },

  _setColor: function(point, color) {
    this.stones[point.y()][point.x()] = color;
  },

  /**
   * Try to add a stone on a new go board instance, but don't change state.
   *
   * Returns true / false depending on whether the 'add' was successful.
   */
  // TODO(kashomon): Needs a test.
  testAddStone: function(point, color) {
    var addStoneResult = this.addStone(point, color);

    // Undo our changes.
    this.clearStone(point);
    var oppositeColor = glift.util.colors.oppositeColor(color);
    for (var i = 0; i < addStoneResult.captures.length; i++) {
      this._setColor(addStoneResult.captures[i], oppositeColor);
    }
    return addStoneResult.successful;
  },

  /**
   * addStone: Add a stone to the GoBoard (0-indexed).  Requires the
   * intersection (a point) where the stone is to be placed, and the color of
   * the stone to be placed.
   *
   * addStone always returns a StoneResult object.
   *
   * A diagram of a StoneResult:
   * {
   *    successful: true or false   // Was placing a stone successful?
   *    captures : [ ... points ... ]  // the intersections of stones captured
   *        by placing a stone at the intersection (pt).
   * }
   *
   */
  addStone: function(pt, color) {
    if (!glift.util.colors.isLegalColor(color)) throw "Unknown color: " + color;

    // Add stone fail.  Return a failed StoneResult.
    if (this.outBounds(pt) || !this.placeable(pt))
      return new StoneResult(false);

    this._setColor(pt, color); // set stone as active
    var captures = new CaptureTracker();
    var oppColor = glift.util.colors.oppositeColor(color);

    this._getCaptures(captures, glift.util.point(pt.x() + 1, pt.y()), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x() - 1, pt.y()), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x(), pt.y() - 1), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x(), pt.y() + 1), oppColor);

    if (captures.numCaptures <= 0) {
      // We are now in a state where placing this stone results in 0 liberties.
      // Now, we check if move is self capture -- i.e., if the move doesn't
      // capture any stones.
      this._getCaptures(captures, pt, color);
      if (captures.numCaptures > 0) {
        // Onos! The move is self capture.
        this.clearStone(pt);
        return new StoneResult(false);
      }
    }

    var actualCaptures = captures.getCaptures();
    // Remove the captures from the board.
    this.clearSome(actualCaptures);
    return new StoneResult(true, actualCaptures);
  },

  // Get the captures.  We return nothing because state is stored in 'captures'
  _getCaptures: function(captures, pt, color) {
    this._findConnected(captures, pt, color);
    if (captures.liberties <= 0) captures.consideringToCaptures();
    captures.clearExceptCaptures();
  },

  // find the stones of the same color connected to eachother.  The color to
  // find is the param color. We return nothing because state is stored in
  // 'captures'.
  _findConnected: function(captures, pt, color) {
    var util = glift.util;
    // check to make sure we haven't already seen a stone
    // and that the point is not out of bounds.  If
    // either of these conditions fail, return immediately.
    if (captures.seen[pt.hash()] !== undefined || this.outBounds(pt)) {
      // we're done -- there's no where to go.
    } else {
      // note that we've seen the point
      captures.seen[pt.hash()] = true;
      var stoneColor = this.getStone(pt);
      if (stoneColor === glift.enums.states.EMPTY)    {
        // add a liberty if the point is empty and return
        captures.liberties++;
      } else if (stoneColor === util.colors.oppositeColor(color)) {
        // return and don't add liberties.  This works because we assume that
        // the stones start out with 0 liberties, and then we go along and add
        // the liberties as we see them.
      } else if (stoneColor === color) {
        // recursively add connected stones
        captures.considering.push(pt);
        this._findConnected(captures, util.point(pt.x() + 1, pt.y()), color);
        this._findConnected(captures, util.point(pt.x() - 1, pt.y()), color);
        this._findConnected(captures, util.point(pt.x(), pt.y() + 1), color);
        this._findConnected(captures, util.point(pt.x(), pt.y() - 1), color);
      } else {
        // Sanity check.
        throw "Unknown color error: " + stoneColor;
      }
    }
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
   */
  loadStonesFromMovetree: function(movetree) {
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    var captures = { BLACK : [], WHITE : [] };
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i]
      var placements = movetree.properties().getPlacementsAsPoints(color);
      for (var j = 0, len = placements.length; j < len; j++) {
        this._loadStone({point: placements[j], color: color}, captures);
      }
    }
    this._loadStone(movetree.properties().getMove(), captures);
    return captures;
  },

  _loadStone: function(mv, captures) {
    // note: if mv is defined, but mv.point is undefined, this is a PASS.
    if (mv  && mv.point !== undefined) {
      var result = this.addStone(mv.point, mv.color);
      if (result.successful) {
        var oppositeColor = glift.util.colors.oppositeColor(mv.color);
        for (var k = 0, len = result.captures.length; k < len; k++) {
          captures[oppositeColor].push(result.captures[k]);
        }
      }
    }
  },

  /**
   * Back out a movetree addition (used for going back a move).
   *
   * Recall that stones and captures both have the form:
   *  { BLACK: [..pts..], WHITE: [..pts..] };
   */
  // TODO(kashomon): Add testing for this in goban_test
  unloadStones: function(stones, captures) {
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    for (var color in stones) {
      for (var j = 0; j < stones[color].length; j++) {
        this.clearStone(stones[color][j]);
      }
    }
    for (var color in captures) {
      for (var i = 0; i < captures[color].length; i++) {
        this.addStone(captures[color][i], color);
      }
    }
  }
};

// Utiity functions

// Private function to initialize the stones.
var initStones = function(ints) {
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


// CaptureTracker is a utility object that assists in keeping track of captures.
// As an optimization, we keep track of points we've seen for efficiency.
var CaptureTracker = function() {
  this.toCapture = {}; // set of points to capture (mapping pt.hash() -> true)
  this.numCaptures = 0;
  this.considering = []; // list of points we're considering to capture
  this.seen = {}; // set of points we've seen (mapping pt.hash() -> true)
  this.liberties = 0;
};

CaptureTracker.prototype = {
  clearExceptCaptures: function() {
    this.considering =[];
    this.seen = {};
    this.liberties = 0;
  },

  consideringToCaptures: function() {
    for (var i = 0; i < this.considering.length; i++) {
      var value = this.considering[i];
      if (this.toCapture[value.hash()] === undefined) {
        this.toCapture[value.hash()] = true;
        this.numCaptures++;
      }
    }
  },

  addLiberties: function(x) {
    this.liberties += x;
  },

  addSeen: function(point) {
    this.seen[point.hash()] = true;
  },

  getCaptures: function() {
    var out = [];
    for (var key in this.toCapture) {
      out.push(glift.util.pointFromHash(key));
    }
    return out;
  }
};

// The stone result keeps track of whether placing a stone was successful and what
// stones (if any) were captured.
var StoneResult = function(success, captures) {
  this.successful = success;
  if (success) {
    this.captures = captures;
  } else {
    this.captures = [];
  }
};

})();
glift.rules.movenode = function(properties, children, nodeId, parentNode) {
  return new glift.rules._MoveNode(properties, children, nodeId, parentNode);
};

glift.rules._MoveNode = function(properties, children, nodeId, parentNode) {
  this._properties = properties || glift.rules.properties();
  this.children = children || [];
  this._nodeId = nodeId || { nodeNum: 0, varNum: 0 }; // this is a bad default.
  this._parentNode = parentNode;
  /**
   * Marker for determining mainline.  Should ONLY be used by onMainline from
   * the movetree.
   */
  // TODO(kashomon): Consider putting this in a data class.
  this._mainline = false;
};

glift.rules._MoveNode.prototype = {
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
    var variationNum = variationNum || 0;
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
/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 * _currentNode
 * _rootNode
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
  /** Create an empty MoveTree */
  getInstance: function(intersections) {
    var mt = new glift.rules._MoveTree(glift.rules.movenode());
    if (intersections !== undefined) {
      mt._setIntersections(intersections);
    }
    return mt;
  },

  /**
   * Create a MoveTree from an SGF.
   * Note: initPosition and parseType are both optional.
   */
  getFromSgf: function(sgfString, initPosition, parseType) {
    initPosition = initPosition || []; // treepath.
    parseType = parseType || glift.parse.parseType.SGF;

    if (glift.util.typeOf(initPosition) === 'string' ||
        glift.util.typeOf(initPosition) === 'number') {
      initPosition = glift.rules.treepath.parsePath(initPosition);
    }
    if (sgfString === undefined || sgfString === '') {
      return glift.rules.movetree.getInstance(19);
    }

    glift.util.majorPerfLog('Before SGF parsing in movetree');
    var mt = glift.parse.fromString(sgfString, parseType);

    mt = mt.getTreeFromRoot(initPosition);
    glift.util.majorPerfLog('After SGF parsing in movetree');

    return mt;
  },

  /** Seach nodes with a Depth First Search. */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      var mtz = moveTree.newTreeRef();
      glift.rules.movetree.searchMoveTreeDFS(mtz.moveDown(i), func);
    }
  },

  /** Convenience method for setting the root properties in a standard way */
  initRootProperties: function(mt) {
    var root = mt.getTreeFromRoot();
    var props = root.properties();
    if (!props.contains('GM')) {
      props.add('GM', '1');
    }
    if (!props.contains('FF')) {
      props.add('FF', '4');
    }
    if (!props.contains('CA')) {
      props.add('CA', 'UTF-8');
    }
    if (!props.contains('AP')) {
      props.add('AP', 'Glift:' + glift.global.version);
    }
    if (!props.contains('KM')) {
      props.add('KM', '0.00');
    }
    if (!props.contains('RU')) {
      props.add('RU', 'Japanese');
    }
    if (!props.contains('SZ')) {
      props.add('SZ', '19');
    }
    if (!props.contains('PB')) {
      props.add('PB', 'Black');
    }
    if (!props.contains('PW')) {
      props.add('PW', 'White');
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
 */
glift.rules._MoveTree = function(rootNode, currentNode, metadata) {
  this._rootNode = rootNode;
  this._currentNode = currentNode || rootNode;
  this._markedMainline = false;

  /**
   * Metadata is arbitrary data attached to the node.
   *
   * As a side note, Metadata extraction in Glift happens in the parser and so
   * will not show up in comments.  See the metadataProperty option in
   * options.baseOptions.
   */
  this._metadata = metadata || null;
};

glift.rules._MoveTree.prototype = {
  /////////////////////////
  // Most common methods //
  /////////////////////////

  /** Get the current node -- that is, the node at the current position. */
  node: function() {
    return this._currentNode;
  },

  /** Get the properties object on the current node. */
  properties: function() {
    return this.node().properties();
  },

  /** Gets global movetree metadata. */
  metadata: function() {
    return this._metadata;
  },

  /** Set the metadata for this Movetree. */
  setMetdata: function(data) {
    this._metadata = data;
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   */
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.node().getChild(num) !== undefined) {
      this._currentNode = this.node().getChild(num);
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not at root move.
   * At the root node, movetree.moveUp().moveUp() == movetree.moveUp();
   */
  moveUp: function() {
    var parent = this._currentNode.getParent();
    if (parent) { this._currentNode = parent; }
    return this;
  },

  /**
   * Get the current player as a color.
   */
  getCurrentPlayer: function() {
    var states = glift.enums.states;
    var tokenMap = {W: 'WHITE', B: 'BLACK'};
    var curNode = this._currentNode;

    // The PL property is a short circuit. Usually only used on the root node.
    if (this.properties().contains('PL')) {
      return tokenMap[this.properties().getOneValue('PL')]
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
   */
  newTreeRef: function() {
    return new glift.rules._MoveTree(
        this._rootNode, this._currentNode, this._metadata);
  },

  /**
   * Creates a new Movetree reference from a particular node. The underlying
   * node-tree remains the same.
   *
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   */
  getFromNode: function(node) {
    return new glift.rules._MoveTree(node, node, this._metadata);
  },

  /**
   * Gets a new move tree instance from the root node. Important note: this
   * creates a new tree reference. Thus, if you don't assign to a var, nothing
   * will happen.
   *
   * treepath: optionally also apply a treepath to the tree
   */
  getTreeFromRoot: function(treepath) {
    var mt = this.getFromNode(this._rootNode);
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
  /** Add a new Node to the cur position and move to that position. */
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
   * branch that has the sepceified move.
   *
   * return either the number or null if no such number exists.
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
          ptSet[node.properties().getAsPoint(token).hash()] =
            node.getVarNum();
        }
      }
    }
    if (ptSet[point.hash()] !== undefined) {
      return ptSet[point.hash()];
    } else {
      return null;
    }
  },

  /** Get the intersections number of the go board, by looking at the props. */
  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.rules.allProperties;
    if (mt.properties().contains(allProperties.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(allProperties.SZ));
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
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * If not on the mainline, returns the appriate 'move number' for a variation,
   * for the current location, which is the number of moves to mainline
   *
   * Returns 0 if on mainline.
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
   * returns: an array of dicts with the moves, e.g.,
   *    [{color: <Color>, point: point },...]
   *
   * The ordering of the moves is guranteed to be the ordering of the
   *    variations at the time of creation.
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

  /** Returns true if the tree is currently on a mainline variation. */
  onMainline: function() {
    if (!this._markedMainline) {
      var mt = this.getTreeFromRoot();
      mt.node()._mainline = true;
      while (mt.node().numChildren() > 0) {
        mt.moveDown();
        mt.node()._mainline = true;
      }
      this._markedMainline = true;
    }
    return this.node()._mainline;
  },

  /**
   * Construct an entirely new movetree, but add all the previous stones as
   * placements.  If the tree is at the root, it's equivalent to a copy of the
   * movetree.
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
          var point = moves[j];
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
      mt.properties().add('PL', tokenmap[oldCurrentPlayer]);
    }
    return mt;
  },

  /** Recursive over the movetree. func is called on the movetree. */
  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  /** Recursive over the movetree from root. func is called on the movetree. */
  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  /** Convert this movetree to an SGF. */
  toSgf: function() {
    return this._toSgfBuffer(this.getTreeFromRoot().node(), []).join("");
  },

  /**
   * Create a treepath to the current location. This does not change the current
   * movetree.
   *
   * returns: A treepath (an array of variation numbers);
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

  /////////////////////
  // Private Methods //
  /////////////////////
  _debugLog: function(spaces) {
    if (spaces === undefined) {
      spaces = "  ";
    }
    glift.util.logz(spaces + this.node(i).getVarNum() + '-'
        + this.node(i).getNodeNum());
    for (var i = 0; i < this.node().numChildren(); i++) {
      this.moveDown(i);
      this._debugLog(spaces);
      this.moveUp();
    }
  },

  /**
   * Set the intersections property.
   * Note: This is quite dangerous. If the goban and other data structures are
   * not also updated, chaos will ensue
   */
  _setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.rules.allProperties;
    if (!mt.properties().contains(allProperties.SZ)) {
      this.properties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  /**
   * Recursive method to build an SGF into an array of data.
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
   * Returns one of enum.problemResults (CORRECT, INDETERMINATE, INCORRECT).
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
   * Get the correct next moves.
   *
   * returns: the 'correct' next moves. In other words
   *
   * [{ point: <point>, color: <color>  },..
   * ]
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
(function() {
glift.rules.properties = function(map) {
  return new Properties(map);
};

/** Properties that accept point values */
glift.rules.propertiesWithPts = {
  // Marks
  CR: true, LB: true, MA: true, SQ: true, TR: true,
  // Stones
  B: true, W: true, AW: true, AB: true,
  // Misc
  AE: true, // clear stones
  AR: true, // arrow
  DD: true, // gray area
  LN: true,// line
};

/** All the SGF Properties plus some things. */
glift.rules.allProperties = {
AB: 'AB', AE: 'AE', AN: 'AN', AP: 'AP', AR: 'AR', AS: 'AS', AW: 'AW', B: 'B',
BL: 'BL', BM: 'BM', BR: 'BR', BS: 'BS', BT: 'BT', C: 'C', CA: 'CA', CH: 'CH',
CP: 'CP', CR: 'CR', DD: 'DD', DM: 'DM', DO: 'DO', DT: 'DT', EL: 'EL', EV: 'EV',
EX: 'EX', FF: 'FF', FG: 'FG', GB: 'GB', GC: 'GC', GM: 'GM', GN: 'GN', GW: 'GW',
HA: 'HA', HO: 'HO', ID: 'ID', IP: 'IP', IT: 'IT', IY: 'IY', KM: 'KM', KO: 'KO',
L: 'L', LB: 'LB', LN: 'LN', LT: 'LT', M: 'M', MA: 'MA', MN: 'MN', N: 'N', OB:
'OB', OH: 'OH', OM: 'OM', ON: 'ON', OP: 'OP', OT: 'OT', OV: 'OV', OW: 'OW', PB:
'PB', PC: 'PC', PL: 'PL', PM: 'PM', PW: 'PW', RE: 'RE', RG: 'RG', RO: 'RO', RU:
'RU', SC: 'SC', SE: 'SE', SI: 'SI', SL: 'SL', SO: 'SO', SQ: 'SQ', ST: 'ST', SU:
'SU', SZ: 'SZ', TB: 'TB', TC: 'TC', TE: 'TE', TM: 'TM', TR: 'TR', TW: 'TW', UC:
'UC', US: 'US', V: 'V', VW: 'VW', W: 'W', WL: 'WL', WR: 'WR', WS: 'WS', WT: 'WT',
MU: 'MU'
};

var Properties = function(map) {
  this.propMap = map || {};
};

Properties.prototype = {
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
   */
  add: function(prop, value) {
    // Return if the property is not string or a real property
    if (!glift.rules.allProperties[prop]) {
      glift.util.logz('Warning! The property [' + prop + ']' +
          ' is not valid and is not recognized in the SGF spec.');
    }
    var valueType = glift.util.typeOf(value);

    if (valueType !== 'string' && valueType !== 'array') {
      // The value has to be either a string or an array.  Maybe we should throw
      // an error?
      value = [ this.unescape(value) ];
    } else if (valueType === 'array') {
      // Force all array values to be of type string.
      for (var i = 0, len = value.length; i < len; i++) {
        // Ensure properties are strings
        value[i] = this.unescape(value[i]);
      }
    } else if (valueType === 'string') {
      value = [ this.unescape(value) ];
    } else {
      throw new Error('Unexpected type ' +
          glift.util.typeOf(value) + ' for item ' + item);
    }

    // Convert any point rectangles...
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
    if (glift.rules.allProperties[strProp] === undefined) {
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
   */
  getOneValue: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.getAllValues(strProp);
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
   * Returns null if the property doesn't exist.
   */
  getAsPoint: function(strProp, index) {
    var out = this.getOneValue(strProp, index);
    if (out) {
      return glift.util.pointFromSgfCoord(out);
    } else {
      return out;
    }
  },

  /**
   * Returns true if the current move has the property "prop".  Return
   * false otherwise.
   */
  contains: function(prop) {
    return prop in this.propMap;
  },

  /** Tests wether a prop contains a value */
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

  /** Deletes the prop and return the value. */
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
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [ this.unescape(value) ];
      } else if (glift.util.typeOf(value) === 'array') {
        for (var i = 0; i < value.length; i++) {
          if (glift.util.typeOf(value[i]) !== 'string') {
            throw new Error('When setting via an array, all values ' +
              'must be strings. was [' + glift.util.typeOf(value[i]) +
              '], for value ' + value[i]);
          }
          value[i] = this.unescape(value[i]);
        }
        this.propMap[prop] = value
      }
    }
    return this;
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  // Get all the placements for a color (BLACK or WHITE).  Return as an array.
  getPlacementsAsPoints: function(color) {
    var prop = '';
    if (color === glift.enums.states.BLACK) {
      prop = glift.rules.allProperties.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.rules.allProperties.AW;
    }
    if (prop === '' || !this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  /**
   * Get the current comment on the move. This is, of course, just a convenience
   * method -- equivalent to properties().getOneValue('C'). It's provided as a
   * convenience method since it's an extremely comment operation.
   *
   * Returns: string or null.
   */
  getComment: function() {
    if (this.contains('C')) {
      return this.getOneValue('C');
    } else {
      return null;
    }
  },

  /**
   * Get the current Move.  Returns null if no move exists.
   *
   * Specifically, returns a dict:
   *  {
   *    color: <BLACK / WHITE>
   *    point: point
   *  }
   *
   * If the move is a pass, then in the SGF, we'll see B[] or W[].  Thus,
   * we will return { color: BLACK } or { color: WHITE }, but we won't have any
   * point associated with this.
   */
  getMove: function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    if (this.contains('B')) {
      if (this.getOneValue('B') === "") {
        return { color: BLACK }; // This is a PASS
      } else {
        return { color: BLACK, point: this.getAsPoint('B') }
      }
    } else if (this.contains('W')) {
      if (this.getOneValue('W') === "") {
        return { color: WHITE }; // This is a PASS
      } else {
        return { color: WHITE, point: this.getAsPoint('W') };
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
   * returns:
   *  {
   *    BLACK: <pts>
   *    WHITE: <pts>
   *  }
   */
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out[BLACK] = this.getPlacementsAsPoints(states.BLACK);
    out[WHITE] = this.getPlacementsAsPoints(states.WHITE);
    var move = this.getMove();
    if (move && move.point) {
      out[move.color].push(move.point);
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
   */
  // TODO(kashomon): Add test
  getGameInfo: function() {
    var gameInfoArr = [];
    // Probably should live in a more canonical place (properties.js).
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
        if (key === 'PW' && this.contains('WR')) {
          obj.value += ' [' + this.getOneValue('WR') + ']';
        } else if (key === 'PB' && this.contains('BR')) {
          obj.value += ' [' + this.getOneValue('BR') + ']';
        }
        // Remove trailing zeroes on komi amounts.
        else if (key === 'KM') {
          obj.value = parseFloat(this.getOneValue(key)) + '' || '0';
        }
        gameInfoArr.push(obj);
      }
    }
    return gameInfoArr;
  },

  /** Escapes some text by converting ] to \\] */
  escape: function(text) {
    return text.toString().replace(/]/g, '\\]');
  },

  /** Unescapes some text by converting \\] to ] */
  unescape: function(text) {
    return text.toString().replace(/\\]/g, ']');
  }
};

})();
/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem. This implies that the treeptahs discussed below
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
   */
  parsePath: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = '' + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return initPos;
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      return this.toEnd();
    }

    var out = [];
    var lastNum = 0;
    // "2.3-4.1+"
    var sect = initPos.split('-');
    // [2.3, 4.1+]
    for (var i = 0; i < sect.length; i++) {
      // 4.1 => [4,1+]
      var v = sect[i].split('\.');
      // Handle the first number (e.g., 4);
      for (var j = 0; j < v[0] - lastNum; j++) {
        out.push(0);
      }
      var lastNum = v[0];
      // Handle the rest of the numbers (e.g., 1+)
      for (var j = 1; j < v.length; j++) {
        // Handle the last number. 1+
        var testNum = v[j];
        if (testNum.charAt(testNum.length - 1) === '+') {
          testNum = testNum.slice(0, testNum.length - 1);
          out.push(parseInt(testNum));
          // + must be the last character.
          out = out.concat(glift.rules.treepath.toEnd());
          return out;
        } else {
          out.push(parseInt(testNum));
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
   * path: an initial path. Should be an array
   */
  parseFragment: function(pathStr) {
    if (!pathStr) {
      pathStr = [];
    }
    var vartype = glift.util.typeOf(pathStr);
    if (vartype === 'array') {
      return pathStr; // assume the array is in the correct format
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
        out.push(parseInt(num))
        out = out.concat(glift.rules.treepath.toEnd());
      } else {
        out.push(parseInt(num));
      }
    }
    return out;
  },

  /**
   * Converts a treepath fragement back to a string.  In other words:
   *    [2,0,1,2,6] => 2.0.1.2.6
   */
  toFragmentString: function(path) {
    if (glift.util.typeOf(path) !== 'array') {
      return path.toString();
    }
    return path.join('.');
  },

  /**
   * Converts a treepath back to an initial path string. This is like the
   * toFragmentString, except that long strings of zeroes are converted to move
   * numbers.  I.e, 0,0,0,0 => 3
   *
   * Note: Once we're on a variation, we don't collapse the path
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
        out.push(i);
        out.push(elem);
        if (onMainLine) {
          onMainLine = false;
        }
      }
    }
    return out.join('.');
  },

  /**
   * Return an array of 500 0-th variations.  This is sort of a hack, but
   * changing this would involve rethinking what a treepath is.
   */
  toEnd: function() {
    if (glift.rules.treepath._storedToEnd !== undefined) {
      return glift.rules.treepath._storedToEnd;
    }
    var storedToEnd = []
    for (var i = 0; i < 500; i++) {
      storedToEnd.push(0);
    }
    glift.rules.treepath._storedToEnd = storedToEnd;
    return glift.rules.treepath._storedToEnd;
  },

  /**
   * Use some heuristics to find a nextMovesTreepath.  This is used for
   * automatically adding move numbers.
   *
   * movetree: a movetree, of course.
   * initTreepath [optional]: the initial treepath. If not specified or
   *    undefined, use the current location in the movetree.
   * minusMovesOverride: force findNextMoves to to return a nextMovesTreepath of
   *    this length, starting from the init treepath.  The actually
   *    nextMovesTreepath can be shorter
   *    breakOnComment: Whether or not to break on comments on the main
   *        variation.  Defaults to true
   *
   * returns: on object with three keys
   *    movetree: an update movetree
   *    treepath: a new treepath that says how to get to this position
   *    nextMoves: A nextMovesTreepath, used to apply for the purpose of
   *        crafting moveNumbers.
   */
  findNextMovesPath: function(
      movetree, initTreepath, minusMovesOverride, breakOnComment) {
    var initTreepath = initTreepath || movetree.treepathToHere();
    var breakOnComment = breakOnComment === false ? false : true;
    var mt = movetree.getTreeFromRoot(initTreepath);
    var minusMoves = minusMovesOverride || 40;
    var nextMovesTreepath = [];
    var startMainline = mt.onMainline();
    for (var i = 0; mt.node().getParent() && i < minusMoves; i++) {
      var varnum = mt.node().getVarNum();
      nextMovesTreepath.push(varnum);
      mt.moveUp();
      if (breakOnComment &&
          mt.properties().getOneValue('C') &&
          !minusMovesOverride) {
        break;
      }

      if (!startMainline && mt.onMainline() && !minusMovesOverride) {
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
   * movetree: a rules.movetree.
   * goban: a rules.goban array.
   * nextMoves:  A next-moves treepath. See findNextMoves.
   *
   * returns: An object with two keys:
   *    movetree: the updated movetree after applying the nextmoves
   *    stones: arrayof 'augmented' stone objects
   *
   * augmented stone objects take the form:
   *    {point: <point>, color: <color>}
   * or
   *    {point: <point>, color: <color>, collision:<idx>}
   *
   * where idx is an index into the stones object.  If idx is null, the stone
   * conflicts with a stone added elsewhere (i.e., in the goban).  This should
   * be a reasonably common case.
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
   * TODO(kashomon): This is only used by the problem.js file.  Maybe move it in
   * there.
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

  _flattenMoveTree: function(movetree, pathToHere) {
    if (pathToHere === undefined) pathToHere = [];
    pathToHere.push(movetree.node().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i)
      var thisout = glift.rules.treepath._flattenMoveTree(
          movetree, pathToHere.slice());
      out = out.concat(thisout)
      movetree.moveUp(i)
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
    var allProps = glift.rules.allProperties;
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
/**
 * Glift parsing
 */
glift.parse = {
  /** Parse types */
  parseType: {
    SGF: 'SGF',
    TYGEM: 'TYGEM',
    PANDANET: 'PANDANET'
  },

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
   */
  fromString: function(str, ttype) {
    var ttype = ttype || glift.parse.parseType.SGF;
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
 * @api(experimental)
 */
glift.parse.sgfMetadataProperty = 'GC';


/**
 * The new Glift SGF parser!
 * Takes a string, returns a movetree.  Easy =).
 *
 * Note: Because SGFs have notoriously bad data / properties, we log warnings
 * for unknown properties rather than throwing errors.
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
          movetree.setMetdata(mdata);
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
            if (glift.rules.allProperties[curProp] === undefined) {
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
 * Also, it's a horrible format.
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
    mt.properties().add(prop, line.substring(
        line.indexOf(name) + name.length + 1, line.length - 2));
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
      var x = parseInt(splat[4]);
      var y = parseInt(splat[5]);
      movetree.addNode().properties().add(
          colorToken, glift.util.point(x, y).toSgfCoord());
    }
  }
  return movetree.getTreeFromRoot();
};
/*
 * The controllers logical parts (the Brains!) of a Go board widget.  You can
 * use the movetree and rules directly, but it's usually easier to use the
 * controller layer to abstract dealing with the rules.  It's especially useful
 * for testing logic as distinct from UI changes.
 */
glift.controllers = {};
(function() {
glift.controllers.base = function() {
  return new BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, an abstract
 * base implementation for interacting with SGFs.  Typically, those objects
 * extending this base class will implement addStone and [optionally]
 * extraOptions.
 *
 * The options are generall set either with initOptions or initialize;
 */
var BaseController = function() {
  // Options set with initOptions and intended to be immutable during the
  // lifetime of the controller.
  this.sgfString = '';
  this.initialPosition = [];

  // These next two are widget specific, but are here, for convenience.

  // Used only for examples.
  this.nextMovesPath = [];
  // Used only for problem-types
  this.problemConditions = {};

  // State variables that are defined on initialize and that could are
  // necessarily mutable.
  this.parseType = undefined;
  this.treepath = undefined;
  this.movetree = undefined;
  this.goban = undefined;
  this.captureHistory = [];
};

BaseController.prototype = {
  /**
   * Initialize both the options and the controller's children data structures.
   *
   * Note that these options should be protected by the options parsing (see
   * options.js in this same directory).  Thus, no special checks are made here.
   */
  initOptions: function(sgfOptions) {
    if (sgfOptions === undefined) {
      throw 'Options is undefined!  Can\'t create controller'
    }
    this.parseType = sgfOptions.parseType || glift.parse.parseType.SGF;
    this.sgfString = sgfOptions.sgfString || '';
    this.initialPosition = sgfOptions.initialPosition || [];
    this.problemConditions = sgfOptions.problemConditions || undefined;
    this.nextMovesPath = sgfOptions.nextMovesPath || [];
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
   * treepath: Optionally pass in the treepath from the beginning and use that
   * instead of the initialPosition treepath.
   */
  initialize: function(treepath) {
    var rules = glift.rules;
    var initTreepath = treepath || this.initialPosition;
    this.treepath = rules.treepath.parsePath(initTreepath);

    // TODO(kashomon): Appending the nextmoves path is hack until the UI
    // supports passing using true flattened data representation.
    if (this.nextMovesPath) {
      this.treepath = this.treepath.concat(
          rules.treepath.parseFragment(this.nextMovesPath));
    }

    this.movetree = rules.movetree.getFromSgf(
        this.sgfString, this.treepath, this.parseType);
    var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
    this.extraOptions(); // Overridden by implementers
    return this;
  },

  /**
   * It's expected that this will be implemented by those extending this base
   * class.  This is called during initOptions above.
   */
  extraOptions: function(opt) { /* Implemented by other controllers. */ },

  /**
   * Add a stone.  This is intended to be overwritten.
   */
  addStone: function(point, color) { throw "Not Implemented"; },

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

  /** Get the current move number. */
  currentMoveNumber: function(treepath) {
    return this.movetree.node().getNodeNum();
  },

  /**
   * Gets the variation number of the next move. This will be something different
   * if we've used setNextVariation or if we've already played into a variation.
   * Otherwise, it will be 0.
   */
  nextVariationNumber: function() {
    return this.treepath[this.currentMoveNumber()] || 0;
  },

  /**
   * Sets what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber());
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /** Gets the treepath to the current position */
  pathToCurrentPosition: function() {
    return this.movetree.treepathToHere();
  },

  /**
   * Gets the game info key-value pairs. This consists of global data about the
   * game, such as the names of the players, the result of the game, the
   * name of the tournament, etc.
   */
  getGameInfo: function() {
    return this.movetree.getTreeFromRoot().properties().getGameInfo();
  },

  /**
   * Return the entire intersection data, including all stones, marks, and
   * comments.  This format allows the user to completely populate some UI of
   * some sort.
   *
   * The output looks like:
   *  {
   *    points: {
   *      "1,2" : {
   *        point: {1, 2},
   *        STONE: "WHITE"
   *      },
   *      ... etc ...
   *    },
   *    comment : "foo"
   *  }
   */
  getEntireBoardState: function() {
    return glift.bridge.intersections.getFullBoardData(
        this.movetree,
        this.goban,
        this.problemConditions,
        this.nextVariationNumber());
  },

  /** Return only the necessary information to update the board. */
  // TODO(kashomon): Rename to getCurrentBoardState
  getNextBoardState: function() {
    return glift.bridge.intersections.nextBoardData(
        this.movetree,
        this.getCaptures(),
        this.problemConditions,
        this.nextVariationNumber());
  },

  /** Get the captures that occured for the current move. */
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
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point, color);
  },

  /**
   * Returns a State (either BLACK or WHITE). Needs to be fast since it's used
   * to display the hover-color in the display.
   *
   * This will be undefined until initialize is called, so the clients of the
   * controller must make sure to always initialize the board position
   * first.
   */
  getCurrentPlayer: function() {
    return this.movetree.getCurrentPlayer();
  },

  /** Get the current SGF string. */
  currentSgf: function() {
    return this.movetree.toSgf();
  },

  /** Get the original SGF string. */
  originalSgf: function() {
    return this.sgfString;
  },

  /** Returns the number of intersections.  Should be known at load time. */
  getIntersections: function() {
    return this.movetree.getIntersections();
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
   */
  nextMove: function(varNum) {
    if (this.treepath[this.currentMoveNumber()] !== undefined &&
        (varNum === undefined || this.nextVariationNumber() === varNum)) {
      // Don't mess with the treepath, if we're 'on variation'.
      this.movetree.moveDown(this.nextVariationNumber());
    } else {
      varNum = varNum === undefined ? 0 : varNum;
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
    return this.getNextBoardState();
  },

  /**
   * Go back a move.
   *
   * Returns null in the case that there is no previous move.
   */
  prevMove: function() {
    if (this.currentMoveNumber() === 0) {
      return null;
    }
    var captures = this.getCaptures();
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber() - 1);
    this.goban.unloadStones(allCurrentStones, captures);
    this.movetree.moveUp();
    var displayData = glift.bridge.intersections.previousBoardData(
        this.movetree,
        allCurrentStones,
        captures,
        this.problemConditions,
        this.nextVariationNumber());
    return displayData;
  },

  /** Go back to the beginning. */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    return this.getEntireBoardState();
  },

  /** Go to the end. */
  toEnd: function() {
    while (this.nextMove()) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  }
};
})();
glift.controllers.boardEditor = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  glift.util.setMethods(baseController, ctrl.BoardEditorMethods);
  baseController.initOptions(sgfOptions);
  return baseController;
};

glift.controllers.BoardEditorMethods = {
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
    var allProps = glift.rules.allProperties;
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
            var lbl = splat[1];
            markData.data = lbl;
            if (alphaRegex.test(lbl)) {
              markData.mark = marks.LABEL_ALPHA;
            } else if (digitRegex.test(lbl)) {
              lbl = parseInt(lbl);
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
        base.push(parseInt(key));;
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
   * Use the current numeric mark (as a string). This removes the mark frome the
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
    return this.getNextBoardState();
  },

  /** Remove a mark from the board. */
  removeMark: function(point) {
    var marks = glift.enums.marks;
    var markData = this.getMark(point);
    if (!markData) { return null; }

    delete this._ptTolabelMap[point.toString()];
    var sgfProp = glift.sgf.markToProperty(markData.mark);
    if (markData.mark === marks.LABEL_NUMERIC) {
      this._numericLabels.push(parseInt(markData.data));
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
    return this.getNextBoardState();
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
    return this.getNextBoardState();
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
      return glift.bridge.intersections.nextBoardData(this.movetree, captures);
    }
    return null;
  },

  pass: function() { throw new Error('Not implemented'); },
  clearStone: function() { throw new Error('Not implemented'); }
};
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
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
    return this.getEntireBoardState();
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
    return this.getEntireBoardState();
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
/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 */
glift.controllers.staticProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  var newController = glift.util.setMethods(baseController,
          glift.controllers.StaticProblemMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.StaticProblemMethods = {
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
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults;
    var CORRECT = problemResults.CORRECT;
    var INCORRECT = problemResults.INCORRECT;
    var INDETERMINATE = problemResults.INDETERMINATE;
    var FAILURE = problemResults.FAILURE;

    if (!this.goban.placeable(point) ||
        !this.goban.testAddStone(point, color)) {
      return { result: FAILURE };
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
      outData.result = correctness;
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
      var outData = this.getEntireBoardState();
      outData.result = correctness;
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
/**
 * The bridge is the only place where display and rules/widget code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion of the objects, see intersections.js in
   * glift.bridge.
   */
  // TODO(kashomon): move showVariations to intersections.
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
        markPtString = markPt.toString();
        marksMap[markPtString] = true;
        if (markType === marks.LABEL) {
          if (variationMap[markPtString] &&
              this.shouldShowNextMoves(boardData, showVariations)) {
            // This is a variation label && we should show it
            var markValue = this.markSelectedNext(
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
      var markValue = this.markSelectedNext(boardData, pt, i);
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

/**
 * Takes a movetree and returns the optimal BoardRegion-Quad for cropping purposes.
 *
 * Note: This isn't a minimal cropping: we split the board into 4 quadrants.
 * Then, we use the quad as part of the final quad-output. Note that we only
 * allow convex shapes.  Thus, these aren't allowed (where the X's are
 * quad-regions)
 * .X     X.
 * X. and XX
 */
glift.bridge.getQuadCropFromMovetree = function(movetree) {
  var bbox = glift.displays.bbox.fromPts;
  var pt = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Tracker is a map from quad-key to array of points.
  var tracker = {};
  var numstones = 0;

  // It's not clear to me if we should be cropping boards smaller than 19.  It
  // usually looks pretty weird, so hence this override.
  if (movetree.getIntersections() !== 19) {
    return boardRegions.ALL;
  }

  var quads = {};
  quads[boardRegions.TOP_LEFT] = bbox(pt(0, 0), pt(middle, middle));
  quads[boardRegions.TOP_RIGHT] = bbox(pt(middle, 0), pt(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] = bbox(pt(0, middle), pt(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] = bbox(pt(middle, middle), pt(ints, ints));

  movetree.recurseFromRoot(function(mt) {
    var stones = mt.properties().getAllStones();
    for (var color in stones) {
      var points = stones[color];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        numstones += 1
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (middle === pt.x() || middle === pt.y()) {
            // Ignore points right on the middle.  It shouldn't make a different
            // for cropping, anyway.
          } else if (box.contains(pt)) {
            if (tracker[quadkey] === undefined) tracker[quadkey] = [];
            tracker[quadkey].push(pt);
          }
        }
      }
    }
  });
  return glift.bridge._getRegionFromTracker(tracker, numstones);
};

glift.bridge._getRegionFromTracker = function(tracker, numstones) {
  var regions = [], br = glift.enums.boardRegions;
  for (var quadkey in tracker) {
    var quadlist = tracker[quadkey];
    regions.push(quadkey);
  }
  if (regions.length === 1) {
    return regions[0];
  }
  if (regions.length !== 2) {
    return glift.enums.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.enums.boardRegions.ALL;
};

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
rules *
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
   */
  // TODO(kashomon): Make this a proper object constructor with accessors and
  // methods and whatnot.  It's getting far too complicated. Alternatively,
  // switch over to the flattener model.
  basePropertyData: function(movetree, problemConditions, nextVarNumber) {
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
    out.selectedNextMove = out.nextMoves[nextVarNumber] || null;
    out.correctNextMoves = problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree, problemConditions)
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
   */
  nextBoardData: function(
      movetree, currentCaptures, problemConditions, nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions, nextVarNumber);
    baseData.stones = movetree.properties().getAllStones();
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
        baseData.stones.EMPTY.push(stones[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   *
   * returns: map from
   */
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.bridge.intersections.propertiesToMarks) {
      var mark = glift.bridge.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.rules.allProperties.LB) {
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
/**
 * Rotates a movetree so that it's canonical, given some cropbox
 */
glift.bridge.autorotateMovetree = function(movetree, regionOrdering) {
  var rotation = glift.bridge.calculateRotation_(movetree, regionOrdering);
};

/**
 * Calculates the desired rotation. As Degrees: Either 90, 180, 270.
 */
glift.bridge.findCanonicalRotation = function(movetree, regionOrdering) {
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

  var region = glift.bridge.getQuadCropFromMovetree(movetree);

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
/**
 * Helps flatten a go board into a diagram definition.
 */
glift.flattener = {
  /**
   * Flatten the combination of movetree, goban, cropping, and treepath into an
   * array (really a 2D array) of symbols, (a Flattened object).
   *
   * Some notes about the parameters:
   *
   * Required parameters:
   *  - The movetree is used for extracting:
   *    -> The marks
   *    -> The next moves
   *    -> The previous move
   *    -> subsequent stones, if a nextMovesTreepath is present.  These are
   *    given labels.
   *
   * Optional parameters:
   *  - goban: used for extracting all the inital stones.
   *  - boardRegion: indicates what region to crop on.
   *  - nextMovesTreepath.  Defaults to [].  This is typically only used for
   *    printed diagrams.
   *  - startingMoveNum.  Optionally override the move number. If not set, it's
   *    automatically determined based on whether the position is on the
   *    mainpath or a variation.
   */
  flatten: function(movetreeInitial, options) {
    // Create a new ref to avoid changing original tree ref.
    var mt = movetreeInitial.newTreeRef();
    options = options || {};

    // Use the provided goban, or reclaculate it.  This is somewhat inefficient,
    // so it's recommended that the goban be provided.
    var goban = options.goban || glift.rules.goban.getFromMoveTree(
        mt.getTreeFromRoot(), mt.treepathToHere()).goban;
    var boardRegion =
        options.boardRegion || glift.enums.boardRegions.ALL;
    var showVars =
        options.showNextVariationsType  || glift.enums.showVariations.NEVER;
    var nmtp = glift.rules.treepath.parseFragment(options.nextMovesTreepath);

    var startingMoveNum = options.startingMoveNum || null;

    // Calculate the board region.
    if (boardRegion === glift.enums.boardRegions.AUTO) {
      boardRegion = glift.bridge.getQuadCropFromMovetree(mt);
    }
    var cropping = glift.displays.cropbox.getFromRegion(
        boardRegion, mt.getIntersections());

    // Find the starting move number before applying the next move path.
    if (startingMoveNum === null) {
      startingMoveNum = glift.flattener._findStartingMoveNum(mt, nmtp);
    }

    // The move number of the first mainline move in the parent-chain.
    var mainlineMoveNum = mt.getMainlineNode().getNodeNum();

    // Like the above, except in stone format (Black 10). null if at the root
    // (or due to weirdness like placements).
    var mainlineMove = mt.getMainlineNode().properties().getMove();

    // Initial move number -- used to calculate the ending move number.
    var initNodeNumber = mt.node().getNodeNum();

    // Map of ptString to move.
    var applied = glift.rules.treepath.applyNextMoves(mt, goban, nmtp);
    // Map of ptString to stone obj.
    var stoneMap = glift.flattener._stoneMap(goban, applied.stones);

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

    // Get the marks at the current position
    var mksOut = glift.flattener._markMap(mt);
    var labels = mksOut.labels; // map of ptstr to label str
    var marks = mksOut.marks; // map of ptstr to symbol


    // Optionally update the labels with labels used to indicate variations.
    var sv = glift.enums.showVariations
    if (showVars === sv.ALWAYS || (
        showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
      glift.flattener._updateLabelsWithVariations(mt, marks, labels);
    }

    // Calculate the collision stones and update the marks / labels maps if
    // necessary.
    var collisions = glift.flattener._createStoneLabels(
        applied.stones, marks, labels, startingMoveNum);

    // Finally! Generate the intersections double-array.
    var board = glift.flattener.board.create(cropping, stoneMap, marks, labels);

    var comment = mt.properties().getComment() || '';
    return new glift.flattener.Flattened(
        board, collisions, comment, boardRegion, cropping, mt.onMainline(),
        startingMoveNum, endingMoveNum, mainlineMoveNum, mainlineMove,
        stoneMap);
  },

  /**
   * Note: This contains ALL stones for a given position.
   *
   * Get map from pt string to stone {point: <point>, color: <color>}.
   * goban: a glift.rules.goban instance.
   * nextStones: array of stone objects -- {point: <pt>, color: <color>}
   *    that are a result of applying a next-moves-treepath.
   */
  _stoneMap: function(goban, nextStones) {
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
  },

  /**
   * Get the relevant marks.  Returns an object containing two fields: marks,
   * which is a map from ptString to Symbol ID. and labels, which is a map
   * from ptString to text label.
   *
   * If there are two marks on the same intersection specified, the behavior is
   * undefined.  Either mark might succeed in being placed.
   *
   * Example return value:
   * {
   *  marks: {
   *    "12.5": 13
   *    "12.3": 23
   *  },
   *  labels: {
   *    "12,3": "A"
   *    "12,4": "B"
   *  }
   * }
   */
  _markMap: function(movetree) {
    var out = { marks: {}, labels: {} };
    var symbols = glift.flattener.symbols;
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
          if (prop === glift.rules.allProperties.LB) {
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
  },

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
   */
  _findStartingMoveNum: function(mt, nextMovesPath) {
    mt = mt.newTreeRef();
    if (mt.onMainline()) {
      if (nextMovesPath.length > 0 && nextMovesPath[0] > 0) {
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
  },

  /**
   * Create or apply labels to identify collisions that occurred during apply
   *
   * stones: stones
   * marks: map from ptstring to Mark symbol int.
   *    see -- glift.bridg.flattener.symbols.
   * labels: map from ptstring to label string.
   * startingMoveNum: The number at which to start creating labels
   *
   * returns: an array of collision objects:
   *
   *  {
   *    color: <color of the move to be played>,
   *    mvnum: <move number>,
   *    label: <label>
   *  }
   *
   * This data is meant to be used like the following:
   *    '<color> <mvnum> at <label>'
   * as in this example:
   *    'Black 13 at 2'
   *
   * Sadly, this has has the side effect of altering the marks / labels maps.
   */
  // TODO(kashomon): Guard this with a autoLabelMoves flag.
  _createStoneLabels: function(stones, marks, labels, startingMoveNum) {
    if (!stones || stones.length === 0) {
      return []; // Don't perform relabeling if no stones are found.
    }
    // Collision labels, for when stone.collision = null.
    var extraLabs = 'abcdefghijklmnopqrstuvwxyz';
    var labsIdx = 0; // index into extra labels string above.
    var symb = glift.flattener.symbols;
    // TODO(kashomon): Make the collisions first class.
    var collisions = []; // {color: <color>, mvnum: <number>, label: <lbl>}

    // Remove any number labels currently existing in the marks map.  This
    // method also numbers stones.
    var digitRegex = /[0-9]/;
    for (var ptstr in labels) {
      if (digitRegex.test(labels[ptstr])) {
        delete labels[ptstr];
        delete marks[ptstr];
      }
    }

    // Create labels for each stone in the 'next-stones'. Note -- we only add
    // labels in the case when there's a next moves path.
    for (var i = 0; i < stones.length; i++) {
      var stone = stones[i];
      var ptStr = stone.point.toString();
      var nextMoveNum = i + startingMoveNum;
      if (nextMoveNum % 100 !== 0) {
        // We don't truncate the 100 moves, e.g., 100, 200, etc.,
        // but otherwise, 3 digit labels are awkward.
        nextMoveNum = nextMoveNum % 100;
      }

      // This is a collision stone. Perform collision labeling.
      if (stone.hasOwnProperty('collision')) {
        var col = {
          color: stone.color,
          mvnum: (nextMoveNum) + '',
          label: undefined
        };
        if (labels[ptStr]) { // First see if there are any available labels.
          col.label = labels[ptStr];
        } else if (glift.util.typeOf(stone.collision) === 'number') {
          var collisionNum = stone.collision + startingMoveNum;
          if (collisionNum % 100 !== 0) {
            collisionNum = collisionNum % 100;
          }
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
  },

  /**
   * Update the labels with variations numbers. This is an optional step and
   * usually isn't done for diagrams-for-print.
   */
  _updateLabelsWithVariations: function(mt, marks, labels) {
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
  }
};
glift.flattener.board = {
  /**
   * Constructs a board object: a 2D array of intersections.
   *
   * cropping: A cropping object, which says how to crop the board.
   * stoneMap: map from pt-string to stone {point: <pt>, color: <color>}
   * markMap: map from pt-string to mark symbol (flattener.symbols)
   * labelMap: map from pt-string to label string
   */
  create: function(cropping, stoneMap, markMap, labelMap) {
    var point = glift.util.point;
    var board = [];
    var cbox = cropping.cbox();
    for (var y = cbox.top(); y <= cbox.bottom(); y++) {
      var row = [];
      for (var x = cbox.left(); x <= cbox.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var stoneColor = stone ? stone.color : undefined;
        var mark = markMap[ptStr];
        var label = labelMap[ptStr]
        row.push(glift.flattener.intersection.create(
            pt, stoneColor, mark, label, cropping.maxBoardSize()));
      }
      board.push(row);
    }
    return new glift.flattener._Board(board, cbox, cropping.maxBoardSize());
  }
};

/**
 * Board object.  Meant to be created with the static constuctor method 'create'.
 */
glift.flattener._Board = function(boardArray, cbox, maxBoardSize) {
  /**
   * 2D Array of intersections. Generally, this is an array of intersections,
   * but could be backed by a different underlying objects based on a
   * transformation.
   */
  this._boardArray = boardArray;

  /** Bounding box for the crop box. */
  this._cbox = cbox;

  /** Maximum board size.  Generally 9, 13, or 19. */
  this._maxBoardSize = maxBoardSize;
};

glift.flattener._Board.prototype = {
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant
   * intersection.  Note, this uses the board indexing as opposed to the indexing
   * in the array.
   */
  getIntBoardPt: function(ptOrX, optionalY) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(optionalY) === 'number') {
      var pt = glift.util.point(ptOrX, optionalY);
    } else {
      var pt = ptOrX;
    }
    return this.getInt(this.boardPtToPt(pt));
  },

  /**
   * Get an intersection from a the intersection table. Uses the absolute array
   * positioning. Returns undefined if the pt doesn't exist on the board.
   */
  getInt: function(ptOrX, optionalY) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(optionalY) === 'number') {
      var pt = glift.util.point(ptOrX, optionalY);
    } else {
      var pt = ptOrX;
    }
    var row = this._boardArray[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  ptToBoardPt: function(pt) {
    return pt.translate(this._cbox.left(), this._cbox.top());
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  boardPtToPt: function(pt) {
    return pt.translate(-this._cbox.left(), -this._cbox.top());
  },

  /** Returns the board array. */
  boardArray: function() {
    return this._boardArray;
  },

  /** Returns the size of the board. Usually 9, 13 or 19. */
  maxBoardSize: function() {
    return this._maxBoardSize;
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
   */
  transform: function(fn) {
    var outArray = [];
    for (var y = 0; y < this._boardArray.length; y++) {
      var row = [];
      // Assumes a rectangular double array but this should always be the case.
      for (var x = 0; x < this._boardArray[0].length; x++) {
        var intersect = this._boardArray[y][x];
        row.push(fn(intersect, x, y));
      }
      outArray.push(row);
    }
    return new glift.flattener._Board(outArray, this._cbox, this._maxBoardSize);
  }
};
/**
 * Data used to populate either a display or diagram.
 */
glift.flattener.Flattened = function(
    board, collisions, comment, boardRegion, cropping, isOnMainPath,
    startMoveNum, endMoveNum, mainlineMoveNum, mainlineMove, stoneMap) {
  /**
   * Board wrapper. Essentially a double array of intersection objects.
   */
  this._board = board;

  /**
   * Array of collisions objects.  In other words, we record stones that
   * couldn't be placed on the board.
   *
   * Each object in the collisions array looks like:
   * {color: <color>, mvnum: <number>, label: <label>}
   */
  this._collisions = collisions;

  /** Comment string. */
  this._comment = comment;

  /** The board region this flattened representation is meant to display. */
  this._boardRegion = boardRegion;

  /** The cropping object. Probably shouldn't be accessed directly. */
  this._cropping = cropping;

  /** Whether or not the position is on the 'top' (zeroth) variation. */
  this._isOnMainPath = isOnMainPath;

  /**
   * The starting and ending move numbers. These are typically used for
   * labeling diagrams.
   */
  this._startMoveNum = startMoveNum;
  this._endMoveNum = endMoveNum;
  this._mainlineMoveNum = mainlineMoveNum;

  /**
   * The move -- {color: <color>, point: <pt> at the first mainline move in the
   * parent tree. Can be null if no move exists at the node.
   */
  this._mainlineMove = mainlineMove;

  /**
   * All the stones!
   *
   * A map from the point string to a stone object:
   *    {point: <point>, color: <color>}
   */
  this._stoneMap = stoneMap;
};

glift.flattener.Flattened.prototype = {
  /** Returns the board wrapper. */
  board: function() { return this._board; },

  /** Returns the comment. */
  comment: function() { return this._comment; },

  /** Returns the collisions. */
  collisions: function() { return this._collisions; },

  /**
   * Whether or not this position is on the main line or path variation.  For
   * game review diagrams, it's usually nice to distinguish between diagrams for
   * the real game and diagrams for exploratory variations.
   */
  isOnMainPath: function() { return this._isOnMainPath; },

  /** Returns the starting move number. */
  startingMoveNum: function() { return this._startMoveNum; },

  /** Returns the ending move number. */
  endingMoveNum: function() { return this._endMoveNum; },

  /**
   * Returns the first mainline move number in the parent-chain. This will be
   * equal to the startingMoveNum if isOnMainPath = true.
   */
  mainlineMoveNum: function() { return this._mainlineMoveNum; },

  /**
   * Returns the first mainline move in the parent-chain. Can be null if no move
   * exists and has the form {color: <color>, pt: <pt>} otherwise.
   */
  mainlineMove: function() { return this._mainlineMove; },

  /** Returns the stone map. */
  stoneMap: function() { return this._stoneMap; }
};
glift.flattener.intersection = {

  /**
   * Creates an intersection obj.
   *
   * pt: A glift point. 0-indexed and bounded by the number of intersections.
   *    Thus, typically between 0 and 18. Note, the zero for this point is the
   *    top-left rather than the more traditional bottom-right, as it is for
   *    kifus.
   * stoneColor: A stone state. Member of glift.enums.states.
   * mark: Mark element from glift.flattener.symbols.
   * textLabel: text label for the stone.
   * maxInts: The maximum number of intersections on the board.
   */
  create: function(pt, stoneColor, mark, textLabel, maxInts) {
    var sym = glift.flattener.symbols;
    var intsect = new glift.flattener._Intersection(pt);

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
    } else if (this._isStarpoint(pt, maxInts)) {
      baseSymb = sym.CENTER_STARPOINT;
    } else {
      baseSymb = sym.CENTER;
    }
    intsect.base(baseSymb);

    if (stoneColor === glift.enums.states.BLACK) {
      intsect.stone(sym.BSTONE);
    } else if (stoneColor === glift.enums.states.WHITE) {
      intsect.stone(sym.WSTONE);
    }

    if (mark !== undefined) {
      intsect.mark(mark);
    }

    if (textLabel !== undefined) {
      intsect.textLabel(textLabel);
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
   */
  _isStarpoint: function(pt, maxInts) {
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
 */
glift.flattener._Intersection = function(pt) {
  var EMPTY = glift.flattener.symbols.EMPTY;
  this._pt = pt;
  this._baseLayer = EMPTY;
  this._stoneLayer = EMPTY;
  this._markLayer = EMPTY;

  // Optional text label. Should only be set when the mark layer symbol is some
  // sort of text-symbol (e.g., TEXTLABEL, NEXTVARIATION)
  this._textLabel = null;
};

glift.flattener._Intersection.prototype = {
  _validateSymbol: function(s, layer) {
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

  /** Sets or gets the base layer. */
  base: function(s) {
    if (s !== undefined) {
      this._baseLayer = this._validateSymbol(s, 'base');
      return this;
    } else {
      return this._baseLayer;
    }
  },

  /** Sets or gets the stone layer. */
  stone: function(s) {
    if (s !== undefined) {
      this._stoneLayer = this._validateSymbol(s, 'stone');
      return this;
    } else {
      return this._stoneLayer;
    }
  },

  /** Sets or gets the mark layer. */
  mark: function(s) {
    if (s !== undefined) {
      this._markLayer = this._validateSymbol(s, 'mark');
      return this;
    } else {
      return this._markLayer;
    }
  },

  /** Sets or gets the text label. */
  textLabel: function(t) {
    if (t != null) {
      this._textLabel = t + '';
      return this;
    } else {
      return this._textLabel;
    }
  },

  /** Clear the text label */
  clearTextLabel: function() {
    this._textLabel = null;
    return this;
  }
};
/**
 * Symbolic representation of a Go Board display.
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
 * Convert a symbol number to a symbol string.
 */
glift.flattener.symbolStr = function(num) {
  if (glift.flattener._reverseSymbol === undefined) {
    // Create and store a reverse mapping.
    var reverse = {};
    var symb = glift.flattener.symbols;
    for (var key in glift.flattener.symbols) {
      reverse[symb[key]] = key;
    }
    glift.flattener._reverseSymbol = reverse;
  }
  return glift.flattener._reverseSymbol[num];
};
/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager and draw the widget
   */
  create: function(options) {
    glift.util.perfInit();
    var manager = glift.widgets.createNoDraw(options);

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
   */
  createNoDraw: function(inOptions) {
    var options = glift.widgets.options.setOptionDefaults(inOptions);
    var actions = {};
    actions.iconActions = options.iconActions;
    actions.stoneActions = options.stoneActions;

    return new glift.widgets.WidgetManager(
        options.divId,
        options.sgfCollection,
        options.sgfMapping,
        options.initialIndex,
        options.allowWrapAround,
        options.loadCollectionInBackground,
        options.sgfDefaults,
        options.display,
        actions,
        options.metadata);
  }
};

/**
 * A convenient alias.  This is the public method that most users of Glift will
 * call.
 *
 * @api(1.0)
 */
glift.create = glift.widgets.create;
/**
 * The base web UI widget.
 */
glift.widgets.BaseWidget = function(
    divId, sgfOptions, displayOptions, actions, manager) {
  this.wrapperDivId = divId; // We split the wrapper div.
  this.type = sgfOptions.type;
  this.sgfOptions = glift.util.simpleClone(sgfOptions);
  this.displayOptions = glift.util.simpleClone(displayOptions);
  this.actions = actions; // deeply nested -- not worth cloning.
  this.manager = manager;

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
    this.initialMoveNumber = this.controller.movetree.node().getNodeNum();
    this.initialPlayerColor = this.controller.getCurrentPlayer();
    glift.util.majorPerfLog('Created controller');

    this.displayOptions.intersections = this.controller.getIntersections();

    this.displayOptions.boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getQuadCropFromMovetree(this.controller.movetree)
        : this.sgfOptions.boardRegion;

    this.displayOptions.rotation = this.sgfOptions.rotation;
    glift.util.majorPerfLog('Calculated board regions');

    // This should be the only time we get the base width and height, until the
    // entire widget is re-drawn.
    var parentDivBbox = glift.displays.bbox.fromDiv(this.wrapperDivId);
    if (parentDivBbox.width() === 0 || parentDivBbox.height() === 0) {
      throw new Error('Div has has invalid dimensions. Bounding box had ' +
          'width: ' + parentDivBbox.width() +
          ', height: ' + parentDivBbox.height());
    }

    var positioning = glift.displays.position.positioner(
        parentDivBbox,
        this.displayOptions.boardRegion,
        this.displayOptions.intersections,
        this._getUiComponents(this.sgfOptions),
        this.displayOptions.oneColumnSplits,
        this.displayOptions.twoColumnSplits).calcWidgetPositioning();

    var divIds = this._createDivsForPositioning(positioning, this.wrapperDivId);
    glift.util.majorPerfLog('Created divs');

    var theme = glift.themes.get(this.displayOptions.theme);
    if (this.displayOptions.goBoardBackground) {
      glift.themes.setGoBoardBackground(
          theme, this.displayOptions.goBoardBackground);
    }

    this.display = glift.displays.create(
        divIds.BOARD,
        positioning.getBbox(glift.enums.boardComponents.BOARD),
        theme,
        this.displayOptions);
    glift.util.majorPerfLog('Finish creating display');

    if (divIds.COMMENT_BOX) {
      this.commentBox = glift.displays.commentbox.create(
          divIds.COMMENT_BOX,
          positioning.getBbox(glift.enums.boardComponents.COMMENT_BOX),
          theme,
          this.displayOptions.useMarkdown);
    }
    glift.util.majorPerfLog('CommentBox');

    if (divIds.ICONBAR) {
      this.iconBar = glift.displays.icons.bar({
          divId: divIds.ICONBAR,
          positioning: positioning.getBbox(glift.enums.boardComponents.ICONBAR),
          icons: this.sgfOptions.icons,
          parentBbox: parentDivBbox,
          theme: theme,
          allDivIds: divIds,
          allPositioning: positioning
      }).draw();
    }
    glift.util.majorPerfLog('IconBar');
    divIds.ICONBAR && this.iconBar.initIconActions(
        this, this.actions.iconActions);

    if (divIds.STATUS_BAR) {
      // TODO(kashomon): Move this logic into a helper.
      var statusBarIcons = glift.util.simpleClone(this.sgfOptions.statusBarIcons);
      if (this.manager.fullscreenDivId) {
        glift.array.replace(statusBarIcons, 'fullscreen', 'unfullscreen');
      }
      if (this.manager.sgfCollection.length > 1) {
        statusBarIcons.splice(0, 0, 'widget-page');
      }
      var statusBarIconBar = glift.displays.icons.bar({
          divId: divIds.STATUS_BAR,
          positioning: positioning.getBbox(glift.enums.boardComponents.STATUS_BAR),
          icons: statusBarIcons,
          parentBbox: parentDivBbox,
          theme: theme,
          allDivIds: divIds,
          allPositioning: positioning
      });
      this.statusBar = glift.displays.statusbar.create({
          iconBarPrototype: statusBarIconBar,
          theme: theme,
          allPositioning: positioning,
          widget: this
      }).draw();
    }
    glift.util.majorPerfLog('StatusBar');
    divIds.STATUS_BAR && this.statusBar.iconBar.initIconActions(
        this, this.actions.iconActions);

    glift.util.majorPerfLog('Before stone event creation');
    this._initStoneActions(this.actions.stoneActions);
    this._initKeyHandlers();
    glift.util.majorPerfLog('After stone event creation');

    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  /** Gets the UI icons to use */
  _getUiComponents: function(sgfOptions) {
    var base = sgfOptions.uiComponents;
    base = base.slice(0, base.length); // make a shallow copy.
    var rmItem = function(arr, key) {
      var idx = arr.indexOf(key);
      if (idx > -1) {
        arr.shift(idx);
      }
    }
    sgfOptions.disableStatusBar && rmItem(base, 'STATUS_BAR');
    sgfOptions.disableBoard && rmItem(base, 'BOARD');
    sgfOptions.disableCommentBox && rmItem(base, 'COMMENT_BOX');
    sgfOptions.disableIonBar && rmItem(base, 'ICONBAR');
    return base;
  },

  /**
   * Create divs from positioning (WidgetBoxes) and the wrapper div id.
   */
  _createDivsForPositioning: function(positioning, wrapperDivId) {
    // Map from component to ID.
    var out = {};
    var createDiv = function(bbox) {
      var newId = wrapperDivId + '_internal_div_' + glift.util.idGenerator.next();
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
      glift.dom.elem(wrapperDivId).append(newDiv);
      glift.dom.ux.setNotSelectable(newId);
      return newId;
    };
    positioning.map(function(key, bbox) {
      out[key] = createDiv(bbox);
    });
    return out;
  },

  /** Initialize the stone actions. */
  _initStoneActions: function(baseActions) {
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
        var actionName = 'touchend';
      }
      this.display.intersections().setEvent(
          actionName, wrapAction(actions.click));
    }
  },

  /** Assign Key actions to some other action. */
  _initKeyHandlers: function() {
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

  /** Initialize properties based on problem type. */
  _initProblemData: function() {
    if (this.sgfOptions.widgetType ===
        glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM) {
      var correctNext = glift.rules.problems.correctNextMoves(
          this.controller.movetree, this.sgfOptions.problemConditions);
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
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData) {
      this.setCommentBox(boardData.comment);
      this.statusBar &&
          this.statusBar.setMoveNumber(this.controller.currentMoveNumber())
      glift.bridge.setDisplayState(
          boardData,
          this.display,
          this.sgfOptions.showVariations,
          this.sgfOptions.markLastMove);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
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
      this.applyBoardData(this.controller.getEntireBoardState());
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
    if (this.keyHandlerFunc !== undefined) {
      document.body.keydown = null;
    }
    this.correctness = undefined;
    this.keyHandlerFunc = undefined;
    this.display = undefined;
  }
};
/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 *
 * divId: the element id of the div without the selector hash (#)
 * sgfCollection: array of sgf objects or a string URL. At creation time of the
 *    manager, The param sgfCollection may either be an array or a string
 *    representing a URL.  If the sgfCollection is a string, then the JSON is
 *    requsted at draw-time and passed to this.sgfCollection.
 * sgfCache: An initial setup for the SGF cache.
 * sgfColIndex: numbered index into the sgfCollection.
 * allowWrapAround: true or false.  Whether to allow wrap around in the SGF
 *    manager.
 * loadColInBack: true or false. Whether or to load the SGFs in the background.
 * sgfDefaults: filled-in sgf default options.  See ./options/base_options.js
 * displayOptions: filled-in display options. See ./options/base_options.js
 * actions: combination of stone actions and icon actions.
 * metadata: metadata about the this instance of glift.
 */
glift.widgets.WidgetManager = function(divId, sgfCollection, sgfMapping,
    sgfColIndex, allowWrapAround, loadColInBack, sgfDefaults, displayOptions,
    actions, metadata) {
  // Globally unique ID, at least across all glift instances in the current
  // page. In theory, the divId should be globally unique, but might as well be
  // absolutely sure.
  this.id = divId + '-glift-' + glift.util.idGenerator.next();

  // Register the instance. Maybe should be its own method.
  glift.global.instanceRegistry[this.id] = this;

  // Set as active, if the active instance hasn't already been set.
  !glift.global.activeInstanceId && this.setActive();

  // The original div id.
  this.divId = divId;

  // The fullscreen div id. Only set via the fullscreen button. Necessary to
  // have for problem collections.
  this.fullscreenDivId = null;
  // The fullscreen div will always be at the top. So we jump up to the top
  // during fullscreen and jump back afterwards.
  this.prevScrollTop = null;
  // If we set the window resize (done, for ex. in the case of full-screening),
  // we track the window-resizing function.
  this.oldWindowResize = null;

  // Note: At creation time of the manager, The param sgfCollection may either
  // be an array or a string representing a URL.  If the sgfCollection is a
  // string, then the JSON is requsted at draw-time and passed to
  // this.sgfCollection
  this.sgfCollection = [];

  // Cache of SGFs.  Useful for reducing the number AJAX calls.
  // Map from SGF name to String contents.
  this.sgfCache = sgfMapping || {};

  // URL for getting the entire SGF collection.
  this.sgfCollectionUrl = null;

  // Suppert either explicit arrays or URLs for fetching JSON.
  if (glift.util.typeOf(sgfCollection) === 'string') {
    this.sgfCollectionUrl = sgfCollection;
  } else {
    this.sgfCollection = sgfCollection;
  }

  this.sgfColIndex = sgfColIndex;
  this.allowWrapAround = allowWrapAround
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;
  this.actions = actions;

  // True or false. Whether to load SGFs in the background.
  this.loadColInBack = loadColInBack;
  this.initBackgroundLoading = false;

  // Defined on draw
  this.currentWidget = undefined;

  /**
   * Global metadata for this manager instance.
   */
  this.metadata = metadata || undefined;
};

glift.widgets.WidgetManager.prototype = {
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
        this.sgfCollection = JSON.parse(data);
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

  /** Gets the current SGF Object from the SGF collection. */
  getCurrentSgfObj: function() { return this.getSgfObj(this.sgfColIndex); },

  /** Modifies the SgfOptions by resetting the icons settings. */
  _resetIcons: function(processedObj) {
    if (this.sgfCollection.length > 1) {
      if (this.allowWrapAround) {
        processedObj.icons.push(this.displayOptions.nextSgfIcon);
        processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
      } else {
        if (this.sgfColIndex === 0) {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
        } else if (this.sgfColIndex === this.sgfCollection.length - 1) {
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        } else {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        }
      }
    }
    return processedObj;
  },

  /**
   * Get the current SGF Object from the sgfCollection. Note: If the item in the
   * array is a string, then we try to figure out whether we're looking at an
   * SGF or a URL and then we manufacture a simple sgf object.
   */
  // TODO(kashomon): Move to options
  getSgfObj: function(index) {
    if (index < 0 || index > this.sgfCollection.length) {
      throw new Error("Index [" + index +  " ] out of bounds."
          + " List size was " + this.sgfCollection.length);
    }
    var curSgfObj = this.sgfCollection[index];
    if (glift.util.typeOf(curSgfObj) === 'string') {
      var out = {};
      if (/^\s*\(;/.test(curSgfObj)) {
        // This is a standard SGF String.
        out.sgfString = curSgfObj;
      } else {
        // assume a URL.
        out.url = curSgfObj
      }
      curSgfObj = out;
    }
    var proc = glift.widgets.options.setSgfOptions(curSgfObj, this.sgfDefaults);
    return this._resetIcons(proc);
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

  /** Get the currentDivId */
  getDivId: function() {
    if (this.fullscreenDivId) {
      return this.fullscreenDivId;
    } else {
      return this.divId;
    }
  },

  /** Create a Sgf Widget. */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(
        this.getDivId(), sgfObj, this.displayOptions, this.actions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget && this.currentWidget.destroy();
    sgfObj = glift.widgets.options.setSgfOptions(sgfObj, this.sgfDefaults);
    this.temporaryWidget = this.createWidget(sgfObj).draw();
  },

  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /** Internal implementation of nextSgf/previous sgf. */
  _nextSgfInternal: function(indexChange) {
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
  nextSgf: function() { this._nextSgfInternal(1); },

  /** Get the next SGF.  Requires that the list be non-empty. */
  prevSgf: function() { this._nextSgfInternal(-1); },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
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

  /** Whether or not the widget is currently fullscreened. */
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
glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on a set of options.
   *
   * options: user specified options object.
   *
   * returns: processed options.
   */
  setOptionDefaults: function(options) {
    var optLib = glift.widgets.options;
    optLib._validateOptions(options);
    var options = glift.util.simpleClone(options);
    var template = glift.util.simpleClone(optLib.baseOptions);

    var topLevelOptions = [
        'divId',
        'sgfCollection',
        'sgfMapping',
        'initialIndex',
        'allowWrapAround',
        'loadCollectionInBackground',
        'metadata'];
    for (var i = 0; i < topLevelOptions.length; i++) {
      if (!options.hasOwnProperty(topLevelOptions[i])) {
        options[topLevelOptions[i]] = template[topLevelOptions[i]];
      }
    }

    // One level deep objects. We don't want to recursively copy keys over --
    // Some options are specified as objects or arrays which need to be
    // overwritten in full if they are specified.
    var templateKeys = [
        'sgfDefaults',
        'display',
        'iconActions',
        'stoneActions'];
    for (var i = 0; i < templateKeys.length; i++) {
      optLib._setDefaults(options, template, templateKeys[i]);
    }

    if (options.sgf) {
      options.sgfCollection = [];
      options.sgfCollection.push(options.sgf);
      options.sgf = undefined;
    }
    if (!options.sgf && !options.sgfCollection) {
      options.sgfCollection = [{}];
    }
    return options;
  },

  /**
   * Do some basic validity checking on the options.
   *
   * options: user specified options.
   */
  _validateOptions: function(options) {
    if (options.sgf && options.sgfCollection) {
      throw new Error('Illegal options configuration: you cannot define both ' +
          'sgf and sgfCollection')
    }
  },

  /**
   * Do a very shallow copy of template keys to the options
   *
   * options: user specified options (now copied)
   * template: base options template (does this need te be passed in?)
   * dataKey: string key to retrieve a subset of the template
   *
   * return: options, with the values filled in from the template.
   */
  _setDefaults: function(options, template, dataKey) {
    var workingObj  = options[dataKey] || {};
    var dataTemplate = template[dataKey];
    for (var optionKey in dataTemplate) {
      if (!workingObj.hasOwnProperty(optionKey)) {
        workingObj[optionKey] = dataTemplate[optionKey];
      }
    }
    options[dataKey] = workingObj;
    return options;
  },

  /**
   * Set some defaults in the sgf object.  This does two passes of 'option'
   * settings.  First we apply the sgfOptions. Then, we apply the
   * widgetOverrides to any options not already filled in.
   *
   * sgf: An object {...} with some settings specified by sgfDefaults.
   * sgfDefaults: Processed SGF defaults.
   *
   * returns: processed (and cloned) sgf object.
   */
  setSgfOptions: function(sgf, sgfDefaults) {
    if (glift.util.typeOf(sgf) !== 'object') {
      throw new Error('SGF must be of type object, was: '
          + glift.util.typeOf(sgf) + ', for ' + sgf);
    }
    var sgf = glift.util.simpleClone(sgf);
    var widgetType = sgf.widgetType || sgfDefaults.widgetType;
    var widgetOverrides = glift.widgets.options[widgetType];
    for (var key in widgetOverrides) {
      if (!sgf[key]) {
        sgf[key] = glift.util.simpleClone(widgetOverrides[key]);
      }
    }

    for (var key in sgfDefaults) {
      if (!sgf[key] && sgfDefaults[key] !== undefined) {
        sgf[key] = sgfDefaults[key];
      }
    }
    return sgf;
  }
};
/**
 * Option defaults.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options hoving to do with managing widgets.  These
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
 *  - @api(1.X) Indicates an option supported for the lifetime of the 1.X
 *    release.
 *  - @api(beta) Indicates an option currently slated to become a 1.X option.
 *  - @api(experimental) Indicates an option in testing.
 */
glift.widgets.options.baseOptions = {
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
   * @api(1.0)
   */
  sgf: undefined,

  /**
   * The defaults or SGF objects. These are equivalent to the options used for
   * each SGF.  In other words, you can set these options either in each
   * individual SGF, or you may set these options in the SGF defaults. Some
   * options are specified here, but should only be specified in the individual
   * SGF (sgfString, url).
   *
   * @api(1.0)
   */
  sgfDefaults: {
    /**
     * A literal SGF String.  Should not be specified in SGF defaults
     * @api(1.0)
     */
    sgfString: undefined,

    /**
     * URL (usually relative) to an SGF. Once loaded, the resulting data is
     * cached to speed recall time.
     * @api(1.0)
     */
    url: undefined,

    /**
     * A name to by which an SGF String can be referred to later.  This is only
     * necessary for SGF Strings -- URLs are their own aliases.
     *
     * Note: If this feature is used, the SGF should be supplied in a SGF Mapping.
     * @api(experimental)
     */
    alias: undefined,

    /**
     * Parsing type.  Defaults to SGF. Supports:
     *  SGF
     *  TYGEM
     *  PANDANET
     * @api(beta)
     */
    parseType: glift.parse.parseType.SGF,

    /**
     * The default widget type. Specifies what type of widget to create.
     * @api(1.0)
     */
    widgetType: glift.enums.widgetTypes.GAME_VIEWER,

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
     * @api(1.0)
     */
    initialPosition: '',

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
     */
    nextMovesPath: '',

    /**
     * The board region to display.  The boardRegion will be 'guessed' if it's set
     * to 'AUTO'.
     * @api(1.0)
     */
    boardRegion: glift.enums.boardRegions.AUTO,

    /**
     * What rotation to apply to -just- the display of the stones. Any of:
     * NO_ROTATION, CLOCKWISE_90, CLOCKWISE_180, CLOCKWISE_270, or undefined;
     * @api(beta)
     */
    rotation: glift.enums.rotations.NO_ROTATION,

    /**
     * Callback to perform once a problem is considered correct / incorrect.
     * @api(beta)
     */
    problemCallback: function() {},

    /**
     * Conditions for determing whether a branch of a movetree is correct.  A
     * map from property-keys, to an array of substring values.  If the array is
     * empty, then we only test to see if the property exists at the current
     * positien.
     *
     * The default tests whether there is a 'GB' property or a 'C' (comment)
     * property containing 'Correct' or 'is correct'.
     * @api(1.0)
     */
    problemConditions: {
      GB: [],
      C: ['Correct', 'is correct', 'is the correct']
    },

    /**
     * Specifies what action to perform based on a particular keystroke.  In
     * otherwords, a mapping from key-enum to action path.
     * See glift.keyMappings
     * @api(beta)
     */
    keyMappings: {
      ARROW_LEFT: 'iconActions.chevron-left.click',
      ARROW_RIGHT: 'iconActions.chevron-right.click'
    },

    /**
     * The UI Components to use for this display.
     * @api(1.0)
     */
    uiComponents: [
      'BOARD',
      'COMMENT_BOX',
      'STATUS_BAR',
      'ICONBAR'
    ],

    /**
     * Convenience variables for disabling ui components.
     * @api(experimental)
     */
    disableStatusBar: false,
    disableBoard: false,
    disableCommentBox: false,
    disableIconBar: false,

    /**
     * Icons to use in the status bar.
     * @api(1.0)
     */
    // TODO(kashomon): Enable settings when ready (?? what does this mean).
    statusBarIcons: undefined,
    // [
      // 'game-info',
      // 'move-indicator',
      // 'fullscreen'
      // 'settings-wrench'
    // ],

    /**
     * Metadata for this SGF.  Like the global metadata, this option is not
     * meant to be used directly by Glift but by other programs utilizing Glift
     * and so the metadata has no expected structure.
     *
     * @api(experimental)
     */
    metadata: undefined,

    /**
     * For all correct, there are multiple correct answers that a user must get.
     * This allows us to specify (in ms) how long the user has until the problem
     * is automatically reset.
     *
     * Should be overridden by the widget options.
     */
    correctVariationsResetTime: undefined,

    /**
     * You can, if you wish, override the total number of correct variations
     * that a user must get correct. Currently only applies to
     * CORRECT_VARIATIONS_PROBLEM.
     */
    totalCorrectVariationsOverride: undefined,

    //-------------------------------------------------------------------------
    // These options must always be overriden by the widget type overrides.
    //
    // This could easily be changed, but right now this exists as a reminder to
    // the widget creator that they should override these options. In practice,
    // it seems that these particular options need to be set on a per-widget
    // basis anyway.
    //-------------------------------------------------------------------------

    /**
     * Whether or not to show variations.  See glift.enums.showVariations
     * Values: NEVER, ALWAYS, MORE_THAN_ONE
     */
    showVariations: 'MORE_THAN_ONE',

    /**
     * Whether or not to mark the last move played.  Either true or false, but
     * defaults to true.
     */
    markLastMove: true,

    /**
     * The function that creates the controller at widget-creation time.
     * See glift.controllers for more detail
     * @api(1.0)
     */
    controllerFunc: undefined,

    /**
     * The names of the icons to use in the icon-bar.  This is a list of
     * icon-names, which must be spceified in glift.displays.icons.svg.
     * @api(1.0)
     */
    icons: undefined,

    /**
     * The action that is performed when a sure clicks on an intersection.
     * @api(1.0)
     */
    stoneClick: undefined,

    /**
     * Mouseover/mouseout override for stones.
     */
    stoneMouseover: undefined,
    stoneMouseout: undefined
  },

  //----------------------------------------------------------------------
  // These are really Widget Manager options.  Any update to here must be
  // accompanied with an update to options.getDisplayOptions.
  //----------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   * @api(1.0)
   */
  divId: 'glift_display',

  /**
   * The SGF collection represents a set of SGFs. Like the Sgf parameter, this
   * can take one of three values:
   * - undefined (if the SGF parameter is defined)
   * - An array of SGF objects.
   * - A URL (to load the collection asynchronously).  The received data must be
   *   a JSON array, containing a list of serialized SGF objects.
   *
   * Once an SGF Collection is loaded, Glift looks through each entry in the
   * collection.  If an SGF URL is found, the SGF is loaded in the background
   * and cached.
   * @api(1.0)
   */
  sgfCollection: undefined,

  /**
   * An experimental feature. Create an association between.  This defines the
   * basis of the manager SGF cache.
   *
   * Expects the structure:
   *  {
   *    [name/alias]: <sgf string>
   *  }
   *
   * @api(experimental)
   */
  sgfMapping: undefined,

  /**
   * Index into the above collection.  This is mostly useful for remembering
   * someone's position in the sgf collection.
   * @api(1.0)
   */
  initialIndex: 0,

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   * @api(experimental)
   */
  allowWrapAround: false,

  /**
   * Wether or not to load the the collection in the background via XHR requests.
   * @api(beta)
   */
  loadCollectionInBackground: true,

  /**
   * Global metadata for this set of options or SGF collection.  These is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   * @api(experimental)
   */
  metadata: undefined,

  /**
   * Miscellaneous options for display.
   * @api(1.0)
   */
  display: {
    /**
     * Specify a background image for the go board.  You can specify an absolute
     * or a relative path.  As you may expect, you cannot do cross domain
     * requests.
     *
     * Examples:
     *  'images/kaya.jpg'
     *  'http://www.mywebbie.com/images/kaya.jpg'
     *
     * @api(1.0)
     */
    goBoardBackground: '',

    /**
     * The name of the theme to be used for this instance. Other themes include:
     *  - DEPTH (stones with shadows)
     *  - MOODY (gray background, no stone outlines)
     *  - TRANSPARENT (board is transparent)
     *  - TEXTBOOK (Everything black and white)
     * @api(1.0)
     */
    theme: 'DEFAULT',

    /**
     * On the edges of the board, draw the board coordinates.
     * - On the left, use the numbers 1-19
     * - On the bottom, use A-T (all letters minus I)
     * @api(1.0)
     */
    drawBoardCoords: false,

    /**
     * Split percentages to use for a one-column widget format.
     */
    oneColumnSplits: {
      first: [
        { component: 'STATUS_BAR',   ratio: 0.06 },
        { component: 'BOARD',       ratio: 0.67 },
        { component: 'COMMENT_BOX', ratio: 0.18 },
        { component: 'ICONBAR',     ratio: 0.09 }
      ]
    },

    /**
     * Split percentages to use for a two-column widget format.
     */
    twoColumnSplits: {
      first: [
        { component: 'BOARD', ratio: 1 }
      ],
      second: [
        { component: 'STATUS_BAR',     ratio: 0.07 },
        { component: 'COMMENT_BOX',   ratio: 0.83 },
        { component: 'ICONBAR',       ratio: 0.10 }
      ]
    },

    /** Previous SGF icon */
    previousSgfIcon: 'chevron-left',

    /** Next SGF Icon */
    nextSgfIcon: 'chevron-right',

    /** For convenience: Disable zoom for mobile users. */
    disableZoomForMobile: false,

    /**
     * Whether or not to enable keyboard shortcuts. This currently binds
     * keypress events to document.body, so it's not unlikely this could
     * conflict with other applications' keybindings.
     */
    enableKeyboardShortcuts: true,

    /**
     * Use Markdown for the comment box.  This requires that marked.js be
     * installed in the global scope. (https://github.com/chjj/marked)
     * @api(experimental)
     */
    useMarkdown: false
  },

  /**
   * Actions for stones.  If the user specifies his own actions, then the
   * actions specified by the user will take precedence.
   * @api(1.0)
   */
  stoneActions: {
    /**
     * click is specified in sgfOptions as stoneClick.  The actions that must
     * happen on each click vary for each widget, so we can't make a general
     * click function here.
     */
    click: undefined,

    /** Add ghost-stone for cursor hovering. */
    mouseover: function(event, widget, pt) {
      var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[currentPlayer]);
      }
    },

    /** Ghost-stone removal for cursor hovering. */
    mouseout: function(event, widget, pt) {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display && widget.display.intersections()
            .setStoneColor(pt, 'EMPTY');
      }
    },

    // TODO(kashomon): It's not clear if we want this. Revisit later.
    touchend: function(event, widget, pt) {
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
      widget.sgfOptions.stoneClick(event, widget, pt);
    }
  },

  /**
   * The actions for the icons.  The keys in iconACtions
   */
  iconActions: {
    start: {
      click:  function(event, widget, icon, iconBar) {
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
  }
};
/**
 * Board Editor options.
 */
// The Board editor is so complex it may need its own directory
glift.widgets.options.BOARD_EDITOR = {
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
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, 'EMPTY');
      }
    }
    intersections.clearTempMarks();
  },

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

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.CORRECT_VARIATIONS_PROBLEM = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var callback = widget.sgfOptions.problemCallback;
    if (widget.correctness === undefined) {
      if (data.result === problemResults.CORRECT) {
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
            callback(problemResults.CORRECT);
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                { fill: '#000', stroke: '#000'});
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.getEntireBoardState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.iconBar.clearTempText('multiopen-boxonly');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'problem-explanation', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem,

  correctVariationsResetTime: 750, // In milliseconds.

  statusBarIcons: [
    'fullscreen'
  ]
};
/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.EXAMPLE = {
  stoneClick: function(event, widget, pt) {},

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.NEVER,

  controllerFunc: glift.controllers.gameViewer,

  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},

  statusBarIcons: [
    // 'game-info',
    'fullscreen'
  ]
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

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
      widget.applyBoardData(widget.controller.getNextBoardState())
    },
    /** Toggle the selected variation. */
    '[': function(widget) {
      widget.controller.moveDownVariations();
      widget.applyBoardData(widget.controller.getNextBoardState())
    }
  },

  icons: ['jump-left-arrow', 'jump-right-arrow', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ]
};
/**
 * Game Viewer options for when used as part of a widget
 */
glift.widgets.options.REDUCED_GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  icons: ['arrowleft', 'arrowright'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ]
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.STANDARD_PROBLEM = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var callback = widget.sgfOptions.problemCallback;
    if (data.result === problemResults.CORRECT) {
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
        widget.correctness = problemResults.CORRECT;
        callback(problemResults.CORRECT);
    } else if (data.result === problemResults.INCORRECT) {
      widget.iconBar.destroyTempIcons();
      widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
      widget.correctness = problemResults.INCORRECT;
      callback(problemResults.INCORRECT);
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
  icons: [
    'undo-problem-move',
    'problem-explanation',
    'multiopen-boxonly'
  ],

  controllerFunc: glift.controllers.staticProblem,

  statusBarIcons: [
    'fullscreen'
  ]
};
