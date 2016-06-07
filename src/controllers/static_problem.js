goog.provide('glift.controllers.StaticProblem');

goog.require('glift.controllers.BaseController');

/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.staticProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  glift.util.setMethods(baseController, glift.controllers.StaticProblem.prototype);
  if (!sgfOptions) {
    throw new Error('SGF Options was not defined, but must be defined');
  }
  baseController.initOptions(sgfOptions);
  return baseController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 */
glift.controllers.StaticProblem = function() {
};

glift.controllers.StaticProblem.prototype = {
  /** Override extra options */
  extraOptions: function() {
    // Rebase the movetree, if we're not at the zeroth move
    if (this.movetree.node().getNodeNum() !== 0) {
      this.movetree = this.movetree.rebase();
      this.treepath = [];
      this.captureHistory = [];
      this.initialPosition = [];
      // It's a hack to reset the SGF string, but it's used by the problem
      // explanation button/widget.
      this.sgfString = this.movetree.toSgf();
      // Shouldn't need to reset the goban.
    }
  },

  /** Reload the problems. */
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
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {!glift.flattener.Flattened} flattened obj
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults;
    var CORRECT = problemResults.CORRECT;
    var INCORRECT = problemResults.INCORRECT;
    var INDETERMINATE = problemResults.INDETERMINATE;
    var FAILURE = problemResults.FAILURE;

    if (!this.goban.placeable(point) ||
        !this.goban.testAddStone(point, color)) {
      var flattened = this.flattenedState();
      flattened.setProblemResult(FAILURE);
      return flattened
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
    var correctness = glift.rules.problems.positionCorrectness(
        this.movetree, this.problemConditions);
    if (correctness === CORRECT) {
      // Don't play out variations for CORRECT>
      outData.setProblemResult(correctness);
      return outData;
    } else if (correctness === CORRECT ||
        correctness === INCORRECT ||
        correctness === INDETERMINATE) {
      // Play for the opposite player. Variation selection used to be random,
      // but randomness is confusing.
      var nextVariation = 0;
      this.nextMove(nextVariation);
      // It's possible that *this* move is correct, so we do another correctness
      // check.
      // (see https://github.com/Kashomon/glift/issues/122).
      correctness = glift.rules.problems.positionCorrectness(
          this.movetree, this.problemConditions);
      outData = this.flattenedState();
      outData.setProblemResult(correctness);
      return outData;
    }
    else {
      throw 'Unexpected result output: ' + correctness
    }
  },

  /**
   * Get the current correctness status.
   * @return {glift.enums.problemResults}
   */
  correctnessStatus: function() {
    return glift.rules.problems.positionCorrectness(
        this.movetree, this.problemConditions);
  }
};
