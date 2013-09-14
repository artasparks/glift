(function() {
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameViewer = function(rawOptions) {
  var options = glift.controllers.processOptions(rawOptions),
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
   * This creates a gamePath (a persisted treepath) and an index into the
   * gamepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function(options) {
    if (options.initialPosition) {
      this.gamePath = glift.rules.treepath.parseInitPosition(
          this.initialPosition);
      this.currentMoveNumber = this.gamePath.length;
    } else {
      this.gamePath = [];
      this.currentMoveNumber = 0;
    }
  },

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
    if (this.currentMoveNumber > this.gamePath.length ||
        this.gamePath[this.currentMoveNumber] === undefined) {
      return 0;
    } else {
      return this.gamePath[this.currentMoveNumber];
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
   * Set what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.gamePath.length (if at the end).  Thus, if the old gamepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.gamePath = this.gamePath.slice(0, this.currentMoveNumber);
    this.gamePath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /**
   * Go back to the beginning.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []);
    this.currentMoveNumber = 0;
    return this.getEntireBoardState();
  },

  /**
   * Go to the end.
   */
  toEnd: function() {
    while (this._nextMoveNoState()) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  },

  /**
   * Get the Previous move in the game.  The path traversed by the player is
   * preserved.
   */
  prevMove: function() {
    // TODO(kashomon): Fix. PrevMove doesn't currently work for some reason.  It
    // definitely needs more testing.
    this.currentMoveNumber = this.currentMoveNumber === 0 ?
        this.currentMoveNumber : this.currentMoveNumber - 1;
    this.movetree.moveUp();
    // There's no way to go backwards in time on the gobans, currently, unless
    // we cache the old Gobans.  This seems fast enough for the time being,
    // though.
    this.goban = glift.rules.goban.getFromMoveTree(
        this.movetree, this.gamePath.slice(0, this.currentMoveNumber));
    return this.getEntireBoardState();
  },

  /**
   * Get the Next move in the game.  If the player has already traversed a path,
   * then we follow this previous path.
   *
   * If varNum is undefined, we try to 'guess' the next move based on the
   * contents of the gamepath.
   */
  nextMove: function(varNum) {
    var wasPossible = this._nextMoveNoState(varNum);
    if (wasPossible) {
      return this.getEntireBoardState();
    } else {
      return false;
    }
  },

  /**
   * Get the possible next moves.  Used to verify that a click is actually
   * reasonable.
   *
   * Implemented as a map from point-string+color to variationNumber:
   *  e.g., pt-BLACK : 1
   */
  _possibleNextMoves: function() {
    var possibleMap = {};
    var nextMoves = this.movetree.nextMoves();
    for (var i = 0; i < nextMoves.length; i++) {
      var move = nextMoves[i];
      var key = move.point.toString() + '-' + move.color;
      possibleMap[key] = i;
    }
    return possibleMap;
  },

  /**
   * Get the next move without returning the updated state.
   *
   * TODO(kashomon): ...what? This description makes no sense.  Also, some of
   * the edge-case logic looks wrong.  Morevore, this is a terrible, confusing
   * name for this function.
   *
   * If varNum is undefined, we try to 'guess' the next move based on the
   * contents of the gamepath.
   *
   * Return true on success. false otherwise.
   */
  _nextMoveNoState: function(varNum) {
    if (this.gamePath[this.currentMoveNumber] !== undefined &&
        (varNum === undefined ||
        this.gamePath[this.currentMoveNumber] === varNum)) {
      this.movetree.moveDown(this.gamePath[this.currentMoveNumber]);
    } else {
      if (varNum === undefined) {
        varNum = 0;
      }
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        // There are no moves available;
        return false;
      }
    }
    this.currentMoveNumber++;
    // Load all of: [B, W, AW, AB].
    this.goban.loadStonesFromMovetree(this.movetree);
    return true;
  }
};
})();
