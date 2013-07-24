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
    LABEL: "LABEL",
    SQUARE: "SQUARE",
    TRIANGLE: "TRIANGLE",
    XMARK: "XMARK",
    STONE_MARKER: "STONE_MARKER"
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
  },

  /**
   * Used to create svg element Ids
   */
  svgElements: {
    BOARD_BASE: 'board_base',
    BOARD_LINE: 'board_line',
    BUTTON: 'intersection_button',
    MARK: 'mark',
    MARK_CONTAINER: 'mark_container',
    GLIFT_ELEMENT: 'glift_element',
    STARPOINT: 'starpoint',
    STONE: 'stone',
    STONE_SHADOW: 'stone_shadow'
  },

  // TODO(kashomon): Perhaps remove.  This isn't used (at least for anything
  // useful yet (and maybe ever).
  mediums: {
    SVG: "SVG",
    CANVAS: "CANVAS"
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

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
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

  value: function() {
    return this.toString();
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
      out[br.BOTTOM] = 1
      out[br.RIGHT] = 1
    } else {
      // TODO: Complete this
    }
    return out;
  }
};
glift.testUtil = {
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
  registered: {},

  // Accepts a (case sensitive) ID and returns a COPY of the theme.
  get: function(id) {
    var registered = glift.themes.registered;
    var rawTheme = !(id in registered) ? glift.util.none : registered[id];

    // Perform the DeepCopy
    var themeCopy = jQuery.extend(true, {}, rawTheme);
    return themeCopy;
  },

  // Accepts a (case sensitive) theme ID and true if the theme exists and false
  // otherwise.
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  // For a theme object. This generally assumes you're called 'get' so that you
  // have a copy of the base theme.
  setGoBoardBackground: function(theme, value) {
    if (theme) {
      theme.board.imagefill = value
      // "url('" + value  + "')";
    } else {
      throw "Yikes! Not a theme: cannot set background image."
    }
  }
};
glift.themes.registered.DEFAULT = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000"
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  lines: {
    stroke: "#000000"
  },

  stones: {
    marks: {
      'font-family': 'sans-serif'
    },

    shadows: {
      stroke: "none",
      fill: "#222"
    },

    "EMPTY" : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black'
      }
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white'
      }
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      "stroke-width": 1, // The default value
      marks: {
        fill: 'white',
        stroke: 'white'
      }
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  },

  icons: {
    'DEFAULT' : {
      fill: "90-#337-#55B"
    },
    'DEFAULT_HOVER' : {
      fill: "90-#337-#55D"
    }
  }
};
glift.themes.registered.DEPTH = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000"
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  lines: {
    stroke: "#000000"
  },

  stones: {
    marks: {
      'font-family': 'sans-serif'
    },
    shadows: {
      stroke: "none",
      fill: "#555"
    },
    "EMPTY" : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black'
      }
    },
    "BLACK" : {
      fill: "black",
      opacity: 1,
      "stroke-width": 0, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white'
      }
    },
    "BLACK_HOVER" : {
      fill: "black",
      opacity: 0.5
    },
    "WHITE" : {
      stroke: "white",
      fill: "white",
      opacity: 1,
      "stroke-width": 0, // The default value
      marks: {
        fill: 'black',
        stroke: 'black'
      }
    },
    "WHITE_HOVER" : {
      fill: "white",
      opacity: 0.5
    }
  }
};
glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...);
   */
  create: function(options) {
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed),
        theme = glift.themes.get(processed.theme); // get a theme copy.
    if (processed.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, processed.goBoardBackground);
    }
    return glift.displays.board.create(environment, processed.theme, theme);
  }
};
(function() {
glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bboxFromDiv = function(divId) {
  // Getting the height this might not work for Window or Documents.
  var e = document.getElementById(divId),
      height = Math.max(e.clientHeight,
          isNaN(parseFloat(e.style.height)) ? 0 : parseFloat(e.style.height),
          e.offsetHeight),
      width = Math.max(e.clientWidth,
          isNaN(parseFloat(e.style.width)) ? 0 : parseFloat(e.style.width),
          e.offsetWidth);
  // There is no reason to use jquery.  Hotever, this is how it would be done:
  // this.divWidth =  ($("#" + this.divId).width());
  return glift.displays.bbox(glift.util.point(0,0), width, height);
};

glift.displays.bbox = function(topLeft, width, height) {
  return new BoundingBox(
      topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
};

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
   * The TopLeft point remains the same.
   */
  fixedScale: function(amount) {
    var newHeight = this.height() * amount,
        newWidth = this.width() * amount;
    return glift.displays.bbox(this.topLeft(), newWidth, newHeight);
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
  //
  // TODO(kashomon): Make this a first-class option. I now think it's totally
  // reasonable to set the height/width explicitly.
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
    // -- no reason to use jquery
    // this.divWidth =  ($("#" + this.divId).width());
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
glift.displays.processOptions = function(rawOptions) {
  // Default keys
  var enums = glift.enums;
  var defaults = {
    intersections: 19,
    divId: "glift_display",
    theme: "DEFAULT",
    boardRegion: "ALL",
    displayConfig: {},
    goBoardBackground: '',
    medium: enums.mediums.SVG
  };

  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {
      case 'intersections':
        if (glift.util.typeOf(value) == 'number' && value > 0) {
          defaults.intersections = value;
        } else {
          throw "Intersection value : " + key;
        }
        break;

      case 'theme':
        if (glift.themes.has(value)) {
          defaults.theme = value;
        } else {
          throw "Unknown theme: " + value;
        }
        break;

      case 'divId':
        var elem = document.getElementById(value);
        if (elem !== null) {
          defaults.divId = value
        } else {
          throw "Could not find div with id: " + value;
        }
        break;

      // BoardRegion defines the cropping box.
      case 'boardRegion':
        if (glift.enums.boardRegions[value] !== undefined) {
          defaults.boardRegion = value;
        } else {
          throw "Unknown board region: " + value;
        }
        break;

      // displayConfig is object containing an assortment of debug attributes.
      case 'displayConfig':
        if (glift.util.typeOf(value) === 'object') {
          defaults.displayConfig = value;
        } else {
          throw "displayConfig not an object: " + value;
        }
        break;

      // GoBoardBackground: just what it sounds like: a jpg or png path.
      case 'goBoardBackground':
        if (glift.util.typeOf(value) === 'string') {
          defaults.goBoardBackground = value;
        } else {
          throw "goBoardBackground not a string: " + value;
        }
        break;

      case 'medium':
        if (glift.enums.mediums[value] !== undefined) {
          defaults.medium = value;
        } else {
          throw "Unknown board region: " + value;
        }
        break;

      default:
        // Don't do anything. This is really convenient for widgets.
        // glift.util.logz("Unknown option key: " + key);
    }
  }
  return defaults;
}
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

  // TODO(kashomon): remove stones (or rework into intersections) now that we're
  // using d3.
  this._stones = undefined;
  this.stones = function() { return this._stones; };

  this._svg = undefined; // defined in draw
  this._intersections = undefined // defined in draw;
  this.intersections = function() { return this._intersections; };

  // Methods accessing private data
  this.intersectionPoints = function() { return this._environment.intersections; };
  this.boardPoints = function() { return this._environment.boardPoints; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
  this.width = function() { return this._environment.goBoardBox.width() };
  this.height = function() { return this._environment.goBoardBox.height() };
};

glift.displays.board.Display.prototype = {
  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.

      // Make the text not selectable (there's no point and it's distracting)
      // TODO(kashomon): Is this needed now that each point is covered with a
      // transparent button element?
      this._svg = d3.select('#' + this.divId())
        .style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'moz-none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none')
        .style('cursor', 'default');
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
    var boardId = board.createBoardBase(divId, svg, env.goBoardBox, theme);
    var lineIds = board.createLines(divId, svg, boardPoints, theme);
    var starPointIds = board.createStarPoints(divId, svg, boardPoints, theme);
    var stoneShadowIds = board.createShadows(divId, svg, boardPoints, theme);
    var stoneIds = board.createStones(divId, svg, boardPoints, theme);
    var markIds = board.createMarkContainer(divId, svg, boardPoints, theme);
    var buttons = board.createButtons(divId, svg, boardPoints);
    var intersectionData = {
        lineIds: lineIds,
        starPointIds: starPointIds,
        stoneShadowIds: stoneShadowIds,
        stoneIds: stoneIds,
        markIds: markIds,
        buttons: buttons
    };
    this._intersections = glift.displays.board.createIntersections(
        divId, svg, intersectionData, boardPoints, theme);
    return this; // required -- used in create(...);
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
  },

  /**
   * Redraw the goboard.
   *
   * TODO(kashomon): Does this still need to exist?
   */
  redraw:  function() {
    this.draw();
  }
};
/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.createBoardBase = function(divId, svg, goBox, theme) {
  var svgutil = glift.displays.board.svgutil;
  var BOARD = glift.enums.svgElements.BOARD;
  var id = svgutil.elementId(divId, BOARD)

  // TODO(kashomon): Make this more DRY
  if (theme.board.imagefill) {
    svg.selectAll('goBoardRect').data([BOARD])
      .enter().append('svg:image')
        .attr('x', goBox.topLeft().x())
        .attr('y', goBox.topLeft().y())
        .attr('width', goBox.width())
        .attr('height', goBox.height())
        .attr('stroke', theme.board.stroke)
        .attr('xlink:href', theme.board.imagefill)
        .attr('preserveAspectRatio', 'none')
        .attr('id', id);
  } else {
    svg.selectAll('goBoardRect').data([BOARD])
      .enter().append('rect')
        .attr('x', goBox.topLeft().x() + 'px')
        .attr('y', goBox.topLeft().y() + 'px')
        .attr('width', goBox.width() + 'px')
        .attr('height', goBox.height() + 'px')
        .attr('height', goBox.height() + 'px')
        .attr('fill', theme.board.fill)
        .attr('background-image', theme.board.imagefill)
        .attr('stroke', theme.board.stroke)
        .attr('id', id);
  }
  return id;
};
/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.createButtons = function(divId, svg, boardPoints) {
  var buttonMapping = {};
  var svgutil = glift.displays.board.svgutil;
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
              var id = svgutil.elementId(divId, BUTTON, pt.intPt);
              buttonMapping[pt.intPt.hash()] = id;
              return id;
        });
  return buttonMapping;
};
glift.displays.board.createIntersections = function(
    divId, svg, ids, boardPoints, theme) {
  return new glift.displays.board._Intersections(
      divId, svg, ids, boardPoints, theme);
};

