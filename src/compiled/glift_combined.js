/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * --------------------------------------
 */
(function() {
var glift = window.glift || {};

glift.global = {
  /**
   * Semantic versioning is used to determine the version.
   * See: http://semver.org/
   *
   * Currently in beta.
   */
  version: '0.7.4',
  /**
   * Whether or not fast click is enabled, via Glift.
   */
  fastClickEnabled: false,
  /**
   * Enable fast click.
   */
  enableFastClick: function() {
    if (!glift.global.fastClickEnabled) {
      FastClick.attach(document.body);
      glift.global.fastClickEnabled = true;
    }
  },
  debugMode: false,
  // Options for performanceDebugLevel: none, fine, info
  performanceDebugLevel: 'none',
  // Map of performance timestamps.
  perf: {},
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  // The problem is that key presses have to be captured in a global scope (or
  // at least at the <body> level.  Unfortunate.
  // (not used yet).
  active: {}
};

window.glift = glift;
})();
glift.util = {
  logz: function(msg) {
    var modmsg = msg;
    if (glift.util.typeOf(msg) === "array" ||
        glift.util.typeOf(msg) === "object") {
      modmsg = JSON.stringify(msg);
    }
    console.log("" + modmsg);
    return glift.util.none; // default value to return.
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

  // Array utility functions
  // is_array is Taken from JavaScript: The Good Parts
  isArray: function (value) {
    return value && typeof value === 'object' && value.constructor === Array;
  },

  /**
   * Test whether two arrays are (shallowly) equal.  We only test references on
   * the elements of the array.
   */
  arrayEquals: function(arr1, arr2) {
    if (arr1 === undefined || arr2 == undefined) return false;
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
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

(function () {
// Private None Class
var None = function() {
  this.type = "none";
};
None.prototype = {
  toString: function() {
    return "None";
  }
};

// We only need to create one instance of None.
glift.util.none = new None();
})();
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
// Otre: A Go Studying Program
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift.enums = {
  // Also sometimes referred to as colors. Might be good to change back
  states: {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
    EMPTY: 'EMPTY'
  },

  directions: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
  },

  controllerMessages: {
    CONTINUE: 'CONTINUE',
    DONE: 'DONE',
    FAILURE: 'FAILURE'
  },

  // The directions should work with the boardRegions.
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
    AUTO: 'AUTO'
  },

  marks: {
    CIRCLE: 'CIRCLE',
    SQUARE: 'SQUARE',
    TRIANGLE: 'TRIANGLE',
    XMARK: 'XMARK',
    STONE_MARKER: 'STONE_MARKER',
    // These last three all have to do with Labels.
    // TODO(kashomon): Consolidate these somehow.
    LABEL: 'LABEL',
    VARIATION_MARKER: 'VARIATION_MARKER',
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
    BOARD_BASE: 'board_base',
    BOARD_LINE: 'board_line',
    BUTTON: 'button',
    MARK: 'mark',
    MARK_CONTAINER: 'mark_container',
    GLIFT_ELEMENT: 'glift_element',
    STARPOINT: 'starpoint',
    STONE: 'stone',
    STONE_SHADOW: 'stone_shadow',
    ICON: 'icon'
  },

  showVariations: {
    ALWAYS: 'ALWAYS',
    NEVER: 'NEVER',
    MORE_THAN_ONE: 'MORE_THAN_ONE'
  },

  widgetTypes: {
    CORRECT_VARIATIONS_PROBLEM: 'CORRECT_VARIATIONS_PROBLEM',
    EXAMPLE: 'EXAMPLE',
    GAME_VIEWER: 'GAME_VIEWER',
    STANDARD_PROBLEM: 'STANDARD_PROBLEM'
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
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.11
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
  'use strict';
  var oldOnClick, self = this;


  /**
   * Whether a click is currently being tracked.
   *
   * @type boolean
   */
  this.trackingClick = false;


  /**
   * Timestamp for when when click tracking started.
   *
   * @type number
   */
  this.trackingClickStart = 0;


  /**
   * The element being tracked for a click.
   *
   * @type EventTarget
   */
  this.targetElement = null;


  /**
   * X-coordinate of touch start event.
   *
   * @type number
   */
  this.touchStartX = 0;


  /**
   * Y-coordinate of touch start event.
   *
   * @type number
   */
  this.touchStartY = 0;


  /**
   * ID of the last touch, retrieved from Touch.identifier.
   *
   * @type number
   */
  this.lastTouchIdentifier = 0;


  /**
   * Touchmove boundary, beyond which a click will be cancelled.
   *
   * @type number
   */
  this.touchBoundary = 10;


  /**
   * The FastClick layer.
   *
   * @type Element
   */
  this.layer = layer;

  if (!layer || !layer.nodeType) {
    throw new TypeError('Layer must be a document node');
  }

  /** @type function() */
  this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

  /** @type function() */
  this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

  /** @type function() */
  this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

  /** @type function() */
  this.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(self, arguments); };

  /** @type function() */
  this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

  /** @type function() */
  this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

  if (FastClick.notNeeded(layer)) {
    return;
  }

  // Set up event handlers as required
  if (this.deviceIsAndroid) {
    layer.addEventListener('mouseover', this.onMouse, true);
    layer.addEventListener('mousedown', this.onMouse, true);
    layer.addEventListener('mouseup', this.onMouse, true);
  }

  layer.addEventListener('click', this.onClick, true);
  layer.addEventListener('touchstart', this.onTouchStart, false);
  layer.addEventListener('touchmove', this.onTouchMove, false);
  layer.addEventListener('touchend', this.onTouchEnd, false);
  layer.addEventListener('touchcancel', this.onTouchCancel, false);

  // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
  // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
  // layer when they are cancelled.
  if (!Event.prototype.stopImmediatePropagation) {
    layer.removeEventListener = function(type, callback, capture) {
      var rmv = Node.prototype.removeEventListener;
      if (type === 'click') {
        rmv.call(layer, type, callback.hijacked || callback, capture);
      } else {
        rmv.call(layer, type, callback, capture);
      }
    };

    layer.addEventListener = function(type, callback, capture) {
      var adv = Node.prototype.addEventListener;
      if (type === 'click') {
        adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
          if (!event.propagationStopped) {
            callback(event);
          }
        }), capture);
      } else {
        adv.call(layer, type, callback, capture);
      }
    };
  }

  // If a handler is already declared in the element's onclick attribute, it will be fired before
  // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
  // adding it as listener.
  if (typeof layer.onclick === 'function') {

    // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
    // - the old one won't work if passed to addEventListener directly.
    oldOnClick = layer.onclick;
    layer.addEventListener('click', function(event) {
      oldOnClick(event);
    }, false);
    layer.onclick = null;
  }
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
  'use strict';
  switch (target.nodeName.toLowerCase()) {

  // Don't send a synthetic click to disabled inputs (issue #62)
  case 'button':
  case 'select':
  case 'textarea':
    if (target.disabled) {
      return true;
    }

    break;
  case 'input':

    // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
    if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
      return true;
    }

    break;
  case 'label':
  case 'video':
    return true;
  }

  return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
  'use strict';
  switch (target.nodeName.toLowerCase()) {
  case 'textarea':
  case 'select':
    return true;
  case 'input':
    switch (target.type) {
    case 'button':
    case 'checkbox':
    case 'file':
    case 'image':
    case 'radio':
    case 'submit':
      return false;
    }

    // No point in attempting to focus disabled inputs
    return !target.disabled && !target.readOnly;
  default:
    return (/\bneedsfocus\b/).test(target.className);
  }
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
  'use strict';
  var clickEvent, touch;

  // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
  if (document.activeElement && document.activeElement !== targetElement) {
    document.activeElement.blur();
  }

  touch = event.changedTouches[0];

  // Synthesise a click event, with an extra attribute so it can be tracked
  clickEvent = document.createEvent('MouseEvents');
  clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
  clickEvent.forwardedTouchEvent = true;
  targetElement.dispatchEvent(clickEvent);
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
  'use strict';
  var length;

  // Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
  if (this.deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
    length = targetElement.value.length;
    targetElement.setSelectionRange(length, length);
  } else {
    targetElement.focus();
  }
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
  'use strict';
  var scrollParent, parentElement;

  scrollParent = targetElement.fastClickScrollParent;

  // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
  // target element was moved to another parent.
  if (!scrollParent || !scrollParent.contains(targetElement)) {
    parentElement = targetElement;
    do {
      if (parentElement.scrollHeight > parentElement.offsetHeight) {
        scrollParent = parentElement;
        targetElement.fastClickScrollParent = parentElement;
        break;
      }

      parentElement = parentElement.parentElement;
    } while (parentElement);
  }

  // Always update the scroll top tracker if possible.
  if (scrollParent) {
    scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
  }
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
  'use strict';

  // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
  if (eventTarget.nodeType === Node.TEXT_NODE) {
    return eventTarget.parentNode;
  }

  return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
  'use strict';
  var targetElement, touch, selection;

  // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
  if (event.targetTouches.length > 1) {
    return true;
  }

  targetElement = this.getTargetElementFromEventTarget(event.target);
  touch = event.targetTouches[0];

  if (this.deviceIsIOS) {

    // Only trusted events will deselect text on iOS (issue #49)
    selection = window.getSelection();
    if (selection.rangeCount && !selection.isCollapsed) {
      return true;
    }

    if (!this.deviceIsIOS4) {

      // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
      // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
      // with the same identifier as the touch event that previously triggered the click that triggered the alert.
      // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
      // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
      if (touch.identifier === this.lastTouchIdentifier) {
        event.preventDefault();
        return false;
      }

      this.lastTouchIdentifier = touch.identifier;

      // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
      // 1) the user does a fling scroll on the scrollable layer
      // 2) the user stops the fling scroll with another tap
      // then the event.target of the last 'touchend' event will be the element that was under the user's finger
      // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
      // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
      this.updateScrollParent(targetElement);
    }
  }

  this.trackingClick = true;
  this.trackingClickStart = event.timeStamp;
  this.targetElement = targetElement;

  this.touchStartX = touch.pageX;
  this.touchStartY = touch.pageY;

  // Prevent phantom clicks on fast double-tap (issue #36)
  if ((event.timeStamp - this.lastClickTime) < 200) {
    event.preventDefault();
  }

  return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
  'use strict';
  var touch = event.changedTouches[0], boundary = this.touchBoundary;

  if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
    return true;
  }

  return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
  'use strict';
  if (!this.trackingClick) {
    return true;
  }

  // If the touch has moved, cancel the click tracking
  if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
    this.trackingClick = false;
    this.targetElement = null;
  }

  return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
  'use strict';

  // Fast path for newer browsers supporting the HTML5 control attribute
  if (labelElement.control !== undefined) {
    return labelElement.control;
  }

  // All browsers under test that support touch events also support the HTML5 htmlFor attribute
  if (labelElement.htmlFor) {
    return document.getElementById(labelElement.htmlFor);
  }

  // If no for attribute exists, attempt to retrieve the first labellable descendant element
  // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
  return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
  'use strict';
  var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

  if (!this.trackingClick) {
    return true;
  }

  // Prevent phantom clicks on fast double-tap (issue #36)
  if ((event.timeStamp - this.lastClickTime) < 200) {
    this.cancelNextClick = true;
    return true;
  }

  // Reset to prevent wrong click cancel on input (issue #156).
  this.cancelNextClick = false;

  this.lastClickTime = event.timeStamp;

  trackingClickStart = this.trackingClickStart;
  this.trackingClick = false;
  this.trackingClickStart = 0;

  // On some iOS devices, the targetElement supplied with the event is invalid if the layer
  // is performing a transition or scroll, and has to be re-detected manually. Note that
  // for this to function correctly, it must be called *after* the event target is checked!
  // See issue #57; also filed as rdar://13048589 .
  if (this.deviceIsIOSWithBadTarget) {
    touch = event.changedTouches[0];

    // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
    targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
    targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
  }

  targetTagName = targetElement.tagName.toLowerCase();
  if (targetTagName === 'label') {
    forElement = this.findControl(targetElement);
    if (forElement) {
      this.focus(targetElement);
      if (this.deviceIsAndroid) {
        return false;
      }

      targetElement = forElement;
    }
  } else if (this.needsFocus(targetElement)) {

    // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
    // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
    if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
      this.targetElement = null;
      return false;
    }

    this.focus(targetElement);

    // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
    if (!this.deviceIsIOS4 || targetTagName !== 'select') {
      this.targetElement = null;
      event.preventDefault();
    }

    return false;
  }

  if (this.deviceIsIOS && !this.deviceIsIOS4) {

    // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
    // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
    scrollParent = targetElement.fastClickScrollParent;
    if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
      return true;
    }
  }

  // Prevent the actual click from going though - unless the target node is marked as requiring
  // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
  if (!this.needsClick(targetElement)) {
    event.preventDefault();
    this.sendClick(targetElement, event);
  }

  return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
  'use strict';
  this.trackingClick = false;
  this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
  'use strict';

  // If a target element was never set (because a touch event was never fired) allow the event
  if (!this.targetElement) {
    return true;
  }

  if (event.forwardedTouchEvent) {
    return true;
  }

  // Programmatically generated events targeting a specific element should be permitted
  if (!event.cancelable) {
    return true;
  }

  // Derive and check the target element to see whether the mouse event needs to be permitted;
  // unless explicitly enabled, prevent non-touch click events from triggering actions,
  // to prevent ghost/doubleclicks.
  if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

    // Prevent any user-added listeners declared on FastClick element from being fired.
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    } else {

      // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
      event.propagationStopped = true;
    }

    // Cancel the event
    event.stopPropagation();
    event.preventDefault();

    return false;
  }

  // If the mouse event is permitted, return true for the action to go through.
  return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
  'use strict';
  var permitted;

  // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
  if (this.trackingClick) {
    this.targetElement = null;
    this.trackingClick = false;
    return true;
  }

  // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
  if (event.target.type === 'submit' && event.detail === 0) {
    return true;
  }

  permitted = this.onMouse(event);

  // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
  if (!permitted) {
    this.targetElement = null;
  }

  // If clicks are permitted, return true for the action to go through.
  return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
  'use strict';
  var layer = this.layer;

  if (this.deviceIsAndroid) {
    layer.removeEventListener('mouseover', this.onMouse, true);
    layer.removeEventListener('mousedown', this.onMouse, true);
    layer.removeEventListener('mouseup', this.onMouse, true);
  }

  layer.removeEventListener('click', this.onClick, true);
  layer.removeEventListener('touchstart', this.onTouchStart, false);
  layer.removeEventListener('touchmove', this.onTouchMove, false);
  layer.removeEventListener('touchend', this.onTouchEnd, false);
  layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
  'use strict';
  var metaViewport;

  // Devices that don't support touch don't need FastClick
  if (typeof window.ontouchstart === 'undefined') {
    return true;
  }

  if ((/Chrome\/[0-9]+/).test(navigator.userAgent)) {

    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
    if (FastClick.prototype.deviceIsAndroid) {
      metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport && metaViewport.content.indexOf('user-scalable=no') !== -1) {
        return true;
      }

    // Chrome desktop doesn't need FastClick (issue #15)
    } else {
      return true;
    }
  }

  // IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
  if (layer.style.msTouchAction === 'none') {
    return true;
  }

  return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
  'use strict';
  return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

  // AMD. Register as an anonymous module.
  define(function() {
    'use strict';
    return FastClick;
  });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = FastClick.attach;
  module.exports.FastClick = FastClick;
} else {
  window.FastClick = FastClick;
}
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
  _nameToCode: {
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_:40,
    BACKSPACE:8,
    ENTER:13,
    SHIFT:16,
    FORWARD_SLASH:191,
    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75
    // TODO(kashomon): Complete this.
  },

  nameToCode: function(name) {
    return glift.keyMappings._nameToCode[name];
  },

  _codeToName: undefined, // lazilyDefined

  codeToName: function(keyCode) {
    if (glift.keyMappings._codeToName === undefined) {
      var out = {};
      for (var keyName in glift.keyMappings._nameToCode) {
        out[glift.keyMappings._nameToCode[keyName]] = keyName;
      }
      glift.keyMappings._codeToName = out;
    }
    return glift.keyMappings._codeToName[keyCode];
  }
};
glift.math = {
  abs: function(num) {
    if (num >= 0) return num;
    else return num * -1;
  },

  max: function(num1, num2) {
    if (num1 > num2) return num1;
    else return num2;
  },

  min: function(num1, num2) {
    if (num1 > num2) return num2;
    else return num1;
  },

  isEven: function(num1) {
    if ((num1 % 2) == 0) return true;
    else return false;
  },

  // Returns a random integer between min and max
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
glift.util.perfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var time = glift.util.perfTime();
  var lastMajor = glift.global.perf.lastMajor;
  var last = glift.global.perf.last;
  console.log("Since Major Record: " + (time - lastMajor + "ms. " + msg));
  if (glift.global.performanceDebugLevel === 'fine') {
    console.log("  Since Last Record: " + (time - last + "ms. " + msg));
  }
  glift.global.perf.last = time;
};

