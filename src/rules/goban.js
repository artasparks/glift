goog.provide('glift.rules.CaptureResult');
goog.provide('glift.rules.Goban');
goog.provide('glift.rules.StoneResult');
goog.provide('glift.rules.goban');

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
  this.ints = ints || 19;

  /** @private {!Array<glift.enums.states>} */
  this.stones = glift.rules.initStones_(ints);
};

glift.rules.Goban.prototype = {
  /** @return {number} The number of intersections. */
  intersections: function() {
    return this.ints;
  },

  /**
   * getStone helps abstract the nastiness and trickiness of having to use the x/y
   * indices in the reverse order.
   *
   * @param {!glift.Point} point
   * @return {!glift.enums.states} the state of the intersection
   */
  getStone: function(point) {
    return this.stones[point.y()][point.x()];
  },

  /**
   * Get all the placed stones on the board (BLACK or WHITE)
   *
   * @return {!Array<!glift.rules.Move>}
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

  /**
   * @param {!glift.Point} point
   * @param {!glift.enums.states=} opt_color Optional (currently unused) color.
   * @return {boolean} True if the board is empty at particular point and the
   *    point is within the bounds of the board.
   */
  placeable: function(point, opt_color) {
    // Currently, color is unused, but there are plans to use it because
    // self-capture is disallowed. Add-stone will still fail.
    return this.inBounds(point)
        && this.getStone(point) === glift.enums.states.EMPTY;
  },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the point is out-of-bounds.
   */
  outBounds: function(point) {
    return glift.util.outBounds(point.x(), this.ints)
        || glift.util.outBounds(point.y(), this.ints);
  },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the point is in-bounds.
   */
  inBounds: function(point) {
    return glift.util.inBounds(point.x(), this.ints)
        && glift.util.inBounds(point.y(), this.ints);
  },

  /**
   * Clear a stone from an intersection
   * @param {!glift.Point} point
   */
  clearStone: function(point) {
    this._setColor(point, glift.enums.states.EMPTY);
  },

  /**
   * Clear an array of stones on the board.
   * @param {!Array<!glift.Point>} points
   */
  clearSome: function(points) {
    for (var i = 0; i < points.length; i++) {
      this.clearStone(points[i]);
    }
  },

  /**
   * @param {!glift.Point} point
   * @param {glift.enums.states} color
   * @private
   */
  _setColor: function(point, color) {
    this.stones[point.y()][point.x()] = color;
  },

  /**
   * Try to add a stone on a new go board instance, but don't change state.
   *
   * Returns true / false depending on whether the 'add' was successful.
   *
   * @param {!glift.Point} point
   * @param {glift.enums.states} color
   */
  // TODO(kashomon): Itself needs a test.
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
   * @param {!glift.Point} pt A point
   * @param {glift.enums.states} color The State to add.
   * @return {!glift.rules.StoneResult}
   */
  addStone: function(pt, color) {
    if (!glift.util.colors.isLegalColor(color)) throw "Unknown color: " + color;

    // Add stone fail.  Return a failed StoneResult.
    if (this.outBounds(pt) || !this.placeable(pt))
      return new glift.rules.StoneResult(false);

    this._setColor(pt, color); // set stone as active
    var captures = new glift.rules.CaptureTracker_();
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
        return new glift.rules.StoneResult(false);
      }
    }

    var actualCaptures = captures.getCaptures();
    // Remove the captures from the board.
    this.clearSome(actualCaptures);
    return new glift.rules.StoneResult(true, actualCaptures);
  },

  /**
   * Get the captures.  We return nothing because state is stored in 'captures'
   *
   * @param {!glift.rules.CaptureTracker_} captures
   * @param {!glift.Point} pt
   * @param {glift.enums.states} color
   */
  _getCaptures: function(captures, pt, color) {
    this._findConnected(captures, pt, color);
    if (captures.liberties <= 0) captures.consideringToCaptures();
    captures.clearExceptCaptures();
  },

  /**
   * Find the stones of the same color connected to eachother.  The color to
   * find is the param color. We return nothing because state is stored in
   * 'captures'.
   *
   * @param {!glift.rules.CaptureTracker_} captures
   * @param {!glift.Point} pt
   * @param {glift.enums.states} color
   */
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

  /**
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

  /**
   * Back out a movetree addition (used for going back a move).
   *
   * Recall that stones and captures both have the form:
   *  { BLACK: [..move..], WHITE: [..move..] };
   *
   * @param {!glift.rules.MoveCollection} stones
   * @param {!glift.rules.CaptureResult} captures
   */
  // TODO(kashomon): Add testing for this in goban_test
  unloadStones: function(stones, captures) {
    for (var color in stones) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.rules.Move>} */ (stones[c]);
      for (var j = 0; j < arr.length; j++) {
        var move = arr[j];
        if (move.point) {
          this.clearStone(move.point);
        }
      }
    }
    for (var color in captures) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.Point>} */ (captures[c]);
      for (var i = 0; i < arr.length; i++) {
        this.addStone(arr[i], c);
      }
    }
  }
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
 * CaptureTracker is a utility object that assists in keeping track of captures.
 * As an optimization, we keep track of points we've seen for efficiency.
 *
 * @private
 * @constructor @final @struct
 */
glift.rules.CaptureTracker_ = function() {
  this.toCapture = {}; // set of points to capture (mapping pt.hash() -> true)
  this.numCaptures = 0;
  this.considering = []; // list of points we're considering to capture
  this.seen = {}; // set of points we've seen (mapping pt.hash() -> true)
  this.liberties = 0;
};

glift.rules.CaptureTracker_.prototype = {
  /** Clear everything except captures */
  clearExceptCaptures: function() {
    this.considering = [];
    this.seen = {};
    this.liberties = 0;
  },

  /** Add points-to-consider to capture */
  consideringToCaptures: function() {
    for (var i = 0; i < this.considering.length; i++) {
      var value = this.considering[i];
      if (this.toCapture[value.hash()] === undefined) {
        this.toCapture[value.hash()] = true;
        this.numCaptures++;
      }
    }
  },

  /**
   * Add to the liberties
   * @param {number} x
   */
  addLiberties: function(x) {
    this.liberties += x;
  },

  /** @param {!glift.Point} point add a point to the seen-map */
  addSeen: function(point) {
    this.seen[point.hash()] = true;
  },

  /** @return {!Array<!glift.Point>} */
  getCaptures: function() {
    var out = [];
    for (var key in this.toCapture) {
      out.push(glift.util.pointFromHash(key));
    }
    return out;
  }
};

/**
 * The stone result keeps track of whether placing a stone was successful and what
 * stones (if any) were captured.
 *
 * @param {boolean} success Whether or not the stone-placement was successful.
 * @param {!Array<!glift.Point>=} opt_captures The Array of captured points, if
 *    there are any captures
 * @constructor @final @struct
 */
glift.rules.StoneResult = function(success, opt_captures) {
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
};
