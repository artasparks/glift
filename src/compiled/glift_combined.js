// Glift: A lightweight Go frontend
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License

(function() {
var glift = window.glift || {};

/**
 * Create a Glift Display
 */
glift.createDisplay = function(options) {
  return glift.displays.create(options);
};

glift.createController = function(options) {
  return glift.controllers.create(options);
};


glift.global = {
  debugMode: false
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
  // TODO(kashomon): Move enums to their own domains
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

  controllerMessages: {
    CONTINUE: "CONTINUE",
    DONE: "DONE",
    FAILURE: "FAILURE"
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
  },

  problemResults: {
    CORRECT: "CORRECT",
    INCORRECT: "INCORRECT",
    INDETERMINATE: "INDETERMINATE"
  },

  // TODO(kashomon): Delete these enums. or at least rethink them
  controllerMessages: {
    CONTINUE: "CONTINUE",
    DONE: "DONE",
    FAILURE: "FAILURE"
  },

  controllerTypes: {
    BASE: "CONTROLLER_BASE",
    STATIC_PROBLEM_STUDY: "STATIC_PROBLEM_STUDY",
    DYNAMIC_PROBLEM_STUDY: "DYNAMIC_PROBLEM_STUDY",
    EXLORE_SOLUTIONS: "EXPLORE_SOLUTIONS",
    EXLORE_GAME: "EXPLORE_GAME"
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

  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
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
  create: function(options) {
    var processed = glift.displays.processOptions(options),
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
    // TODO(kashomon): Remove the processOptions here.  It's only used for
    // tests.
    return new GuiEnvironment(glift.displays.processOptions(options));
  },

  getInitialized: function(options) {
    return glift.displays.environment.get(options).init();
  },

  environmentCopy: function(env) {
    return new GuiEnvironment(glift.displays.processOptions({
      divId: env.divId,
      boardRegion: env.boardRegion,
      intersections: env.intersections
    }));
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
    this.divHeight = ($("#" + this.divId).height());
    // -- no reason to use jquery
    // document.getElementById(divId).style.height();
    this.divWidth =  ($("#" + this.divId).width());
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
glift.displays.processOptions = function(rawOptions) {
  var DisplayOptionError = function(message) {
    this.name = "DisplayOptionError";
    this.message = message;
  };
  DisplayOptionError.prototype = new Error();

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
          throw new DisplayOptionError("Intersection value : " + key);
        }
        break;

      case 'theme':
        if (glift.themes.has(value)) {
          defaults.theme = value;
        } else {
          throw new DisplayOptionError("Unknown theme: " + value);
        }
        break;

      case 'divId':
        var elem = document.getElementById(value);
        if (elem !== null) {
          defaults.divId = value
        } else {
          throw new DisplayOptionError("Could not find div with id: " + value);
        }
        break;

      // BoardRegion defines the cropping box.
      case 'boardRegion':
        if (glift.enums.boardRegions[value] !== undefined) {
          defaults.boardRegion = value;
        } else {
          throw new DisplayOptionError("Unknown board region: " + value);
        }
        break;

      // displayConfig is object containing an assortment of debug attributes.
      case 'displayConfig':
        if (glift.util.typeOf(value) === 'object') {
          defaults.displayConfig = value;
        } else {
          throw new DisplayOptionError("displayConfig not an object: " + value);
        }
        break;

      default:
        glift.util.logz("Unknown option key: " + key);
    }
  }
  return defaults;
};
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
  var processed = glift.displays.processOptions(options),
      environment = glift.displays.environment.get(processed);
  this._environment = environment;
  this._themeName = processed.theme
  this._theme = glift.themes.get(processed.theme);
  return this;
};

Display.prototype.enableAutoResizing = function() {
  var that = this;
  var resizeFunc = function() {
    that.redraw();
  };

  var timeoutId;
  $(window).resize(function(event) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(resizeFunc, 200);
  });
};

