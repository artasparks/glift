goog.provide('glift.rules.Goban');
goog.provide('glift.rules.StoneResult');
goog.provide('glift.rules.goban');
goog.provide('glift.rules.ConnectedGroup');
goog.provide('glift.rules.CaptureResult');

/**
 * Result of a Capture
 *
 * @typedef {{
 *   WHITE: !Array<!glift.Point>,
 *   BLACK: !Array<!glift.Point>
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
   *   captures: !Array<!glift.rules.CaptureResult>,
   *   clearHistory: !Array<!Array<!glift.rules.Move>>
   * }}
   */
  getFromMoveTree: function(mt, opt_treepath) {
    var treepath = opt_treepath || mt.treepathToHere();
    var goban = new glift.rules.Goban(mt.getIntersections()),
        movetree = mt.getTreeFromRoot(),
        clearHistory = [],
        captures = []; // array of captures.
    goban.loadStonesFromMovetree(movetree); // Load root placements.
    // We don't consider clear-locations (AE) properties at the root because why
    // the heck would you do that?

    for (var i = 0;
        i < treepath.length && movetree.node().numChildren() > 0;
        i++) {
      movetree.moveDown(treepath[i]);
      clearHistory.push(goban.applyClearLocationsFromMovetree(movetree));
      captures.push(goban.loadStonesFromMovetree(movetree));
    }
    return {
      goban: goban,
      captures: captures,
      clearHistory: clearHistory,
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
    return this.inBounds_(point)
        && !point.equals(this.koPoint_)
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
   * @return {glift.enums.states} color of the location cleared
   */
  clearStone: function(point) {
    this.clearKo();
    var color = this.getStone(point);
    this.setColor(point, glift.enums.states.EMPTY);
    return color;
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
        this.setColor(addStoneResult.captures[i], oppositeColor);
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
    if (!(color === glift.enums.states.BLACK ||
        color === glift.enums.states.WHITE ||
        color === glift.enums.states.EMPTY)) {
      throw "Unknown color: " + color;
    }

    // Add stone fail.  Return a failed StoneResult.
    if (!this.placeable(pt)) {
      return new glift.rules.StoneResult(false);
    }

    // Set the stone as active and see what happens!
    this.setColor(pt, color);

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
      this.setColor(capPt, oppColor);
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
   * @param {!glift.rules.MoveTree} movetree
   * @return {!glift.rules.CaptureResult} The black and white captures.
   */
  loadStonesFromMovetree: function(movetree) {
    /** @type {!Array<glift.enums.states>} */
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    var captures = { BLACK : [], WHITE : [] };
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];
      var placements = movetree.properties().getPlacementsAsPoints(color);
      for (var j = 0, len = placements.length; j < len; j++) {
        this.loadStone_({point: placements[j], color: color}, captures);
      }
    }
    this.loadStone_(movetree.properties().getMove(), captures);
    return captures;
  },

  /**
   * For the current position in the movetree, apply the clear-locations (AE),
   * returning any intersections that were actually cleared. Returns an empty
   * array if AE doesn't exist or no locations were cleared.
   *
   * @param {!glift.rules.MoveTree} movetree
   * @return {!Array<!glift.rules.Move>} the cleared stones.
   */
  applyClearLocationsFromMovetree: function(movetree) {
    var clearLocations = movetree.properties().getClearLocationsAsPoints();
    var outMoves = [];
    for (var i = 0; i < clearLocations.length; i++) {
      var pt = clearLocations[i];
      var color = this.clearStone(pt);
      if (color !== glift.enums.states.EMPTY) {
        outMoves.push({point: pt, color: color});
      }
    }
    return outMoves;
  },

  /////////////////////
  // Private Methods //
  /////////////////////

  /**
   * Set a color without performing any validation. Use with Caution!!
   *
   * @param {glift.enums.states} color
   * @param {!glift.Point} pt
   */
  setColor: function(pt, color) {
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
