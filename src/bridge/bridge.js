/**
 * The bridge is the only place where display and rules+controller code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion, see intersections in glift.rules.
   */
  setDisplayState: function(boardData, display, showVariations) {
    display.intersections().clearMarks();
    if (boardData.displayDataType === glift.enums.displayDataTypes.FULL) {
      display.intersections().clearAll();
    }
    for (var color in boardData.stones) {
      for (var i = 0; i < boardData.stones[color].length; i++) {
        var pt = boardData.stones[color][i];
        display.intersections().setStoneColor(pt, color);
      }
    }

    var variationMapping = {};
    if (glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
      variationMapping = glift.bridge.variationMapping(boardData);
    }

    var marks = glift.enums.marks;
    for (var markType in boardData.marks) {
      for (var i = 0; i < boardData.marks[markType].length; i++) {
        var markData = boardData.marks[markType][i];
        if (markType === marks.LABEL) {
          if (variationMapping[markData.point.toString()] !== undefined) {
            display.intersections().addMarkPt(
                markData.point, marks.VARIATION_MARKER, markData.value);
            delete variationMapping[markData.point.toString()];
          } else {
            display.intersections().addMarkPt(
                markData.point, marks.LABEL, markData.value);
          }
        } else {
          display.intersections().addMarkPt(markData, markType);
        }
      }
    }

    var i = 1;
    for (var ptstring in variationMapping) {
      var pt = variationMapping[ptstring];
      display.intersections().addMarkPt(pt, marks.VARIATION_MARKER, i);
      i += 1;
    }

    if (boardData.lastMove && boardData.lastMove !== glift.util.none) {
      var lm = boardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
  },

  shouldShowNextMoves: function(boardData, showVariations) {
    return boardData.nextMoves &&
      ((boardData.nextMoves.length > 1 &&
          showVariations === glift.enums.showVariations.MORE_THAN_ONE) ||
      (boardData.nextMoves.length >= 1 &&
          showVariations === glift.enums.showVariations.ALWAYS));
  },

  variationMapping: function(boardData) {
    var out = {};
    for (var i = 0; i < boardData.nextMoves.length; i++) {
      var nextMove = boardData.nextMoves[i];
      if (nextMove.point !== undefined) {
        out[nextMove.point.toString()] = nextMove.point;
      } else {
        // This is a 'pass'
      }
    }
    return out;
  }
};

