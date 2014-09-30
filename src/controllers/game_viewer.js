/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameViewer = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  var newController = glift.util.setMethods(baseController,
      ctrl.GameViewerMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.GameViewerMethods = {
  /**
   * Called during initOptions, in the BaseController.
   *
   * This creates a treepath (a persisted treepath) and an index into the
   * treepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function() {},

  /**
   * Find the variation associated with the played move.
   *
   * Returns null if the addStone operation isn't possible.
   */
  addStone: function(point, color) {
    var possibleMap = this._possibleNextMoves();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return null;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
  },

  /**
   * Based on the game path, get what the next variation number to be retrieved
   * will be.
   */
  getNextVariationNumber: function() {
    if (this.currentMoveNumber() > this.treepath.length ||
        this.treepath[this.currentMoveNumber()] === undefined) {
      return 0;
    } else {
      return this.treepath[this.currentMoveNumber()];
    }
  },

  /**
   * Go back to the previous branch or comment.
   *
   * If maxMovesPrevious is defined, then we cap the number of moves at
   * maxMovesPrevious. Otherwise, we keep going until we hit the beginning of
   * the game.
   *
   * Returns null in the case that we're at the root already.
   */
  previousCommentOrBranch: function(maxMovesPrevious) {
    var displayDataList = []; // TODO(kashomon): Merge this together?
    var displayData = null;
    var movesSeen = 0;
    do {
      displayData = this.prevMove();
      var comment = this.movetree.properties().getOneValue('C');
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesPrevious && movesSeen === maxMovesPrevious) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1);
    // It's more expected to reset the 'next' variation to zero.
    this.setNextVariation(0);
    return this.getEntireBoardState();
  },

  /**
   * Go to the next branch or comment.
   *
   * If maxMovesNext is defined, then we cap the number of moves at
   * maxMovesNext. Otherwise, we keep going until we hit the beginning of
   * the game.
   *
   * Returns null in the case that we're at the root already.
   */
  nextCommentOrBranch: function(maxMovesNext) {
    var displayData = null;
    var movesSeen = 0;
    do {
      displayData = this.nextMove();
      var comment = this.movetree.properties().getOneValue('C');
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesNext && movesSeen === maxMovesNext) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1); 
    return this.getEntireBoardState();
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
