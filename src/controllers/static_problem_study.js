(function() {
var msgs = glift.enums.controllerMessages,
    util = glift.util,
    STATIC_PROBLEM_STUDY = glift.enums.controllerTypes.STATIC_PROBLEM_STUDY;

glift.controllers.staticProblemStudy = {
  create: function(options) {
    var controllers = glift.controllers,
        baseController = glift.util.beget(controllers.baseController.create()),
        newController = util.setMethods(
            baseController, staticProblemStudyMethods),
        // At this point, options have already been processed
        _ = newController.initOptions(options);
    return newController;
  }
};

// Register this Controller type in the map;
glift.controllers.controllerMap[STATIC_PROBLEM_STUDY] =
    glift.controllers.staticProblemStudy.create;

var staticProblemStudyMethods = {
  initOptions: function(options) {
    this.sgfString = options.sgfString;
    this.initialPosition = options.initialPosition
    return this;
  },

  nextSgf: function(callback) {
    if (this.sgfString !== "") {
      this.staticStringNextSgf(callback);
    } else if (options.sgfDataLocation !== undefined) {
      this.sgfDataLocation = options.sgfDataLocation;
      // Get the Data Location
      throw "Not implemented"
    } else {
      // ... what to do here?
    }
  },

  staticStringNextSgf: function(callback) {
    this.initialize(this.sgfString, this.initPosition, callback);
  },

  // Add a stone to the board.  Since this is a problem, we check for
  // 'correctness', which we check whether all child nodes are labeled (in some
  // fashion) as correct.
  //
  // TODO: Refactor this into something less ridiculous.
  addStone: function(point, color, callback) {
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      callback({
        message: msgs.FAILURE,
        reason: "Cannot add stone"
      });
      return util.none;
    }
    // At this point, the move is allowed by the rules of Go
    var problemResults = glift.enums.problemResults,
        nextVarNum = this.movetree.findNextMove(point, color);
    this.lastPlayed = {point: point, color: color};
    if (nextVarNum === util.none) {
      callback({
        message: msgs.DONE,
        result: problemResults.INCORRECT
      });
      return util.none;
    } else {
      this.movetree.moveDown(nextVarNum);
      var correctness = this.movetree.isCorrectPosition();
      var intersectionData = glift.rules.intersections.getFullBoardData(
          this.movetree, this.goban);
      if (correctness === problemResults.CORRECT) {
        // A bit sloppy: we don't need the entire board info.
        callback({
            message: msgs.DONE,
            result: problemResults.CORRECT,
            data: intersectionData
        });
        return util.none;
      } else if (correctness === problemResults.INDETERMINATE) {
        var randNext = glift.math.getRandomInt(
            0, this.movetree.getNode().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.getProperties().getMove();
        this.goban.addStone(nextMove.point, nextMove.color);
        var intersectionData = glift.rules.intersections.getFullBoardData(
            this.movetree, this.goban);
        callback({
            message: msgs.CONTINUE,
            result: problemResults.INDETERMINATE,
            data: intersectionData
        });
        return util.none;
      } else if (correctness === problemResults.INCORRECT) {
        callback({
            message: msgs.DONE,
            result: problemResults.INCORRECT
        });
        return util.none;
      } else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};

})();
