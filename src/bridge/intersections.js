goog.provide('glift.bridge.intersections');

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
 * In the points array, each must object contain a point, and each should contain a
 * mark or a stone.  There can only be a maximum of one stone and one mark
 * (glift.enums.marks).
 */
glift.bridge.intersections = {
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
   *
   * @param {!glift.rules.MoveTree} movetree Glift movetree.
   * @param {!glift.rules.ProblemConditions=} opt_problemConditions Optional
   *    problem conditions.
   * @param {number=} opt_nextVarNumber Optional next variation number.
   */
  // TODO(kashomon): Make this a proper object constructor with accessors and
  // methods and whatnot.  It's getting far too complicated. Alternatively,
  // switch over to the flattener model.
  basePropertyData: function(movetree, opt_problemConditions, opt_nextVarNumber) {
    var out = {
      stones: {
        WHITE: [],
        BLACK: [],
        EMPTY: []
      },
      marks: {},
      comment: null,
      lastMove: null,
      nextMoves: [],
      selectedNextMove: null,
      correctNextMoves: [],
      captures: [],
      displayDataType: glift.enums.displayDataTypes.PARTIAL
    };
    out.comment = movetree.properties().getComment();
    out.lastMove = movetree.getLastMove();
    out.marks = glift.bridge.intersections.getCurrentMarks(movetree);
    out.nextMoves = movetree.nextMoves();
    out.selectedNextMove = opt_nextVarNumber ? out.nextMoves[opt_nextVarNumber] : null;
    out.correctNextMoves = opt_problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree,
            /** @type {!glift.rules.ProblemConditions} */ (opt_problemConditions))
        : [];
    return out;
  },

  /**
   * Extends the basePropertyData with stone data.
   */
  getFullBoardData: function(movetree, goban, problemConditions, nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions, nextVarNumber);
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
   *
   * @param {glift.rules.ProblemConditions=} opt_problemConditions Optional
   *    problem conditions.
   * @param {number=} opt_nextVarNumber Optional next var number.
   */
  nextBoardData: function(
      movetree, currentCaptures, opt_problemConditions, opt_nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, opt_problemConditions, opt_nextVarNumber);
    var allStones = movetree.properties().getAllStones();
    baseData.stones = {};

    // The properties returns moves rather than a list of points. However, the
    // intersections still expect an array of points =(. Thus we need to
    // transform into an array of points here.
    for (var color in allStones) {
      var moves = allStones[color];
      baseData.stones[color] = [];
      for (var i = 0; i < moves.length; i++) {
        baseData.stones[color].push(moves[i].point);
      }
    }
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
      problemConditions, nextVarNumber) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions, nextVarNumber);
    baseData.stones = captures;
    baseData.stones.EMPTY = [];
    for (var color in stones) {
      for (var i = 0; i < stones[color].length; i++) {
        baseData.stones.EMPTY.push(stones[color][i].point);
      }
    }
    return baseData;
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   *
   * returns: map from label to array of points
   */
  // TODO(kashomon): Use the getAllMarks directly from the properties code.
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.bridge.intersections.propertiesToMarks) {
      var mark = glift.bridge.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.rules.prop.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point or a point rectangle.
            var newPts = glift.util.pointArrFromSgfProp(data[i])
            if (newPts.length === 1) {
              // This is handled specially since it's the normal case.
              marksToAdd.push(newPts[0]);
            } else {
              marksToAdd = marksToAdd.concat(newPts);
            }
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  }
};
