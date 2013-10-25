(function() {
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
    CR: glift.enums.marks.CIRCLE,
    LB: glift.enums.marks.LABEL,
    MA: glift.enums.marks.XMARK,
    SQ: glift.enums.marks.SQUARE,
    TR: glift.enums.marks.TRIANGLE
  },

  /**
   * Returns property data -- everything minus the stone data.  The empty stone
   * data object is still supplied so that users can fill in the rest of the
   * data.
   *
   * Ex. of returned object:
   *  {
   *    stones: {
   *      WHITE: [],
   *      BLACK: [],
   *      EMPTY: [] // useful for clearing out captures
   *    },
   *    marks: {
   *      TRIANGLE: [pt, pt, ...],
   *      // It's unfortunate that labels need their own structure.
   *      LABEL: [{point:pt, value: 'val'}, ...]
   *    }
   *    comment : "foo",
   *    lastMove : { color: <color>, point: <point> }
   *    nextMoves : [ { color: <color>, point: <point> }, ...]
   *    correctNextMoves : [ {color: <color>, point: <point> }, ...]
   *    displayDataType : <Either PARTIAL or FULL>.  Defaults to partial.
   *  }
   */
  // TODO(kashomon): Make this a proper object constructor with accessors and
  // methods and whatnot.  It's getting far too complicated.
  basePropertyData: function(movetree, problemConditions) {
    var out = {
      stones: {
        WHITE: [],
        BLACK: [],
        EMPTY: []
      },
      marks: {},
      comment: glift.util.none,
      lastMove: glift.util.none,
      nextMoves: [],
      correctNextMoves: [],
      captures: [],
      displayDataType: glift.enums.displayDataTypes.PARTIAL
    };
    out.comment = movetree.properties().getComment();
    out.lastMove = movetree.getLastMove();
    out.marks = glift.rules.intersections.getCurrentMarks(movetree);
    out.nextMoves = movetree.nextMoves();
    out.correctNextMoves = problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree, problemConditions)
        : [];
    return out;
  },

  /**
   * Extends the basePropertyData with stone data.
   */
  getFullBoardData: function(movetree, goban, problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.displayDataType = glift.enums.displayDataTypes.FULL;
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      baseData.stones[stone.color].push(stone.point);
    }
    return baseData;
  },

  /**
   * CurrentCaptures is expected to look like:
   *
   * {
   *    BLACK: [..pts..],
   *    WHITE: [..pts..]
   * }
   */
  nextBoardData: function(movetree, currentCaptures, problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.stones = movetree.properties().getAllStones();
    baseData.stones.EMPTY = [];
    for (var color in currentCaptures) {
      for (var i = 0; i < currentCaptures[color].length; i++) {
        baseData.stones.EMPTY.push(currentCaptures[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Ascertain the previous board state.  This requires knowing what the 'next'
   * moves (stones) and captures were.
   */
  // TODO(kashomon): Reduce duplication with nextBoardData.
  previousBoardData: function(movetree, stones, captures,
      problemConditions) {
    var baseData = glift.rules.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.stones = captures;
    baseData.stones.EMPTY = [];
    for (var color in stones) {
      for (var i = 0; i < stones[color].length; i++) {
        baseData.stones.EMPTY.push(stones[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   */
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.rules.intersections.propertiesToMarks) {
      var mark = glift.rules.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          var pt = {}, value = true;
          if (prop === glift.sgf.allProperties.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point
            marksToAdd.push(glift.util.pointFromSgfCoord(data[i]));
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  }
};

})();
