(function() {
/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 */
glift.controllers.staticProblem = function(sgfOptions) {
  var controllers = glift.controllers,
      baseController = glift.util.beget(controllers.base()),
      newController = glift.util.setMethods(baseController, methods),
      _ = newController.initOptions(sgfOptions);
  return newController;
};

var methods = {
  /**
   * Reload the problems.
   *
   * TODO(kashomon): Remove this?  Or perhaps rename initialize() to load() or
   * reload() or something.
   */
  reload: function() {
    this.initialize();
  },

  /**
   * Add a stone to the board.  Since this is a problem, we check for
   * 'correctness', which we check whether all child nodes are labeled (in some
   * fashion) as correct.
   *
   * Note: color must be one of enums.states (either BLACK or WHITE).
   *
   * TODO(kashomon): Refactor this into something less ridiculous -- i.e.,
   * shorter and easier to understand.
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults;
    var CORRECT = problemResults.CORRECT;
    var INCORRECT = problemResults.INCORRECT;
    var INDETERMINATE = problemResults.INDETERMINATE;
    var FAILURE = problemResults.FAILURE;

    // Reminder -- the goban returns:
    //  {
    //    successful: <boolean>
    //    captures: [ points]
    //  }
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { result: FAILURE };
    } else {
      var toRecord = {};
      toRecord[color] = addResult.captures;
      this.recordCaptures(toRecord);
    }

    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT. However, we still add the move down the movetree,
    // adding a node if necessary.  This allows us to maintain a consistent
    // state.
    if (nextVarNum === glift.util.none) {
      this.movetree.addNode();
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      var outData = this.getNextBoardState();
      outData.result = INCORRECT;
      return outData;
    } else {
      this.movetree.moveDown(nextVarNum);

      var correctness = glift.rules.problems.isCorrectPosition(
          this.movetree, this.problemConditions);
      if (correctness === CORRECT || correctness == INCORRECT) {
        var outData = this.getNextBoardState();
        outData.result = correctness;
        return outData;
      } else if (correctness === INDETERMINATE) {
        var prevOutData = this.getNextBoardState();
        // Play for the opposite player. Should this be deterministic?
        var randNext = glift.math.getRandomInt(
            0, this.movetree.node().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.properties().getMove();
        var result = this.goban.addStone(nextMove.point, nextMove.color);
        var toRecord = {};
        toRecord[nextMove.color] = result.captures;
        this.recordCaptures(toRecord);
        var outData = this.getNextBoardState();
        for (var color in prevOutData.stones) {
          for (var i = 0; i < prevOutData.stones[color].length; i++) {
            outData.stones[color].push(prevOutData.stones[color][i]);
          }
        }
        outData.result = INDETERMINATE;
        return outData;
      }
      else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};

})();
