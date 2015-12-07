goog.provide('glift.flattener.board');
goog.provide('glift.flattener.Board');

glift.flattener.board = {
  /**
   * Constructs a board object: a 2D array of intersections.
   *
   * @param {!glift.orientation.Cropbox} cropping A cropping object, which says
   *    how to crop the board.
   * @param {!Object<!glift.rules.Move>} stoneMap A map from pt-string to
   *    move.
   * @param {!Object<glift.flattener.symbols>} markMap A map from pt-string to
   *    mark symbol.
   * @param {!Object<string>} labelMap A map from pt-string to label string
   *
   * @return {!glift.flattener.Board<Intersection>}
   */
  create: function(cropping, stoneMap, markMap, labelMap) {
    var point = glift.util.point;
    var board = [];
    var bbox = cropping.bbox;
    for (var y = bbox.top(); y <= bbox.bottom(); y++) {
      var row = [];
      for (var x = bbox.left(); x <= bbox.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var stoneColor = stone ? stone.color : undefined;
        var mark = markMap[ptStr];
        var label = labelMap[ptStr]
        row.push(glift.flattener.intersection.create(
            pt, stoneColor, mark, label, cropping.size));
      }
      board.push(row);
    }
    return new glift.flattener.Board(board, bbox, cropping.size);
  }
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
   * Provide a SGF Point (intersection-point) and retrieve the relevant
   * intersection.  Note, this uses the board indexing as opposed to the indexing
   * in the array.
   *
   * @param {!glift.Point|number} ptOrX a Point object or, optionaly, a number.
   * @param {number=} opt_y If the first param is a number.
   *
   * @return {T} Intersection or null if the
   *    coordinate is out of bounds.
   */
  getIntBoardPt: function(ptOrX, opt_y) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(opt_y) === 'number') {
      var pt = glift.util.point(ptOrX, opt_y);
    } else {
      var pt = ptOrX;
    }
    return this.getInt(this.boardPtToPt(pt));
  },

  /**
   * Get an intersection from a the intersection table. Uses the absolute array
   * positioning. Returns undefined if the pt doesn't exist on the board.
   *
   * @param {!glift.Point|number} ptOrX a Point object or, optionaly, a number.
   * @param {number=} opt_y If the first param is a number.
   *
   * @return {T}
   */
  getInt: function(ptOrX, opt_y) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(opt_y) === 'number') {
      var pt = glift.util.point(ptOrX, opt_y);
    } else {
      var pt = ptOrX;
    }
    var row = this.boardArray_[pt.y()];
    if (!row) { return null };
    return row[pt.x()] || null;
  },

  /**
   * Turns a 0 indexed pt to a point that's board-indexed.
   * @param {!glift.Point} pt
   * @return {!glift.Point} The translated point
   */
  ptToBoardPt: function(pt) {
    return pt.translate(this.bbox_.left(), this.bbox_.top());
  },

  /**
   * Turns a 0 indexed pt to a point that's board-indexed.
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
   * Returns the size of the board. Usually 9, 13 or 19.
   * @return {number}
   */
  maxBoardSize: function() {
    return this.maxBoardSize_;
  },

  /**
   * Returns the height of the Go board. Note that this won't necessarily be the
   * length of the board - 1 due to cropping.
   * @return {number}
   */
  height: function() {
    return this.boardArray_.length;
  },

  /**
   * Returns the width of the Go board. Note that this won't necessarily be the
   * length of the board - 1 due to cropping.
   * @return {number}
   */
  width: function() {
    // Here we assume that the Go board is rectangular.
    return this.boardArray_[0].length;
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
  }
};
