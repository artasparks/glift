(function(){
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
    if (mv != glift.util.none) {
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