glift.util.majorPerfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var time = glift.util.perfTime();
  glift.util.perfLog(msg);
  glift.global.perf.lastMajor = time;
};

glift.util.perfDone = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
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
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var t = glift.util.perfTime();
  glift.global.perf = { first: t, last: t, lastMajor: t};
};

glift.util.perfTime = function() {
  return (new Date()).getTime();
};
(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

glift.util.coordToString = function(x, y) {
  return x + ',' + y
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
    throw "Unknown SGF Coord length: " + str.length;
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

  /**
   * Returns an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    return String.fromCharCode(this.x() + 97) +
        String.fromCharCode(this.y() + 97);
  },

  /**
   * Create the form used in objects.
   * TODO(kashomon): Replace with string form.  The term hash() is confusing and
   * it makes it seem like I'm converting it to an int (which I was, long ago)
   */
  hash: function() {
    return this.toString();
  },

  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * Return a new point that's a translation from this one
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
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
    ok(d3.selectAll('#' + divId + ' svg')[0].length !== 0,
        "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    deepEqual(d3.selectAll('#' + divId + ' svg')[0].length, 0 ,
        "Div should not contain contents");
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
   */
  get: function(id) {
    var registered = glift.themes.registered;
    // TODO(kashomon): The else case should be undefined. glift.util.none was
    // probably a mistake.
    var rawTheme = !(id in registered) ? glift.util.none : registered[id];
    if (rawTheme === glift.util.none) {
      return rawTheme
    } else {
      return glift.themes.deepCopy({}, rawTheme, registered.DEFAULT);
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
    fill: '#000000'
  },

  lines: {
    stroke: "#000000",
    'stroke-width': 0.5
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

  // TODO(kashomon): Add support for gradients.  This is non-trivial.  It
  // requires that we attach defs at the beginning of the SVG.  Not hard, but a
  // little bit of work.
  icons: {
    DEFAULT : {
      fill: "#0000AA",
      stroke: 'black'
      //fill: "90-#337-#55B"
    },
    DEFAULT_HOVER : {
      fill: 'cyan',
      stroke: 'black'
      //fill: "90-#337-#55D"
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
      fill: "#555"
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
    fill: "#777777"
  },
  stones: {
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
}
glift.themes.registered.TEXTBOOK = {
  board: {
    fill: "#FFFFFF"
  }
};
glift.themes.registered.TRANSPARENT = {
  board: {
    fill: "none"
  }
};
glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which currently
   * creates an SVG based Go Board.
   */
  create: function(options) {
    glift.util.majorPerfLog("Before environment creation");
    var environment = glift.displays.environment.get(options);
    glift.util.majorPerfLog("After environment creation");
    var themeKey = options.theme || 'DEFAULT';
    var theme = glift.themes.get(themeKey); // Get a theme copy.
    if (options.goBoardBackground && options.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, options.goBoardBackground);
    }
    return glift.displays.board.create(environment, themeKey, theme);
  }
};
(function() {
glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bboxFromDiv = function(divId) {
  return glift.displays.bbox(
      glift.util.point(0,0),
      $('#' + divId).width(),
      $('#' + divId).height());
};

glift.displays.bbox = function(topLeft, width, height) {
  return new BoundingBox(
      topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
};

// Might be nice to use the closure to create private variables.
// A bounding box, generally for a graphical object.
var BoundingBox = function(topLeftPtIn, botRightPtIn) {
  this._topLeftPt = topLeftPtIn;
  this._botRightPt = botRightPtIn;
};

BoundingBox.prototype = {
  topLeft: function() { return this._topLeftPt; },
  botRight: function() { return this._botRightPt; },
  width: function() { return this.botRight().x() - this.topLeft().x(); },
  height: function() { return this.botRight().y() - this.topLeft().y(); },
  top: function() { return this.topLeft().y(); },
  left: function() { return this.topLeft().x(); },
  bottom: function() { return this.botRight().y(); },
  right: function() { return this.botRight().x(); },

  /**
   * Find the center of the box
   */
  center: function() {
    return glift.util.point(
      glift.math.abs((this.botRight().x() - this.topLeft().x()) / 2)
          + this.topLeft().x(),
      glift.math.abs((this.botRight().y() - this.topLeft().y()) / 2)
          + this.topLeft().y());
  },

  /**
   * Draw the bbox (for debugging).
   */
  draw: function(paper, color) {
    var obj = paper.rect(
        this.topLeft().x(), this.topLeft().y(), this.width(), this.height());
    obj.attr({fill:color, opacity:0.5});
  },

  /**
   * Log the points to the console (for debugging).
   */
  log: function() {
    glift.util.logz("TopLeft: " + JSON.stringify(this.topLeft()));
    glift.util.logz("BotRight: " + JSON.stringify(this.botRight()));
    glift.util.logz("Width: " + this.width());
    glift.util.logz("Height: " + this.height());
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
   * Test to see if two points are equal.
   */
  equals: function(other) {
    return other.topLeft() && this.topLeft().equals(other.topLeft()) &&
        other.botRight() && this.botRight().equals(other.botRight());
  },

  /**
   * Return a new Bbox with the width and the height scaled by some fraction.
   * The TopLeft point is also scaled by the amount.
   */
  scale: function(amount) {
    var newHeight = this.height() * amount,
        newWidth = this.width() * amount,
        newTopLeft = glift.util.point(
            this.topLeft().x() * amount, this.topLeft().y() * amount);
    return glift.displays.bbox(newTopLeft, newWidth, newHeight);
  },

  toString: function() {
    return this.topLeft().toString() + ',' +  this.botRight().toString();
  },

  translate: function(dx, dy) {
    return glift.displays.bboxFromPts(
        glift.util.point(this.topLeft().x() + dx, this.topLeft().y() + dy),
        glift.util.point(this.botRight().x() + dx, this.botRight().y() + dy));
  }
};

})();
(function() {
// TODO(kashomon): Add much better tests for these methods.  The BoardPoints are
// pivotal to creating the go board, so we want them to really work.

/**
 * Simple wrapper around the BoardPoints constructor.
 */
glift.displays.boardPoints = function(points, spacing, maxIntersects) {
  return new BoardPoints(points, spacing, maxIntersects);
};

/**
 * Construct the board points from a linebox (see linebox.js).
 *
 * TODO(kashomon): This is pretty irritating to test.  Is there an easier way to
 * structure this?
 */
glift.displays.boardPointsFromLineBox = function(linebox, maxIntersects) {
  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      left = linebbox.left() + linebox.extensionBox.left() * spacing,
      top = linebbox.top() + linebox.extensionBox.top() * spacing,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      // Mapping from int point hash, e.g., (0,18), to coordinate data.
      points = {};

  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);

      // TODO(kashomon): Prehaps the coordinate point should be truncated?
      // right now it's ~15 decimal places.  This is too much precision and it
      // might hurt performance.
      var coordPt = glift.util.point(xCoord, yCoord);
      points[intPt.hash()] = {
        // Integer point.
        intPt: intPt,
        coordPt: coordPt,
        bbox: glift.displays.bboxFromPts(
            glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
            glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
      };
    }
  }
  return glift.displays.boardPoints(points, spacing, maxIntersects);
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
var BoardPoints = function(points, spacing, numIntersections) {
  this.points = points; // int hash is 0 indexed, i.e., 0->18.
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
};

BoardPoints.prototype = {
  /**
   * Get the points.
   *
   * TODO(kashomon): Remove?  I don't think this is necessary any longer.
   */
  getCoords: function() {
    return this.points;
  },

  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18.
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
   * Return the points as an array.  This is useful for D3, in particular.
   */
  data: function() {
    var data = [];
    this.forEach(function(point) {
      data.push(point);
    });
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
  },

  /**
   * Draw a circle for every intersection, for debug purposes.
   *
   * TODO(kashomon): This is raphael-specific and should be removed, or changed
   * to use D3.
   */
  _debugDraw: function(paper, color) {
    for (var ptHash in this.points) {
      var centerX = this.points[ptHash].bbox.center().x();
      var centerY = this.points[ptHash].bbox.center().y();
      var circ = paper.circle(centerX, centerY, this.radius);
      circ.attr({fill:color, opacity:.3});
    }
  }
};

})();
(function() {
// TODO(kashomon): Make its own directory?
glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  create: function(cbox, extBox, minIntersects, maxIntersects) {
    return new CropBox(cbox, extBox, minIntersects, maxIntersects);
  },

  getFromRegion: function(region, intersects) {
    var util = glift.util,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        // So that we can 0 index, we subtract one.
        maxIntersects = intersects - 1,
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
          right = halfInts + 1;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;
      default: break;
    };

    var cbox = glift.displays.bboxFromPts(
        util.point(left, top), util.point(right, bot));
    var extBox = glift.displays.bboxFromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension));
    return glift.displays.cropbox.create(
        cbox, extBox, minIntersects, maxIntersects);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 */
var CropBox = function(cbox, extBox, minIntersects, maxIntersects) {
  this._cbox = cbox;
  this._extBox = extBox;
};

CropBox.prototype = {
  cbox: function() { return this._cbox; },
  extBox: function() { return this._extBox; },
  xPoints: function() { return this.cbox().width(); },
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

var getRegionFromTracker = function(tracker, numstones) {
  var regions = [], br = glift.enums.boardRegions;
  for (var quadkey in tracker) {
    var quadlist = tracker[quadkey];
    if (quadlist.length === numstones) {
      return quadkey;
    } else {
      regions.push(quadkey);
    }
  }
  if (regions.length !== 2) {
    // Shouldn't be 1 element here...
    return glift.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.boardRegions.ALL;
};
})();
(function() {
/***
 * The Environment contains:
 *  - The bounding box for the lines.
 *  - The bounding box for the whole board
 *  - The bounding boxes for the sidebars.
 *  - The divId to be used
 */
glift.displays.environment = {
  TOPBAR_SIZE: 0.10,
  BOTTOMBAR_SIZE: 0.10,

  get: function(options) {
    // TODO(kashomon): Remove the processOptions here.  It's only used for
    // tests.
    return new GuiEnvironment(options);
  },

  getInitialized: function(options) {
    return new GuiEnvironment(options).init();
  }
};

var GuiEnvironment = function(options) {
  this.divId = options.divId || 'glift_display';
  this.boardRegion = options.boardRegion || glift.enums.boardRegions.ALL;
  this.intersections = options.intersections || 19;
  var displayConfig = options.displayConfig || {};
  this.cropbox = displayConfig.cropbox !== undefined
      ? displayConfig.cropbox
      : glift.displays.cropbox.getFromRegion(this.boardRegion, this.intersections);
  this.heightOverride = false;
  this.widthOverride = false;

  // because it's extremely useful for testing.
  if (displayConfig.divHeight !== undefined) {
    this.divHeight = displayConfig.divHeight;
    this.heightOverride = true;
  }

  if (displayConfig.divWidth !== undefined) {
    this.divWidth = displayConfig.divWidth;
    this.widthOverride = true;
  }
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
  init: function() {
    if (!this.heightOverride || !this.widthOverride) {
      this._resetDimensions();
    }

    var displays = glift.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth = this.divWidth,
        cropbox = this.cropbox,
        dirs = glift.enums.directions,

        // The box for the entire div.
        // TODO(kashomon): This is created twice, which is a little silly (but
        // not expensive) in _resetDimensions. Might want to replace.
        divBox = displays.bboxFromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.displays.boardPointsFromLineBox(
            goBoardLineBox, this.intersections);
    this.divBox = divBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    return this;
  },

  _resetDimensions: function() {
    var bbox = glift.displays.bboxFromDiv(this.divId);
    this.divHeight = bbox.height();
    this.divWidth = bbox.width();
    return this;
  },

  _debugDrawAll: function() {
    var paper = Raphael(this.divId, "100%", "100%")
    this.divBox.draw(paper, 'yellow');
    this.resizedBox.draw(paper, 'red');
    this.goBoardBox.draw(paper, 'orange');
    this.goBoardLineBox.bbox.draw(paper, 'red');
    this.goBoardLineBox._debugDrawLines(paper, 'blue');
    this.boardPoints._debugDraw(paper, 'green');
    this.lineSegments._debugDraw(paper, 'black');
  }
};

})();
(function() {
glift.displays.getLineBox = function(boardBox, cropbox) {
  var totalOverflow = glift.displays.cropbox.OVERFLOW;
  var oneSidedOverflow = totalOverflow / 2;
  // TODO(kashomon): This is very mysterious. Provide more documentation.
  var xSpacing = boardBox.width() / cropbox.widthMod();
  var ySpacing = boardBox.height() / cropbox.heightMod();
  var top = ySpacing * oneSidedOverflow; // Scale the overflow by spacing
  var left = xSpacing * oneSidedOverflow; // Scale the overflow by spacing
  var bot = ySpacing * (cropbox.heightMod() - oneSidedOverflow)
  var right = xSpacing * (cropbox.widthMod() - oneSidedOverflow)
  var leftBase = boardBox.topLeft().x();
  var topBase = boardBox.topLeft().y();

      // The Line Box is an extended cropbox.
  var lineBoxBoundingBox = glift.displays.bboxFromPts(
          glift.util.point(left + leftBase, top + topBase),
          glift.util.point(right + leftBase, bot + topBase));
      return new LineBox(lineBoxBoundingBox, xSpacing, ySpacing, cropbox);
};

var LineBox = function(boundingBox, xSpacing, ySpacing, cropbox) {
  this.bbox = boundingBox;
  this._xSpacing = xSpacing; // For debug -- should be identical
  this._ySpacing = ySpacing; // For debug -- should be identical
  this.spacing = xSpacing;
  // todo: Make these methods instead of variables
  this.extensionBox = cropbox.extBox();
  this.pointTopLeft = cropbox.cbox().topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};

})();
/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 */
glift.displays.getResizedBox = function(divBox, cropbox) {
  var util = glift.util,
      newDims = glift.displays.getCropDimensions(
          divBox.width(),
          divBox.height(),
          cropbox),
      newWidth = newDims.width(),
      newHeight = newDims.height(),
      xDiff = divBox.width() - newWidth,
      yDiff = divBox.height() - newHeight,
      xDelta = xDiff === 0 ? 0 : xDiff / 2,
      yDelta = yDiff === 0 ? 0 : yDiff / 2,
      newLeft = divBox.topLeft().x() + xDelta,
      newTop = divBox.topLeft().y() + yDelta,
      newBox = glift.displays.bbox(
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
    height: function() { return newHeight; },
    width: function() { return newWidth; }
  };
};
glift.displays.board = {
  create: function(env, themeName, theme) {
    return new glift.displays.board.Display(env, themeName, theme).draw();
  }
};

/**
 * The core Display object returned to the user.
 */
glift.displays.board.Display = function(inEnvironment, themeName, theme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;
  this._svg = undefined; // defined in draw
  this._intersections = undefined // defined in draw;
};

glift.displays.board.Display.prototype = {
  intersections: function() { return this._intersections; },
  intersectionPoints: function() { return this._environment.intersections; },
  boardPoints: function() { return this._environment.boardPoints; },
  divId: function() { return this._environment.divId },
  theme: function() { return this._themeName; },
  boardRegion: function() { return this._environment.boardRegion; },
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
      this._svg = d3.select('#' + this.divId())
        .append("svg")
          .attr("width", '100%')
          .attr("height", '100%');
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
        divId = this.divId();

    board.initBlurFilter(divId, svg);
    var boardId = board.boardBase(divId, svg, env.goBoardBox, theme);
    var lineIds = board.lines(divId, svg, boardPoints, theme);
    var starPointIds = board.starPoints(divId, svg, boardPoints, theme);
    var stoneShadowIds = board.shadows(divId, svg, boardPoints, theme);
    var stoneIds = board.stones(divId, svg, boardPoints, theme);
    var markIds = board.markContainer(divId, svg, boardPoints, theme);
    var buttons = board.buttons(divId, svg, boardPoints);
    var intersectionData = {
        lineIds: lineIds,
        starPointIds: starPointIds,
        stoneShadowIds: stoneShadowIds,
        stoneIds: stoneIds,
        markIds: markIds,
        buttons: buttons
    };
    this._intersections = new glift.displays.board._Intersections(
        divId, svg, intersectionData, boardPoints, theme);
    return this; // required
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    this.divId() && d3.select('#' + this.divId()).selectAll("svg").remove();
    this._svg = undefined;
    this._intersections = undefined;
    return this;
  },

  /**
   * Recreate the GoBoard. This means we create a completely new environment,
   * but we reuse the old Display object.
   *
   * TODO(kashomon): Why is this here?  Why not just give back a completely new
   * display?
   */
  recreate: function(options) {
    this.destroy();
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed);
    this._environment = environment;
    this._themeName = processed.theme
    this._theme = glift.themes.get(processed.theme);
    return this;
  }
};
/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.boardBase = function(divId, svg, goBox, theme) {
  var BOARD = glift.enums.svgElements.BOARD;
  var id = glift.displays.gui.elementId(divId, BOARD)

  if (theme.board.imagefill) {
    svg.selectAll('goBoardRect').data([BOARD])
      .enter().append('svg:image')
        .attr('x', goBox.topLeft().x())
        .attr('y', goBox.topLeft().y())
        .attr('width', goBox.width())
        .attr('height', goBox.height())
        .attr('xlink:href', theme.board.imagefill)
        .attr('preserveAspectRatio', 'none')
        .attr('id', id);
  }

  svg.selectAll('goBoardRect').data([BOARD])
    .enter().append('rect')
      .attr('x', goBox.topLeft().x() + 'px')
      .attr('y', goBox.topLeft().y() + 'px')
      .attr('width', goBox.width() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
      .attr('stroke', theme.board.stroke)
      .attr('stroke-width', theme.board['stroke-width'])
      .attr('id', id);
  return id;
};
/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(divId, svg, boardPoints) {
  var buttonMapping = {};
  var elems = glift.enums.svgElements;
  var BUTTON = elems.BUTTON;
  svg.selectAll(BUTTON).data(boardPoints.data())
    .enter().append("svg:rect")
      .attr("x", function(pt) { return pt.coordPt.x() - boardPoints.radius; })
      .attr("y", function(pt) { return pt.coordPt.y() - boardPoints.radius; })
      .attr("width", boardPoints.spacing)
      .attr("height", boardPoints.spacing)
      .attr("class", BUTTON)
      .attr('opacity', 0)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stone_color', 'EMPTY')
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, BUTTON, pt.intPt);
        buttonMapping[pt.intPt.hash()] = id;
        return id;
      });
  return buttonMapping;
};
glift.displays.board._Intersections = function(
    divId, svg, intersectionData, boardPoints, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.boardPoints = boardPoints;

  // elements by id.  Maps from point-string to element ID ('#...')
  this.lineIds = intersectionData.lineIds;
  this.starPointIds = intersectionData.starPointIds;
  this.stoneShadowIds = intersectionData.stoneShadowIds;
  this.stoneIds = intersectionData.stoneIds;
  this.markIds = intersectionData.markIds;
  this.buttons = intersectionData.buttons;

  // TODO(kashomon): What's going on here?
  this.buttonsData = [];
  for (var key in this.buttons) {
    this.buttonsData.push(glift.util.pointFromString(key));
  }
};

