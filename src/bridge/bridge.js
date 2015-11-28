goog.provide('glift.bridge');

/**
 * A bridge between the UI code and the data/logic code living in rules/widget.
 *
 * The bridge is the only place where display and core rules/widget code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion of the objects, see intersections.js in
   * glift.bridge.
   */
  setDisplayState: function(
      boardData, display, showVariations, markLastMove) {
    glift.util.majorPerfLog('Set display state');
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

    // Map from point-string to point.
    var variationMap = {};
    if (glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
      variationMap = glift.bridge.variationMapping(boardData.nextMoves);
    }

    // Map from point-string to true/false. This allows us to know whether or
    // not there's a mark at the particular location, which is in turn useful
    // for drawing the stone marker.
    var marksMap = {};

    var marks = glift.enums.marks;
    for (var markType in boardData.marks) {
      for (var i = 0; i < boardData.marks[markType].length; i++) {
        var markData = boardData.marks[markType][i];
        var markPt = markData.point ? markData.point : markData;
        var markPtString = markPt.toString();
        marksMap[markPtString] = true;
        if (markType === marks.LABEL) {
          if (variationMap[markPtString] &&
              glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
            // This is a variation label && we should show it
            var markValue = glift.bridge.markSelectedNext(
                boardData, markData.point, markData.value);
            display.intersections().addMarkPt(
                markData.point, marks.VARIATION_MARKER, markValue);
            delete variationMap[markPtString];
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
    var correctNextMap =
        glift.bridge.variationMapping(boardData.correctNextMoves);
    for (var ptstring in variationMap) {
      var pt = variationMap[ptstring];
      var markValue = glift.bridge.markSelectedNext(boardData, pt, i);
      if (pt in correctNextMap) {
        display.intersections().addMarkPt(pt, marks.CORRECT_VARIATION, markValue);
      } else {
        display.intersections().addMarkPt(pt, marks.VARIATION_MARKER, markValue);
      }
      i += 1;
    }

    if (boardData.lastMove && boardData.lastMove.point && markLastMove &&
        !marksMap[boardData.lastMove.point.toString()]) {
      var lm = boardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
    glift.util.majorPerfLog('Finish display state');
    // display.flush();
  },

  /** Mark the selected next move */
  markSelectedNext: function(boardData, pt, markValue) {
    if (boardData.selectedNextMove &&
        pt.equals(boardData.selectedNextMove.point)) {
      // Mark the 'selected' variation as active.
      markValue += '.';
      //'\u02D9';
      // -- some options
      // '\u02C8' => ˈ simple
      // '\u02D1' => ˑ kinda cool
      // '\u02D9' => ˙ dot above (actually goes to the right)
      // '\u00B4' => ´
      // '\u0332' => underline
    }
    return markValue;
  },

  /**
   * Logic for determining whether the next variations should be (automatically)
   * shown.
   */
  shouldShowNextMoves: function(boardData, showVariations) {
    return boardData.nextMoves &&
      ((boardData.nextMoves.length > 1 &&
          showVariations === glift.enums.showVariations.MORE_THAN_ONE) ||
      (boardData.nextMoves.length >= 1 &&
          showVariations === glift.enums.showVariations.ALWAYS));
  },

  /**
   * Make the next variations into in an object map.  This prevents us from
   * adding variations twice, which can happen if variations are automatically
   * shown and the SGF has explicit markings.  This happens quite frequently in
   * the case of game reviews.
   */
  variationMapping: function(variations) {
    var out = {};
    for (var i = 0; i < variations.length; i++) {
      var nextMove = variations[i];
      if (nextMove.point !== undefined) {
        out[nextMove.point.toString()] = nextMove.point;
      } else {
        // This is a 'pass'
      }
    }
    return out;
  }
};

