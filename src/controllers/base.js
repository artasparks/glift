(function() {
glift.controllers.createBase = function() {
  return new BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, a base
 * implementation for interacting with SGFs.  Typically, those objects extending
 * this base class will implement addStone and extraOptions
 */
var BaseController = function() {
  this.sgfString = ""; // set with initOptions
  this.initPosition = []; // can also be a string (and then parsed)
};

BaseController.prototype = {
  /**
   * Initialize both the options and the controller's children data structures.
   *
   * Note that these options should be protected by the options parsing (see
   * options.js in this same directory).  Thus, no special checks are made here.
   */
  initOptions: function(options) {
    this.sgfString = options.sgfString;
    this.initialPosition = options.initialPositiona;
    this.extraOptions(options); // Overridden by implementers
    this.initialize();
    return this;
  },

  /**
   * It's expected that this will be implemented by those extending this base
   * class.  This is called during initOptions above.
   */
  extraOptions: function(opt) { /* Implemented by other controllers. */ },

  /**
   * Generally, this is the only thing you need to override.
   */
  addStone: function() {
    throw "Not Implemented";
  },

  /**
   * Initialize the:
   *  - initPosition -- description of where to start
   *  - movetree -- tree of move nodes from the SGF
   *  - goban -- data structure describing the go board.  Really, the goban is
   *  useful for telling you where stones can be placed, and (after placing)
   *  what stones were captured.
   */
  initialize: function() {
    var rules = glift.rules,
        sgfString = this.sgfString,
        initPos = this.initialPosition;
    this.initPosition = rules.treepath.parseInitPosition(initPos);
    this.movetree = rules.movetree.getFromSgf(sgfString, this.initPosition);
    this.goban = rules.goban.getFromMoveTree(this.movetree, this.initPosition);
    return this;
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
