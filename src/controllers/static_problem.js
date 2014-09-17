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
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  var newController = glift.util.setMethods(baseController,
          glift.controllers.StaticProblemMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.StaticProblemMethods = {
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

    if (!this.goban.placeable(point) ||
        !this.goban.testAddStone(point, color)) {
      return { result: FAILURE };
    }

    var nextVarNum = this.movetree.findNextMove(point, color);
    if (nextVarNum === null) {
      // There are no variations corresponding to the move made (i.e.,
      // nextVarNum is null), so we assume that the move is INCORRECT. However,
      // we still add the move down the movetree, adding a node if necessary.
      // This allows us to maintain a consistent state.
      this.movetree.addNode(); // add node and move down
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      this.movetree.moveUp();
      nextVarNum = this.movetree.node().numChildren() - 1;
    }

    var outData = this.nextMove(nextVarNum);
    var correctness = glift.rules.problems.isCorrectPosition(
        this.movetree, this.problemConditions);
    if (correctness === CORRECT ||
        correctness === INCORRECT ||
        correctness === INDETERMINATE) {
      // Play for the opposite player. It used to be random, but randomness is
      // confusing.
      // var nextVariation = glift.math.getRandomInt(
          // 0, this.movetree.node().numChildren() - 1);
      var nextVariation = 0;
      this.nextMove(nextVariation);
      // We return the entire board state because we've just moved two moves.
      // In theory, we could combine the output of the next moves, but it's a
      // little tricky and it doesn't seem to be worth the effort at the moment.
      var outData = this.getEntireBoardState();
      outData.result = correctness;
      return outData;
    }
    else {
      throw 'Unexpected result output: ' + correctness
    }
  },

  /** Get the current correctness status */
  correctnessStatus: function() {
    return glift.rules.problems.isCorrectPosition(
        this.movetree, this.problemConditions);
  }
};
