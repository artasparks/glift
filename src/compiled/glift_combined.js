// Glift: A lightweight Go frontend
// Copyright (c) 2011-2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};
glift.create = function(options) {
  return glift.displays.getImpl(options);
};
window.glift = glift;
})();
// Create: Process the options, using defaults where appropriate.
glift.processOptions = function(rawOptions) {

  // Default keys
  var defaults = {
    intersections: 19,
    divId: "glift_display",
    theme: "DEFAULT",
    boardRegion: "ALL",
    displayConfig: {}
  };

  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {
      case 'intersections':
        if (glift.util.typeOf(value) == 'number' && value > 0) {
          defaults.intersections = value;
        } else {
          glift.util.logz("Intersection value : " + key);
        }
        break;

      case 'theme':
        if (glift.themes.has(value)) {
          defaults.theme = value;
        } else {
          glift.util.logz("Unknown theme: " + value);
        }
        break;

      case 'divId':
        var elem = document.getElementById(value);
        if (elem !== null) {
          defaults.divId = value
        } else {
          glift.util.logz("Could not find div with id: " + value);
        }
        break;

      // BoardRegion defines the cropping box.
      case 'boardRegion':
        if (glift.enums.boardRegions[value] !== undefined) {
          defaults.boardRegion = value;
        } else {
          glift.util.logz("Unknown board region: " + value);
        }
        break;

      // displayConfig is object containing an assortment of debug attributes.
      case 'displayConfig':
        if (glift.util.typeOf(value) === 'object') {
          defaults.displayConfig = value;
        } else {
          glift.util.logz("displayConfig not an object: " + value);
        }
        break;

      default:
        glift.util.logz("Unknown option key: " + key);
    }
  }
  return defaults;
};
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

  // A utility method -- for prototypal inheritence.
  beget: function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  },

  // Via Crockford / StackOverflow: Determine the type of a value in robust way.
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

  // Checks to make sure a number is inbounds
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

  varDefined: function(arg, label) {
    var msg = label || "",
        msg = msg !== "" ? ": " + msg : msg;
    if (arg === undefined) {
      throw "Argument cannot be undefined" + msg
    }
  },

  /*
   * Check to make sure that the variables specified are defined.
   */
  defined: function() { // args...
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === undefined) {
        return false;
      }
    }
    return true;
  },

  assertDefined: function(variable, msg) {
    if (variable === undefined) {
      throw msg;
    }
    return glift.util.none;
  },

  checkArgsDefined: function(args, expected) {
    for (var i = 0; i < expected; i++) {
      if (args[i] === undefined) {
        throw "Argument " + i + " of " + args.length +
            " must be defined, but is undefined";
      }
    }
    return glift.util.none;
  },

  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
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
    return color === enums.states.BLACK ||
        color === enums.states.WHITE ||
        color === enums.states.EMPTY;
  },

  oppositeColor: function(color) {
    if (color === enums.states.BLACK) return enums.states.WHITE;
    if (color === enums.states.WHITE) return enums.states.BLACK;
    else return color;
  }
};
// Otre: A Go Studying Program
// Copyright (c) 2012, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift.enums = {
  // Also sometimes referred to as colors. See util.colors.
  states: {
    BLACK: "BLACK",
    WHITE: "WHITE",
    EMPTY: "EMPTY"
  },

  directions: {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOP: "TOP",
    BOTTOM: "BOTTOM"
  },

  // The directions should work with the boardRegions.
  boardRegions: {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    TOP: "TOP",
    BOTTOM: "BOTTOM",
    TOP_LEFT: "TOP_LEFT",
    TOP_RIGHT: "TOP_RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    ALL: "ALL"
  },

  marks: {
    CIRCLE: "CIRCLE",
    LETTER: "LETTER",
    SQUARE: "SQUARE",
    STONE: "STONE",
    TRIANGLE: "TRIANGLE",
    XMARK: "XMARK"
  }
};
(function() {
glift.logger = function(logDiv, numMsgs) {
  return new glift.Log(logDiv, numMsgs);
};

glift.Log = function(logDiv, numMsgs) {
  this.name = "#" + logDiv;
  this.num = numMsgs;
  this.curMsgs = 0;
};

glift.Log.prototype.println = function(msg) {
  var modmsg = msg;
  if (glift.util.typeOf(msg) === "array" ||
      glift.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  $('<p>' + modmsg + '</p>').appendTo(this.name);
  this.curMsgs++;
  if (this.curMsgs > this.num) {
    $(this.name).children("p:first").remove();
    this.curMsgs = this.curMsgs - 1;
  }
};

glift.Log.prototype.printv = function() {
  var args = arguments;
  var out = "";
  out = args[0];
  for (var i = 1; i < args.length; i++) {
    out = out + "," + args[i];
  }
  this.println(out);
};

glift.Log.prototype.log = glift.Log.prototype.println;

glift.Log.prototype.printArr = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    this.println(arr[i].toString());
  }
  this.println("----");
};
})();
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
(function() {

// Perhaps this should be removed.  It's hard to preserve immutability when
// there's a global cache.
var pointCache = {};

// Create a point.  Each point is cached, so that each point is only actually
// created once.
glift.util.point = function(x, y) {
  var str = glift.util.coordToString(x, y);
  if (pointCache[str] !== undefined) {
    return pointCache[str];
  } else {
    var newpt = new GliftPoint(x, y);
    pointCache[str] = newpt;
    return newpt;
  }
};

// Create a point, but don't use the cache. The method above is prefered to this
// one, but sometimes it's useful to use an explicitly uncached point.
glift.util.uncachedPoint = function(x, y) {
  return new GliftPoint(x, y);
};

// For testing the cache
glift.util._cacheHasPoint = function(x, y) {
  return pointCache[glift.util.coordToString(x, y)] !== undefined;
};

// Private Point Class.  Because each point is cached, we have to be careful to
// preserve immutability. As such, we use getters to access the x and y values.
// Of course, you could still change functions themselves to be mysterious and
// annoying, but the purpose of using getters is more to prevent accidental
// mistakes.
var GliftPoint = function(xIn, yIn) {
  var privateXval = xIn,
      privateYval = yIn;
  this.x = function() { return privateXval };
  this.y = function() { return privateYval };
  this.toString = function() {
      return glift.util.coordToString(privateXval, privateYval); };
  this.equals = function(pt) {
      return privateXval === pt.x() && privateYval === pt.y();
  };
  this.toSgfCoord = function() {
    return String.fromCharCode(privateXval + 97) +
        String.fromCharCode(privateYval + 97);
  };
};

GliftPoint.prototype = {
  hash: function() {
    return this.toString();
  },

  value: function() {
    return this.toString();
  },

  log: function() {
    glift.util.logz(this.toString());
  }
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

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
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
      out[br.BOTTOM] = 1
      out[br.RIGHT] = 1
    } else {
      // TODO: Complete this
    }
    return out;
  }
};
glift.testUtil = {
  getAllElements: function(paper) {
    var list = [];
    paper.forEach(function (el) {
      list.push(el);
    });
    return list;
  },

  assertEmptyPaper: function(paper) {
    var elems = glift.testUtil.getAllElements(paper);
    deepEqual(elems.length, 0, "Paper should have been emptied");
  },

  assertFullDiv: function(divId) {
    ok($('#' + divId).text() !== '', "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    deepEqual($('#' + divId ).text(), '', "Div should not contain contents");
  }
};
glift.themes = {
  registered: {},

  // Accepts a (case sensitive) ID and returns the theme.
  get: function(id) {
    var registered = glift.themes.registered;
    return !(id in registered) ? glift.util.none : registered[id];
  },

  // Accepts a (case sensitive) theme ID and true if the theme exists and false
  // otherwise.
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  }
};
glift.themes.registered.DEFAULT = {
  board: {
    bgColor: "#f5be7e",
    lineColor: "black",
    lineSize: 1,
    edgeLineSize: 1,
    starPointSize: .15, // As a fraction of the spacing.
    textColor: "white"
  },

  stones: {
    hoverOpacity: 0.5,
    "EMPTY" : {
      fill: 'blue',
      opacity: 0
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black"
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      "stroke-width": 1 // The default value
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  },

  marks: {
    // TODO(kashomon): add
    XMARK : {
    }
  }
};
glift.displays = {
  getImpl: function(options) {
    var processed = glift.processOptions(options),
        environment = glift.displays.environment.get(processed);
    return glift.displays.raphael.create(environment, processed.theme).draw();
  }
};
(function() {
glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bbox = function(topLeft, width, height) {
  return new BoundingBox(
      topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
}

// Might be nice to use the closure to create private variables.
// A bounding box, generally for a graphical object.
var BoundingBox = function(topLeftPtIn, botRightPtIn) {
  var topLeftPt = topLeftPtIn,
      botRightPt = botRightPtIn;
  this.topLeft = function() { return topLeftPt; };
  this.botRight = function() { return botRightPt; };
  this.center = function() {
    return glift.util.point(
      glift.math.abs((botRightPt.x() - topLeftPt.x()) / 2) + topLeftPt.x(),
      glift.math.abs((botRightPt.y() - topLeftPt.y()) / 2) + topLeftPt.y());
  };
  this.width = function() { return botRightPt.x() - topLeftPt.x(); };
  this.height = function() { return botRightPt.y() - topLeftPt.y(); };
  this.top = function() { return topLeftPt.y(); };
  this.left = function() { return topLeftPt.x(); };
  this.bottom = function() { return botRightPt.y(); };
  this.right = function() { return botRightPt.x(); };
};


BoundingBox.prototype = {
  // Draw the bbox (for debugging);
  draw: function(paper, color) {
    var obj = paper.rect(
        this.topLeft().x(), this.topLeft().y(), this.width(), this.height());
    obj.attr({fill:color, opacity:0.5});
  },

  contains: function(point) {
   return point.x() >= this.topLeft().x()
      && point.x() <= this.botRight().x()
      && point.y() >= this.topLeft().y()
      && point.y() <= this.botRight().y();
  },

  // Log the points to the console (for debugging);
  log: function() {
    glift.util.logz("TopLeft: " + JSON.stringify(this.topLeft()));
    glift.util.logz("BotRight: " + JSON.stringify(this.botRight()));
    glift.util.logz("Width: " + this.width());
    glift.util.logz("Height: " + this.height());
  },

  equals: function(other) {
    return other.topLeft && this.topLeft().equals(other.topLeft()) &&
        other.botRight && this.botRight().equals(other.botRight());
  }
};

})();
(function() {
var util = glift.util;

glift.displays.boardPoints = function() {
  return new BoardPoints();
};

glift.displays.boardPointsFromLineBox = function(linebox) {
  var spacing = linebox.spacing,
      linebbox = linebox.bbox,
      left = linebbox.left() + linebox.extensionBox.left() * spacing,
      top = linebbox.top() + linebox.extensionBox.top() * spacing,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      boardPoints = glift.displays.boardPoints();
  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);
      var coordPt = glift.util.point(xCoord, yCoord);
      boardPoints.add(intPt, coordPt);
    }
  }
  boardPoints.setSpacing(spacing);
  return boardPoints;
};

// BoardPoints maintains a mapping from an intersection on the board
// to a coordinate in pixel-space.
// Also: Why the hell did I design this objec this way?
var BoardPoints = function() {
  this.points = {};
  this.spacing = undefined; // to be set by caller
};

BoardPoints.prototype = {
  add: function(intPt, coordPt) {
    if (this.points[intPt.hash()] === undefined) {
      this.points[intPt.hash()] = coordPt;
    }
    return this;
  },

  setSpacing: function(spacing) {
    this.spacing = spacing;
    return this;
  },

  getCoords: function() {
    return this.points;
  },

  // Test whether there is a
  hasCoord: function(pt) {
    return this.points[pt.hash()] !== undefined;
  },

  // Get the coordinate in the HTML div associated with the
  getCoord: function(pt) {
    return this.points[pt.hash()];
  },

  _debugDraw: function(paper, color) {
    for (var ptHash in this.points) {
      var coordPt = this.points[ptHash];
      var circ = paper.circle(coordPt.x(), coordPt.y(), this.spacing / 2);
      circ.attr({fill:color, opacity:.3});
    }
  }
};

})();
(function() {
glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0,
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
          rightExtension = this.LINE_EXTENSION;
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
  var OVERFLOW = glift.displays.cropbox.OVERFLOW;
  this.cbox = function() { return cbox; };
  this.extBox = function() { return extBox; };
  this.xPoints = function() { return cbox.width(); };
  this.yPoints = function() { return cbox.height(); };

  // Modifications to the width/height to make the ratios work.
  this.widthMod = function() {
    return cbox.width() + extBox.topLeft().x() + extBox.botRight().x() + OVERFLOW;
  };
  this.heightMod = function() {
    return cbox.height() + extBox.topLeft().y() + extBox.botRight().y() + OVERFLOW;
  };
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
// Note: options are already processed by the time they get here.
glift.displays.createBase = function(options) {
  var themeName = options.themeName,
      theme = glift.themes.get(themeName);
  return new BaseDisplay(theme);
};

/**
 * In the absence of interfaces in javascript, the BaseDisplay represents the
 * Display interface.
 */
var BaseDisplay = function(type, theme) {
  this.theme = theme;
};

BaseDisplay.prototype = {
  // Set the theme, by providing a registered theme key (e.g., DEFAULT). This
  // causes the board to be redrawn.
  setTheme: function(themeKey) {
    throw "Not implemented";
  },

  // Set the CropBox.  This causes the board to be redrawn.
  setBoardRegion: function(direction) {
    throw "Not implemented";
  },

  // Set an event handler for the given object.  If more than one object is
  // found, the handler will be applied to all such objects.
  setHandler: function(objKey, func) {
    throw "Not implemented";
  },

  // Redraw the board
  redraw: function() {
    throw "Not implemented";
  },

  // Set a stone at a particular point (bounded
  setStone: function(point, color, mark) {
    throw "Not implemented";
  },

  // The sidebar is managed separately.
  getSidebar: function(direction) {
    throw "Not implemented";
  }
};
})();
(function() {
var util = glift.util;
var enums = glift.enums;

/*
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
    return new GuiEnvironment(glift.processOptions(options));
  },

  getInitialized: function(options) {
    return glift.displays.environment.get(options).init();
  }
};

var GuiEnvironment = function(options) {
  this.divId = options.divId;
  this.boardRegion = options.boardRegion
  this.intersections = options.intersections
  this.cropbox = options.displayConfig._cropbox ||
      glift.displays.cropbox.getFromRegion(this.boardRegion, this.intersections);
  this.heightOverride = false;
  this.widthOverride = false;

  // We allow the divHeight and divWidth to be specified explicitly, primarily
  // because it's extremely useful for testing.
  if (options.displayConfig._divHeight !== undefined) {
    this.divHeight = options.displayConfig._divHeight;
    this.heightOverride = true;
  }

  if (options.displayConfig._divWidth !== undefined) {
    this.divWidth = options.displayConfig._divWidth;
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
        divWidth  = this.divWidth,
        cropbox   = this.cropbox,
        dirs = enums.directions,

        // The box for the entire div
        divBox = displays.bboxFromPts(
            util.point(0, 0), // top left point
            util.point(divWidth, divHeight)), // bottom right point
        resizedBox = glift.displays.getResizedBox(divBox, cropbox),
        goBoardBox = resizedBox,
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),
        boardPoints = glift.displays.boardPointsFromLineBox(goBoardLineBox),
        lineSegments = glift.displays.getLineSegments(goBoardLineBox);

    this.divBox = divBox;
    this.resizedBox = resizedBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    this.lineSegments = lineSegments;
    return this;
  },

  setIntersections: function(intersections) {
    this.intersections = intersections;
  },

  _resetDimensions: function() {
    this.divHeight = ($("#" + this.divId).innerHeight());
    // -- no reason to use jquery
    // document.getElementById(divId).style.height();
    this.divWidth =  ($("#" + this.divId).innerWidth());
    this.needsInitialization = true;
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
  var overflow = glift.displays.cropbox.OVERFLOW,
      xSpacing = boardBox.width() / cropbox.widthMod(),
      ySpacing = boardBox.height() / cropbox.heightMod(),
      top = ySpacing * overflow / 2,
      left = xSpacing * overflow / 2,
      bot = ySpacing * (cropbox.heightMod() - overflow / 2),
      right = xSpacing * (cropbox.widthMod() - overflow / 2),
      leftBase = boardBox.topLeft().x(),
      topBase = boardBox.topLeft().y(),

      // The Line Box is an extended cropbox.
      lineBoxBoundingBox = glift.displays.bboxFromPts(
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

LineBox.prototype = {
  _debugDrawLines: function(paper, color) {
    for (var i = this.bbox.left(), j = this.bbox.top();
          i <= this.bbox.right();
          i += this.spacing, j += this.spacing) {
      var obj = paper.rect(i, j, this.spacing, this.spacing);
      obj.attr({fill:color, opacity:0.5});
    }
  }
};


})();
(function() {
glift.displays.getLineSegments = function(lineBox) {
  var segments = new Segments();
  var point = glift.util.point;
  var logz = glift.util.logz;

  var spacing = lineBox.spacing,
      left = lineBox.bbox.left() + lineBox.extensionBox.left() * spacing,
      top = lineBox.bbox.top(),
      bottom = lineBox.bbox.bottom();
  for (var i = 0; i <= lineBox.xPoints; i++ ) {
    var xPos = left + i * spacing;
    var ordinal = lineBox.pointTopLeft.x() + i;
    segments.vert.push(new LineSegment(
        point(xPos, top), point(xPos, bottom), ordinal));
  }

  var left = lineBox.bbox.left(),
      right = lineBox.bbox.right(),
      top = lineBox.bbox.top() + lineBox.extensionBox.top() * spacing;
  for (var i = 0; i <= lineBox.yPoints; i++ ) {
    var yPos = top + i * spacing;
    var ordinal = lineBox.pointTopLeft.y() + i;
    segments.horz.push(new LineSegment(
        point(left, yPos), point(right, yPos), ordinal));
  }
  return segments;
};

// Segments contains all the line segments, which are eventually turned into
// lines on the board.
var Segments = function() {
  this.horz = [];
  this.vert = [];
};

Segments.prototype._debugDraw = function(paper, color) {
  var rutil = glift.displays.raphael.rutil;
  var segs = [this.horz, this.vert];
  for (var i = 0; i < segs.length; i++) {
    var lines = segs[i];
    for (var j = 0; j < lines.length; j++) {
      paper.path(
          rutil.svgMovePt(lines[j].topLeft) +
          rutil.svgLineAbsPt(lines[j].botRight))
    }
  }
};

// The equation for a line segment, which is eventually turned into a line on
// the board.
var LineSegment = function(tl, br, ordinal) {
  this.topLeft = tl;  // coordinate
  this.botRight = br; // coordinate
  // The ordinal point on the board, i.e., the 0th line, the 2nd line, etc...
  // 0 indexed, of course.
  this.ordinal = ordinal;
};

})();
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
(function() {

glift.displays.raphael = {
  create: function(environment, theme) {
    return new glift.displays.raphael.Display(environment, theme);
  }
};

glift.displays.raphael.Display = function(inEnvironment, inTheme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._paper = glift.util.none;
  this._environment = inEnvironment;
  this._themeName = inTheme;
  this._theme = glift.themes.get(inTheme);
  this._stones = glift.util.none;

  // Methods accessing private data
  this.intersections = function() { return this._environment.intersections; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
};

// Alias for typing convenience
var Display = glift.displays.raphael.Display;

// This allows us to create a base display object without creating all drawing
// all the parts.
Display.prototype.init = function() {
  this._paper = Raphael(this.divId(), "100%", "100%");
  this._environment.init();
  return this;
};

Display.prototype.draw = function() {
  this.init();
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].destroy();
  }
  this._objectHistory = [
    this.createBoardBase(),
    this.createBoardLines(),
    this.createStarPoints()
  ];
  this._stones = this.createStones();
  this._objectHistory.push(this._stones);
  return this;
};

// Maybe I'm working too hard to 'destroy' these objects.  Why not just remove
// them from the SVG paper?
Display.prototype.destroy = function() {
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].destroy();
  }
  this._objectHistory = [];
  this._paper.remove();
  this._paper = glift.util.none;
  this._stones = glift.util.none;
  // Empty out the div of anything that's left
  $('#' + this.divId()).empty();
};

Display.prototype.recreate = function(options) {
  this.destroy();
  var processed = glift.processOptions(options),
      environment = glift.displays.environment.get(processed);
  this._environment = environment;
  this._themeName = processed.theme
  this._theme = glift.themes.get(processed.theme);
  return this;
};

Display.prototype.setColor = function(point, color) {
  if (this._stones !== glift.util.none) {
    this._stones.setColor(point, color);
    return this;
  } else {
    throw "Stones === none! Cannot setColor";
  }
};

Display.prototype.setClickHandler = function(fn) {
  this._stones.setClickHandler(fn);
};

Display.prototype.setHoverInHandler = function(fn) {
  this._stones.setHoverInHandler(fn);
};

Display.prototype.setHoverOutHandler = function(fn) {
  this._stones.setHoverOutHandler(fn);
};

})();
(function(){
// Create the base board background object and immediately call draw().
glift.displays.raphael.Display.prototype.createBoardBase = function() {
  return new BoardBase(this._paper, this._environment, this._theme.board)
    .draw();
};

var BoardBase = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.rect = glift.util.none // init'd with draw()
};

BoardBase.prototype = {
  draw: function() {
    var box = this.environment.goBoardBox;
    this.destroy(); // remove if it already exists.
    this.rect = this.paper.rect(
        box.topLeft().x(),
        box.topLeft().y(),
        box.width(),
        box.height());
    this.rect.attr({fill: this.subtheme.bgColor});
    return this;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.rect && this.rect !== glift.util.none && this.rect.remove();
    return this;
  }
};
})();
(function() {
// Create the board lines objects and immediately call draw()
glift.displays.raphael.Display.prototype.createBoardLines = function() {
  return new BoardLineSet(this._paper, this._environment, this._theme.board)
      .draw();
};

var BoardLineSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.horzSet = glift.util.none; // filled in by draw;
  this.vertSet = glift.util.none; // filled in by draw;
};

BoardLineSet.prototype = {
  draw: function() {
    var _ = this.destroy(),
        point = glift.util.point,
        paper = this.paper,
        subt = this.subtheme,
        segments = this.environment.lineSegments,
        maxInts = this.environment.intersections;
    this.horzSet = drawSegments(
        paper, segments.horz, maxInts, subt.lineSize, subt.edgeLineSize);
    this.vertSet = drawSegments(
        paper, segments.vert, maxInts, subt.lineSize, subt.edgeLineSize);
    return this;
  },

  destroy: function() {
    this.horzSet && this.horzSet !== glift.util.none && this.horzSet.remove();
    this.vertSet && this.vertSet !== glift.util.none && this.vertSet.remove();
    return this;
  }
};

var drawSegments = function(paper, segs, maxInts, normalSize, edgeSize) {
  var lineSet = paper.set(),
      rutil = glift.displays.raphael.rutil;
  for (var i = 0; i < segs.length; i++) {
    var path = paper.path(
        rutil.svgMovePt(segs[i].topLeft) +
        rutil.svgLineAbsPt(segs[i].botRight));
    var ordinal = segs[i].ordinal;
    var size = ordinal === 0 || ordinal  === maxInts - 1 ?
        edgeSize : normalSize;
    path.attr({"stroke-linecap" : "round", "stroke-width" : size});
    lineSet.push(path);
  }
  return lineSet;
};

})();
(function() {
glift.displays.raphael.Display.prototype.createMarks = function() {
  return new Marks(this._paper, this._environment, this._theme.marks)
};

var Marks = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.marks = {}; // map from intersection to mark
};

// TODO(kashomon): Finish writing marks.  This will probably require changing
// how the circle/bounding boxes are created, again, due to layering issues.
Marks.prototype = {
  addMark: function(type, pt, color) {
    switch(type) {
      case "XMARK": _addXMark(pt, color); break;
      default: // do nothing
    }
    return this;
  },

  _addXMark: function(pt, color) {
    var boardPoints = this.environment.boardpoints,
        coordPt = boardpoints.points[pt.hash()],
        spacing = boardpoints.spacing;
  },

  clearMark: function(pt) {

  },

  clearMarks: function() {

  }
};
})();
glift.displays.raphael.rutil = {
  // Move the current position to X,Y
  svgMove: function(x, y) {
    return "M" + x + "," + y;
  },
  svgMovePt: function(pt) {
    return glift.displays.raphael.rutil.svgMove(pt.x(), pt.y());
  },
  // Create a relative SVG line, starting from the 'current' position.
  svgLineRel: function(x, y) {
    return "l" + x + "," + y;
  },
  svgLineRelPt: function(pt) {
    return glift.displays.raphael.rutil.svgLineRel(pt.x(), pt.y());
  },
  // Create an absolute SVG line -- different from lower case
  svgLineAbs: function(x, y) {
    return "L" + x + "," + y;
  },
  // Create an absolute SVG line -- different from lower case.
  svgLineAbsPt: function(pt) {
    return glift.displays.raphael.rutil.svgLineAbs(pt.x(), pt.y());
  }
};
(function() {

// Create the starPoints object and immediately call draw()
glift.displays.raphael.Display.prototype.createStarPoints = function() {
  return new StarPointSet(this._paper, this._environment, this._theme.board)
      .draw();
};

var StarPointSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.starSet = glift.util.none; // init'd with draw()
};

StarPointSet.prototype = {
  draw: function() {
    var _ = this.destroy(), // remove if it already exists.
        point = glift.util.point,
        boardPoints = this.environment.boardPoints,
        size = boardPoints.spacing * this.subtheme.starPointSize,
        intersections = this.environment.intersections,
        pts = {
          9 : [[ 4 ]],
          13 : [[ 3, 9 ], [6]],
          19 : [[ 3, 9, 15 ]]
        },
        outerSet = pts[intersections] || [],
        starSet = this.paper.set();
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (boardPoints.hasCoord(pt)) {
            var coord = boardPoints.getCoord(pt);
            starSet.push(this.paper.circle(coord.x(), coord.y(), size));
          }
        }
      }
    }
    starSet.attr({fill: this.subtheme.lineColor});
    this.starSet = starSet;
    return this;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.starSet && this.starSet !== glift.util.none && this.starSet.remove();
    return this;
  }
};
})();
(function(){
// Create the entire grid of stones and immediately call draw()
glift.displays.raphael.Display.prototype.createStones = function() {
  return new Stones(this._paper, this._environment, this._theme.stones)
      .draw();
};

// Stones is a container for all the go stones.  Individual stones are only
// interacted with through this container.
var Stones = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;

  // Map from PtHash to Stone
  this.stoneMap = {}; // init'd with draw();
};

Stones.prototype = {
  draw: function() {
    var stoneMap = {},
        boardPoints = this.environment.boardPoints;
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash],
          intersection = glift.util.pointFromHash(ptHash),
          spacing = boardPoints.spacing,
          stone = new Stone(this.paper, intersection, coordPt, spacing,
              this.subtheme);
      stoneMap[ptHash] = stone.draw();
    }
    this.stoneMap = stoneMap;
    return this;
  },

  // Set handlers for all the stones.
  setClickHandler: function(fn) { return this._handler('clickHandler', fn); },
  setHoverInHandler: function(fn) { return this._handler('hoverInHandler', fn); },
  setHoverOutHandler: function(fn) { return this._handler('hoverOutHandler', fn); },

  _handler: function(key, fn) {
    for (var ptHash in this.stoneMap) {
      var stone = this.stoneMap[ptHash];
      stone[key] = fn;
    }
    return this;
  },

  forceClick: function(pt) { this.stoneMap[pt.hash()].bboxClick(); },
  forceHoverIn: function(pt) { this.stoneMap[pt.hash()].bboxHoverIn(); },
  forceHoverOut: function(pt) { this.stoneMap[pt.hash()].bboxHoverOut(); },

  setColor: function(point, key) {
    var stone = this.stoneMap[point.hash()];
    if (stone === undefined) {
      throw "Could not find stone for point: " + point.toString();
    }
    stone.setColor(key);
    return this;
  },

  // Destroy is extremely slow.
  destroy: function() {
    for (var ptHash in this.stoneMap) {
      this.stoneMap[ptHash].destroy();
    }
    this.stoneMap = {};
  }

  // TODO(kashomon): Add drawing marks on top of the stones.
};

var Stone = function(paper, intersection, coordinate, spacing, subtheme) {
  this.paper = paper;
  // intersection: The standard point on the board, (1-indexed?). So, on a 19x19
  // board, this will be a point where x,y are between 1 and 19 inclusive.
  this.intersection = intersection;
  // coordinate: the center of the stone, in pixels.
  this.coordinate = coordinate;
  this.subtheme = subtheme;
  // TODO(kashomon): Change the magic #s to variables.
  // The .2 fudge factor is used to account for line width.
  this.radius = spacing / 2 - .2

  // Set via draw
  this.circle = glift.util.none;
  this.bbox = glift.util.none;

  this.bboxHoverIn = function() { throw "bboxHoverIn not Defined"; };
  this.bboxHoverOut = function() { throw "bboxHoverOut not defined"; };
  this.bboxClick = function() { throw "bboxClick not defined"; };

  // Click handlers are set via setHandler in Stones.
  this.clickHandler = function(intersection) {};
  this.hoverInHandler = function(intersection) {};
  this.hoverOutHandler = function(intersection) {};
};

Stone.prototype = {
  draw: function() {
    var subtheme = this.subtheme,
        paper = this.paper,
        r = this.radius,
        coord = this.coordinate,
        intersection = this.intersection,
        that = this; // Avoid lexical 'this' binding problems.

    this.circle = paper.circle(coord.x(), coord.y(), r);

    // Create a bounding box surrounding the stone.  This is what the user
    // actually clicks on, since just using circles leaves annoying gaps.
    this.bbox = paper.rect(coord.x() - r, coord.y() - r, 2 * r, 2 * r)
    this.bbox.attr({fill: "white", opacity: 0});

    this.bboxHoverIn = function() { that.hoverInHandler(intersection); };
    this.bboxHoverOut = function() { that.hoverOutHandler(intersection); };
    this.bboxClick = function() { that.clickHandler(intersection); };
    this.bbox.hover(this.bboxHoverIn, this.bboxHoverOut);
    this.bbox.click(this.bboxClick);
    this.setColor("EMPTY");
    return this;
  },

  // Set the color of the stone by retrieving the "key" from the stones
  // sub object.
  setColor: function(key) {
    if (this.circle === glift.util.none) {
      throw "Circle was not initialized, so cannot set color";
    }
    if (!(key in this.subtheme)) {
     glift.util.logz("Key " + key + " not found in theme");
    }
    this.circle.attr(this.subtheme[key]);
  },

  destroy: function() {
    if (this.circle === glift.util.none || this.bbox === glift.util.none) {
      return this // not initialized,
    }
    this.bbox.unhover(this.bboxHoverIn, this.bboxHoverOut);
    this.bbox.unclick(this.bboxClick);
    this.bbox.remove();
    this.circle.remove();
    return this;
  },

  _bboxToFront: function() {
    this.bbox && this.bbox !== glift.util.non && this.bbox.toFront();
    return this;
  },

  addMark: function(type, color) {
    // TODO(kashomon): flargnargle.
  }
};

})();
