(function() {
var msgs = glift.enums.controllerMessages,
    BASE = glift.enums.controllerTypes.BASE;

glift.controllers.createBaseController = function() {
  return new BaseController();
};

glift.controllers.controllerMap[BASE] = glift.controllers.createBaseController;

/**
 * Boring constructor.  It's expected that this will be extended.
 */
var BaseController = function() {};

BaseController.prototype = {
  /**
   * Add a stone.  What happens here depends on the extender of this base class.
   */
  addStone: function() {
    throw "Not Implemented";
  },

  /**
   * Initialize the:
   *  - initPosition (description of where to start)
   *  - movetree (tree of move nodes from the SGF)
   *  - goban (backing array describing the go board)
   */
  initialize: function(o) {
    var rules = glift.rules,
        sgfString = this.sgfString,
        initPosString = this.initialPosition;
    this.initPosition = rules.treepath.parseInitPosition(initPosString);
    this.movetree = rules.movetree.getFromSgf(sgfString, this.initPosition);
    // glift.sgf.parseInitPosition handles an undefined initPosition
    this.goban = rules.goban.getFromMoveTree(this.movetree, this.initPosition);
    // return the entire boardState
    return this.getEntireBoardState();
  },

  /**
   * Return the entire intersection data, including all stones, marks, and
   * comments.  This format allows the user to completely populate some UI of
   * some sort.
   *
   * The output looks like:
   *  {
   *    points: {
   *      "1,2" : {
   *        point: {1, 2},
   *        STONE: "WHITE"
   *      }
   *      ... etc ...
   *    }
   *    comment : "foo"
   *  }
   */
  getEntireBoardState: function() {
    return glift.rules.intersections.getFullBoardData(this.movetree, this.goban);
  },

  /**
   * Return true if a Stone can (probably) be added to the board and false
   * otherwise.
   *
   * Note, this method isn't always totally accurate. This method must be very
   * fast since it's expected that this will be used for hover events.
   *
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point,color);
  },

  /**
   * Returns a State (either BLACK or WHITE). Needs to be fast since it's used
   * to display the hover-color in the display.
   *
   * This will be undefined until initialize is called, so the clients of the
   * controller must make sure to always initialize the board position
   * first.
   */
  getCurrentPlayer: function() {
    return this.movetree.getCurrentPlayer();
  },

  /**
   * Returns the number of intersections.  Should be known at load time.
   */
  getIntersections: function() {
    return this.movetree.getIntersections();
  }
};
})();