glift.displays.board._Intersections.prototype = {
  /**
   * Set the color of a stone. Returns 'this' for the possibility of chaining.
   */
  setStoneColor: function(pt, colorKey) {
    var key = pt.hash();
    if (this.theme.stones[colorKey] === undefined) {
      throw 'Unknown color key [' + colorKey + ']'
    }

    if (this.stoneIds[key] !== undefined) {
      var stoneColor = this.theme.stones[colorKey];
      this.svg.select('#' + this.stoneIds[key])
          .attr('fill', stoneColor.fill)
          .attr('stroke', stoneColor.stroke)
          .attr('stone_color', colorKey)
          .attr('opacity', stoneColor.opacity);
      if (this.stoneShadowIds[key] !== undefined) {
        if (stoneColor.opacity === 1) {
          this.svg.select('#' + this.stoneShadowIds[key]).attr('opacity', 1);
        } else {
          this.svg.select('#' + this.stoneShadowIds[key]).attr('opacity', 0);
        }
      }
    }
    return this;
  },

  addMarkPt: function(pt, mark, label) {
    glift.displays.board.addMark(
        this.divId, this.svg, this.boardPoints, this.theme, pt, mark, label);
    return this;
  },

  clearMarks: function() {
    var elems = glift.enums.svgElements;
    // Some STARPOINTs/BOARD_LINEs may have been 'turned-off' when adding marks.
    // It's easier just to manipulate them as a whole.
    // TODO(kashomon): Is there much of a performance hit for doing this?
    this.svg.selectAll('.' + elems.STARPOINT).attr('opacity', 1);
    this.svg.selectAll('.' + elems.BOARD_LINE).attr('opacity', 1);
    this.svg.selectAll('.' + elems.MARK).remove();
    return this;
  },

  clearStones: function() {
    var elems = glift.enums.svgElements;
    this.svg.selectAll('.' + elems.STONE).attr('opacity', 0)
        .attr('stone_color', 'EMPTY');
    this.svg.selectAll('.' + elems.STONE_SHADOW).attr('opacity', 0);
  },

  clearAll: function() {
    this.clearMarks();
    this.clearStones();
  },

  setEvent: function(event, func) {
    var BUTTON = glift.enums.svgElements.BUTTON;
    this.svg.selectAll('rect' + '.' + BUTTON).data(this.buttonsData)
      .on(event, function(pt) { func(pt); });
  }
};
/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 */
glift.displays.board.lines = function(divId, svg, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var lineMapping = {};
  var BOARD_LINE = glift.enums.svgElements.BOARD_LINE;
  svg.selectAll(BOARD_LINE).data(boardPoints.data())
    .enter().append("path")
      .attr('d', function(pt) {
        return glift.displays.board.intersectionLine(
            pt, boardPoints.radius, boardPoints.numIntersections, theme);
      })
      .attr('stroke', theme.lines.stroke)
      .attr('stroke-width', theme.lines['stroke-width'])
      .attr('class', BOARD_LINE)
      .attr('stroke-linecap', 'round')
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, BOARD_LINE, pt.intPt);
        lineMapping[pt.intPt.hash()] = id;
        return id;
      });
  return lineMapping;
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
      svgutil = glift.displays.board.svgutil;
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
      svgutil.svgMove(coordinate.x(), top) + ' '
      + svgutil.svgLineAbs(coordinate.x(), bottom) + ' '
      // Horizontal Line
      + svgutil.svgMove(left, coordinate.y()) + ' '
      + svgutil.svgLineAbs(right, coordinate.y());
  return line;
};
/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 */
glift.displays.board.markContainer =
    function(divId, svg, boardPoints, theme) {
  var markMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var MARK_CONTAINER = glift.enums.svgElements.MARK_CONTAINER;

  svg.selectAll(MARK_CONTAINER).data([1]) // dummy data;
      .enter().append("g")
          .attr('class', MARK_CONTAINER);
  return markMapping;
};

// This is a static method instead of a method on intersections because, due to
// the way glift is compiled together, there'no s guarantee what order the files
// come in (beyond the base package file).  So, either we need to combine
// intersections.js with board.js or we week this a separate static method.
glift.displays.board.addMark = function(
    divId, svg, boardPoints, theme, pt, mark, label) {
  var svgutil = glift.displays.board.svgutil;
  var elems = glift.enums.svgElements;
  var MARK = elems.MARK;
  var STONE = elems.STONE;
  var STARPOINT = elems.STARPOINT;
  var BOARD_LINE = elems.BOARD_LINE;
  var MARK_CONTAINER = elems.MARK_CONTAINER;
  var rootTwo = 1.41421356237;
  var rootThree = 1.73205080757;
  var marks = glift.enums.marks;
  var coordPt = boardPoints.getCoord(pt).coordPt;
  var stoneColor = svg.select('#' + glift.displays.gui.elementId(divId, STONE, pt))
      .attr('stone_color');
  var marksTheme = theme.stones[stoneColor].marks;

  // If necessary, clear out intersection lines and starpoints.  This only applies
  // when a stone hasn't yet been set (stoneColor === 'EMPTY').
  if (stoneColor === 'EMPTY' &&
      (mark === marks.LABEL
          || mark === marks.VARIATION_MARKER
          || mark === marks.CORRECT_VARIATION)) {
    svg.select('#' + glift.displays.gui.elementId(divId, STARPOINT, pt))
        .attr('opacity', 0);
    svg.select('#' + glift.displays.gui.elementId(divId, BOARD_LINE, pt))
        .attr('opacity', 0);
  }

  var fudge = boardPoints.radius / 8;
  // TODO(kashomon): Move the labels code to a separate function.  It's pretty
  // hacky right now.  It doesn't seem right that there should be a whole
  // separate coditional based on what are essentially color requirements.
  if (mark === marks.LABEL
      || mark == marks.VARIATION_MARKER
      || mark == marks.CORRECT_VARIATION) {
    if (mark === marks.VARIATION_MARKER) {
      marksTheme = marksTheme.VARIATION_MARKER;
    } else if (mark === marks.CORRECT_VARIATION) {
      marksTheme = marksTheme.CORRECT_VARIATION;
    }
    svg.select('.' + MARK_CONTAINER).append('text')
        .text(label)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('class', MARK)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', coordPt.x()) // x and y are the anchor points.
        .attr('y', coordPt.y())
        .attr('font-family', theme.stones.marks['font-family'])
        .attr('font-size', boardPoints.spacing * 0.7);

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    svg.select('.' + MARK_CONTAINER).append('rect')
        .attr('x', coordPt.x() - halfWidth)
        .attr('y', coordPt.y() - halfWidth)
        .attr('width', 2 * halfWidth)
        .attr('height', 2 * halfWidth)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    svg.select('.' + MARK_CONTAINER).append('path')
        .attr('d',
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(topLeft) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(topRight) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(botLeft) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(botRight))
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else if (mark === marks.CIRCLE) {
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = theme.stones.marks['STONE_MARKER'];
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('class', MARK)
        .attr('opacity', marksTheme.STONE_MARKER.opacity)
        .attr('fill', marksTheme.STONE_MARKER.fill);
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    svg.select('.' + MARK_CONTAINER).append('path')
        .attr('fill', 'none')
        .attr('d',
            svgutil.svgMovePt(topNode) + ' ' +
            svgutil.svgLineAbsPt(leftNode) + ' ' +
            svgutil.svgLineAbsPt(rightNode) + ' ' +
            svgutil.svgLineAbsPt(topNode))
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};
/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 */
glift.displays.board.starPoints = function(
    divId, svg, boardPoints, theme) {
  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  var STARPOINT = glift.enums.svgElements.STARPOINT;
  var starPointIds = {}; // mapping from int point hash to element ID
  svg.selectAll(STARPOINT).data(starPointData)
    .enter().append('circle')
      .attr('cx', function(ip) { return boardPoints.getCoord(ip).coordPt.x(); })
      .attr('cy', function(ip) { return boardPoints.getCoord(ip).coordPt.y(); })
      .attr('r', size)
      .attr('class', STARPOINT)
      .attr('fill', theme.starPoints.fill)
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, STARPOINT, pt);
        starPointIds[pt.hash()] = id;
        return id;
      });
  return starPointIds;
};
/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(divId, svg, boardPoints, theme) {
  var STONE = glift.enums.svgElements.STONE;
  var stoneIdMap = {};
  svg.selectAll(STONE).data(boardPoints.data())
    .enter().append("circle")
      .attr("cx", function(pt) { return pt.coordPt.x(); })
      .attr("cy", function(pt) { return pt.coordPt.y(); })
      .attr("r", boardPoints.radius - .2) // for stroke
      .attr("opacity", 0)
      .attr('class', glift.enums.svgElements.STONE)
      .attr("stone_color", "EMPTY")
      .attr("fill", 'blue') // dummy color
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = glift.displays.gui.elementId(divId, STONE, intPt);
        stoneIdMap[intPt.hash()] = id;
        return id;
      });
  return stoneIdMap;
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 */
glift.displays.board.shadows = function(
    divId, svg, boardPoints, theme) {
  if (theme.stones.shadows === undefined) {
    return {};
  }
  var STONE_SHADOW = glift.enums.svgElements.STONE_SHADOW;
  var svgutil = glift.displays.board.svgutil;
  var shadowMap = {};
  svg.selectAll(STONE_SHADOW).data(boardPoints.data())
    .enter().append("circle")
      .attr("cx", function(pt) {
          return pt.coordPt.x() + boardPoints.radius / 7;
      })
      .attr("cy", function(pt) {
          return pt.coordPt.y() + boardPoints.radius / 7;
      })
      .attr("r", boardPoints.radius - 0.4)
      .attr("opacity", 0)
      .attr("class", STONE_SHADOW)
      .attr("fill", theme.stones.shadows.fill)
      .attr("stroke", theme.stones.shadows.stroke)
      // .attr("filter", 'url(#' + divId + "_svg_blur)")
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = glift.displays.gui.elementId(divId, STONE_SHADOW, intPt);
        shadowMap[intPt.hash()] = id;
        return id;
      });
  return shadowMap;
};

