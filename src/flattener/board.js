glift.flattener.board = {
  /**
   * Constructs a board object: a 2D array of intersections.
   *
   * cropping: A cropping object, which says how to crop the board.
   * stoneMap: map from pt-string to stone {point: <pt>, color: <color>}
   * markMap: map from pt-string to mark symbol (flattener.symbols)
   * labelMap: map from pt-string to label string
   */
  create: function(cropping, stoneMap, markMap, labelMap) {
    var point = glift.util.point;
    var board = [];
    var cbox = cropping.cbox();
    for (var y = cbox.top(); y <= cbox.bottom(); y++) {
      var row = [];
      for (var x = cbox.left(); x <= cbox.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var stoneColor = stone ? stone.color : undefined;
        var mark = markMap[ptStr];
        var label = labelMap[ptStr]
        row.push(glift.flattener.intersection.create(
            pt, stoneColor, mark, label, cropping.maxBoardSize()));
      }
      board.push(row);
    }
    return new glift.flattener._Board(board, cbox, cropping.maxBoardSize());
  }
};

/**
 * Board object.  Meant to be created with the static constuctor method 'create'.
 */
glift.flattener._Board = function(boardArray, cbox, maxBoardSize) {
  /**
   * 2D Array of intersections. Generally, this is an array of intersections,
   * but could be backed by a different underlying objects based on a
   * transformation.
   */
  this._boardArray = boardArray;

  /** Bounding box for the crop box. */
  this._cbox = cbox;

  /** Maximum board size.  Generally 9, 13, or 19. */
  this._maxBoardSize = maxBoardSize;
};

glift.flattener._Board.prototype = {
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant
   * intersection.  Note, this uses the board indexing as opposed to the indexing
   * in the array.
   */
  getIntBoardPt: function(ptOrX, optionalY) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(optionalY) === 'number') {
      var pt = glift.util.point(ptOrX, optionalY);
    } else {
      var pt = ptOrX;
    }
    return this.getInt(this.boardPtToPt(pt));
  },

  /**
   * Get an intersection from a the intersection table. Uses the absolute array
   * positioning. Returns undefined if the pt doesn't exist on the board.
   */
  getInt: function(ptOrX, optionalY) {
    if (glift.util.typeOf(ptOrX) === 'number' &&
        glift.util.typeOf(optionalY) === 'number') {
      var pt = glift.util.point(ptOrX, optionalY);
    } else {
      var pt = ptOrX;
    }
    var row = this._boardArray[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  ptToBoardPt: function(pt) {
    return pt.translate(this._cbox.left(), this._cbox.top());
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  boardPtToPt: function(pt) {
    return pt.translate(-this._cbox.left(), -this._cbox.top());
  },

  /** Returns the board array. */
  boardArray: function() {
    return this._boardArray;
  },

  /** Returns the size of the board. Usually 9, 13 or 19. */
  maxBoardSize: function() {
    return this._maxBoardSize;
  },

  /** Returns the height of the Go board. */
  height: function() {
    return this._boardArray.length;
  },

  /** Returns the width of the Go board. */
  width: function() {
    // Here we assume that the Go board is rectangular.
    return this._boardArray[0].length;
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
   */
  transform: function(fn) {
    var outArray = [];
    for (var y = 0; y < this._boardArray.length; y++) {
      var row = [];
      // Assumes a rectangular double array but this should always be the case.
      for (var x = 0; x < this._boardArray[0].length; x++) {
        var intersect = this._boardArray[y][x];
        row.push(fn(intersect, x, y));
      }
      outArray.push(row);
    }
    return new glift.flattener._Board(outArray, this._cbox, this._maxBoardSize);
  }
};
