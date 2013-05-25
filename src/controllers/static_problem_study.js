(function() {
var util = glift.util,
    STATIC_PROBLEM_STUDY = glift.enums.controllerTypes.STATIC_PROBLEM_STUDY;

glift.controllers.staticProblemStudy = {
  // This is mostly left for legacy reasons
  _create: function(options) {
    var controllers = glift.controllers,
        baseController = glift.util.beget(controllers.createBaseController()),
        newController = util.setMethods(
            baseController, staticProblemStudyMethods),
        // At this point, options have already been processed
        _ = newController.initOptions(options);
    return newController;
  }
};

glift.controllers.createStaticProblemStudy = function(options) {
  var c = glift.controllers.staticProblemStudy._create(options)
  c.initialize('foo');
  return c;
};

// Register this Controller type in the map;
glift.controllers.controllerMap[STATIC_PROBLEM_STUDY] =
    glift.controllers.createStaticProblemStudy;

var staticProblemStudyMethods = {
  initOptions: function(options) {
    this.sgfString = options.sgfString || "";
    this.initialPosition = options.initialPosition;
    return this;
  },

  // Add a stone to the board.  Since this is a problem, we check for
  // 'correctness', which we check whether all child nodes are labeled (in some
  // fashion) as correct.
  //
  // TODO: Refactor this into something less ridiculous.
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults,
        msgs = glift.enums.controllerMessages,
        FAILURE = msgs.FAILURE,
        DONE = msgs.DONE,
        CONTINUE = msgs.CONTINUE,
        CORRECT = problemResults.CORRECT,
        INCORRECT = problemResults.INCORRECT,
        INDETERMINATE = problemResults.INDETERMINATE;

    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { message: FAILURE, reason: "Cannot add stone" };
    }
    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);
    this.lastPlayed = {point: point, color: color};

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT.
    if (nextVarNum === util.none) {
      return { message: DONE, result: INCORRECT };
    }

    else {
      this.movetree.moveDown(nextVarNum);
      var correctness = this.movetree.isCorrectPosition();
      // TODO(kashomon): Only retrieve the intersections that have changed.
      var outData = glift.rules.intersections.getFullBoardData(
          this.movetree, this.goban);

      if (correctness === CORRECT) {
        return { message: DONE, result: CORRECT, data: outData };
      }

      else if (correctness === INDETERMINATE) {
        var randNext = glift.math.getRandomInt(
            0, this.movetree.getNode().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.getProperties().getMove();
        this.goban.addStone(nextMove.point, nextMove.color);
        var outData = glift.rules.intersections.getFullBoardData(
            this.movetree, this.goban);
        return { message: CONTINUE, result: INDETERMINATE, data: outData };
      }

      else if (correctness === problemResults.INCORRECT) {
        return { message: msgs.DONE, result: INCORRECT };
      }

      else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};

})();
