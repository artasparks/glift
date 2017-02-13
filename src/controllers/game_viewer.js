goog.provide('glift.controllers.GameViewer');

goog.require('glift.controllers.BaseController');

/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.gameViewer = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  var newController = /** @type {!glift.controllers.BaseController} */
      (glift.util.setMethods(baseController, ctrl.GameViewer.prototype));
  if (!sgfOptions) {
    throw new Error('SGF Options was not defined, but must be defined');
  }
  newController.initOptions(sgfOptions);
  return newController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 */
glift.controllers.GameViewer = function() {
};

glift.controllers.GameViewer.prototype = {
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
    var possibleMap = this.possibleNextMoves_();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return null;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
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
    var displayDataList = [];
    var displayData = null;
    var movesSeen = 0;
    do {
      displayData = this.prevMove();
      var comment = this.movetree.properties().getComment();
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesPrevious && movesSeen === maxMovesPrevious) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1);
    // It's more expected to reset the 'next' variation to zero.
    this.setNextVariation(0);
    return this.flattenedState();
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
      var comment = this.movetree.properties().getComment();
      var numChildern = this.movetree.node().numChildren();
      movesSeen++;
      if (maxMovesNext && movesSeen === maxMovesNext) {
        break;
      }
    } while (displayData && !comment && numChildern <= 1); 
    return this.flattenedState();
  },

  /**
   * Move up what variation will be next retrieved.
   */
  moveUpVariations: function() {
    return this.setNextVariation((this.nextVariationNumber() + 1)
        % this.movetree.node().numChildren());
  },

  /**
   * Move down  what variation will be next retrieved.
   */
  moveDownVariations: function() {
    // Module is defined incorrectly for negative numbers.  So, we need to add n
    // to the result.
    return this.setNextVariation((this.nextVariationNumber() - 1 +
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
   *
   * @private
   */
  possibleNextMoves_: function() {
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
