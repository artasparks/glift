(function() {
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.createGameViewer = function(rawOptions) {
  var options = glift.controllers.processOptions(rawOptions),
      controllers = glift.controllers,
      baseController = glift.util.beget(controllers.createBase()),
      newController = glift.util.setMethods(baseController, methods),
      _ = newController.initOptions(options);
  return newController;
};

var methods = {
  /**
   * Called during initOptions, in the BaseController.
   */
  extraOptions: function(options) {
    if (options.initialPosition) {
      this.gamePath = rules.treepath.parseInitPosition(this.initialPosition);
      this.index = gamePath.length - 1;
    } else {
      this.gamePath = [];
      this.index = -1;
    }
  },

  addStone: function(point, color) {
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { message: FAILURE, reason: "Cannot add stone" };
    }
    var nextVarNum = this.movetree.findNextMove(point, color);
    this.gamePath.push(nextVarNum);
    this.movetree.moveDown(nextVarNum);
  },

  /**
   * Change what the next variation will be.
   */
  changeNextVariation: function(num) {
    this.gamePath = this.gamePath.slice(0, this.index);
    var nextNum = ((this.gamePath[this.index + 1] || 0) + num) %
        this.movetree.numVariations();
    this.gamePath.push(varNum);
    return this;
  },

  /**
   * Get the Previous move in the game.
   */
  prevMove: function() {
    this.index--;
    this.movetree.moveUp();
    this.goban = glift.rules.goban.getFromMoveTree(
        this.movetree(), this.gamePath.slice(0, this.index + 1));
    return this.getEntireBoardState();
  },

  /**
   * Get the Next move in the game.
   */
  nextMove: function() {
    this.index++;
    if (this.gamePath[this.index] !== undefined) {
      this.movetree.moveDown(this.gamePath[this.index]);
    } else {
      this.movetree.moveDown(0);
    }
    return this.getEntireBoardState();
  }
};
})();
