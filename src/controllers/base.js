(function() {
glift.controllers.base = function() {
  return new BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, a base
 * implementation for interacting with SGFs.  Typically, those objects extending
 * this base class will implement addStone and extraOptions
 */
var BaseController = function() {
  this.sgfString = ""; // Set with initOptions. Intended to be Immutable.
  this.initialPosition = []; // Set with initOptions. Intended to be Immutable.
  this.treepath = undefined; // Defined with initialize.
  this.movetree = undefined; // Defined with initialize.
  this.goban = undefined; // Defined with initialize.
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
    this.initialPosition = options.initialPosition;
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
  addStone: function(point, color) { throw "Not Implemented"; },

  /**
   * Initialize the:
   *  - initPosition -- description of where to start
   *  - treepath -- the path to the current position.  An array of variaton
   *  numbers
   *  - movetree -- tree of move nodes from the SGF
   *  - goban -- data structure describing the go board.  Really, the goban is
   *  useful for telling you where stones can be placed, and (after placing)
   *  what stones were captured.
   *  - capture history -- the history of the captures
   */
  initialize: function() {
    var rules = glift.rules;
    this.treepath = rules.treepath.parseInitPosition(this.initialPosition);
    this.currentMoveNumber  = this.treepath.length
    this.movetree = rules.movetree.getFromSgf(this.sgfString, this.treepath);
    var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
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
   * Return only the necessary information to update the board
   */
  getNextBoardState: function() {
    return glift.rules.intersections.nextBoardData(
        this.movetree, this.getCaptures());
  },

  /**
   * Get the captures that occured for the current move.
   */
  getCaptures: function() {
    if (this.captureHistory.length === 0) {
      return { BLACK: [], WHITE: [] };
    }
    return this.captureHistory[this.currentMoveNumber - 1];
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
  },

  /**
   * Get the Next move in the game.  If the player has already traversed a path,
   * then we follow this previous path.
   *
   * If varNum is undefined, we try to 'guess' the next move based on the
   * contents of the treepath.
   *
   * Proceed to the next move.  This is slightly trickier than you might
   * imagine:
   *   - We need to either add to the Movetree or, if the movetree is readonly,
   *   we need to make sure the move exists.
   *   - We need to update the Goban.
   *   - We need to store the captures.
   *   - We need to update the current move number.
   */
  nextMove: function(varNum) {
    if (this.treepath[this.currentMoveNumber] !== undefined &&
        (varNum === undefined ||
        this.treepath[this.currentMoveNumber] === varNum)) {
      this.movetree.moveDown(this.treepath[this.currentMoveNumber]);
    } else {
      varNum = varNum === undefined ? 0 : varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        // TODO(kashomon): Add case for non-readonly goboard.
        return glift.util.none; // No moves available
      }
    }
    this.currentMoveNumber++;
    var captures = this.goban.loadStonesFromMovetree(this.movetree)
    this.captureHistory.push(captures)
    return this.getNextBoardState();
  },

  /**
   * Go back a move.
   */
  prevMove: function() {
    var captures = this.getCaptures();
    var allStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber - 1);
    this.goban.unloadStones(allStones, captures);
    this.currentMoveNumber = this.currentMoveNumber === 0 ?
        this.currentMoveNumber : this.currentMoveNumber - 1;
    this.movetree.moveUp();
    var displayData = glift.rules.intersections.previousBoardData(
        this.movetree, allStones, captures);
    return displayData;
  },

  /**
   * Set what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber);
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  }
};
})();
