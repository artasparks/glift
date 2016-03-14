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
  this.ints_ = ints;

  /** @private {!Array<glift.enums.states>} */
  this.stones = glift.rules.initStones_(ints);
};

glift.rules.Goban.prototype = {
  /** @return {number} The number of intersections. */
  intersections: function() {
    return this.ints_;
  },

  /**
   * Retrieves a state (color) from the board. Accepts either a point object or
   * an X and Y.
   *
   * @param {!glift.Point|number} pointOrX
   * @param {!number=} opt_y
   * @return {!glift.enums.states} the state of the intersection
   */
  getStone: function(pointOrX, opt_y) {
    if (typeof pointOrX === 'number' && typeof opt_y === 'number') {
      var x = /** @type {number} */ (pointOrX);
      var y = /** @type {number} */ (opt_y);
      return this.stones[y][x];
    } else if (typeof pointOrX === 'object') {
      var pt = /** @type {!glift.Point} */ (pointOrX);
      return this.stones[pt.y()][pt.x()];
    } else {
      throw new Error('Invalid arguments: pointOrX: ' + pointOrX + ', opt_y:' + opt_y);
    }
  },

  /**
   * Set a color without performing any validation. Accepts either a point
   * object or an X and Y.
   *
   * @param {glift.enums.states} color
   * @param {!glift.Point|number} pointOrX
   * @param {!number=} opt_y
   * @private
   */
  setColor_: function(color, pointOrX, opt_y) {
    if (typeof pointOrX === 'number' && typeof opt_y === 'number') {
      var x = /** @type {number} */ (pointOrX);
      var y = /** @type {number} */ (opt_y);
      this.stones[y][x] = color;
    } else if (typeof pointOrX === 'object') {
      var pt = /** @type {!glift.Point} */ (pointOrX);
      this.stones[pt.y()][pt.x()] = color;
    } else {
      throw new Error('Invalid arguments: pointOrX: ' + pointOrX + ', opt_y:' + opt_y);
    }
  },

  /**
   * Get all the placed stones on the board (BLACK or WHITE)
   * @return {!Array<!glift.rules.Move>}
   */
  getAllPlacedStones: function() {
    var out = [];
    for (var i = 0; i < this.intersections(); i++) {
      for (var j = 0; j < this.intersections(); j++) {
        var color = this.getStone(j, i);
        if (color === glift.enums.states.BLACK ||
            color === glift.enums.states.WHITE) {
          out.push({point: glift.util.point(j, i), color:color});
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
    return glift.util.outBounds(point.x(), this.intersections())
        || glift.util.outBounds(point.y(), this.intersections());
  },

  /**
   * @param {!glift.Point} point
   * @return {boolean} True if the point is in-bounds.
   */
  inBounds: function(point) {
    return glift.util.inBounds(point.x(), this.intersections())
        && glift.util.inBounds(point.y(), this.intersections());
  },

  /**
   * Clear a stone from an intersection
   * @param {!glift.Point} point
   */
  clearStone: function(point) {
    this.setColor_(glift.enums.states.EMPTY, point);
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
   * Try to add a stone on a new go board instance, but don't change state.
   *
   * Returns true / false depending on whether the 'add' was successful.
   *
   * @param {!glift.Point} point
   * @param {glift.enums.states} color
   */
  testAddStone: function(point, color) {
    var addStoneResult = this.addStone(point, color);

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
    if (this.outBounds(pt) || !this.placeable(pt)) {
      return new glift.rules.StoneResult(false);
    }

    // Set the stone as active and see what happens!
    this.setColor_(color, pt);

    // First find the connected groups on each of the cardinal directions.
    var captures = new glift.rules.CaptureTracker_();
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
        var newGroup = this.findConnected(nborPt, oppColor);
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

    if (capturedGroups.length === 0) {
      // If a move doesn't capture, then it's possible that the move is self
      // capture. If there are captured groups, this is not an issue.
      //
      // So, let's find the connected group for the stone placed.
      var g = this.findConnected(pt, color);
      if (g.liberties === 0) {
        // Onos! The move is self capture.
        this.clearStone(pt);
        return new glift.rules.StoneResult(false);
      }
    }

    // Remove the captures from the board.
    var capturedPoints = [];
    for (var i = 0; i < capturedGroups.length; i++) {
      var g = capturedGroups[i];
      for (var j = 0; j < g.group.length; j++) {
        var capPoint = g.group[j].point;
        capturedPoints.push(capPoint);
        this.clearStone(capPoint);
      }
    }

    // Finally, test for Ko. Some rulesets specify that repeating board
    // positions are not allowed. This is too expensive and generally unnecesary
    // except in rare cases.
    // if (actualCaptures.length === 1) {
      // var pt = actualCaptures[0]
      // var captures = this.getCaptures_(newglift.rules.CaptureTracker_
    // }

    return new glift.rules.StoneResult(true, capturedPoints);
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
   * Gets the captures at a point with a given color.
   *
   * @param {!glift.Point} inPoint
   * @param {!glift.enums.states} color
   * @return {!glift.rules.ConnectedGroup} A connected group, with an
   *    associated number of liberties.
   */
  findConnected: function(inPoint, color) {
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
      if (this.inBounds(outp)) {
        out.push(outp);
      }
    }
    return out;
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
  this.toCapture = {}; // set of points to capture (mapping pt str -> true)
  this.numCaptures = 0;
  this.considering = []; // list of points we're considering to capture
  this.seen = {}; // set of points we've seen (mapping pt str -> true)
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
      if (this.toCapture[value.toString()] === undefined) {
        this.toCapture[value.toString()] = true;
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

  /**
   * @param {!glift.Point} point add a point to the seen-map
   */
  addSeen: function(point) {
    this.seen[point.toString()] = true;
  },

  /** @return {!Array<!glift.Point>} */
  getCaptures: function() {
    var out = [];
    for (var key in this.toCapture) {
      out.push(glift.util.pointFromString(key));
    }
    return out;
  }
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