// TODO(kashomon): This should be moved somewhere more general.
glift.displays.board.initBlurFilter = function(divId, svg) {
  svg.append("svg:defs")
    .append("svg:filter")
      .attr("id", divId + '_svg_blur')
    .append("svg:feGaussianBlur")
      .attr("stdDeviation", 2);
};
glift.displays.board.svgutil = {
  /**
   * Move the current position to X,Y.  Usually used in the context of creating a
   * path.
   */
  svgMove: function(x, y) {
    return "M" + x + " " + y;
  },

  svgMovePt: function(pt) {
    return glift.displays.board.svgutil.svgMove(pt.x(), pt.y());
  },

  // Create a relative SVG line, starting from the 'current' position.
  svgLineRel: function(x, y) {
    return "l" + x + " " + y;
  },

  svgLineRelPt: function(pt) {
    return glift.displays.board.svgutil.svgLineRel(pt.x(), pt.y());
  },

  /**
   * Create an absolute SVG line -- different from lower case
   * This form is usually preferred.
   */
  svgLineAbs: function(x, y) {
    return "L" + x + " " + y;
  },

  // Create an absolute SVG line -- different from lower case.
  svgLineAbsPt: function(pt) {
    return glift.displays.board.svgutil.svgLineAbs(pt.x(), pt.y());
  }
};
/**
 * Extra GUI methods and data.  This also contains pieces used by widgets.
 */
glift.displays.gui = {
  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  elementId: function(divId, type, extraData) {
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
  }
};
/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box.
 *
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *  }
 */
// TODO(kashomon): Support column centering.
glift.displays.gui.rowCenter = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [],
      elemWidth = 0;
  if (maxSpacing <= 0) {
    maxSpacing = 10000000; // some arbitrarily large number
  }

  // Adjust all the bboxes so that they are the right height.
  for (var i = 0; i < inBboxes.length; i++) {
    var bbox = inBboxes[i];
    if (innerHeight > innerWidth) {
      var vscale = innerWidth / bbox.width();
    } else {
      var vscale = innerHeight / bbox.height();
    }
    var partialTransform = { scale: vscale }
    // we have scale the bbox to account for the transform.
    var newBbox = bbox.scale(vscale);
    transforms.push(partialTransform);
    newBboxes.push(newBbox);
    elemWidth += newBbox.width() + minSpacing;
  }

  // We don't need the final minSpacing, so subtract off.
  elemWidth -= minSpacing

  // Remove elements that don't fit.
  var unfitTransforms = [];
  while (innerWidth < elemWidth) {
    var rightMostBox = newBboxes.pop();
    var transform = transforms.pop();
    elemWidth -= rightMostBox.width() + minSpacing;
    unfitTransforms.push(transform);
  }

  // Find how much space to use for which parts
  var extraSpace = innerWidth - elemWidth;
  var extraSpacing = extraSpace / (transforms.length + 1);
  var elementSpacing = extraSpacing;
  var extraMargin = extraSpacing;
  if (extraSpacing > maxSpacing) {
    elementSpacing = maxSpacing;
    var totalExtraMargin = extraSpace -
        elementSpacing * (transforms.length - 1);
    extraMargin = totalExtraMargin / 2;
  }
  var left = outerBox.left() + horzMargin + extraMargin;
  var top = outerBox.top() + vertMargin;

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
    left += newBbox.width() + elementSpacing;
  }

  return { transforms: transforms, bboxes: finishedBoxes };
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
(function() {
glift.displays.gui.commentBox = function(
    divId, displayWidth, boundingWidth, themeName, useBoardImage) {
  return new CommentBox(divId, displayWidth, boundingWidth, themeName,
      useBoardImage).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(
    divId, displayWidth, boundingWidth, themeName, useBoardImage) {
  this.divId = divId;
  this.displayWidth = displayWidth;
  this.boundingWidth = boundingWidth;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.useBoardImage = useBoardImage;
  this.commentBoxObj = undefined; // currently: jquery obj
};

CommentBox.prototype = {
  draw: function() {
    // TODO(kashomon): Remove JQuery References
    this.commentBoxObj = $('#' + this.divId);
    var commentBoxHeight = $('#' + this.divId).height();
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    var width = this.displayWidth;
    // var fontSize = width / 25 < 15 ? 15 : width / 25;
    var fontSize = commentBoxHeight * .13 < 15 ? 15 : commentBoxHeight * .13;
    this.commentBoxObj.css({
      // TODO(kashomon): Get the theme info from the theme
      background: '#CCCCFF',
      border: borderWidth + 'px solid',
      left: Math.ceil((this.boundingWidth - this.displayWidth) / 2 - boardBorder),
      width: Math.ceil(this.displayWidth + boardBorder),
      height: commentBoxHeight,
      margin: 'auto',
      'font-family': 'Baskerville',
      overflow: 'auto',
      'font-size': fontSize,
      // Prevent padding from affecting width
      '-webkit-box-sizing': 'border-box', /* Safari/Chrome, other WebKit */
      '-moz-box-sizing': 'border-box',    /* Firefox, other Gecko */
      'box-sizing': 'border-box',         /* Opera/IE 8+ */
      padding: padding
    });
    return this;
  },

  setText: function(text) {
    this.commentBoxObj.html('<p>' +
        text.replace(/\n/g, '<br>') + '</p>');
  },

  clearText: function() {
    this.commentBoxObj.html('');
  },

  destroy: function() {
    this.commentBoxObj.empty();
  }
};

})();
(function() {
/**
 * Options:
 *    - divId (if need to create paper)
 *    - paper (if div already created)
 *    - bounding box (if paper already created)
 *    - icons (an array of icon names)
 *    - vertMargin (in pixels)
 *    - theme (default: DEFAULT)
 */
glift.displays.gui.iconBar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      vertMargin = options.vertMargin || 0,
      horzMargin = options.horzMargin || 0,
      themeName = options.theme || 'DEFAULT';
  if (divId === undefined) {
    throw "Must define an options 'divId' as an option";
  }
  for (var i = 0; i < icons.length; i++) {
    if (glift.displays.gui.icons[icons[i]] === undefined) {
      throw "Icon string undefined in glift.displays.gui.icons [" +
          icons[i] + "]";
    }
  }
  return new IconBar(divId, themeName, icons, vertMargin, horzMargin).draw();
};

var IconBar = function(divId, themeName, iconNames, vertMargin, horzMargin) {
  this.divId = divId;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.iconNames = iconNames; // array of names
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.newIconBboxes = {}; // initialized by draw
  this.svg = undefined; // initialized by draw
  this.tempIconIds = []; // from addTempIcon.
};

IconBar.prototype = {
  /**
   * Draw the IconBar!
   */
  draw: function() {
    this.destroy();
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svg = d3.select('#' + this.divId).append("svg")
            .attr("width", '100%')
            .attr("height", '100%'),
        gui = glift.displays.gui,
        iconBboxes = [],
        iconStrings = [],
        indicesData = [],
        point = glift.util.point;
    this.svg = svg;

    for (var i = 0; i < this.iconNames.length; i++) {
      var name = this.iconNames[i];
      var iconData = gui.icons[name];
      iconStrings.push(iconData.string);
      iconBboxes.push(glift.displays.bboxFromPts(
          point(iconData.bbox.x, iconData.bbox.y),
          point(iconData.bbox.x2, iconData.bbox.y2)));
      indicesData.push(i);
    }

    // Row center returns: { transforms: [...], bboxes: [...] }
    var centerObj = glift.displays.gui.rowCenter(
        divBbox, iconBboxes, this.vertMargin, this.horzMargin, 0, 0);
    for (var i = 0; i < centerObj.bboxes.length; i++) {
      this.newIconBboxes[this.iconNames[i]] = centerObj.bboxes[i];
    }

    var that = this;
    svg.selectAll('icons').data(indicesData)
      .enter().append('path')
        .attr('d', function(i) { return iconStrings[i]; })
        .attr('fill', this.theme.icons['DEFAULT'].fill)
        .attr('id', function(i) { return that.iconId(that.iconNames[i]); })
        .attr('transform', function(i) {
          return glift.displays.gui.scaleAndMoveString(
              centerObj.bboxes[i], centerObj.transforms[i]);
        });

    var bboxes = centerObj.bboxes;
    svg.selectAll('buttons').data(indicesData)
      .enter().append('rect')
        .attr('x', function(i) { return bboxes[i].topLeft().x(); })
        .attr('y', function(i) { return bboxes[i].topLeft().y(); })
        .attr('width', function(i) { return bboxes[i].width(); })
        .attr('height', function(i) { return bboxes[i].height(); })
        .attr('fill', 'blue') // doesn't matter the color.
        .attr('opacity', 0)
        .attr('_icon', function(i) { return that.iconNames[i]; })
        .attr('id', function(i) { return that.buttonId(that.iconNames[i]); });
    return this;
  },

  addTempIcon: function(bbox, iconName, color) {
    var icon = glift.displays.gui.icons[iconName];
    var iconBbox = glift.displays.bboxFromPts(
        glift.util.point(icon.bbox.x, icon.bbox.y),
        glift.util.point(icon.bbox.x2, icon.bbox.y2));
    var that = this;
    var id = that.iconId(iconName);
    var centerObj = glift.displays.gui.centerWithin(bbox, iconBbox, 2, 2);
    this.svg.append('path')
      .attr('d', icon.string)
      .attr('fill', color) // that.theme.icons['DEFAULT'].fill)
      .attr('id', that.iconId(iconName))
      .attr('class', 'tempIcon')
      .attr('transform', glift.displays.gui.scaleAndMoveString(
          centerObj.bbox, centerObj.transform));
    this.tempIconIds.push(id);
    return this;
  },

  addTempText: function(bbox, text, color) {
    var fontSize = bbox.width() * .54;
    var boxStrokeWidth = 7
    this.svg.append('text')
      .text(text)
      .attr('fill', color)
      .attr('stroke', color)
      .attr('class', 'tempIcon')
      .attr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .attr('font-size', fontSize + 'px')
      .attr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .attr('y', bbox.center().y()) //+ fontSize)
      .attr('dy', '.33em') // Move down, for centering purposes
      .attr('style', 'text-anchor: middle; vertical-align: middle;')
      // .attr('textLength', bbox.width() - (2 * boxStrokeWidth) + 'px')
      .attr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    return this;
  },

  destroyTempIcons: function() {
    this.svg.selectAll('.tempIcon').remove();
    this.tempIconIds = [];
    return this;
  },

  /**
   * Get the Element ID of the Icon.
   */
  iconId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.ICON, iconName);
  },

  /**
   * Get the Element ID of the button.
   */
  buttonId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
  },

  /**
   * Assign an event handler to the icon named with 'iconName'.  Note, that the
   * function 'func' will always be sent the object resulting from getIcon,
   * namely,
   *
   * {
   *  name: name of the icon
   *  iconId: the element id of the icon (for convenience).
   * }
   */
  setEvent: function(event, iconName, func) {
    var that = this; // not sure if this is necessary
    d3.select('#' + this.buttonId(iconName))
      .on(event, function() { func(that.getIcon(iconName)); });
    return this;
  },

  /**
   * Convenience mothod for adding hover events.  Equivalent to adding mouseover
   * and mouseout.
   */
  setHover: function(name, hoverin, hoverout) {
    this.setEvent('mouseover', name, hoverin);
    this.setEvent('mouseout', name, hoverout);
  },

  /**
   * Return whether the iconBar has instantiated said icon or not
   */
  hasIcon: function(name) {
    return this.newIconBboxes[name] === undefined;
  },

  /**
   * Return a simple object containing the
   *
   * {
   *  name: name of the icon
   *  iconId: the element id of the icon (for convenience)
   * }
   */
  getIcon: function(name) {
    return {
      name: name,
      iconId: this.iconId(name),
      newBbox: this.newIconBboxes[name]
    };
  },

  /**
   * Convenience method to loop over each icon, primarily for the purpose of
   * adding events.
   */
  forEachIcon: function(func) {
    for (var i = 0; i < this.iconNames.length; i++) {
      func(this.getIcon(this.iconNames[i]));
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && d3.select('#' + this.divId).selectAll("svg").remove();
    return this;
  }
};

})();
/**
 * Icons taken from: http://raphaeljs.com/icons
 *
 * The bounding boxes are precalculated by running BboxFinder.html
 *
 * Current supported icons:
 */
