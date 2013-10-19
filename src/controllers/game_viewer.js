(function() {
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameViewer = function(rawOptions) {
  var options = rawOptions,
      controllers = glift.controllers,
      baseController = glift.util.beget(controllers.base()),
      newController = glift.util.setMethods(baseController, methods),
      _ = newController.initOptions(options);
  return newController;
};

var methods = {
  /**
   * Called during initOptions, in the BaseController.
   *
   * This creates a treepath (a persisted treepath) and an index into the
   * treepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function(options) {},

  /**
   * Find the variation associated with the played move.
   */
  addStone: function(point, color) {
    var possibleMap = this._possibleNextMoves();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return glift.util.none;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
  },

  /**
   * Based on the game path, get what the next variation number to be retrieved
   * will be.
   */
  getNextVariationNumber: function() {
    if (this.currentMoveNumber > this.treepath.length ||
        this.treepath[this.currentMoveNumber] === undefined) {
      return 0;
    } else {
      return this.treepath[this.currentMoveNumber];
    }
  },

  /**
   * Move up what variation will be next retrieved.
   */
  moveUpVariations: function() {
    return this.setNextVariation((this.getNextVariationNumber() + 1)
        % this.movetree.node().numChildren());
  },

  /**
   * Move down  what variation will be next retrieved.
   */
  moveDownVariations: function() {
    // Module is defined incorrectly for negative numbers.  So, we need to add n
    // to the result.
    return this.setNextVariation((this.getNextVariationNumber() - 1 +
        + this.movetree.node().numChildren())
        % this.movetree.node().numChildren());
  },

  /**
   * Go back to the beginning.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    this.currentMoveNumber = 0;
    return this.getEntireBoardState();
  },

  /**
   * Go to the end.
   */
  toEnd: function() {
    while (this.nextMove() !== glift.util.none) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  },

  /**
   * Get the possible next moves.  Used to verify that a click is actually
   * reasonable.
   *
   * Implemented as a map from point-string+color to variationNumber:
   *  e.g., pt-BLACK : 1.  For pass, we use 'PASS' as the point string.  This is
   *  sort of a hack and should maybe be rethought.
   */
  _possibleNextMoves: function() {
    var possibleMap = {};
    var nextMoves = this.movetree.nextMoves();
    for (var i = 0; i < nextMoves.length; i++) {
      var move = nextMoves[i];
      var firstString = move.point !== undefined
          ? move.point.toString() : 'PASS'
      var key = firstString + '-' + (move.color);
      possibleMap[key] = i;
    }
    return possibleMap;
  }
};
})();
