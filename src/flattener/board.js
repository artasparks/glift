glift.flattener.board = {
  /**
   * Constructs a board object: a 2D array of intersections.
   *
   * cbox: a bounding box from a crop box.
   * stoneMap: map from pt-string to stone {point: <pt>, color: <color>}
   * markMap: map from pt-string to mark symbol (flattener.symbols)
   * labelMap: map from pt-string to label string
   * ints: max intersections of the board (typically 9, 13, or 19)
   */
  create: function(cbox, stoneMap, markMap, labelMap, ints) {
    var point = glift.util.point;
    var board = [];
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
            pt, stoneColor, mark, label, ints));
      }
      board.push(row);
    }
    return new glift.flattener._Board(board, cbox);
  },
};

/**
 * Board object.  Meant to be created with the static constuctor method 'create'.
 */
glift.flattener._Board = function(boardArray, cbox) {
  /** 2D Array of intersections. */
  this._boardArray = boardArray;

  /** Bounding box for the crop box. */
  this._cbox = cbox;
};

glift.flattener._Board.prototype = {
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant
   * intersection.  Note, this uses the board indexing as opposed to the indexing
   * in the array.
   */
  getIntBoardIdx: function(pt) {
    var row = this._boardArray[pt.y() - this._cbox.top()];
    if (row === undefined) { return row; }
    return row[pt.x() - this._cbox.left()];
  },

  /**
   * Get an intersection from a the intersection table. Uses the absolute array
   * positioning. Returns undefined if the pt doesn't exist on the board.
   */
  getInt: function(pt) {
    var row = this.boardArray[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  ptToBoardPt: function(pt) {
    return glift.util.point(
        pt.x() + this._cbox.left(),
        pt.y() + this._cbox.top());
  },

  /** Returns the board array of intersections. */
  intersections: function() {
    return this._boardArray;
  }
};