Display.prototype.redraw = function() {
  this._environment.init();
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].redraw();
  }
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
    this.destroy();
    var point = glift.util.point,
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

  redraw: function() {
    return this.draw();
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
  },
  // Get the transform string, based on the scaliing object, which look like:
  // {
  //  xScale: num,
  //  yScale: num,
  //  xMove: num,
  //  yMove: num
  // }
  transform: function(scalingObj) {
    return "t" + scalingObj.xMove + "," + scalingObj.yMove +
      "s" + scalingObj.xScale + "," + scalingObj.yScale;
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
    this.destroy(); // remove if it already exists.
    var point = glift.util.point,
        boardPoints = this.environment.boardPoints,
        size = boardPoints.spacing * this.subtheme.starPointSize,
        intersections = this.environment.intersections,
        pts = {
          9 : [[ 2, 6 ], [ 4 ]],
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

/**
 * Create a Stone.
 *
 * This constructor is different than all the other constructors in this
 * diroctory.  Not sure if this is a problem or not.
 */
glift.displays.raphael.createStone = function(
    paper, intersection, coordinate, spacing, subtheme) {
  return new Stone(paper, intersection, coordinate, spacing, subtheme);
}

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

  // The purpose of colorState is to provide a way to recreate the GoBoard.
  this.colorState = glift.util.none; // set with setColor(...)

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

// TODO(kashomon): Break out into its own file.
Stone.prototype = {
  draw: function() {
    this.destroy();
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

  cloneHandlers: function(stone) {
    var propertiesToCopy = [ 'bboxHoverIn', 'bboxHoverOut', 'bboxClick',
        'clickHandler', 'hoverInHandler', 'hoverOutHandler'];
    for (var i = 0; i < propertiesToCopy.length; i++) {
      if (stone[propertiesToCopy[i]]) {
        this[propertiesToCopy[i]] = stone[propertiesToCopy[i]];
      }
    }
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
    this.colorState = key;
  },

  redraw: function() {
    return this.draw();
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
  this.stoneMap = glift.util.none; // init'd with draw();
};

Stones.prototype = {
  draw: function() {
    var newStoneMap = {},
        boardPoints = this.environment.boardPoints;
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash],
          intersection = glift.util.pointFromHash(ptHash),
          spacing = boardPoints.spacing,
          stone = glift.displays.raphael.createStone(
              this.paper, intersection, coordPt, spacing, this.subtheme);

      // This is a ack.  This is here so we can support redrawing the board.
      // However, it conflates the idea of drawing and redrawing which probably
      // ought to be separate.
      if (this.stoneMap && this.stoneMap !== glift.util.none &&
          this.stoneMap[ptHash]) {
        // restore the stone state, if it exists.
        var prevStone = this.stoneMap[ptHash];
        var state = prevStone.colorState;
        stone.cloneHandlers(prevStone);
        stone.draw();
        stone.setColor(state);
        this.stoneMap[ptHash].destroy();
      } else {
        stone.draw();
      }

      newStoneMap[ptHash] = stone;
    }
    this.stoneMap = newStoneMap;
    return this;
  },

  redraw: function() {
    return this.draw();
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

})();
glift.rules = {};
(function(){
var util = glift.util;

glift.rules.goban = {
  getInstance: function(intersections) {
    var ints = intersections || 19;
    return new Goban(ints);
  },

  getFromMoveTree: function(mt, initPosition) {
    var goban = new Goban(mt.getIntersections()),
        movetree = mt.getTreeFromRoot();
    if (initPosition === undefined) {
      initPosition = [];
    }
    // We assume the movetree is at root
    goban.loadStonesFromMovetree(movetree);
    for (var i = 0; i < initPosition.length; i++) {
      movetree.moveDown(initPosition[i]);
      goban.loadStonesFromMovetree(movetree);
    }
    return goban;
  }
};

// Goban tracks the state of the stones.
//
// Note that, for our purposes,
// x: refers to the column.
// y: refers to the row.
//
// Thus, to get a particular "stone" you must do
// stones[y][x]. Also, stones are 0-indexed.
//
// 0,0    : Upper Left
// 0,19   : Lower Left
// 19,0   : Upper Right
// 19,19  : Lower Right
var Goban = function(ints) {
  if (ints <= 0) throw "Intersections must be greater than 0";
  this.ints = ints;
  this.stones = initStones(ints);
};

Goban.prototype = {
  intersections: function() {
    return this.ints;
  },

  // getStone helps abstract the nastiness and trickiness of having to use the x/y
  // indices in the reverse order.
  //
  // Returns: a Color from glift.enums.states.
  getStone: function(point) {
    return this.stones[point.y()][point.x()];
  },

  // Get all the placed stones on the board (BLACK or WHITE)
  // Returns an array of the form:
  // [ {point:point, color:color}, {...}, ...]
  getAllPlacedStones: function() {
    var out = [];
    for (var i = 0; i < this.stones.length; i++) {
      var row = this.stones[i];
      for (var j = 0; j < row.length; j++) {
        var point = util.point(j, i);
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
    return util.outBounds(point.x(), this.ints)
        || util.outBounds(point.y(), this.ints);
  },

  // Returns true if in-bounds. False, otherwise
  inBounds: function(point) {
    return util.inBounds(point.x(), this.ints)
        && util.inBounds(point.y(), this.ints);
  },

  // Simply set the intersection back to EMPTY
  clearStone: function(point) {
    this._setColor(point, glift.enums.states.EMPTY);
  },

  clearSome: function(points) {
    for (var i = 1; i < points.length; i++) {
      this.clearStone(points[i]);
    }
  },

  _setColor: function(point, color) {
    this.stones[point.y()][point.x()] = color;
  },

  // addStone: Add a stone to the GoBoard (0-indexed).  Requires the
  // intersection (a point) where the stone is to be placed, and the color of
  // the stone to be placed.
  //
  // addStone always returns a StoneResult object.
  //
  // A diagram of a StoneResult:
  // {
  //    successful: true or false   // Was placing a stone successful?
  //    captures : [ ... points ... ]  // the intersections of stones captured
  //        by placing a stone at the intersection (pt).
  // }
  //
  addStone: function(pt, color) {
    if (!util.colors.isLegalColor(color)) throw "Unknown color: " + color;

    // Add stone fail.  Return a failed StoneResult.
    if (this.outBounds(pt) || !this.placeable(pt))
      return new StoneResult(false);

    this._setColor(pt, color); // set stone as active
    var captures = new CaptureTracker();
    var oppColor = util.colors.oppositeColor(color);

    this._getCaptures(captures, util.point(pt.x() + 1, pt.y()), oppColor);
    this._getCaptures(captures, util.point(pt.x() - 1, pt.y()), oppColor);
    this._getCaptures(captures, util.point(pt.x(), pt.y() - 1), oppColor);
    this._getCaptures(captures, util.point(pt.x(), pt.y() + 1), oppColor);

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

  loadStonesFromMovetree: function(movetree) {
    var cols = [glift.enums.states.BLACK, glift.enums.states.WHITE];
    for (var i = 0; i < cols.length; i++) {
      var pm = movetree.getProperties().getPlacementsAsPoints(cols[i]);
      for (var j = 0; j < pm.length; j++) {
        if (this.placeable(pm[j]), cols[i]) {
          this.addStone(pm[j], cols[i]);;
        }
      }
    }
    var mv = movetree.getProperties().getMove();
    if (mv != util.none) {
      this.addStone(mv.point, mv.color);
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
      out.push(util.pointFromHash(key));
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
var enums = glift.enums;
/*
 * Intersection Data is the precise set of information necessary to display the
 * Go Board, which is to say, it is the set of stones and display information.
 *
 * The IntersectionData is just an object containing intersection information, of
 * the form:
 *
 *   {
 *     points: [
 *       pthash: {STONE: "BLACK" , TRIANGLE: true, point: pt},
 *       pthash: {STONE: "WHITE", point: pt},
 *       pthash: {LETTER: "A", point: pt}
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
    CR: enums.marks.CIRCLE,
    LB: enums.marks.LETTER,
    MA: enums.marks.XMARK,
    SQ: enums.marks.SQUARE,
    TR: enums.marks.TRIANGLE
  },

  /**
   * Intersection data is a object, containing all the intersection data.  So,
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
  getFullBoardData: function(movetree, goban) {
    var out = {},
        pointsObj = {},
        gobanStones = goban.getAllPlacedStones();
    // First, set the stones.
    for (var i = 0; i < gobanStones.length; i++) {
      var pt = gobanStones[i].point;
      var sobj = {};
      sobj["point"] = pt;
      sobj[enums.marks.STONE] = gobanStones[i].color;
      pointsObj[pt.hash()] = sobj;
    }

    pointsObj = this.addCurrentMarks(pointsObj, movetree);
    out.points = pointsObj;
    if (movetree.getProperties().getComment() !== glift.util.none) {
      out.comment = movetree.getProperties().getComment();
    }
    return out;
  },

  // TODO: Add a way to send back only what has changed
  getChangeData: function(movetree, captures, extra) {
  },

  addCurrentMarks: function(pointsObj, movetree) {
    for (var prop in glift.rules.intersections.propertiesToMarks) {
      var mark = glift.rules.intersections.propertiesToMarks[prop];
      if (movetree.getProperties().contains(prop)) {
        var data = movetree.getProperties().get(prop);
        for (var i = 0; i < data.length; i++) {
          var pt = {}, value = true;
          if (prop === glift.sgf.allProperties.LB) {
            var conv = glift.sgf.convertFromLabelData(data[i]);
            pt = conv.point;
            value = conv.value
          } else {
            var pt = glift.sgf.sgfCoordToPoint(data[i]);
          }

          var ptHash = pt.hash();
          if (pointsObj[ptHash] === undefined) {
            pointsObj[ptHash] = {point: pt};
          }
          pointsObj[ptHash][mark] = value;
        }
      }
    }
    return pointsObj;
  }
};

})();
(function() {
glift.rules.movenode = function(properties, children) {
  return new MoveNode(properties, children);
};

var MoveNode = function(properties, children) {
  this.properties = properties || glift.rules.properties();
  this.children = children || [];
  this.nodeId = {nodeNum: 0, varNum: 0};
};

MoveNode.prototype = {
  setNodeId: function(nodeNum, varNum) {
    this.nodeId = {
        nodeNum: nodeNum,
        varNum: varNum
    }
    return this;
  },

  getNodeNum: function() {
    return this.nodeId.nodeNum
  },

  getVarNum: function() {
    return this.nodeId.varNum
  },

  numChildren: function() {
    return this.children.length;
  },

  addChild: function() {
    this.children.push(glift.rules.movenode().setNodeId(
        this.getNodeNum() + 1, this.numChildren()));
    return this;
  },

  getNext: function(variationNum) {
    if (variationNum === undefined) {
      return this.children[0];
    } else {
      return this.children[variationNum];
    }
  },

  renumber: function() {
    numberMoves(this, this.nodeId.nodeNum, this.nodeId.varNum);
    return this;
  }
};

// Private number moves function
var numberMoves = function(move, nodeNum, varNum) {
  move.setNodeId(nodeNum, varNum);
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
/*
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 *  _history: [MoveNode, MoveNode, ... ]
 *}
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
 * actual SGF format, and is easily converten back to a SGF. And so, The
 * MoveTree is a simple wrapper around the parsed SGF.
 *
 * Each move is an object with two properties: tokens and nodes, the
 * latter of which is a list to capture the idea of multiple variations.
 */
glift.rules.movetree = {
  // Create an empty MoveTree
  getInstance: function(intersections) {
    var intersections = intersections || 19;
    var mt = new MoveTree(glift.rules.movenode());
    mt.setIntersections(intersections);
    return mt;
  },

  // Create a MoveTree from an SGF.
  getFromSgf: function(sgfString, initPosition) {
    if (initPosition === undefined) {
      initPosition = []; // Should throw an error?
    }
    if (sgfString === undefined || sgfString === "") {
      return glift.rules.movetree.getInstance(19);
    }
    var mt = new MoveTree(glift.sgf.parser.parse($.trim(sgfString)));
    // Set the initial position
    for (var i = 0; i < initPosition.length; i++) {
      mt.moveDown(initPosition[i]);
    }
    return mt;
  },

  getFromNode: function(node) {
    return new MoveTree(node);
  },

  // Seach nodes with a Depth First Search. We rely on closure variables to
  // capture the result of the recursion.
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.getNode().numChildren(); i++) {
      glift.rules.movetree.searchMoveTreeDFS(moveTree.moveDown(i), func);
    }
    moveTree.moveUp();
  }
};

// A MoveTree is a history (a tree) of the past nodes played.  The movetree is
// (usually) a processed parsed SGF, but could be created organically.
//
// The tree itself is tree structure made out of MoveNodes.
var MoveTree = function(rootNode) {
  // The moveHistory serves two purposes -- it allows travel backwards (i.e.,
  // up the tree), and it gives the current move, which is the last move in the
  // array.
  this._nodeHistory = [];
  this._nodeHistory.push(rootNode);
};

MoveTree.prototype = {
  getTreeFromRoot: function() {
    return glift.rules.movetree.getFromNode(this._nodeHistory[0]);
  },

  getNode: function() {
    return this._nodeHistory[this._nodeHistory.length - 1];
  },

  getProperties: function() {
    return this.getNode().properties;
  },

  findNextMove: function(point, color) {
    var nextNodes = this.getNode().children,
        token = glift.sgf.colorToToken(color),
        ptSet = {};
    for (var i = 0; i < nextNodes.length; i++) {
      var node = nextNodes[i];
      if (node.properties.contains(token)) {
        ptSet[node.properties.getAsPoint(token).hash()] =
          node.getVarNum();
      }
    }
    if (ptSet[point.hash()] !== undefined) {
      return ptSet[point.hash()];
    } else {
      return util.none;
    }
  },

  getCurrentPlayer: function() {
    var move = this.getProperties().getMove();
    if (move === util.none) {
      return enums.states.BLACK;
    } else if (move.color === enums.states.BLACK) {
      return enums.states.WHITE;
    } else if (move.color === enums.states.WHITE) {
      return enums.states.BLACK;
    } else {
      // TODO: This is not the right way to do this.  Really, we need to
      // traverse up the tree until we see a color, and return the opposite. If
      // we reach the root, _then_ we can return BLACK.
      return enums.states.BLACK;
    }
  },

  // Move down, but only if there is an available variation
  // variationNum can be undefined for convenicence.
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.getNode().getNext(num) !== undefined) {
      var next = this.getNode().getNext(num);
      this._nodeHistory.push(next);
    }
    return this;
  },

  // Move up a move, but only if you are not in the intial (0th) move.
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

  addNewNode: function() {
    this.getNode().addChild();
    this.moveDown(this.getNode().numChildren() - 1);
    return this;
  },

  //TODO(nelsonjhk): finish
  deleteCurrentNode: function() {
    var nodeId = glift.rules.movetree.getNodeId();
    VarNum = this.getVarNum();
    this.moveUp();
    var theMoves = this.getAllNextNodes();
    //delete theMoves(nodeId,VarNum); // This is currently a syntax error
    return this;
  },

  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  // TODO (probably will involve the recursion)
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
    glift.util.logz(spaces + this.getNode(i).getVarNum() + '-'
        + this.getNode(i).getNodeNum());
    for (var i = 0; i < this.getNode().numChildren(); i++) {
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
    if (!mt.getProperties().contains(allProperties.SZ)) {
      this.getProperties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (mt.getNode().properties.contains(allProperties.SZ)) {
      return parseInt(mt.getNode().properties.get(allProperties.SZ));
    } else {
      return undefined;
    }
  },

  // Used for Problems.
  // Can return CORRECT, INCORRECT, or INDETERMINATE
  isCorrectPosition: function() {
    var problemResults = glift.enums.problemResults;
    if (this.getProperties().isCorrect()) {
      return problemResults.CORRECT;
    } else {
      var flatPaths = glift.rules.treepath.flattenMoveTree(this);
      var successTracker = {};
      for (var i = 0; i < flatPaths.length; i++) {
        var path = flatPaths[i];
        var newmt = glift.rules.movetree.getFromNode(this.getNode());
        var pathCorrect = false
        for (var j = 0; j < path.length; j++) {
          newmt.moveDown(path[j]);
          if (newmt.getProperties().isCorrect()) {
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
  }
};
})();
(function() {
var util = glift.util;
var enums = glift.enums;

// A stub for the time being.
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
  // Add an SGF Property to the current move. Return the 'this', for
  // convenience, so that you can chain addProp calls.
  //
  // Eventually, each sgf property should be matched to a datatype.  For now,
  // the user is allowed to put arbitrary data into a property.
  //
  // Note that this does not overwrite an existing property - for that, the user
  // has to delete the existing property. If the property already exists, we add
  // another data element onto the array.
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
      this.propMap[prop] = this.get(prop).concat(value);
    } else {
      this.propMap[prop] = value;
    }
    return this;
  },

  // Return an array of data associated with a property key
  get: function(strProp) {
    if (glift.sgf.allProperties[strProp] === undefined) {
      util.debugl("attempted to retrieve a property that is not part"
           + " of the SGF Spec: " + strProp);
      return util.none;
    }
    if (this.propMap[strProp] !== undefined) {
      return this.propMap[strProp];
    } else {
      util.debugl("no property: " + strProp + " exists for the current move");
      return util.none;
    }
  },

  // Get one piece of data associated with a property. Default to the first
  // element in the data associated with a property.
  //
  // Since the get() always returns an array, it's sometimes useful to return
  // the first property in the list.  Like get(), if a property or value can't
  // be found, util.none is returned.
  getDatum: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.get(strProp);
    if (arr !== util.none && arr.length >= 1) {
      return arr[index];
    } else {
      return util.none;
    }
  },

  // Get a value from a property and return the point representation.
  // Optionally, the user can provide an index, since each property points to an
  // array of values.
  getAsPoint: function(strProp, index) {
    var out = this.getDatum(strProp, index);
    if (out !== util.none) {
      return glift.sgf.sgfCoordToPoint(out);
    } else {
      return out;
    }
  },

  // contains: Return true if the current move has the property "prop".  Return
  // false otherwise.
  contains: function(prop) {
    return this.get(prop) !== util.none;
  },

  // Delete the prop and return the value.
  remove: function(prop) {
    if (this.contains(prop)) {
      var value = this.get(prop);
      delete this.propMap[prop];
      return value;
    } else {
      return util.none;
    }
  },

  // Replace replaces the current value if the property already exists.
  replace: function(prop, value) {
    this.propMap[prop] = value
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

    return glift.sgf.allSgfCoordsToPoints(this.get(prop));
  },

  getComment: function() {
    if (this.contains('C')) {
      return this.getDatum('C');
    } else {
      return util.none;
    }
  },

  getMove: function() {
    if (this.contains('B')) {
      return {
        color: enums.states.BLACK,
        point: glift.sgf.sgfCoordToPoint(this.getDatum('B'))
      };
    } else if (this.contains('W')) {
      return {
        color: enums.states.WHITE,
        point: glift.sgf.sgfCoordToPoint(this.getDatum('W'))
      };
    } else {
      return util.none;
    }
  },

  isCorrect: function() {
    if (this.contains('GB')) {
      return true;
    } else {
      return false;
    }
  },

  // Get all the stones (placements and moves)
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out[BLACK] = this.getPlacementsAsPoints(states.BLACK);
    out[WHITE] = this.getPlacementsAsPoints(states.WHITE);
    var move = this.getMove()
    if (move != util.none) {
      out[move.color].push(move.point);
    }
    return out;
  }
};

})();
/*
 * The treepath is specified by a String, which specifies a series of moves
 * saying how to get to the move.
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
      return initPos
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Do nothing. this is the expected type
    // TODO(kashomon): throw some darn errors.
    // } else if (glift.util.typeOf(initPos) === 'object') {
      // throw new errors.ParseError("Cannot parse type " +
          // glift.util.typeOf(initPos));
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
  // are each a tree-path.
  flattenMoveTree: function(movetree) {
    var out = [];
    for (var i = 0; i < movetree.getNode().numChildren(); i++) {
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
    pathToHere.push(movetree.getNode().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.getNode().numChildren(); i++) {
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
/*
 * The SGF library contains functions for dealing with SGFs.
 *
 * sgf_grammar.js: sgf parser generated, generated from
 * sgf_grammar.pegjs. To regenerate the parser from the peg grammar, use
 * jszip.py.
 *
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

  // SGFs are indexed from the Upper Left:
  //  _  _  _
  // |aa ba ca ...
  // |ab bb
  // |.
  // |.
  // |.
  sgfCoordToPoint: function(c) {
    var a = 'a'.charCodeAt(0)
    return glift.util.point(c.charCodeAt(0) - a, c.charCodeAt(1) - a);
  },

  allSgfCoordsToPoints: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.sgfCoordToPoint(arr[i]));
    }
    return out;
  },

  convertFromLabelData: function(data) {
    var parts = data.split(":"),
        pt = glift.sgf.sgfCoordToPoint(parts[0]),
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
// The allProperties object is used to check to make sure that a given property is
// actually a real property
glift.sgf.allProperties = {
AB: "AB", AE: "AE", AN: "AN", AP: "AP", AR: "AR", AS: "AS", AW: "AW", B: "B",
BL: "BL", BM: "BM", BR: "BR", BS: "BS", BT: "BT", C: "C", CA: "CA", CH: "CH",
CP: "CP", CR: "CR", DD: "DD", DM: "DM", DO: "DO", DT: "DT", EL: "EL", EV: "EV",
EX: "EX", FF: "FF", FG: "FG", GB: "GB", GC: "GC", GM: "GM", GN: "GN", GW: "GW",
HA: "HA", HO: "HO", ID: "ID", IP: "IP", IT: "IT", IY: "IY", KM: "KM", KO: "KO",
L: "L", LB: "LB", LN: "LN", LT: "LT", M: "M", MA: "MA", MN: "MN", N: "N", OB:
"OB", OM: "OM", ON: "ON", OP: "OP", OT: "OT", OV: "OV", OW: "OW", PB: "PB", PC:
"PC", PL: "PL", PM: "PM", PW: "PW", RE: "RE", RG: "RG", RO: "RO", RU: "RU", SC:
"SC", SE: "SE", SI: "SI", SL: "SL", SO: "SO", SQ: "SQ", ST: "ST", SU: "SU", SZ:
"SZ", TB: "TB", TC: "TC", TE: "TE", TM: "TM", TR: "TR", TW: "TW", UC: "UC", US:
"US", V: "V", VW: "VW", W: "W", WL: "WL", WR: "WR", WS: "WS", WT: "WT"
};
glift.sgf.parser = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "Data": parse_Data,
        "MoreData": parse_MoreData,
        "MoreTokens": parse_MoreTokens,
        "MoreVars": parse_MoreVars,
        "Moves": parse_Moves,
        "Start": parse_Start,
        "TokenName": parse_TokenName,
        "Tokens": parse_Tokens,
        "Variations": parse_Variations,
        "WhiteSpace": parse_WhiteSpace
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "Start";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_Start() {
        var cacheKey = 'Start@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 2) === "(;") {
          var result3 = "(;";
          pos += 2;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"(;\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse_Tokens();
          if (result4 !== null) {
            var result5 = parse_Variations();
            if (result5 !== null) {
              if (input.substr(pos, 1) === ")") {
                var result6 = ")";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\")\"");
                }
              }
              if (result6 !== null) {
                var result1 = [result3, result4, result5, result6];
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(props, children) {
            return glift.rules.movenode(glift.rules.properties(props), children).renumber();
          })(result1[1], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_Variations() {
        var cacheKey = 'Variations@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        if (input.substr(pos, 1) === "(") {
          var result7 = "(";
          pos += 1;
        } else {
          var result7 = null;
          if (reportMatchFailures) {
            matchFailed("\"(\"");
          }
        }
        if (result7 !== null) {
          var result8 = parse_Moves();
          if (result8 !== null) {
            if (input.substr(pos, 1) === ")") {
              var result9 = ")";
              pos += 1;
            } else {
              var result9 = null;
              if (reportMatchFailures) {
                matchFailed("\")\"");
              }
            }
            if (result9 !== null) {
              var result17 = parse_WhiteSpace();
              var result10 = result17 !== null ? result17 : '';
              if (result10 !== null) {
                if (input.substr(pos, 1) === "(") {
                  var result11 = "(";
                  pos += 1;
                } else {
                  var result11 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"(\"");
                  }
                }
                if (result11 !== null) {
                  var result12 = parse_Moves();
                  if (result12 !== null) {
                    if (input.substr(pos, 1) === ")") {
                      var result13 = ")";
                      pos += 1;
                    } else {
                      var result13 = null;
                      if (reportMatchFailures) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result13 !== null) {
                      var result16 = parse_WhiteSpace();
                      var result14 = result16 !== null ? result16 : '';
                      if (result14 !== null) {
                        var result15 = parse_MoreVars();
                        if (result15 !== null) {
                          var result5 = [result7, result8, result9, result10, result11, result12, result13, result14, result15];
                        } else {
                          var result5 = null;
                          pos = savedPos2;
                        }
                      } else {
                        var result5 = null;
                        pos = savedPos2;
                      }
                    } else {
                      var result5 = null;
                      pos = savedPos2;
                    }
                  } else {
                    var result5 = null;
                    pos = savedPos2;
                  }
                } else {
                  var result5 = null;
                  pos = savedPos2;
                }
              } else {
                var result5 = null;
                pos = savedPos2;
              }
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(var1, white, var2, whiteAlso, more) { return [var1, var2].concat(more); })(result5[1], result5[3], result5[5], result5[7], result5[8])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_Moves();
          var result3 = result2 !== null
            ? (function(move) { return (move === undefined ? [] : [move]); })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_MoreVars() {
        var cacheKey = 'MoreVars@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        if (input.substr(pos, 1) === "(") {
          var result7 = "(";
          pos += 1;
        } else {
          var result7 = null;
          if (reportMatchFailures) {
            matchFailed("\"(\"");
          }
        }
        if (result7 !== null) {
          var result8 = parse_Moves();
          if (result8 !== null) {
            if (input.substr(pos, 1) === ")") {
              var result9 = ")";
              pos += 1;
            } else {
              var result9 = null;
              if (reportMatchFailures) {
                matchFailed("\")\"");
              }
            }
            if (result9 !== null) {
              var result12 = parse_WhiteSpace();
              var result10 = result12 !== null ? result12 : '';
              if (result10 !== null) {
                var result11 = parse_MoreVars();
                if (result11 !== null) {
                  var result5 = [result7, result8, result9, result10, result11];
                } else {
                  var result5 = null;
                  pos = savedPos2;
                }
              } else {
                var result5 = null;
                pos = savedPos2;
              }
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(move, white, more) {
              return [move].concat(more); })(result5[1], result5[3], result5[4])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 0) === "") {
            var result2 = "";
            pos += 0;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          var result3 = result2 !== null
            ? (function() { return []; })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_Moves() {
        var cacheKey = 'Moves@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        if (input.substr(pos, 1) === ";") {
          var result7 = ";";
          pos += 1;
        } else {
          var result7 = null;
          if (reportMatchFailures) {
            matchFailed("\";\"");
          }
        }
        if (result7 !== null) {
          var result8 = parse_Tokens();
          if (result8 !== null) {
            var result9 = parse_Variations();
            if (result9 !== null) {
              var result5 = [result7, result8, result9];
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(props, children) {
                    return glift.rules.movenode(glift.rules.properties(props), children);
                  })(result5[1], result5[2])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 0) === "") {
            var result2 = "";
            pos += 0;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          var result3 = result2 !== null
            ? (function() { return undefined; })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_Tokens() {
        var cacheKey = 'Tokens@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_TokenName();
        if (result3 !== null) {
          if (input.substr(pos, 1) === "[") {
            var result4 = "[";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"[\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_Data();
            if (result5 !== null) {
              if (input.substr(pos, 1) === "]") {
                var result6 = "]";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\"]\"");
                }
              }
              if (result6 !== null) {
                var result12 = parse_WhiteSpace();
                var result7 = result12 !== null ? result12 : '';
                if (result7 !== null) {
                  var result8 = parse_MoreData();
                  if (result8 !== null) {
                    var result11 = parse_WhiteSpace();
                    var result9 = result11 !== null ? result11 : '';
                    if (result9 !== null) {
                      var result10 = parse_MoreTokens();
                      if (result10 !== null) {
                        var result1 = [result3, result4, result5, result6, result7, result8, result9, result10];
                      } else {
                        var result1 = null;
                        pos = savedPos1;
                      }
                    } else {
                      var result1 = null;
                      pos = savedPos1;
                    }
                  } else {
                    var result1 = null;
                    pos = savedPos1;
                  }
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(token, propdata, white, more, whiteAlso, tokens) {
            tokens[token] = [propdata].concat(more);
            return tokens;
          })(result1[0], result1[2], result1[4], result1[5], result1[6], result1[7])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_MoreTokens() {
        var cacheKey = 'MoreTokens@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result4 = parse_Tokens();
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 0) === "") {
            var result2 = "";
            pos += 0;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          var result3 = result2 !== null
            ? (function() { return {}; })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_Data() {
        var cacheKey = 'Data@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result1 = [];
        if (input.substr(pos, 2) === "\\]") {
          var result5 = "\\]";
          pos += 2;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("\"\\\\]\"");
          }
        }
        if (result5 !== null) {
          var result3 = result5;
        } else {
          if (input.substr(pos).match(/^[^\]]/) !== null) {
            var result4 = input.charAt(pos);
            pos++;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("[^\\]]");
            }
          }
          if (result4 !== null) {
            var result3 = result4;
          } else {
            var result3 = null;;
          };
        }
        while (result3 !== null) {
          result1.push(result3);
          if (input.substr(pos, 2) === "\\]") {
            var result5 = "\\]";
            pos += 2;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("\"\\\\]\"");
            }
          }
          if (result5 !== null) {
            var result3 = result5;
          } else {
            if (input.substr(pos).match(/^[^\]]/) !== null) {
              var result4 = input.charAt(pos);
              pos++;
            } else {
              var result4 = null;
              if (reportMatchFailures) {
                matchFailed("[^\\]]");
              }
            }
            if (result4 !== null) {
              var result3 = result4;
            } else {
              var result3 = null;;
            };
          }
        }
        var result2 = result1 !== null
          ? (function(props) {
            return props.join("");
          })(result1)
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_MoreData() {
        var cacheKey = 'MoreData@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        if (input.substr(pos, 1) === "[") {
          var result7 = "[";
          pos += 1;
        } else {
          var result7 = null;
          if (reportMatchFailures) {
            matchFailed("\"[\"");
          }
        }
        if (result7 !== null) {
          var result8 = parse_Data();
          if (result8 !== null) {
            if (input.substr(pos, 1) === "]") {
              var result9 = "]";
              pos += 1;
            } else {
              var result9 = null;
              if (reportMatchFailures) {
                matchFailed("\"]\"");
              }
            }
            if (result9 !== null) {
              var result12 = parse_WhiteSpace();
              var result10 = result12 !== null ? result12 : '';
              if (result10 !== null) {
                var result11 = parse_MoreData();
                if (result11 !== null) {
                  var result5 = [result7, result8, result9, result10, result11];
                } else {
                  var result5 = null;
                  pos = savedPos2;
                }
              } else {
                var result5 = null;
                pos = savedPos2;
              }
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(propdata, white, more) {
              return [propdata].concat(more); })(result5[1], result5[3], result5[4])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 0) === "") {
            var result2 = "";
            pos += 0;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"\"");
            }
          }
          var result3 = result2 !== null
            ? (function() { return []; })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_TokenName() {
        var cacheKey = 'TokenName@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos).match(/^[a-zA-Z]/) !== null) {
          var result5 = input.charAt(pos);
          pos++;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("[a-zA-Z]");
          }
        }
        if (result5 !== null) {
          if (input.substr(pos).match(/^[a-zA-Z]/) !== null) {
            var result6 = input.charAt(pos);
            pos++;
          } else {
            var result6 = null;
            if (reportMatchFailures) {
              matchFailed("[a-zA-Z]");
            }
          }
          if (result6 !== null) {
            var result4 = [result5, result6];
          } else {
            var result4 = null;
            pos = savedPos1;
          }
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result1 = result4;
        } else {
          if (input.substr(pos).match(/^[a-zA-Z]/) !== null) {
            var result3 = input.charAt(pos);
            pos++;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("[a-zA-Z]");
            }
          }
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;;
          };
        }
        var result2 = result1 !== null
          ? (function(name) {
            if (name.length === 1) return name[0];
            else return name.join("").toUpperCase();
          })(result1)
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_WhiteSpace() {
        var cacheKey = 'WhiteSpace@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result0 = [];
        if (input.substr(pos, 1) === " ") {
          var result3 = " ";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\" \"");
          }
        }
        if (result3 !== null) {
          var result1 = result3;
        } else {
          if (input.substr(pos, 1) === "\n") {
            var result2 = "\n";
            pos += 1;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"\\n\"");
            }
          }
          if (result2 !== null) {
            var result1 = result2;
          } else {
            var result1 = null;;
          };
        }
        while (result1 !== null) {
          result0.push(result1);
          if (input.substr(pos, 1) === " ") {
            var result3 = " ";
            pos += 1;
          } else {
            var result3 = null;
            if (reportMatchFailures) {
              matchFailed("\" \"");
            }
          }
          if (result3 !== null) {
            var result1 = result3;
          } else {
            if (input.substr(pos, 1) === "\n") {
              var result2 = "\n";
              pos += 1;
            } else {
              var result2 = null;
              if (reportMatchFailures) {
                matchFailed("\"\\n\"");
              }
            }
            if (result2 !== null) {
              var result1 = result2;
            } else {
              var result1 = null;;
            };
          }
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
/*
 * The controllers logical parts of the Go board.
 */
glift.controllers = {
  // Map from glift.enums.controllerTypes to constructor, which takes one argument:
  // (processed) options. This is global static state and thus meant to be
  // immutable.
  controllerMap: {},

  create: function(rawOptions) {
    var options = glift.controllers.processOptions(rawOptions);
    if (options.controllerType in glift.controllers.controllerMap) {
      return glift.controllers.controllerMap[options.controllerType](options);
    } else {
      throw "No controller found for type: " + options.controllerType;
    }
  }
};
(function() {
var msgs = glift.enums.controllerMessages,
    BASE = glift.enums.controllerTypes.BASE;

glift.controllers.createBaseController = function() {
  return new BaseController();
};

glift.controllers.controllerMap[BASE] = glift.controllers.createBaseController;

/**
 * Boring constructor.  It's expected that this will be extended.
 */
var BaseController = function() {};

BaseController.prototype = {
  /**
   * Add a stone.  What happens here depends on the extender of this base class.
   */
  addStone: function() {
    throw "Not Implemented";
  },

  /**
   * Initialize the:
   *  - initPosition (description of where to start)
   *  - movetree (tree of move nodes from the SGF)
   *  - goban (backing array describing the go board)
   */
  initialize: function(o) {
    var rules = glift.rules,
        sgfString = this.sgfString,
        initPosString = this.initialPosition;
    this.initPosition = rules.treepath.parseInitPosition(initPosString);
    this.movetree = rules.movetree.getFromSgf(sgfString, this.initPosition);
    // glift.sgf.parseInitPosition handles an undefined initPosition
    this.goban = rules.goban.getFromMoveTree(this.movetree, this.initPosition);
    // return the entire boardState
    return this.getEntireBoardState();
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
    return glift.rules.intersections.getFullBoardData(this.movetree, this.goban);
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
  }
};
})();
glift.controllers.processOptions = function(rawOptions) {
  var ControllerOptionError = function(message) {
    this.name = "DisplayOptionError";
    this.message = message;
  };
  ControllerOptionError.prototype = new Error();

  // Default options
  var defaults = {
    // intersections: 19, -- intersections is not necessary, since it's set via
    // the SGF (and the default is 19 anyway).
    controllerType: "STATIC_PROBLEM_STUDY",
    initialPosition: [],
    sgfString: ''
  };
  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {

      case 'controllerType':
        if (glift.util.typeOf(value) == 'string' &&
            value in glift.enums.controllerTypes) {
          defaults.controllerType = value;
        } else {
          throw new ControllerOptionError("Unknown controllerType: " + value);
        }
        break;

      case 'initialPosition':
        // If there's an error, a ParseError will be thrown.
        defaults.initialPosition = glift.rules.parseInitPosition(value);
        break;

      case 'sgfString':
        if (glift.util.typeOf(value) === 'string') {
          defaults.sgfString = value;
        } else {
          throw new ControllerOptionError("Bad type for sgfString: " + value);
        }
        break;

      default:
        glift.util.logz("Unknown option key: " + key);
    }
  }
  return defaults;
};
(function() {
var util = glift.util,
    STATIC_PROBLEM_STUDY = glift.enums.controllerTypes.STATIC_PROBLEM_STUDY;

glift.controllers.staticProblemStudy = {
  // This is mostly left for legacy reasons
  _create: function(options) {
    var controllers = glift.controllers,
        baseController = glift.util.beget(controllers.createBaseController()),
        newController = util.setMethods(
            baseController, staticProblemStudyMethods),
        // At this point, options have already been processed
        _ = newController.initOptions(options);
    return newController;
  }
};

glift.controllers.createStaticProblemStudy = function(options) {
  var c = glift.controllers.staticProblemStudy._create(options)
  c.initialize('foo');
  return c;
};

// Register this Controller type in the map;
glift.controllers.controllerMap[STATIC_PROBLEM_STUDY] =
    glift.controllers.createStaticProblemStudy;

var staticProblemStudyMethods = {
  initOptions: function(options) {
    this.sgfString = options.sgfString || "";
    this.initialPosition = options.initialPosition;
    return this;
  },

  // Add a stone to the board.  Since this is a problem, we check for
  // 'correctness', which we check whether all child nodes are labeled (in some
  // fashion) as correct.
  //
  // TODO: Refactor this into something less ridiculous.
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults,
        msgs = glift.enums.controllerMessages,
        FAILURE = msgs.FAILURE,
        DONE = msgs.DONE,
        CONTINUE = msgs.CONTINUE,
        CORRECT = problemResults.CORRECT,
        INCORRECT = problemResults.INCORRECT,
        INDETERMINATE = problemResults.INDETERMINATE;

    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { message: FAILURE, reason: "Cannot add stone" };
    }
    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);
    this.lastPlayed = {point: point, color: color};

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT.
    if (nextVarNum === util.none) {
      return { message: DONE, result: INCORRECT };
    }

    else {
      this.movetree.moveDown(nextVarNum);
      var correctness = this.movetree.isCorrectPosition();
      // TODO(kashomon): Only retrieve the intersections that have changed.
      var outData = glift.rules.intersections.getFullBoardData(
          this.movetree, this.goban);

      if (correctness === CORRECT) {
        return { message: DONE, result: CORRECT, data: outData };
      }

      else if (correctness === INDETERMINATE) {
        var randNext = glift.math.getRandomInt(
            0, this.movetree.getNode().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.getProperties().getMove();
        this.goban.addStone(nextMove.point, nextMove.color);
        var outData = glift.rules.intersections.getFullBoardData(
            this.movetree, this.goban);
        return { message: CONTINUE, result: INDETERMINATE, data: outData };
      }

      else if (correctness === problemResults.INCORRECT) {
        return { message: msgs.DONE, result: INCORRECT };
      }

      else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};

})();
/**
 * The bridge is the only place where display and rules+controller code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion, see intersections in glift.rules.
   */
  setDisplayState: function(intersectionData, display) {
    var marks = glift.enums.marks;
    for (var ptHash in intersectionData.points) {
      var intersection = intersectionData.points[ptHash];
      if (marks.STONE in intersection) {
        var color = intersection[marks.STONE];
        var pt = intersection.point;
        display.setColor(pt, color);
      }
    }
  }
};
glift.bridge.getFromMovetree = function(movetree) {
  var bbox = glift.displays.bboxFromPts,
      point = glift.util.point,
      boardRegions = glift.enums.boardRegions,
      // Intersections need to be 0 rather than 1 indexed.
      ints = movetree.getIntersections() - 1,
      middle = Math.ceil(ints / 2),
      quads = {},
      tracker = {},
      numstones = 0;
  quads[boardRegions.TOP_LEFT] =
      bbox(point(0, 0), point(middle + 1, middle + 1));
  quads[boardRegions.TOP_RIGHT] =
      bbox(point(middle - 1, 0), point(ints, middle + 1));
  quads[boardRegions.BOTTOM_LEFT] =
      bbox(point(0, middle - 1), point(middle + 1, ints));
  quads[boardRegions.BOTTOM_RIGHT] =
      bbox(point(middle - 1, middle - 1), point(ints, ints));
  movetree.recurseFromRoot(function(mt) {
    var stones = mt.getProperties().getAllStones();
    for (var color in stones) {
      var points = stones[color];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        numstones += 1
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (box.contains(pt)) {
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
    if (quadlist.length === numstones) {
      return quadkey;
    } else {
      regions.push(quadkey);
    }
  }
  if (regions.length !== 2) {
    return glift.boardRegions.ALL; // Shouldn't be 1 element here...
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