glift.displays.gui.icons = {
   // http://raphaeljs.com/icons/#cross
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
  undo: {
    string: "M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z",
    bbox: {"x":0.875,"y":6.817,"x2":29.54,"y2":27.042158,"width":28.665,"height":20.225158}
  },

  // http://raphaeljs.com/icons/#arrowright2
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
  'chevron-left': {
    string: "M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z",
    bbox: { "x":8.612,"y":6.276,"x2":21.871,"y2":25.725,"width":13.259,"height":19.449
    }
  },

  // http://raphaeljs.com/icons/#smallgear
  'small-gear': {
    string: "M31.229,17.736c0.064-0.571,0.104-1.148,0.104-1.736s-0.04-1.166-0.104-1.737l-4.377-1.557c-0.218-0.716-0.504-1.401-0.851-2.05l1.993-4.192c-0.725-0.91-1.549-1.734-2.458-2.459l-4.193,1.994c-0.647-0.347-1.334-0.632-2.049-0.849l-1.558-4.378C17.165,0.708,16.588,0.667,16,0.667s-1.166,0.041-1.737,0.105L12.707,5.15c-0.716,0.217-1.401,0.502-2.05,0.849L6.464,4.005C5.554,4.73,4.73,5.554,4.005,6.464l1.994,4.192c-0.347,0.648-0.632,1.334-0.849,2.05l-4.378,1.557C0.708,14.834,0.667,15.412,0.667,16s0.041,1.165,0.105,1.736l4.378,1.558c0.217,0.715,0.502,1.401,0.849,2.049l-1.994,4.193c0.725,0.909,1.549,1.733,2.459,2.458l4.192-1.993c0.648,0.347,1.334,0.633,2.05,0.851l1.557,4.377c0.571,0.064,1.148,0.104,1.737,0.104c0.588,0,1.165-0.04,1.736-0.104l1.558-4.377c0.715-0.218,1.399-0.504,2.049-0.851l4.193,1.993c0.909-0.725,1.733-1.549,2.458-2.458l-1.993-4.193c0.347-0.647,0.633-1.334,0.851-2.049L31.229,17.736zM16,20.871c-2.69,0-4.872-2.182-4.872-4.871c0-2.69,2.182-4.872,4.872-4.872c2.689,0,4.871,2.182,4.871,4.872C20.871,18.689,18.689,20.871,16,20.871z",
    bbox: {
      "x":0.667,"y":0.667,"x2":31.333,"y2":31.333,"width":30.666,"height":30.666
    }
  },

  // http://raphaeljs.com/icons/#talke
  'question-bubble': {
    string: "M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.982,21.375h-1.969v-1.889h1.969V21.375zM16.982,17.469v0.625h-1.969v-0.769c0-2.321,2.641-2.689,2.641-4.337c0-0.752-0.672-1.329-1.553-1.329c-0.912,0-1.713,0.672-1.713,0.672l-1.12-1.393c0,0,1.104-1.153,3.009-1.153c1.81,0,3.49,1.121,3.49,3.009C19.768,15.437,16.982,15.741,16.982,17.469z",
    bbox: {
      "x":2,"y":4.938,"x2":30,"y2":25.938,"width":28,"height":21
    }
  },

  // http://raphaeljs.com/icons/#roadmap
  roadmap: {
    string: "M23.188,3.735c0-0.975-0.789-1.766-1.766-1.766s-1.766,0.791-1.766,1.766s1.766,4.267,1.766,4.267S23.188,4.71,23.188,3.735zM20.578,3.734c0-0.466,0.378-0.843,0.844-0.843c0.467,0,0.844,0.377,0.844,0.844c0,0.466-0.377,0.843-0.844,0.843C20.956,4.578,20.578,4.201,20.578,3.734zM25.281,18.496c-0.562,0-1.098,0.046-1.592,0.122L11.1,13.976c0.199-0.181,0.312-0.38,0.312-0.59c0-0.108-0.033-0.213-0.088-0.315l8.41-2.239c0.459,0.137,1.023,0.221,1.646,0.221c1.521,0,2.75-0.485,2.75-1.083c0-0.599-1.229-1.083-2.75-1.083s-2.75,0.485-2.75,1.083c0,0.069,0.021,0.137,0.054,0.202L9.896,12.2c-0.633-0.188-1.411-0.303-2.265-0.303c-2.088,0-3.781,0.667-3.781,1.49c0,0.823,1.693,1.489,3.781,1.489c0.573,0,1.11-0.054,1.597-0.144l11.99,4.866c-0.19,0.192-0.306,0.401-0.306,0.623c0,0.188,0.096,0.363,0.236,0.532L8.695,25.415c-0.158-0.005-0.316-0.011-0.477-0.011c-3.241,0-5.87,1.037-5.87,2.312c0,1.276,2.629,2.312,5.87,2.312c3.241,0,5.87-1.034,5.87-2.312c0-0.22-0.083-0.432-0.229-0.633l10.265-5.214c0.37,0.04,0.753,0.066,1.155,0.066c2.414,0,4.371-0.771,4.371-1.723C29.65,19.268,27.693,18.496,25.281,18.496z",
    bbox: {
      "x":2.348,"y":1.969,"x2":29.65,"y2":30.028,"width":27.302,"height":28.059
    }
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
  end: {
    string: "M21.167,5.5,21.167,13.681,6.684,5.318,6.684,25.682,21.167,17.318,21.167,25.5,25.5,25.5,25.5,5.5z",
    bbox: {"x":6.684,"y":5.318,"x2":25.5,"y2":25.682,"width":18.816,"height":20.364}
  },

  // http://raphaeljs.com/icons/#start
  start: {
    string: "M24.316,5.318,9.833,13.682,9.833,5.5,5.5,5.5,5.5,25.5,9.833,25.5,9.833,17.318,24.316,25.682z",
    bbox: {"x":5.5,"y":5.318,"x2":24.316,"y2":25.682,"width":18.816,"height":20.364}
  },

  // http://raphaeljs.com/icons/#arrowup
  arrowup: {
    string: "M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z",
    bbox: {"x":7.684895,"y":8.56825,"x2":24.315105,"y2":23.432,"width":16.630209,"height":14.86375}
  },

  // http://raphaeljs.com/icons/#arrowright
  arrowright: {
    string: "M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z",
    bbox: {"x":8.568,"y":7.684457,"x2":23.4315,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

  // http://raphaeljs.com/icons/#arrowleft
  arrowleft: {
    string: "M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z",
    bbox: {"x":8.5685,"y":7.684457,"x2":23.432,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

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

  // My own creation
  twostones: {
    string: "m 42.894737,29.335869 c 0,6.540213 -5.301891,11.842106 -11.842105,11.842106 -6.540214,0 -11.842105,-5.301893 -11.842105,-11.842106 0,-6.540214 5.301891,-11.842105 11.842105,-11.842105 6.540214,0 11.842105,5.301891 11.842105,11.842105 z M 31.052632,16.309553 c -7.194236,0 -13.026316,5.83208 -13.026316,13.026316 0,7.194233 5.83208,13.026314 13.026316,13.026314 3.733917,0 7.098575,-1.575815 9.473684,-4.092928 2.375029,2.516206 5.740532,4.092928 9.473684,4.092928 7.194235,0 13.026316,-5.832081 13.026316,-13.026314 0,-7.194236 -5.832081,-13.026316 -13.026316,-13.026316 -3.733152,0 -7.098655,1.56932 -9.473684,4.085526 -2.374906,-2.51483 -5.741698,-4.085526 -9.473684,-4.085526 z",
    bbox: {"x":18.026316,"y":16.309553,"x2":63.026316,"y2":42.362183,"width":45,"height":26.05263}
  },

  // http://raphaeljs.com/icons/#ff
  ff: {
    string: "M25.5,15.5,15.2,9.552,15.2,15.153,5.5,9.552,5.5,21.447,15.2,15.847,15.2,21.447z",
    bbox: {}
  },

  // http://raphaeljs.com/icons/#rw
  rw: {
    string: "M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z",
    bbox: {}
  }
};
/**
 * Get the scaling string based on the raphael bbox and the scaling object.
 * This scales the object, with the scale centered at the top left.
 *
 * The arguments ar a scaling object and an object bounding box.
 *
 * The Bounding Box is the original bounding box.  It's used to specify the
 * center of the scale operation.
 *
 * The scaleObject looks like the following:
 *  {
 *    scale: num,
 *    xMove: num,
 *    yMove: num
 *  }
 *
 * Returned is the transformation string. To apply, one only needs to set the
 * transform attribute on the SVG element, e.g.,
 *    d3.select('foo').attr('transform', transformString);
 */
glift.displays.gui.scaleAndMoveString = function(objBbox, scaleObj) {
  return 'translate(' + scaleObj.xMove + ',' + scaleObj.yMove + ') ' +
    'scale(' + scaleObj.scale + ')';
};
/**
 * A simple object representing a DivSplit.
 */
glift.displays.gui.DivSplit = function(id, start, length) {
  this.id = id;
  this.start = start;
  this.length = length;
};

/**
  * Take a div, create multiple sub divs, absolutely positioned.
  *
  * divId: divId to be split.
  * percents: Precent tall that each section is.  Note that the length of this
  * == the number of splits - 1;
  *
  * direction: defaults to 'horizontal'.  Also can split 'vertical'-ly.
  *
  * Note:
  *  X => XX (vertical split)
  *
  *  X => X  (horizontal split)
  *       X
  *
  * return: an array of useful div info:
  *  [{
  *    id: foo
  *    start: 0 // top for horz, left for vert
  *    length: 100 // height for horz, width for vert
  *  }, {...}
  *  ]
  */
glift.displays.gui.splitDiv = function(divId, percents, direction) {
  var bbox = glift.displays.bboxFromDiv(divId),
      totalPercent = 0;
  if (!direction) {
    direction = 'horizontal';
  } else if (direction !== 'vertical' && direction !== 'horizontal') {
    direction = 'horizontal'
  }

  for (var i = 0; i < percents.length; i++) {
    totalPercent += percents[i];
  }

  if (totalPercent > 1 || totalPercent < 0) {
    throw 'Percents must sum to a number be between 0 and 1.' +
        'Was ' + totalPercent;
  }
  percents.push(1 - totalPercent); // Add in last value.

  // Create Data for D3.
  var boxData = [];
  var currentStart = direction === 'horizontal' ? bbox.top() : bbox.left();
  var maxAmount = direction === 'horizontal' ? bbox.height() : bbox.width();
  for (var i = 0; i < percents.length; i++) {
    boxData.push(new glift.displays.gui.DivSplit(
      'glift_internal_div_' + glift.util.idGenerator.next(),
      currentStart, // e.g., Top
      maxAmount * percents[i] // e.g., Height
    ));
    currentStart = currentStart + maxAmount * percents[i];
  }

  for (var i = 0; i < boxData.length; i++) {
    // TODO(kashomon): Replace with d3 for uniformity
    $('#' + divId).append('<div id="' + boxData[i].id + '"></div>');
    var cssObj = {
      width: direction === 'horizontal' ? '100%' : boxData[i].length,
      height: direction === 'horizontal' ? boxData[i].length : '100%',
      position: 'absolute'
    };
    var posKey =  (direction === 'horizontal' ? 'top' : 'left' )
    cssObj[posKey] = boxData[i].start;
    $('#' + boxData[i].id).css(cssObj);
  }
  return boxData;
};

glift.displays.gui.repack = function() {
};
/**
 * Objects and methods that enforce the basic rules of Go.
 */
glift.rules = {};
(function(){
glift.rules.goban = {
  /**
   * Create a Goban instance, just with intersections.
   */
  getInstance: function(intersections) {
    var ints = intersections || 19;
    return new Goban(ints);
  },

  /**
   * Create a goban, from a move tree and (optionally) a treePath, which defines
   * how to get from the start to a given location.  Usually, the treePath is
   * the initialPosition, but not necessarily.
   *
   * returns:
   *  {
   *    goban: Goban,
   *    stoneDeltas: [StoneDelta, StoneDelta, ...]
   *  }
   */
  getFromMoveTree: function(mt, treepath) {
    var goban = new Goban(mt.getIntersections()),
        movetree = mt.getTreeFromRoot(),
        treepath = treepath || [],
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
  if (ints <= 0) throw "Intersections must be greater than 0";
  this.ints = ints;
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
      for (var j = 0; j < placements.length; j++) {
        this._loadStone({point: placements[j], color: color}, captures);
      }
    }
    this._loadStone(movetree.properties().getMove(), captures);
    return captures;
  },

  _loadStone: function(mv, captures) {
    // note: if mv is defined, but mv.point is undefined, this is a PASS.
    if (mv !== glift.util.none && mv.point !== undefined) {
      var result = this.addStone(mv.point, mv.color);
      if (result.successful) {
        var oppositeColor = glift.util.colors.oppositeColor(mv.color);
        for (var k = 0; k < result.captures.length; k++) {
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
  },

  // for debug, of course =)
  _debug: function() {
    glift.util.logz(this.stones);
  }
}

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
(function() {
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
 *
 * In the points array, each must object contain a point, and each should contain a
 * mark or a stone.  There can only be a maximum of one stone and one mark
 * (glift.enums.marks).
 */

glift.rules.intersections = {
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
  // methods and whatnot.  It's getting far too complicated.
  basePropertyData: function(movetree, problemConditions) {
    var out = {
      stones: {
        WHITE: [],
        BLACK: [],
        EMPTY: []
      },
      marks: {},
      comment: glift.util.none,
      lastMove: glift.util.none,
      nextMoves: [],
      correctNextMoves: [],
      captures: [],
      displayDataType: glift.enums.displayDataTypes.PARTIAL
    };
    out.comment = movetree.properties().getComment();
    out.lastMove = movetree.getLastMove();
    out.marks = glift.rules.intersections.getCurrentMarks(movetree);
    out.nextMoves = movetree.nextMoves();
    out.correctNextMoves = problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree, problemConditions)
        : [];
    return out;
  },

  /**
   * Extends the basePropertyData with stone data.
   */
  getFullBoardData: function(movetree, goban, problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
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
  nextBoardData: function(movetree, currentCaptures, problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
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
      problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
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
   */
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.rules.intersections.propertiesToMarks) {
      var mark = glift.rules.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          var pt = {}, value = true;
          if (prop === glift.sgf.allProperties.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point
            marksToAdd.push(glift.util.pointFromSgfCoord(data[i]));
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  }
};

})();
(function() {
glift.rules.movenode = function(properties, children) {
  return new MoveNode(properties, children);
};

var MoveNode = function(properties, children) {
  this._properties = properties || glift.rules.properties();
  this.children = children || [];
  // TODO(kashomon): NodeId should be assignable on creation.
  this._nodeId = { nodeNum: 0, varNum: 0 };
};

MoveNode.prototype = {
  properties:  function() {
    return this._properties;
  },

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
  getNodeNum: function() {
    return this._nodeId.nodeNum
  },

  /**
   * Get the variation number.
   */
  getVarNum: function() {
    return this._nodeId.varNum
  },

  /**
   * Get the number of children.  This the same semantically as the number of
   * variations.
   */
  numChildren: function() {
    return this.children.length;
  },

  /**
   * Add a new child node.
   */
  addChild: function() {
    this.children.push(glift.rules.movenode()._setNodeId(
        this.getNodeNum() + 1, this.numChildren()));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * movetree.
   */
  getChild: function(variationNum) {
    if (variationNum === undefined) {
      return this.children[0];
    } else {
      return this.children[variationNum];
    }
  },

  /**
   * Renumber the nodes.  Useful for when nodes are deleted during SGF editing.
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

})();
(function() {
var util = glift.util;
var enums = glift.enums;

/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 *  _history: [MoveNode, MoveNode, ... ]
 *}
 *
 * And where a MoveNode looks like the following:
 * MoveNode: {
 *    nodeId: { ... }
 *    properties: Properties
 *    children: [MoveNode, MoveNode, MoveNode]
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
   * Create an empty MoveTree
   */
  getInstance: function(intersections) {
    var mt = new MoveTree(glift.rules.movenode());
    if (intersections !== undefined) {
      mt.setIntersections(intersections);
    }
    return mt;
  },

  /**
   * Create a MoveTree from an SGF.
   */
  getFromSgf: function(sgfString, initPosition) {
    initPosition = initPosition || []; // treepath.
    if (sgfString === undefined || sgfString === "") {
      return glift.rules.movetree.getInstance(19);
    }
    // var mt = new MoveTree(glift.sgf.parser.parse($.trim(sgfString)));
    var mt = glift.sgf.parse(sgfString);
    for (var i = 0; i < initPosition.length; i++) {
      mt.moveDown(initPosition[i]);
    }
    return mt;
  },

  /**
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   */
  getFromNode: function(node) {
    return new MoveTree(node);
  },

  /**
   * Seach nodes with a Depth First Search.
   */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      glift.rules.movetree.searchMoveTreeDFS(moveTree.moveDown(i), func);
    }
    moveTree.moveUp();
  }
};

/**
 * A MoveTree is a history (a tree) of the past nodes played.  The movetree is
 * (usually) a processed parsed SGF, but could be created organically.
 *
 * The tree itself is tree structure made out of MoveNodes.
 *
 * Semantically, a MoveTree can be thought of as a game.  Thus, this is the
 * place where such moves as currentPlayer or lastMove.
 */
var MoveTree = function(rootNode) {
  // The moveHistory serves two purposes -- it allows travel backwards (i.e.,
  // up the tree), and it gives the current move, which is the last move in the
  // array.
  //
  // Really, this exists so that we don't have to make the nodes have to know
  // about their parent node.  It would be nice to know linkkkkk
  // Unfortunately, there's not good way to do this at parsing time, as far as I
  // know.
  this._nodeHistory = [];
  this._nodeHistory.push(rootNode);
};

MoveTree.prototype = {
  /**
   * Get a new move tree instance from the node history.  Note, that this still
   * refers to the same movetree -- the current position is just changed.
   */
  getTreeFromRoot: function() {
    return glift.rules.movetree.getFromNode(this._nodeHistory[0]);
  },

  /**
   * Get the current node -- that is, the node at the current position.
   */
  node: function() {
    return this._nodeHistory[this._nodeHistory.length - 1];
  },

  /**
   * Get the properties object on the current node.
   */
  properties: function() {
    return this.node().properties();
  },

  /**
   * Given a point and a color, find the variation number corresponding to the
   * branch that has the sepceified move.
   *
   * return either the number or glift.util.none;
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
      return util.none;
    }
  },

  /**
   * Get the last move ([B] or [W]). This is a convenience method, since it
   * delegates to properties().getMove();
   *
   * Returns a simple object:
   *  {
   *    color:
   *    point:
   *  }
   *
   * returns glift.util.none if property doesn't exist.  There are two cases
   * where this can occur:
   *  - The root node.
   *  - When, in the middle of the game, stone-placements are added for
   *  illustration (AW,AB).
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * Get the next moves (i.e., nodes with either B or W properties);
   *
   * returns an array of dicts with the moves, e.g.,
   *
   *  [{
   *    color: <BLACK or WHITE>
   *    point: point
   *  },
   *  {...}]
   *
   *  The ordering of the moves is guranteed to be the ordering of the
   *  variations at the time of creation.
   */
  nextMoves: function() {
    var curNode = this.node();
    var nextMoves = [];
    for (var i = 0; i < curNode.numChildren(); i++) {
      var nextNode = curNode.getChild(i);
      var move = nextNode.properties().getMove();
      if (move !== glift.util.none) {
        nextMoves.push(move);
      }
    }
    return nextMoves;
  },

  /**
   * Get the current player.  This is exactly the opposite of the last move that
   * was played -- i.e., the move on the current node.
   */
  getCurrentPlayer: function() {
    var move = this.properties().getMove();
    if (move === util.none) {
      return enums.states.BLACK;
    } else if (move.color === enums.states.BLACK) {
      return enums.states.WHITE;
    } else if (move.color === enums.states.WHITE) {
      return enums.states.BLACK;
    } else {
      // TODO(kashomon): This is not the right way to do this.  Really, we need
      // to traverse up the tree until we see a color, and return the opposite.
      // If we reach the root, _then_ we can return BLACK.
      return enums.states.BLACK;
    }
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   */
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.node().getChild(num) !== undefined) {
      var next = this.node().getChild(num);
      this._nodeHistory.push(next);
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not in the intial (0th) move.
   */
  moveUp: function() {
    if (this._nodeHistory.length > 1) {
      this._nodeHistory.pop();
    }
    return this;
  },

  // Move to the root node
  moveToRoot: function() {
    this._nodeHistory = this._nodeHistory.slice(0,1);
    return this;
  },

  /**
   * Add a newNode and move to that position.  This is convenient becuase it
   * means you can start adding properties.
   */
  addNode: function() {
    this.node().addChild();
    this.moveDown(this.node().numChildren() - 1);
    return this;
  },

  // TODO(kashomon): Finish this.
  deleteCurrentNode: function() {
    // var nodeId = glift.rules.movetree.getNodeId();
    // VarNum = this.getVarNum();
    // this.moveUp();
    // var theMoves = this.getAllNextNodes();
    //delete theMoves(nodeId,VarNum); // This is currently a syntax error
    throw "Unfinished";
  },

  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  // TODO(kashomon): Add this.
  toSgf: function() {
    var out = "";
    for (var propKey in this.getAllProps()) {
      //TODO
    }
  },

  debugLog: function(spaces) {
    if (spaces === undefined) {
      spaces = "  ";
    }
    glift.util.logz(spaces + this.node(i).getVarNum() + '-'
        + this.node(i).getNodeNum());
    for (var i = 0; i < this.node().numChildren(); i++) {
      this.moveDown(i);
      this.debugLog(spaces);
      this.moveUp();
    }
  },

  //---------------------//
  // Convenience methods //
  //---------------------//
  setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (!mt.properties().contains(allProperties.SZ)) {
      this.properties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (mt.properties().contains(allProperties.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(allProperties.SZ));
      return ints;
    } else {
      return undefined;
    }
  }
};
})();
glift.rules.problems = {
  /**
   * Determines if a 'move' is correct. Takes a movetree and a series of
   * conditions, which is a map of properties to an array of possible substring
   * matches.  Only one conditien must be met
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
        var newmt = glift.rules.movetree.getFromNode(movetree.node());
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
        return problemResults.CORRECT;
      } else if (successTracker[problemResults.CORRECT] &&
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
var util = glift.util;
var enums = glift.enums;

glift.rules.properties = function(map) {
  return new Properties(map);
};

var Properties = function(map) {
  if (map === undefined) {
    this.propMap = {};
  } else {
    this.propMap = map;
  }
}

Properties.prototype = {
  /**
   * Add an SGF Property to the current move. Return the 'this', for
   * convenience, so that you can chain addProp calls.
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
    if (glift.sgf.allProperties[prop] === undefined) {
      throw "Can't add undefined properties";
    } else if (util.typeOf(value) !== 'string' &&
        util.typeOf(value) !== 'array') {
      // The value has to be either a string or an array.
      value = value.toString();
    }
    value = util.typeOf(value) === 'string' ? [value] : value;

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(value);
    } else {
      this.propMap[prop] = value;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key
   */
  getAllValues: function(strProp) {
    if (glift.sgf.allProperties[strProp] === undefined) {
      return util.none; // Not a valid Property
    } else if (this.propMap[strProp] !== undefined) {
      return this.propMap[strProp];
    } else {
      return util.none;
    }
  },

  /**
   * Get one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the getOneValue() always returns an array, it's sometimes useful to
   * return the first property in the list.  Like getOneValue(), if a property
   * or value can't be found, util.none is returned.
   */
  getOneValue: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.getAllValues(strProp);
    if (arr !== util.none && arr.length >= 1) {
      return arr[index];
    } else {
      return util.none;
    }
  },

  /**
   * Get a value from a property and return the point representation.
   * Optionally, the user can provide an index, since each property points to an
   * array of values.
   */
  getAsPoint: function(strProp, index) {
    var out = this.getOneValue(strProp, index);
    if (out === util.none) {
      return out;
    } else {
      return glift.util.pointFromSgfCoord(out);
    }
  },

  /**
   * contains: Return true if the current move has the property "prop".  Return
   * false otherwise.
   */
  contains: function(prop) {
    return this.getAllValues(prop) !== util.none;
  },

  /** Delete the prop and return the value. */
  remove: function(prop) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      delete this.propMap[prop];
      return allValues;
    } else {
      return util.none;
    }
  },

  /**
   * Sets current value, even if the property already exists.
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [value]
      } else if (glift.util.typeOf(value) === 'array') {
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
    var prop = "";
    if (color === enums.states.BLACK) {
      prop = glift.sgf.allProperties.AB;
    } else if (color === enums.states.WHITE) {
      prop = glift.sgf.allProperties.AW;
    }
    if (prop === "" || !this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  getComment: function() {
    if (this.contains('C')) {
      return this.getOneValue('C');
    } else {
      return util.none;
    }
  },

  /**
   * Get the current Move.  Returns util.none if no move exists.
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
      return glift.util.none;
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
        for (var i = 0; i < allValues.length; i++) {
          for (var j = 0; j < substrings.length; j++) {
            var value = allValues[i];
            var substr = substrings[j];
            if (value.indexOf(substr) !== -1) {
              return true;
            }
          }
        }
      }
    }
    return false
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
    if (move != util.none && move.point !== undefined) {
      out[move.color].push(move.point);
    }
    return out;
  }
};

})();
/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem.
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
 * The init position returned is an array of variation numbers traversed through.
 * The move number is precisely the length of the array.
 *
 * So:
 * 0       becomes []
 * 1       becomes [0]
 * 0.1     becomes [1]
 * 53      becomes [0,0,0,...,0] (53 times)
 * 2.3     becomes [0,0,3]
 * 0.0.0.0 becomes [0,0,0,0]
 * 2.3-4.1 becomes [0,0,3,0,1]
 */
glift.rules.treepath = {
  parseInitPosition: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = "" + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return initPos;
    } else if (glift.util.typeOf(initPos) === 'string') {

    } else {
      return [];
    }

    var out = [];
    var lastNum = 0;
    var sect = initPos.split('-');
    for (var i = 0; i < sect.length; i++) {
      var v = sect[i].split('\.');
      for (var j = 0; j < v[0] - lastNum; j++) {
        out.push(0);
      }
      var lastNum = v[0];
      for (var j = 1; j < v.length; j++) {
        out.push(parseInt(v[j]));
        lastNum++;
      }
    }
    return out;
  },

  // Flatten the move tree variations into a list of lists, where the sublists
  // are each a treepath
  //
  // TODO(kashomon): Why does this exist?
  flattenMoveTree: function(movetree) {
    var out = [];
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
 * sgf_grammar.js: sgf parser generated, generated from the pegjs grammar.
 *  -> This is called with glift.rules.parser.parse(...);
 *
 * sgf_grammar.pegjs. To regenerate the parser from the peg grammar, use
 * depgen.py.
 */
glift.sgf = {
  colorToToken: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'W';
    } else if (color === glift.enums.states.BLACK) {
      return 'B';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  allSgfCoordsToPoints: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.util.pointFromSgfCoord(arr[i]));
    }
    return out;
  },

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
  },

  pointToSgfCoord: function(pt) {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(pt.x() +  a) + String.fromCharCode(pt.y() + a);
  }
};
/**
 * The new Glift SGF parser!
 * Takes a string, returns a movetree.
 */
glift.sgf.parse = function(sgfString) {
  var states = {
    BEGINNING: 1,
    PROPERTY: 2, // e.g., 'AB[oe]' or 'A_B[oe]' or 'AB_[oe]'
    PROP_DATA: 3, // 'AB[o_e]'
    BETWEEN: 4 // 'AB[oe]_', '_AB[oe]'
  };
  var statesToString = {
    1: 'BEGINNING',
    2: 'PROPERTY',
    3: 'PROP_DATA',
    4: 'BETWEEN'
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

  var curstate = states.BEGINNING;
  var movetree = glift.rules.movetree.getInstance();
  var charBuffer = []; // List of characters.
  var propData = []; // List of Strings.
  var branchMoveNums = []; // used for when we pop up.
  var curProp = '';
  var curchar = '';
  var i = 0; // defined here for closing over
  var lineNum = 0;
  var colNum = 0;

  var perror = function(msg) {
    glift.sgf.parseError(lineNum, colNum, curchar, msg);
  };

  var flushCharBuffer = function() {
    var strOut = charBuffer.join("");
    charBuffer = [];
    return strOut;
  };

  var flushPropDataIfNecessary = function() {
    if (curProp.length > 0) {
      movetree.properties().add(curProp, propData);
      propData = [];
      curProp = '';
    }
  };

  var nextChar = function() {
    i++;
    i === sgfString.length ||
        perror("Reached end of input, but expected a character.");
    return sgfString.charAt(i);
  };

  (function() {
    // Run everything inside an anonymous function so we can use 'return' as a
    // fullstop break.
    for (var i = 0; i < sgfString.length; i++) {
      colNum++; // This means that columns are 1 indexed.
      curchar = sgfString.charAt(i);

      if (curchar === "\n" && curstate !== states.PROP_DATA) {
        lineNum++;
        colNum = 0;
        continue;
      }
      // glift.util.logz('i[' + i + '] -- ' + statesToString[curstate]
      //    + ' -- char[' + char + ']');
      switch (curstate) {
        case states.BEGINNING:
          if (curchar === syn.LPAREN || wsRegex.test(curchar)) {
            branchMoveNums.push(movetree.node().getNodeNum()); // Should Be 0.
          } else if (curchar === syn.SCOLON) {
            curstate = states.BETWEEN; // The SGF Begins!
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror("Unexpected character");
          }
          break;
        case states.PROPERTY:
          if (propRegex.test(curchar)) {
            charBuffer.push(curchar);
            if (charBuffer.length > 2) {
              perror("Expected: length two proprety. Found: " + charBuffer);
            }
          } else if (curchar === syn.LBRACE) {
            curProp = flushCharBuffer();
            if (glift.sgf.allProperties[curProp] === undefined) {
              perror('Unknown property: ' + curProp);
            }
            curstate = states.PROP_DATA;
          } else if (wsRegex.test(curchar)) {
            // Should whitespace be allowed here?
            perror('Unexpected whitespace in Property')
          } else {
            perror('Unexpected character');
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
              perror("Unexpected token.  Orphan property data.");
            }
          } else if (curchar === syn.LPAREN) {
            flushPropDataIfNecessary();
            branchMoveNums.push(movetree.node().getNodeNum());
          } else if (curchar === syn.RPAREN) {
            flushPropDataIfNecessary();
            if (branchMoveNums.length === 0) {
              while (movetree.node().getNodeNum() !== 0) {
                movetree.moveUp(); // Is this necessary?
              }
              return movetree;
            }
            var parentBranchNum = branchMoveNums.pop();
            while (movetree.node().getNodeNum() !== parentBranchNum) {
              movetree.moveUp();
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
        default:
          perror("Fatal Error: Unknown State!"); // Shouldn't get here.
      }
    }
    if (movetree.node().getNodeNum() !== 0) {
      perror('Expected to end up at start.');
    }
  })();
  return movetree;
};

/**
 * Throw a parser error.  The message is optional.
 */
glift.sgf.parseError =  function(lineNum, colNum, curchar, message) {
  var err = 'SGF Parsing Error: At line [' + lineNum + '], column [' + colNum
      + '], char [' + curchar + '], ' + message;
  glift.util.logz(err); // Should this error be logged this way?
  throw err;
};
// The allProperties object is used to check to make sure that a given property is
// actually a real property
glift.sgf.allProperties = {
AB: "AB", AE: "AE", AN: "AN", AP: "AP", AR: "AR", AS: "AS", AW: "AW", B: "B",
BL: "BL", BM: "BM", BR: "BR", BS: "BS", BT: "BT", C: "C", CA: "CA", CH: "CH",
CP: "CP", CR: "CR", DD: "DD", DM: "DM", DO: "DO", DT: "DT", EL: "EL", EV: "EV",
EX: "EX", FF: "FF", FG: "FG", GB: "GB", GC: "GC", GM: "GM", GN: "GN", GW: "GW",
HA: "HA", HO: "HO", ID: "ID", IP: "IP", IT: "IT", IY: "IY", KM: "KM", KO: "KO",
L: "L", LB: "LB", LN: "LN", LT: "LT", M: "M", MA: "MA", MN: "MN", N: "N", OB:
"OB", OH: "OH", OM: "OM", ON: "ON", OP: "OP", OT: "OT", OV: "OV", OW: "OW", PB:
"PB", PC: "PC", PL: "PL", PM: "PM", PW: "PW", RE: "RE", RG: "RG", RO: "RO", RU:
"RU", SC: "SC", SE: "SE", SI: "SI", SL: "SL", SO: "SO", SQ: "SQ", ST: "ST", SU:
"SU", SZ: "SZ", TB: "TB", TC: "TC", TE: "TE", TM: "TM", TR: "TR", TW: "TW", UC:
"UC", US: "US", V: "V", VW: "VW", W: "W", WL: "WL", WR: "WR", WS: "WS", WT: "WT"
};
/*
 * The controllers logical parts (the Brains!) of a Go board widget.  You can
 * use the movetree and rules directly, but it's usually easier to use the
 * controller layer to abstract dealing with the rules.  It's especially useful
 * for testing logic as distinct from UI changes.
 */
glift.controllers = {};
/**
 * The all correct problem controller encapsulates the idea of trying to get
 * everything right about a problem.  Every branch in the tree is thus
 * considered 'correct'.  This is useful for practicing joseki.
 */
glift.controllers.allCorrectProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  var newController = glift.util.setMethods(baseController,
          glift.controllers.AllCorrectProblemMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.AllCorrectProblemMethods = {

};
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
  this.sgfString = "";
  this.initialPosition = [];
  this.problemConditions = {};

  // State variables that are defined on initialize and that could are
  // necessarily mutable.
  this.treepath = undefined;
  this.movetree = undefined;
  this.goban = undefined;
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
      throw "Options is undefined!  Can't create controller"
    }
    this.sgfString = sgfOptions.sgfString || "";
    this.initialPosition = sgfOptions.initialPosition || [];
    this.problemConditions = sgfOptions.problemConditions || undefined;
    this.extraOptions(sgfOptions); // Overridden by implementers
    this.initialize();
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
    this.currentMoveNumber++;
    this.captureHistory.push(captures)
    return this;
  },

  /**
   * Initialize the:
   *  - initPosition -- description of where to start
   *  - treepath -- the path to the current position.  An array of variaton
   *  numbers
   *  - movetree -- tree of move nodes from the SGF
   *  - goban -- data structure describing the go board.  Really, the goban is
   *  useful for telling you where stones can be placed, and (after placing)
   *  what stones were captured.
   *  - capture history -- the history of the captures
   */
  initialize: function() {
    var rules = glift.rules;
    this.treepath = rules.treepath.parseInitPosition(this.initialPosition);
    this.currentMoveNumber  = this.treepath.length
    this.movetree = rules.movetree.getFromSgf(this.sgfString, this.treepath);
    var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
    return this;
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
   *      }
   *      ... etc ...
   *    }
   *    comment : "foo"
   *  }
   */
  getEntireBoardState: function() {
    return glift.rules.intersections.getFullBoardData(
        this.movetree, this.goban, this.problemConditions);
  },

  /**
   * Return only the necessary information to update the board
   */
  getNextBoardState: function() {
    return glift.rules.intersections.nextBoardData(
        this.movetree, this.getCaptures(), this.problemConditions);
  },

  /**
   * Get the captures that occured for the current move.
   */
  getCaptures: function() {
    if (this.captureHistory.length === 0) {
      return { BLACK: [], WHITE: [] };
    }
    return this.captureHistory[this.currentMoveNumber - 1];
  },

  /**
   * Return true if a Stone can (probably) be added to the board and false
   * otherwise.
   *
   * Note, this method isn't always totally accurate. This method must be very
   * fast since it's expected that this will be used for hover events.
   *
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point,color);
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

  /**
   * Returns the number of intersections.  Should be known at load time.
   */
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
    if (this.treepath[this.currentMoveNumber] !== undefined &&
        (varNum === undefined ||
        this.treepath[this.currentMoveNumber] === varNum)) {
      this.movetree.moveDown(this.treepath[this.currentMoveNumber]);
    } else {
      varNum = varNum === undefined ? 0 : varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        // TODO(kashomon): Add case for non-readonly goboard.
        return glift.util.none; // No moves available
      }
    }
    var captures = this.goban.loadStonesFromMovetree(this.movetree)
    this.recordCaptures(captures);
    return this.getNextBoardState();
  },

  /**
   * Go back a move.
   */
  prevMove: function() {
    if (this.currentMoveNumber === 0) {
      return glift.util.none;
    }
    var captures = this.getCaptures();
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber - 1);
    this.goban.unloadStones(allCurrentStones, captures);
    this.currentMoveNumber = this.currentMoveNumber === 0 ?
        this.currentMoveNumber : this.currentMoveNumber - 1;
    this.movetree.moveUp();
    var displayData = glift.rules.intersections.previousBoardData(
        this.movetree, allCurrentStones, captures, this.problemConditions);
    return displayData;
  },

  /**
   * Set what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber);
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /**
   * Go back to the beginning.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    this.currentMoveNumber = 0;
    return this.getEntireBoardState();
  },

  /**
   * Go to the end.
   */
  toEnd: function() {
    while (this.nextMove() !== glift.util.none) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  }
};
})();
(function() {
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameViewer = function(sgfOptions) {
  var controllers = glift.controllers,
      baseController = glift.util.beget(controllers.base()),
      newController = glift.util.setMethods(baseController, methods),
      _ = newController.initOptions(sgfOptions);
  return newController;
};

var methods = {
  /**
   * Called during initOptions, in the BaseController.
   *
   * This creates a treepath (a persisted treepath) and an index into the
   * treepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function(options) {},

  /**
   * Find the variation associated with the played move.
   */
  addStone: function(point, color) {
    var possibleMap = this._possibleNextMoves();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return glift.util.none;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
  },

  /**
   * Based on the game path, get what the next variation number to be retrieved
   * will be.
   */
  getNextVariationNumber: function() {
    if (this.currentMoveNumber > this.treepath.length ||
        this.treepath[this.currentMoveNumber] === undefined) {
      return 0;
    } else {
      return this.treepath[this.currentMoveNumber];
    }
  },

  /**
   * Move up what variation will be next retrieved.
   */
  moveUpVariations: function() {
    return this.setNextVariation((this.getNextVariationNumber() + 1)
        % this.movetree.node().numChildren());
  },

  /**
   * Move down  what variation will be next retrieved.
   */
  moveDownVariations: function() {
    // Module is defined incorrectly for negative numbers.  So, we need to add n
    // to the result.
    return this.setNextVariation((this.getNextVariationNumber() - 1 +
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
})();
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

    // Reminder -- the goban returns:
    //  {
    //    successful: <boolean>
    //    captures: [ points]
    //  }
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { result: FAILURE };
    } else {
      var toRecord = {};
      toRecord[color] = addResult.captures;
      this.recordCaptures(toRecord);
    }

    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT. However, we still add the move down the movetree,
    // adding a node if necessary.  This allows us to maintain a consistent
    // state.
    if (nextVarNum === glift.util.none) {
      this.movetree.addNode();
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      var outData = this.getNextBoardState();
      outData.result = INCORRECT;
      return outData;
    } else {
      this.movetree.moveDown(nextVarNum);

      var correctness = glift.rules.problems.isCorrectPosition(
          this.movetree, this.problemConditions);
      if (correctness === CORRECT || correctness == INCORRECT) {
        var outData = this.getNextBoardState();
        outData.result = correctness;
        return outData;
      } else if (correctness === INDETERMINATE) {
        var prevOutData = this.getNextBoardState();
        // Play for the opposite player. Should this be deterministic?
        var randNext = glift.math.getRandomInt(
            0, this.movetree.node().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.properties().getMove();
        var result = this.goban.addStone(nextMove.point, nextMove.color);
        var toRecord = {};
        toRecord[nextMove.color] = result.captures;
        this.recordCaptures(toRecord);
        var outData = this.getNextBoardState();
        for (var color in prevOutData.stones) {
          for (var i = 0; i < prevOutData.stones[color].length; i++) {
            outData.stones[color].push(prevOutData.stones[color][i]);
          }
        }
        outData.result = INDETERMINATE;
        return outData;
      }
      else {
        throw "Unexpected result output: " + correctness
      }
    }
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
   * For a more detailed discussion, see intersections in glift.rules.
   */
  // TODO(kashomon): move showVariations to intersections.
  setDisplayState: function(boardData, display, showVariations) {
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

    var variationMap = {};
    if (glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
      variationMap = glift.bridge.variationMapping(boardData.nextMoves);
    }

    var marks = glift.enums.marks;
    for (var markType in boardData.marks) {
      for (var i = 0; i < boardData.marks[markType].length; i++) {
        var markData = boardData.marks[markType][i];
        if (markType === marks.LABEL) {
          if (variationMap[markData.point.toString()] !== undefined) {
            display.intersections().addMarkPt(
                markData.point, marks.VARIATION_MARKER, markData.value);
            delete variationMap[markData.point.toString()];
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
      if (pt in correctNextMap) {
        display.intersections().addMarkPt(pt, marks.CORRECT_VARIATION, i);
      } else {
        display.intersections().addMarkPt(pt, marks.VARIATION_MARKER, i);
      }
      i += 1;
    }

    if (boardData.lastMove &&
        boardData.lastMove !== glift.util.none &&
        boardData.lastMove.point !== undefined) {
      var lm = boardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
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
 * Takes a movetree and returns the optimal BoardRegion for cropping purposes.
 */
glift.bridge.getCropFromMovetree = function(movetree) {
  var bbox = glift.displays.bboxFromPts;
  var point = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Quads is a map from BoardRegion to the points that the board region
  // represents.
  var quads = {};

  // Tracker is a mapfrom 
  var tracker = {};
  var numstones = 0;

  // TODO(kashomon): Reevaluate this later.  It's not clear to me if we should
  // be cropping boards smaller than 19.  It usually looks pretty weird.
  if (movetree.getIntersections() !== 19) {
    return glift.enums.boardRegions.ALL;
  }
  quads[boardRegions.TOP_LEFT] =
      bbox(point(0, 0), point(middle, middle));
  quads[boardRegions.TOP_RIGHT] =
      bbox(point(middle, 0), point(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] =
      bbox(point(0, middle), point(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] =
      bbox(point(middle, middle), point(ints, ints));
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
  return glift.boardRegions.ALL;
};
/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager.
   */
  create: function(options) {
    options = glift.widgets.options.setBaseOptionDefaults(options);
    if (options.sgf && options.sgfList.length === 0) {
      options.sgfList = [options.sgf];
    }
    if (options.enableFastClick) {
      glift.global.enableFastClick();
    }
    return new glift.widgets.WidgetManager(
      options.sgfList,
      options.initialListIndex,
      options.allowWrapAround,
      options.sgfDefaults,
      glift.widgets.options.getDisplayOptions(options)).draw();
  }
};
/**
 * The base web UI widget.  It can be extended, if necessary.
 */
glift.widgets.BaseWidget = function(sgfOptions, displayOptions, manager) {
  this.type = sgfOptions.type;
  this.sgfOptions = glift.util.simpleClone(sgfOptions);
  this.displayOptions= glift.util.simpleClone(displayOptions);
  this.manager = manager;

  // Used for problems, exclusively
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;

  this.wrapperDiv = displayOptions.divId; // We split the wrapper div.
  this.controller = undefined; // Initialized with draw.
  this.display = undefined; // Initialized by draw.
  this.iconBar = undefined; // Initialized by draw.
  this.boardRegion = undefined; // Initialized by draw.
};

glift.widgets.BaseWidget.prototype = {
  /**
   * Draw the widget.
   */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    var divSplits = this.displayOptions.useCommentBar ?
        this.displayOptions.splitsWithComments :
        this.displayOptions.splitsWithoutComments;
    if (this.sgfOptions.icons.length === 0) {
      divSplits = this.displayOptions.splitsWithOnlyComments;
    }
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, divSplits, 'horizontal');
    this.goboxDivId = this.divInfo[0].id;
    this._setNotSelectable(this.goboxDivId);
    this.displayOptions.boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.sgfOptions.boardRegion;

    // TODO(kashomon): Remove these hacks. We shouldn't be modifying
    // displayOptions.
    this.displayOptions.intersections = this.controller.getIntersections();
    this.displayOptions.divId = this.goboxDivId;
    this.display = glift.displays.create(this.displayOptions);
    var boundingWidth = $('#' +  this.goboxDivId).width();

    if (this.displayOptions.useCommentBar) {
      this.commentBoxId = this.divInfo[1].id;
      this._setNotSelectable(this.commentBoxId);
      this._createCommentBox(boundingWidth);
    }

    if (this.sgfOptions.icons.length > 0) {
      this.iconBarId = this.displayOptions.useCommentBar ?
          this.divInfo[2].id :
          this.divInfo[1].id;
      this._setNotSelectable(this.iconBarId);
      this._createIconBar(boundingWidth)
    }
    this._initStoneActions();
    this._initIconActions();
    this._initKeyHandlers();
    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  _getProblemType: function() {
    var props = this.controller.movetree.properties();
    var probTypes = glift.enums.problemTypes;
    if (props.contains('EV')) {
      var value = props.getOneValue('EV').toUpperCase();
      if (probTypes[value] !== undefined && value !== probTypes.AUTO) {
        return value;
      }
    }
    if (this.controller.movetree.nextMoves().length === 0) {
      return probTypes.EXAMPLE;
    }
    return probTypes.STANDARD;
  },

  _setNotSelectable: function(divId) {
    $('#' + divId).css({
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'moz-none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        '-webkit-highlight': 'none',
        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
        'cursor': 'default'
    });
    return this;
  },

  _createCommentBox: function(boundingWidth) {
    this.commentBox = glift.displays.gui.commentBox(
        this.commentBoxId,
        this.display.width(),
        boundingWidth,
        this.displayOptions.theme,
        this.displayOptions.goBoardBackground !== undefined);
  },

  _createIconBar: function(boundingWidth) {
    var margin = (boundingWidth - this.display.width()) / 2;
    var icons = this.sgfOptions.icons;
    if (this.type === glift.enums.widgetTypes.EXAMPLE) {
      icons = this.displayOptions.reducedIconsForExample || icons;
    }
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.displayOptions.theme,
      divId: this.iconBarId,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons: icons
    });
  },

  _initIconActions: function() {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var widget = this;
    var iconActions = this.displayOptions.iconActions;
    var icons = this.sgfOptions.icons;
    for (var i = 0; i < icons.length; i++) {
      var iconName = icons[i];
      if (!iconActions.hasOwnProperty(iconName)) {
        continue;
      }
      iconActions[iconName].mouseover = iconActions[iconName].mouseover ||
          function(widget, name) {
            var id = widget.iconBar.iconId(name);
            d3.select('#' + id).attr('fill', 'red');
          };
      iconActions[iconName].mouseout = iconActions[iconName].mouseout ||
          function(widget, name) {
            var id = widget.iconBar.iconId(name);
            d3.select('#' + id)
                .attr('fill', widget.iconBar.theme.icons.DEFAULT.fill);
          };
      for (var eventName in iconActions[iconName]) {
        (function(eventName, iconNameBound, event) { // lazy binding pattern.
          widget.iconBar.setEvent(eventName, iconName, function() {
            event(widget, iconNameBound);
          });
        })(eventName, iconName, iconActions[iconName][eventName]);
      }
    }
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function() {
    var stoneActions = this.displayOptions.stoneActions
    stoneActions.click = this.sgfOptions.stoneClick;
    var that = this;
    for (var action in stoneActions) {
      (function(act, fn) { // bind the event -- required due to lazy binding.
        that.display.intersections().setEvent(act, function(pt) {
          fn(that, pt);
       });
      })(action, stoneActions[action]);
    }
  },

  /**
   * Assign Key actions to some other action.
   */
  _initKeyHandlers: function() {
    var that = this;
    this.keyHandlerFunc = function(e) {
      var name = glift.keyMappings.codeToName(e.which);
      if (name && that.sgfOptions.keyMappings[name] !== undefined) {
        var actionName = that.sgfOptions.keyMappings[name];
        // actionNamespaces look like: icons.arrowleft.mouseup
        var actionNamespace = actionName.split('.');
        var action = that.displayOptions[actionNamespace[0]];
        for (var i = 1; i < actionNamespace.length; i++) {
          action = action[actionNamespace[i]];
        }
        action(that);
      }
    };
    $('body').keydown(this.keyHandlerFunc);
  },

  /**
   * Initialize properties based on problem type.
   */
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
      this.iconBar.addTempText(this.iconBar.getIcon('checkbox').newBbox,
          this.numCorrectAnswers + '/' + this.totalCorrectAnswers, '#000');
    }
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData && boardData !== glift.util.none) {
      this.setCommentBox(boardData.comment);
      glift.bridge.setDisplayState(
          boardData, this.display, this.sgfOptions.showVariations);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   */
  setCommentBox: function(text) {
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text && text !== glift.util.none) {
      this.commentBox.setText(text);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  reload: function() {
    if (this.correctness !== undefined) {
      this.correctNextSet = undefined;
      this.numCorrectAnswers = undefined;
      this.totalCorrectAnswers = undefined;
    }
    this.redraw();
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  redraw: function() {
    this.correctness = undefined;
    this.destroy();
    this.draw();
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    this.keyHandlerFunc !== undefined
      && $('body').unbind('keydown', this.keyHandlerFunc);
    this.keyHandlerFunc = undefined;
    this.display = undefined;
  }
}
/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 */
glift.widgets.WidgetManager = function(
    sgfList, sgfListIndex, allowWrapAround, sgfDefaults, displayOptions) {
  this.sgfList = sgfList;
  this.sgfListIndex = sgfListIndex;
  this.allowWrapAround = allowWrapAround
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;

  // Defined on draw
  this.currentWidget = undefined;
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    this.getSgfString(function(sgfObj) {
      // Prevent flickering by destroying the widget _after_ loading the SGF.
      that.destroy();
      that.currentWidget = that.createWidget(sgfObj).draw();
    });
    return this;
  },

  /**
   * Get the current SGF Object from the SGF List.
   */
  getCurrentSgfObj: function() {
    var curSgfObj = this.sgfList[this.sgfListIndex];
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
    var processedObj = glift.widgets.options.setSgfOptionDefaults(
        curSgfObj, this.sgfDefaults);
    if (this.sgfList.length > 1) {
      if (this.allowWrapAround) {
        processedObj.icons.push(this.displayOptions.nextSgfIcon);
        processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
      } else {
        if (this.sgfListIndex === 0) {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
        } else if (this.sgfListIndex === this.sgfList.length - 1) {
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
   * Get the SGF string.  Since these can be loaded with ajax, the data needs to
   * be returned with a callback.
   */
  getSgfString: function(callback) {
    var sgfObj = this.getCurrentSgfObj();
    if (sgfObj.url) {
      this.loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      callback(sgfObj);
    }
  },

  /**
   * Create a Sgf Widget.
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(sgfObj, this.displayOptions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget.destroy();
    sgfObj = glift.widgets.options.setSgfOptionDefaults(
        sgfObj, this.sgfDefaults);
    this.temporaryWidget = this.createWidget(sgfObj).draw();
  },

  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /**
   * Internal implementation of nextSgf/previous sgf..
   */
  _nextSgfInternal: function(indexChange) {
    if (!this.sgfList.length > 1) {
      return; // Nothing to do
    }
    if (this.allowWrapAround) {
      this.sgfListIndex = (this.sgfListIndex + indexChange + this.sgfList.length)
          % this.sgfList.length;
    } else {
      this.sgfListIndex = this.sgfListIndex + indexChange;
      if (this.sgfListIndex < 0) {
        this.sgfListIndex = 0;
      } else if (this.sgfListIndex >= this.sgfList.length) {
        this.sgfListIndex = this.sgfList.length - 1;
      }
    }
    this.draw();
  },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  nextSgf: function() { this._nextSgfInternal(1); },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  prevSgf: function() { this._nextSgfInternal(-1); },

  /**
   * Undraw the most recent widget and remove references to it.
   */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
  },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    $.ajax({
      url: url,
      dataType: 'text',
      cache: false,
      success: function(data) {
        sgfObj.sgfString = data;
        callback(sgfObj);
      }
    });
  }
};
glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on a set of options.
   */
  setBaseOptionDefaults: function(options) {
    var options = glift.util.simpleClone(options);
    var baseTemplate = glift.util.simpleClone(
        glift.widgets.options.baseOptions);
    for (var optionName in baseTemplate) {
      if (optionName === 'sgfDefaults') {
        options.sgfDefaults = options.sgfDefaults || {};
        for (var key in baseTemplate.sgfDefaults) {
          if (options.sgfDefaults[key] === undefined) {
            options.sgfDefaults[key] = baseTemplate.sgfDefaults[key];
          }
        }
      } else if (options[optionName] === undefined) {
        options[optionName] = baseTemplate[optionName];
      }
    }
    return options
  },

  /**
   * Set the default SGF Options.  At this point, we assume that that
   * baseOptions has alreday been copied and filled in.  The process of
   * setting the sgf options goes as follows:
   *
   * 1. Get the default WidgetType from the sgfDefaults.
   * 2. Retrieve the WidgetType overrides.
   * Then:
   *  3. Prefer first options set explicitly in the sgfObj
   *  4. Then, prefer options set in the WidgetType Overrides
   *  5. Finally, prefer options set in baseOptions.sgfDefaults
   */
  setSgfOptionDefaults: function(sgfObj, sgfDefaults) {
    if (!sgfObj) throw "SGF Obj undefined";
    if (!sgfDefaults) throw "SGF Defaults undefined";

    sgfObj = glift.util.simpleClone(sgfObj);
    sgfDefaults = glift.util.simpleClone(sgfDefaults);
    sgfObj.widgetType = sgfObj.widgetType || sgfDefaults.widgetType;
    var widgetTypeOverrides = glift.util.simpleClone(
        glift.widgets.options[sgfObj.widgetType]);
    for (var key in sgfDefaults) {
      if (key in sgfObj) {
      } else if (key in widgetTypeOverrides) {
        sgfObj[key] = widgetTypeOverrides[key];
      } else {
        sgfObj[key] = sgfDefaults[key];
      }
    }
    return sgfObj;
  },

  /**
   * Get only the widget specific options -- i.e. not manager options nor sgf
   * options.
   */
  getDisplayOptions: function(fullOptions) {
    var outOptions = {};
    var ignore = {
      sgfList: true,
      sgf: true,
      initialListIndex: true,
      allowWrapAround: true,
      sgfDefaults: true
    };
    for (var key in fullOptions) {
      if (!ignore[key]) {
        outOptions[key] = fullOptions[key];
      }
    }
    return outOptions;
  }
};
/**
 * Option defaults.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options hoving to do with managing widgets
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. Sgf Options. Options having to do specifically with each SGF.
 */
glift.widgets.options.baseOptions = {
  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object.
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   */
  sgf: undefined,

  /**
   * The defaults or SGF objects.
   */
  sgfDefaults: {
    /**
     * The default widget type. Specifies what type of widget to create.
     */
    widgetType: glift.enums.widgetTypes.GAME_VIEWER,

    /**
     * Defines where to start on the go board. An empty string implies the very
     * beginning. Rather than describe how you can detail the paths, here are
     * some examples of ways to specify an initial position.
     * 0         - Start at the 0th move (the root node)
     * 1         - Start at the 1st move. This is often used in combination with
     *             a black pass to specify that white should play in a
     *             particular problem.
     * 53        - Start at the 53rd move, taking the primary path
     * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
     * 3         - Start at the 3rd move, going through all the top variations
     * 2.0       - Start at the 3rd move, going through all the top variations
     * 0.0.0.0   - Start at the 3rd move, going through all the top variations
     * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by
     *             traveling through the 3rd varition on the 2nd move
     */
    initialPosition: '',

    /**
     * The board region to display.  The boardRegion will be 'guessed' if it's set
     * to 'AUTO'.
     */
    boardRegion: glift.enums.boardRegions.AUTO,

    /**
     * Callback to perform once a problem is considered correct / incorrect.
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
     */
    problemConditions: {
      GB: [],
      C: ['Correct', 'is correct']
    },

    /**
     * Specifies what action to perform based on a particular keystroke.  In
     * otherwords, a mapping from key-enum to action path.
     *
     * See glift.keyMappings
     */
    keyMappings: {
      ARROW_LEFT: 'iconActions.chevron-left.click',
      ARROW_RIGHT: 'iconActions.chevron-right.click'
    },

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
    showVariations: undefined,

    /**
     * The function that creates the controller at widget-creation time.
     * See glift.controllers for more detail
     */
    controllerFunc: undefined,

    /**
     * The icons to use in the icon-bar.  This is a list of icon-names, which
     * must be spceified in glift.displays.gui.icons.
     */
    icons: undefined,

    /**
     * The action that is performed when a sure clicks on an intersection.
     */
    stoneClick: undefined,

    /**
     * For all correct, there are multiple correct answers that a user must get.
     * This allows us to specify (in ms) how long the user has until the problem
     * is automatically reset.
     */
    correctVariationsResetTime: undefined,

    /**
     * You can, if you wish, override the total number of correct variations
     * that a user must get correct.
     */
    totalCorrectVariationsOverride: undefined
  },

  //----------------------------------------------------------------------
  // These are really widget Manager Options.  Any update to here must be
  // accompanied with an update to options.getDisplayOptions.
  //----------------------------------------------------------------------

  /**
   * The SGF list is a list of SGF objects (given above)
   */
  sgfList: [],

  /**
    * Index into the above list.  I can't imagine why anyone would want to change
    * the initial index for the sgfList, but it's here anyway for
    * configurability.
    */
  initialListIndex: 0,

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   */
  allowWrapAround: false,

  //--------------------------------------------------------------------------
  // The rest of the options are the set of display options for the widget
  // It is assumed that these options are immutable for the life the widget
  // manager instance.
  //--------------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   */
  divId: 'glift_display',

  /**
   * Specify a background image for the go board.  You can specify an
   * absolute or a relative path.
   *
   * Examples:
   * 'images/kaya.jpg'
   * 'http://www.mywebbie.com/images/kaya.jpg'
   */
  goBoardBackground: '',

  /**
   * Whether or not to use the comment bar. It's possible this should be made
   * part of the SGF.
   */
  useCommentBar: true,

  /**
   * Div splits with the CommentBar.  Thus, there are three resulting divs - the
   * remainder is used by the last div - the icon bar.
   */
  splitsWithComments: [.70, .20],

  /**
   * Div splits without the comment bar.  Thus, there are two resulting divs -
   * the remainder is used by the last div -- the icon bar
   */
  splitsWithoutComments: [.90],

  /**
   * Div splits with only the comment bar.
   */
  splitsWithOnlyComments: [.80],

  /**
   * The name of the theme.
   */
  theme: 'DEFAULT',

  /**
   * Enable FastClick (for mobile displays).
   */
  enableFastClick: true,

  /**
   * Previous SGF icon
   */
  previousSgfIcon: 'chevron-left',

  /**
   * Next SGF Icon
   */
  nextSgfIcon: 'chevron-right',

  /**
   * Actions for stones.  If the user specifies his own actions, then the
   * actions specified by the user will take precedence.
   */
  stoneActions: {
    /**
     * click is specified in sgfOptions as stoneClick.  The actions that must
     * happen on each click vary for each widget, so we can't make a general
     * click function here.
     */
    click: undefined,

    /**
     * Ghost-stone for hovering.
     */
    mouseover: function(widget, pt) {
      var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[currentPlayer]);
      }
    },

    /**
     * Ghost-stone removal for hovering.
     */
    mouseout: function(widget, pt) {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display &&
            widget.display.intersections().setStoneColor(pt, 'EMPTY');
      }
    }
  },

  /**
   * The actions for the icons.  The keys in iconACtions
   */
  iconActions: {
    start: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.toBeginning());
      }
    },

    end: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.toEnd());
      }
    },

    arrowright: {
      click: function(widget) {
        widget.applyBoardData(widget.controller.nextMove());
      }
    },

    arrowleft: {
      click:  function(widget) {
        widget.applyBoardData(widget.controller.prevMove());
      }
    },

    // Get next problem.
    'chevron-right': {
      click: function(widget) {
        widget.manager.nextSgf();
      }
    },

    // Get the previous problem.
    'chevron-left': {
      click: function(widget) {
        widget.manager.prevSgf();
      }
    },

    // Try again
    refresh: {
      click: function(widget) {
        widget.reload();
      }
    },

    undo: {
      click: function(widget) {
        widget.manager.returnToOriginalWidget();
      }
    },

    // Go to the explain-board.
    roadmap: {
      click: function(widget) {
        var manager = widget.manager;
        var sgfObj = {
          widgetType: glift.enums.widgetTypes.GAME_VIEWER,
          initialPosition: widget.sgfOptions.initialPosition,
          sgfString: widget.sgfOptions.sgfString,
          showVariations: glift.enums.showVariations.ALWAYS,
          problemConditions: glift.util.simpleClone(
              widget.sgfOptions.problemConditions),
          icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo']
        }
        manager.createTemporaryWidget(sgfObj);
      }
    }
  }
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.CORRECT_VARIATIONS_PROBLEM = {
  stoneClick: function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var probTypes = glift.enums.problemTypes;
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
                widget.iconBar.getIcon('checkbox').newBbox,
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#0CC');
            callback(problemResults.CORRECT);
          } else {
            widget.iconBar.addTempText(
                widget.iconBar.getIcon('checkbox').newBbox,
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#000');
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.getEntireBoardState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addTempIcon(
            widget.iconBar.getIcon('checkbox').newBbox, 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'roadmap', 'checkbox'],

  controllerFunc: glift.controllers.staticProblem,

  correctVariationsResetTime: 500 // In milliseconds.
};
/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.EXAMPLE = {
  stoneClick: function(widget, pt) {},

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.GAME_VIEWER = {
  stoneClick: function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  keyMappings: {
    ARROW_LEFT: 'iconActions.arrowleft.click',
    ARROW_RIGHT: 'iconActions.arrowright.click'
  },

  icons: ['start', 'end', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.STANDARD_PROBLEM = {
  stoneClick: function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var probTypes = glift.enums.problemTypes;
    var callback = widget.sgfOptions.problemCallback;
    if (widget.correctness === undefined) {
      if (data.result === problemResults.CORRECT) {
          widget.iconBar.addTempIcon(
              widget.iconBar.getIcon('checkbox').newBbox, 'check', '#0CC');
          widget.correctness = problemResults.CORRECT;
          callback(problemResults.CORRECT);
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addTempIcon(
            widget.iconBar.getIcon('checkbox').newBbox, 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'roadmap', 'checkbox'],

  controllerFunc: glift.controllers.staticProblem
};
