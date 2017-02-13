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
   * @param {!glift.flattener.MarkMap} markMap A map from pt-string to
   *    mark symbol, and a map from pt-string to label string.
   *
   * @return {!glift.flattener.Board<Intersection>}
   */
  create: function(cropping, stoneMap, markMap) {
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
        var mark = markMap.marks[ptStr];
        var label = markMap.labels[ptStr]
        row.push(glift.flattener.intersection.create(
            pt, stoneColor, mark, label, cropping.size));
      }
      board.push(row);
    }
    return new glift.flattener.Board(board, bbox, cropping.size);
  },

  /**
   * A specialized diffing function to be used for display. This differ checkes
   * whether the stone-layer as different OR the the new intersection has a mark
   * (even if it's the same).
   *
   * @param {!glift.flattener.Intersection} oldPoint
   * @param {!glift.flattener.Intersection} newPoint
   * @return {boolean} Whether or not these points are different
   */
  displayDiff:  function(oldPoint, newPoint) {
    if (newPoint.mark()) {
      // Any time there's a mark, we want to display it, so consider this point
      // as being different.
      return true;
    }
    return oldPoint.stone() !== newPoint.stone();
  },
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
   * Returns the size of the board. Usually 9, 13 or 19.
   * @return {number}
   */
  maxBoardSize: function() {
    return this.maxBoardSize_;
  },

  /**
   * Gets the go-intersection at the top left, respecting cropping.
   * @return {!glift.Point}
   */
  topLeft: function() {
    return this.ptToBoardPt(new glift.Point(0,0));
  },

  /**
   * Gets the go-intersection at the bottom right, respecting cropping.
   * @return {!glift.Point}
   */
  botRight: function() {
    return this.topLeft().translate(this.width() - 1, this.height() - 1);
  },

  /**
   * Returns the bounding box (in intersections) of the board.
   * @return {!glift.orientation.BoundingBox}
   */
  boundingBox: function() {
    return new glift.orientation.BoundingBox(this.topLeft(), this.botRight());
  },

  /** @return {boolean} Returns whether the board is cropped. */
  isCropped: function() {
    return this.width() !== this.maxBoardSize() ||
        this.height() !== this.maxBoardSize();
  },

  /**
   * Returns the height of the Go board in intersections. Note that this won't
   * necessarily be the length of the board - 1 due to cropping.
   * @return {number}
   */
  height: function() {
    return this.boardArray_.length;
  },

  /**
   * Returns the width of the Go board in intersections. Note that this won't
   * necessarily be the length of the board - 1 due to cropping.
   * @return {number}
   */
  width: function() {
    // Here we assume that the Go board is rectangular.
    return this.boardArray_[0].length;
  },

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
      var pt = /** @type {!glift.Point} */ (ptOrX);
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
   * diff to make sense, the boards must have the same type. This compares each
   * intersection and, if they are not equal, adds the intersection to the
   * output.
   *
   * It is required that the boards be the same dimensions, or else an error is
   * thrown.
   *
   * @param {!glift.flattener.Board<T>} newBoard
   * @return {!Array<!glift.flattener.BoardDiffPt<T>>}
   */
  diff: function(newBoard) {
    /**
     * @param {T} oldPoint
     * @param {T} newPoint
     * @return boolean Whether or not these points are different (or rather, not
     *    equal for this particular diffFn).
     */
    var diffFn = function(oldPoint, newPoint) {
      if (oldPoint.equals && typeof oldPoint.equals === 'function') {
        // Equals is defined, let's use it.
        return !oldPoint.equals(newPoint);
      } else {
        // Use regular !== since equals isn't defined
        return oldPoint !== newPoint;
      }
    };
    return this.differ(newBoard, diffFn);
  },

  /**
   * General method for performing diff-ing. Takes a newBoard and a function for
   * determining if the points are different.
   *
   * @param {!glift.flattener.Board<T>} newBoard
   * @param {!function(T, T):boolean} diffFn A diffFn is a function that takes
   *    two parameters: the old point and the new point. If they are
   *    different, the diffFn returns true (answering the question: 'are they
   *    different?') and returns false if they are thsame.
   */
  differ: function(newBoard, diffFn) {
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

        // Out of bounds. This shouldn't happen if the diff function is used in
        // a sane way.
        if (!newIntp) { break; }
        var ptsAreDifferent = diffFn(intp, newIntp);
        if (ptsAreDifferent) {
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
