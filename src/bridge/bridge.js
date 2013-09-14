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
    var marks = glift.enums.marks;
    display.intersections().clearMarks();
    for (var ptHash in fullBoardData.points) {
      var intersection = fullBoardData.points[ptHash];
      var pt = intersection.point;
      if ('stone' in intersection) {
        var color = intersection.stone;
        display.intersections().setStoneColor(pt, color);
      }
      for (var mark in marks) {
        if (mark in intersection) {
          if (mark === marks.LABEL) {
            display.intersections().addMarkPt(pt, mark, intersection[mark]);
          } else {
            display.intersections().addMarkPt(pt, mark);
          }
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