glift.displays.board._Intersections = function(
    divId, svg, ids, boardPoints, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.boardPoints = boardPoints;

  // elements by id.  Maps from point-string to element ID ('#...')
  this.lineIds = ids.lineIds;
  this.starPointIds = ids.starPointIds;
  this.stoneShadowIds = ids.stoneShadowIds;
  this.stoneIds = ids.stoneIds;
  this.markIds = ids.markIds;
  this.buttons = ids.buttons;

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

  // TODO(kashomon): Move to marks.js.  Besides the arguments below, the only
  // data this method depends on is the divId, to generate the Element ID and
  // boardPoints.  SVG can be passed in or inferred.
  addMarkPt: function(pt, mark, label) {
    glift.displays.board.addMark(
        this.divId, this.svg, this.boardPoints, this.theme, pt, mark, label);
    return this;
  },

  addMark: function(x, y, mark, label) {
    this.addMarkPt(glift.util.point(x, y), mark, label);
    return this;
  },

  clearMarks: function() {
    var elems = glift.enums.svgElements;
    // Some STARPOINTs/BOARD_LINEs may have been 'turned-off' when adding marks.
    // It's easier just to manipulate them as a whole.
    this.svg.selectAll('.' + elems.STARPOINT).attr('opacity', 1);
    this.svg.selectAll('.' + elems.BOARD_LINE).attr('opacity', 1);
    this.svg.selectAll('.' + elems.MARK).remove();
    return this;
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
glift.displays.board.createLines = function(divId, svg, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var lineMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var BOARD_LINE = glift.enums.svgElements.BOARD_LINE;
  svg.selectAll(BOARD_LINE).data(boardPoints.data())
    .enter().append("path")
      .attr('d', function(pt) {
        return glift.displays.board.intersectionLine(
            pt, boardPoints.radius, boardPoints.numIntersections, theme);
      })
      .attr('stroke', theme.lines.stroke)
      .attr('class', BOARD_LINE)
      .attr('stroke-linecap', 'round')
      .attr('id', function(pt) {
        var id = svgutil.elementId(divId, BOARD_LINE, pt.intPt);
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
glift.displays.board.createMarkContainer =
    function(divId, svg, boardPoints, theme) {
  var markMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var MARK_CONTAINER = glift.enums.svgElements.MARK_CONTAINER;

  svg.selectAll(MARK_CONTAINER).data([1]) // dummy data;
      .enter().append("g")
          .attr('class', MARK_CONTAINER);
  return markMapping;
};

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
  var id = svgutil.elementId(divId, MARK, pt);
  var stoneColor = svg.select('#' + svgutil.elementId(divId, STONE, pt))
      .attr('stone_color');
  var marksTheme = theme.stones[stoneColor].marks;

  // If necessary, clear out intersections and starpoints.  This only applies
  // to when a stone hasn't yet been set (stoneColor === 'EMPTY').
  if (stoneColor === 'EMPTY' && mark === marks.LABEL) {
    svg.select('#' + svgutil.elementId(divId, STARPOINT, pt))
        .attr('opacity', 0);
    svg.select('#' + svgutil.elementId(divId, BOARD_LINE, pt))
        .attr('opacity', 0);
  }

  var node = undefined;
  var fudge = boardPoints.radius / 8;
  // Although not strictly necessary to specify node, since scoping is based
  // on the function, it is semantically convenient to define the node first
  // as undefined, at least to this Java-trained programmer.
  if (mark === marks.LABEL) {
    svg.select('.' + MARK_CONTAINER).append('text')
        .text(label)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('class', MARK)
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em') // for vertical centering
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
  } else if (mark == marks.CIRCLE) {
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else if (mark == marks.STONE_MARKER) {
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('class', MARK)
        .attr('opacity', 0.6)
        .attr('fill', 'blue');
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - fudge;
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
glift.displays.board.createStarPoints = function(
    divId, svg, boardPoints, theme) {
  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  var svgutil = glift.displays.board.svgutil;
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
        var id = svgutil.elementId(divId, STARPOINT, pt);
        starPointIds[pt.hash()] = id;
        return id;
      });
  return starPointIds;
};
/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.createStones = function(divId, svg, boardPoints, theme) {
  var STONE = glift.enums.svgElements.STONE;
  var svgutil = glift.displays.board.svgutil;
  var stoneIdMap = {};
  svg.selectAll(STONE).data(boardPoints.data())
    .enter().append("circle")
      .attr("cx", function(pt) { return pt.coordPt.x(); })
      .attr("cy", function(pt) { return pt.coordPt.y(); })
      .attr("r", boardPoints.radius - .4) // for stroke
      .attr("opacity", 0)
      .attr('class', glift.enums.svgElements.GLIFT_ELEMENT)
      .attr("stone_color", "EMPTY")
      .attr("fill", 'blue') // dummy color
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = svgutil.elementId(divId, STONE, intPt);
        stoneIdMap[intPt.hash()] = id;
        return id;
      });
  return stoneIdMap;
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 *
 * TODO(kashomon): Probably, this should be merged with createStarPoints.
 */
glift.displays.board.createShadows = function(
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
      .attr("fill", theme.stones.shadows.fill)
      .attr("stroke", theme.stones.shadows.stroke)
      .attr("filter", 'url(#' + divId + "_svg_blur)")
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = svgutil.elementId(divId, STONE_SHADOW, intPt);
        shadowMap[intPt.hash()] = id;
        return id;
      });
  return shadowMap;
};


glift.displays.board.initBlurFilter = function(divId, svg) {
  svg.append("svg:defs")
    .append("svg:filter")
      .attr("id", divId + '_svg_blur')
    .append("svg:feGaussianBlur")
      .attr("stdDeviation", 2);
};
glift.displays.board.svgutil = {
  /**
   * Get an ID for a SVG element.
   */
  elementId: function(divId, type, intPt) {
    var base = divId + "_" + type;
    if (intPt !== undefined) {
      return base + '_' + intPt.x() + '_' + intPt.y();
    } else {
      return base;
    }
  },

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
 * Extra GUI methods and data.
 */
glift.displays.gui = {};
/**
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *  }
 */
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
    var vscale = innerHeight / bbox.height();
    var partialTransform = { xScale: vscale, yScale: vscale };
    var newBbox = bbox.fixedScale(vscale);
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
/**
 * Icons taken from: http://raphaeljs.com/icons
 *
 * The bounding boxes are precalculated by running BboxFinder.html
 */
glift.displays.gui.icons = {
   // http://raphaeljs.com/icons/#cross
  cross: function() {
    return {
      string: "M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z",
      "x":8.116,
      "y":7.585,
      "x2":24.778,
      "y2":24.248,
      "width":16.662,
      "height":16.663
    };
  },

  // http://raphaeljs.com/icons/#check
  check: function() {
    return {
      string: "M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z",
      "x":2.379,
      "y":6.733,
      "x2":28.707,
      "y2":25.308,
      "width":26.328,
      "height":18.575
    };
  },

  // http://raphaeljs.com/icons/#refresh
  refresh: function() {
    return {
      string: "M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z",
      "x":3.416,
      "y":3.415,
      "x2":27.583,
      "y2":27.583,
      "width":24.167,
      "height":24.168
    };
  },

  // http://raphaeljs.com/icons/#star3
  star3on: function() {
    return {
      string: "M22.441,28.181c-0.419,0-0.835-0.132-1.189-0.392l-5.751-4.247L9.75,27.789c-0.354,0.26-0.771,0.392-1.189,0.392c-0.412,0-0.824-0.128-1.175-0.384c-0.707-0.511-1-1.422-0.723-2.25l2.26-6.783l-5.815-4.158c-0.71-0.509-1.009-1.416-0.74-2.246c0.268-0.826,1.037-1.382,1.904-1.382c0.004,0,0.01,0,0.014,0l7.15,0.056l2.157-6.816c0.262-0.831,1.035-1.397,1.906-1.397s1.645,0.566,1.906,1.397l2.155,6.816l7.15-0.056c0.004,0,0.01,0,0.015,0c0.867,0,1.636,0.556,1.903,1.382c0.271,0.831-0.028,1.737-0.739,2.246l-5.815,4.158l2.263,6.783c0.276,0.826-0.017,1.737-0.721,2.25C23.268,28.053,22.854,28.181,22.441,28.181L22.441,28.181z",
      "x":2.27025872,
      "y":2.821,
      "x2":28.7268678,
      "y2":28.181,
      "width":26.45660907,
      "height":25.36
    };
  },

  // http://raphaeljs.com/icons/#star3off
  star3off: function() {
    return {
      string: "M28.631,12.359c-0.268-0.826-1.036-1.382-1.903-1.382h-0.015l-7.15,0.056l-2.155-6.816c-0.262-0.831-1.035-1.397-1.906-1.397s-1.645,0.566-1.906,1.397l-2.157,6.816l-7.15-0.056H4.273c-0.868,0-1.636,0.556-1.904,1.382c-0.27,0.831,0.029,1.737,0.74,2.246l5.815,4.158l-2.26,6.783c-0.276,0.828,0.017,1.739,0.723,2.25c0.351,0.256,0.763,0.384,1.175,0.384c0.418,0,0.834-0.132,1.189-0.392l5.751-4.247l5.751,4.247c0.354,0.26,0.771,0.392,1.189,0.392c0.412,0,0.826-0.128,1.177-0.384c0.704-0.513,0.997-1.424,0.721-2.25l-2.263-6.783l5.815-4.158C28.603,14.097,28.901,13.19,28.631,12.359zM19.712,17.996l2.729,8.184l-6.94-5.125L8.56,26.18l2.729-8.184l-7.019-5.018l8.627,0.066L15.5,4.82l2.603,8.225l8.627-0.066L19.712,17.996z",
      "x":2.27070338,
      "y":2.82,
      "x2":28.72944822,
      "y2":28.18,
      "width":26.45874494,
      "height":25.36
    };
  },

  // http://raphaeljs.com/icons/#arrowright2
  'chevron-right': function() {
    return {
      string: "M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z",
      "x":10.129,
      "y":6.276,
      "x2":23.389,
      "y2":25.725,
      "width":13.26,
      "height":19.449
    };
  },

  // http://raphaeljs.com/icons/#arrowleft2
  'chevron-left': function() {
    return {
      string: "M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z",
      "x":8.612,"y":6.276,"x2":21.871,"y2":25.725,"width":13.259,"height":19.449
    };
  },

  // http://raphaeljs.com/icons/#smallgear
  'small-gear': function() {
    return {
      string: "M31.229,17.736c0.064-0.571,0.104-1.148,0.104-1.736s-0.04-1.166-0.104-1.737l-4.377-1.557c-0.218-0.716-0.504-1.401-0.851-2.05l1.993-4.192c-0.725-0.91-1.549-1.734-2.458-2.459l-4.193,1.994c-0.647-0.347-1.334-0.632-2.049-0.849l-1.558-4.378C17.165,0.708,16.588,0.667,16,0.667s-1.166,0.041-1.737,0.105L12.707,5.15c-0.716,0.217-1.401,0.502-2.05,0.849L6.464,4.005C5.554,4.73,4.73,5.554,4.005,6.464l1.994,4.192c-0.347,0.648-0.632,1.334-0.849,2.05l-4.378,1.557C0.708,14.834,0.667,15.412,0.667,16s0.041,1.165,0.105,1.736l4.378,1.558c0.217,0.715,0.502,1.401,0.849,2.049l-1.994,4.193c0.725,0.909,1.549,1.733,2.459,2.458l4.192-1.993c0.648,0.347,1.334,0.633,2.05,0.851l1.557,4.377c0.571,0.064,1.148,0.104,1.737,0.104c0.588,0,1.165-0.04,1.736-0.104l1.558-4.377c0.715-0.218,1.399-0.504,2.049-0.851l4.193,1.993c0.909-0.725,1.733-1.549,2.458-2.458l-1.993-4.193c0.347-0.647,0.633-1.334,0.851-2.049L31.229,17.736zM16,20.871c-2.69,0-4.872-2.182-4.872-4.871c0-2.69,2.182-4.872,4.872-4.872c2.689,0,4.871,2.182,4.871,4.872C20.871,18.689,18.689,20.871,16,20.871z",
      "x":0.667,"y":0.667,"x2":31.333,"y2":31.333,"width":30.666,"height":30.666
    };
  },

  // http://raphaeljs.com/icons/#?2
  'question-box': function() {
    return {
      string: "M26.711,14.086L16.914,4.29c-0.778-0.778-2.051-0.778-2.829,0L4.29,14.086c-0.778,0.778-0.778,2.05,0,2.829l9.796,9.796c0.778,0.777,2.051,0.777,2.829,0l9.797-9.797C27.488,16.136,27.488,14.864,26.711,14.086zM16.431,21.799c-0.248,0.241-0.543,0.362-0.885,0.362c-0.343,0-0.638-0.121-0.886-0.362c-0.247-0.241-0.371-0.533-0.371-0.876s0.124-0.638,0.371-0.885c0.248-0.248,0.543-0.372,0.886-0.372c0.342,0,0.637,0.124,0.885,0.372c0.248,0.247,0.371,0.542,0.371,0.885S16.679,21.558,16.431,21.799zM18.911,15.198c-0.721,0.716-1.712,1.147-2.972,1.294v2.027h-0.844v-3.476c0.386-0.03,0.768-0.093,1.146-0.188c0.38-0.095,0.719-0.25,1.019-0.464c0.312-0.227,0.555-0.5,0.729-0.822c0.174-0.322,0.261-0.77,0.261-1.346c0-0.918-0.194-1.623-0.582-2.113c-0.389-0.49-0.956-0.735-1.701-0.735c-0.281,0-0.527,0.042-0.738,0.124s-0.366,0.16-0.464,0.234c0.031,0.146,0.072,0.357,0.124,0.633c0.052,0.275,0.078,0.486,0.078,0.633c0,0.226-0.098,0.433-0.294,0.619c-0.195,0.187-0.479,0.28-0.853,0.28c-0.33,0-0.565-0.113-0.706-0.339s-0.211-0.489-0.211-0.789c0-0.244,0.067-0.484,0.201-0.72c0.135-0.235,0.346-0.463,0.633-0.684c0.245-0.195,0.577-0.364,0.995-0.504c0.419-0.141,0.854-0.211,1.308-0.211c0.647,0,1.223,0.103,1.724,0.308c0.502,0.205,0.914,0.479,1.238,0.822c0.337,0.355,0.586,0.755,0.748,1.198c0.162,0.444,0.243,0.926,0.243,1.446C19.994,13.558,19.633,14.482,18.911,15.198z",
      "x":3.7065,"y":3.7065,"x2":27.293875,"y2":27.293750,"width":23.587375,"height":23.58725
    };
  },

  // http://raphaeljs.com/icons/#talke
  'question-bubble': function() {
    return {
      string: "M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.982,21.375h-1.969v-1.889h1.969V21.375zM16.982,17.469v0.625h-1.969v-0.769c0-2.321,2.641-2.689,2.641-4.337c0-0.752-0.672-1.329-1.553-1.329c-0.912,0-1.713,0.672-1.713,0.672l-1.12-1.393c0,0,1.104-1.153,3.009-1.153c1.81,0,3.49,1.121,3.49,3.009C19.768,15.437,16.982,15.741,16.982,17.469z",
      "x":2,"y":4.938,"x2":30,"y2":25.938,"width":28,"height":21
    };
  },

  // http://raphaeljs.com/icons/#roadmap
  roadmap: function() {
    return {
      string: "M23.188,3.735c0-0.975-0.789-1.766-1.766-1.766s-1.766,0.791-1.766,1.766s1.766,4.267,1.766,4.267S23.188,4.71,23.188,3.735zM20.578,3.734c0-0.466,0.378-0.843,0.844-0.843c0.467,0,0.844,0.377,0.844,0.844c0,0.466-0.377,0.843-0.844,0.843C20.956,4.578,20.578,4.201,20.578,3.734zM25.281,18.496c-0.562,0-1.098,0.046-1.592,0.122L11.1,13.976c0.199-0.181,0.312-0.38,0.312-0.59c0-0.108-0.033-0.213-0.088-0.315l8.41-2.239c0.459,0.137,1.023,0.221,1.646,0.221c1.521,0,2.75-0.485,2.75-1.083c0-0.599-1.229-1.083-2.75-1.083s-2.75,0.485-2.75,1.083c0,0.069,0.021,0.137,0.054,0.202L9.896,12.2c-0.633-0.188-1.411-0.303-2.265-0.303c-2.088,0-3.781,0.667-3.781,1.49c0,0.823,1.693,1.489,3.781,1.489c0.573,0,1.11-0.054,1.597-0.144l11.99,4.866c-0.19,0.192-0.306,0.401-0.306,0.623c0,0.188,0.096,0.363,0.236,0.532L8.695,25.415c-0.158-0.005-0.316-0.011-0.477-0.011c-3.241,0-5.87,1.037-5.87,2.312c0,1.276,2.629,2.312,5.87,2.312c3.241,0,5.87-1.034,5.87-2.312c0-0.22-0.083-0.432-0.229-0.633l10.265-5.214c0.37,0.04,0.753,0.066,1.155,0.066c2.414,0,4.371-0.771,4.371-1.723C29.65,19.268,27.693,18.496,25.281,18.496z",
      "x":2.348,"y":1.969,"x2":29.65,"y2":30.028,"width":27.302,"height":28.059
    };
  }
};
/**
 * Get Raphael Bboxes.
 * TODO(kashomon): Remove this now that we're using D3.
 */
glift.displays.gui.getRaphaelBboxes = function(robjects) {
  var outBboxes = [];
  for (var i = 0; i < robjects.length; i++) {
    outBboxes.push(robjects[i].getBBox());
  }
  return outBboxes;
};

/**
 * Apply a set of transforms to a Raphael object.
 * TODO(kashomon): Remove this now that we're using D3.
 */
glift.displays.gui.applyTransforms = function(transforms, robjects) {
  for (var i = 0; i < transforms.length; i++) {
    var obj = robjects[i];
    obj.transform(glift.displays.gui.scaleAndMove(
        obj.getBBox(), transforms[i]));
  }
};

/**
 * Get the scaling string based on the raphael bbox and the scaling object.
 * This scales the object, with the scale centered at the top left.
 *
 * The scaleObject looks like the following:
 *  {
 *    xScale: num,
 *    yScale: num,
 *    xMove: num,
 *    yMove
 *  }
 */
glift.displays.gui.scaleAndMove = function(objBbox, scaleObj) {
  return 's' + scaleObj.xScale + ',' + scaleObj.yScale +
      ',' + objBbox.x + ',' + objBbox.y +
      'T' + scaleObj.xMove + ',' + scaleObj.yMove;
};
glift.rules = {};
(function(){
var util = glift.util;

glift.rules.goban = {
  /**
   * Create a Goban instance, just with intersections.
   */
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
    CR: enums.marks.CIRCLE,
    LB: enums.marks.LABEL,
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
   *        stone: "WHITE"
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
      sobj.point = pt;
      sobj.stone = gobanStones[i].color;
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
          throw "Unknown controllerType: " + value;
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
          throw "Bad type for sgfString: " + value;
        }
        break;

      default:
        // Don't do anything.  This is really convenient for widgets.
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
    display.intersections().clearMarks();
    for (var ptHash in intersectionData.points) {
      var intersection = intersectionData.points[ptHash];
      var pt = intersection.point;
      if ('stone' in intersection) {
        var color = intersection.stone;
        display.intersections().setStoneColor(pt, color);
      }
      for (var mark in marks) {
        if (mark in intersection) {
          if (mark === marks.LABEL) {
            display.intersections().addMarkPt(pt, mark, intersection[mark]);
          } else {
            display.intersections().addMarkPt(pt, mark);
          }
        }
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
// Widgets are toplevel objects, which combine display and
// controller/rules bits together.
glift.widgets = {};
glift.widgets.basicProblem = function(options) {
  var displayTypes = glift.enums.displayTypes;
  var boardRegions = glift.enums.boardRegions;
  var point = glift.util.point;
  var divId = options.divId;
  var display = glift.createDisplay(options);

  options.controllerType = "STATIC_PROBLEM_STUDY";
  var controller = glift.createController(options);
  var cropping = glift.bridge.getFromMovetree(controller.movetree);
  glift.bridge.setDisplayState(controller.getEntireBoardState(), display);
  return new glift.widgets._BasicProblem(display, controller);
};

// Basic problem function object.  Meant to be private;
glift.widgets._BasicProblem = function(display, controller) {
  this.display = display;
  this.controller = controller;

  var hoverColors = {
    "BLACK": "BLACK_HOVER",
    "WHITE": "WHITE_HOVER"
  };

  display.intersections().setEvent('click', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    var data = controller.addStone(pt, currentPlayer);
    $('#extra_info').text(data.message + '//' + (data.result || ''));
    if (data.data !== undefined) {
      glift.bridge.setDisplayState(data.data, display);
    }
  });

  display.intersections().setEvent('mouseover', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    if (controller.canAddStone(pt, currentPlayer)) {
      display.intersections().setStoneColor(pt, hoverColors[currentPlayer]);
    }
  });

  display.intersections().setEvent('mouseout', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    if (controller.canAddStone(pt, currentPlayer)) {
      display.intersections().setStoneColor(pt, 'EMPTY');
    }
  });
};

glift.widgets._BasicProblem.prototype = {
  redraw: function() {
    this.display.redraw();
  },

  destroy: function() {
    this.display.destroy();
  },

  /**
   * Enable auto-resizing.  This completely destroys and recreates the goboard.
   * However, this
   *
   * TODO(kashomon): Does this need to be reworked for d3? Also, need to provide
   * a way to turn enableAutoResizing off.
   */
  enableAutoResizing: function() {
    var that = this; // for closing over.
    var resizeFunc = function() {
      that.redraw();
    };

    var timeoutId;
    $(window).resize(function(event) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resizeFunc, 100);
    });
  }
};
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
glift.widgets.iconBar = function(options) {
  var paper = undefined,
      boundingBox = undefined,
      icons = [],
      vertMargin = 0,
      horzMargin = 0,
      theme = 'DEFAULT';
  // TODO(kashomon): Replace this hackiness with legitimate options code.  Much
  // better to keep this code from getting WETter ;).
  if (options.divId !== undefined) {
    throw "Must define 'divId' as an option"
  }

  if (options.icons !== undefined) {
    icons = options.icons;
  }

  if (options.vertMargin !== undefined) {
    vertMargin = options.vertMargin;
  }

  if (options.horzMargin !== undefined) {
    horzMargin = options.horzMargin;
  }

  if (options.theme !== undefined) {
    this.theme = options.theme;
  }

  for (var i = 0; i < icons.length; i++) {
    if (glift.displays.gui.icons[icons[i]] === undefined) {
      throw "Icon string undefined in glift.displays.gui.icons [" +
          icons[i] + "]";
    }
  }

  return new IconBar(divId, boundingBox, theme, icons, vertMargin, horzMargin)
      .draw();
};

var IconBar = function(
    divId, boundingBox, themeName, iconNames, vertMargin, horzMargin) {
  this.divId = divId;
  this.boundingBox = boundingBox;
  this.themeName = themeName;
  this.subTheme = glift.themes.get(themeName).icons;
  this.iconNames = iconNames;
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.iconObjects = {}; // init'd by draw
  this.iconButtons = {}; // init'd by draw
};

IconBar.prototype = {
  draw: function() {
    var gui = glift.displays.gui,
        bboxes = [];
    for (var i = 0; i < this.iconNames.length; i++) {
      var name = this.iconNames[i];
      var iconString = gui.icons[name];
      if (this.subTheme[name] !== undefined) {
        obj.attr(this.subTheme[name]);
      } else {
        obj.attr(this.subTheme['DEFAULT']);
      }
      this.iconObjects[name] = obj;
      raphObjects.push(obj);
    }
    var bboxes = raph.getBboxes(raphObjects);
    var transforms = raph.rowCenter(
        this.boundingBox, bboxes, this.vertMargin, this.horzMargin, 0, 0).transforms;
    raph.applyTransforms(transforms, raphObjects);

    // Create the buttons (without handlers.
    for (var key in this.iconObjects) {
      this.iconButtons[key] = glift.displays.raphael.button(
          this.paper, {name: name}, this.iconObjects[key]);
    }
    return this;
  },

  setHover: function(name, hoverin, hoverout) {
    this.iconButtons[name].setMouseOver(hoverin).setMouseOut(hoverout);
  },

  setClick: function(name, mouseDown, mouseUp) {
    this.iconButtons[name].setClick(mouseDown, mouseUp);
  },

  getIcon: function(name) {
    return {
      name: name,
      obj: this.iconObjects[name],
      button: this.iconButtons[name]
    };
  },

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
    this.forEachIcon(function(icon) {
      icon.obj.remove();
      icon.button.destroy(); // Destroys handlers also.
    });
    this.iconObjects = {};
    this.iconButtons = {};
    return this;
  }
};

})();
(function() {
glift.widgets.problemSeries = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var main = 'glift_internal_main_' + glift.util.idGenerator.next();
  var footer = 'glift_internal_footer_' + glift.util.idGenerator.next();
  options.divId = main;
  var series = new ProblemSeries(options, divId, main, footer);
  return series;
};

ProblemSeries = function(
    options, wrapperDiv, mainDiv, footerDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.mainDiv = mainDiv;
  this.footerDiv = footerDiv;
  this.problemDisplay = undefined;
  this.iconBar = undefined;
  this.draw();
};

ProblemSeries.prototype = {
  draw: function() {
    this.createDivs();
    this.resizeDivs();
    this.problemDisplay = glift.widgets.basicProblem(this.options);
    var margin = ($('#' +  this.mainDiv).width() -
        this.problemDisplay.display.width()) / 2;
    this.iconBar = glift.widgets.iconBar({
      divId: this.footerDiv,
      vertMargin:  5,
      horzMargin: margin,
      icons:  ['chevron-left', 'refresh', 'chevron-right', 'roadmap',
          'small-gear']
    });
  },

  createDivs: function() {
    $('#' + this.wrapperDiv).append('<div id = "' + this.mainDiv + '"></div>');
    $('#' + this.wrapperDiv).append('<div id = "' + this.footerDiv + '"></div>');
    return this;
  },

  resizeDivs: function() {
    var height = $('#' + this.wrapperDiv).height();
    $('#' + this.mainDiv).css({
        position: 'absolute',
        width: '100%',
        height: (height - 50),
        top: 0
    });
    $('#' + this.footerDiv).css({
        'position' : 'absolute',
        'width' : '100%',
        'height' : 50,
        'text-align': 'center',
        'bottom' : 0
    });
    return this;
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.problemDisplay && this.problemDisplay.destroy();
    this.iconBar && this.iconBar.destroy();
    $('#' + this.wrapperDiv).empty();
    return this;
  }
};
})();
