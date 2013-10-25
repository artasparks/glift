glift.rules.problems = {
  /**
   * Determines if a 'move' is correct.
   *
   * Can return CORRECT, INCORRECT, or INDETERMINATE
   *
   */
  isCorrectPosition: function(movetree) {
    var problemResults = glift.enums.problemResults;
    if (movetree.properties().isCorrect()) {
      return problemResults.CORRECT;
    } else {
      var flatPaths = glift.rules.treepath.flattenMoveTree(movetree);
      var successTracker = {};
      for (var i = 0; i < flatPaths.length; i++) {
        var path = flatPaths[i];
        var newmt = glift.rules.movetree.getFromNode(movetree.node());
        var pathCorrect = false
        for (var j = 0; j < path.length; j++) {
          newmt.moveDown(path[j]);
          if (newmt.properties().isCorrect()) {
            pathCorrect = true;
          }
        }
        if (pathCorrect) {
          successTracker[problemResults.CORRECT] = true;
        } else {
          successTracker[problemResults.INCORRECT] = true;
        }
      }
      if (successTracker[problemResults.CORRECT] &&
          !successTracker[problemResults.INCORRECT]) {
        return problemResults.CORRECT;
      } else if (successTracker[problemResults.CORRECT] &&
          successTracker[problemResults.INCORRECT]) {
        return problemResults.INDETERMINATE;
      } else {
        return problemResults.INCORRECT;
      }
    }
  },

  /**
   * Get the correct next moves.
   *
   * returns: the 'correct' next moves. In other words
   *
   * [{ point: <point>, color: <color>  },..
   * ]
   */
  correctNextMoves: function(movetree) {
    var nextMoves = movetree.nextMoves();
    var INCORRECT = glift.enums.problemResults.INCORRECT;
    var correctNextMoves = [];
    for (var i = 0; i < nextMoves.length; i++) {
      movetree.moveDown(i);
      if (glift.rules.problems.isCorrectPosition(movetree) !== INCORRECT) {
        correctNextMoves.push(nextMoves[i]);
      }
      movetree.moveUp(); // reset the position
    }
    return correctNextMoves;
  }
};
