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
  setDisplayState: function(fullBoardData, display, showVariations) {
    display.intersections().clearMarks();
    for (var color in fullBoardData.stones) {
      for (var i = 0; i < fullBoardData.stones[color].length; i++) {
        var pt = fullBoardData.stones[color][i];
        display.intersections().setStoneColor(pt, color);
      }
    }

    var marks = glift.enums.marks;
    for (var markType in fullBoardData.marks) {
      for (var i = 0; i < fullBoardData.marks[markType].length; i++) {
        var markData = fullBoardData.marks[markType][i];
        if (markType === marks.LABEL) {
          display.intersections().addMarkPt(
              markData.point, markType, markData.value);
        } else {
          display.intersections().addMarkPt(markData, markType);
        }
      }
    }

    if (fullBoardData.nextMoves &&
        ((fullBoardData.nextMoves.length > 1 &&
            showVariations === glift.enums.showVariations.MORE_THAN_ONE) ||
        (fullBoardData.nextMoves.length >= 1 &&
            showVariations === glift.enums.showVariations.ALWAYS))) {
      for (var i = 0; i < fullBoardData.nextMoves.length; i++) {
        var nextMove = fullBoardData.nextMoves[i];
        display.intersections().addMarkPt(
            nextMove.point, marks.VARIATION_MARKER, i + 1);
      }
    }

    if (fullBoardData.lastMove && fullBoardData.lastMove !== glift.util.none) {
      var lm = fullBoardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
  }
};
