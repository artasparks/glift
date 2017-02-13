goog.provide('glift.controllers.BaseController');
goog.provide('glift.controllers.ControllerFunc');

/**
 * A controller function which indicates how to consturct a BaseController.
 *
 * @typedef {function(!glift.api.SgfOptions):!glift.controllers.BaseController}
 */
glift.controllers.ControllerFunc;

/**
 * Creates a base controller implementation.
 *
 * @return {!glift.controllers.BaseController}
 */
glift.controllers.base = function() {
  return new glift.controllers.BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, an abstract
 * base implementation for interacting with SGFs.  Typically, those objects
 * extending this base class will implement addStone and [optionally]
 * extraOptions.
 *
 * @constructor
 */
glift.controllers.BaseController = function() {
  //////////////////////////////////////////////////////////////
  // Variables set during initialization but const afterwards //
  //////////////////////////////////////////////////////////////

  /**
   * The initial SGF String.
   * @package {string}
   */
  this.sgfString = '';

  /**
   * The raw initial position.
   *
   * @package {string|!Array<number>}
   */
  this.rawInitialPosition = [];

  /**
   * Used only for problem-types.
   *
   * @package {!glift.rules.ProblemConditions}
   */
  this.problemConditions = {};

  /**
   * @package {glift.parse.parseType}
   */
  this.parseType = glift.parse.parseType.SGF;

  /**
   * The raw next moves path. Used only for examples (see the Game Figure).
   * Indicates how to create move numbers.
   *
   * @private {glift.rules.Treepath|undefined}
   */
  this.nextMovesPath_ = undefined;

  /**
   * Enum indicating the show-variations preference
   * @private {glift.enums.showVariations|undefined}
   */
  this.showVariations_ = undefined;

  /**
   * Boolean indicating whether or not to mark the last move.
   * @private {boolean}
   */
  this.markLastMove_ = false;

  /**
   * Boolean indicating whether or not to mark the ko.
   * @private {boolean}
   */
  this.markKo_ = true;

  /////////////////////////////////////////
  // Variables set during initialization //
  /////////////////////////////////////////

  /**
   * The treepath representing the pth to the current position.
   * @package {glift.rules.Treepath}
   */
  this.treepath = [];

  /**
   * The full tree of moves constructed from the SGF.
   * @package {!glift.rules.MoveTree}
   */
  // Here we create a dummy movetree to ensure that the movetree is always
  // initialized.
  this.movetree = glift.rules.movetree.getInstance();

  /**
   * The Goban representing the current state of the board. Here, we construct a
   * dummy Goban to ensure that the goban is non-nullable.
   *
   * @package {!glift.rules.Goban} goban
   */
  this.goban = glift.rules.goban.getInstance(1);

  /**
   * Initialize a dummy hooks instance and override during initOptions.
   *
   * @package {!glift.api.HookOptions}
   */
  this.hooks = new glift.api.HookOptions();

  /**
   * The history of the captures so we can go backwards in time.
   * @package {!Array<!glift.rules.CaptureResult>}
   */
  this.captureHistory = [];

  /**
   * The history of cleared-location-points (i.e., the AE property). We need to
   * keep a full history to back-out the changes.
   * @package {!Array<!Array<!glift.rules.Move>>}
   */
  this.clearHistory = [];

  /**
   * Array of ko-history so that when we go backwards, we can reset the ko
   * correctly.
   * @package {!Array<?glift.Point>}
   */
  this.koHistory = [];
};

glift.controllers.BaseController.prototype = {
  /**
   * Initialize both the options and the controller's children data structures.
   *
   * Note that these options should be protected by the options parsing (see
   * options.js in this same directory).  Thus, no special checks are made here.
   *
   * @param {!glift.api.SgfOptions} sgfOptions Object containing SGF options.
   */
  initOptions: function(sgfOptions) {
    this.sgfString = sgfOptions.sgfString || '';

    if (sgfOptions.nextMovesPath) {
      this.nextMovesPath_ = glift.rules.treepath.parseFragment(
          sgfOptions.nextMovesPath);
    }

    this.rawInitialPosition = sgfOptions.initialPosition || [];
    this.parseType = sgfOptions.parseType || glift.parse.parseType.SGF;
    this.problemConditions = sgfOptions.problemConditions || {};
    this.hooks = sgfOptions.hooks || this.hooks;

    // A controller may not be the best place for these next few, since they're
    // display only; However, this is currenly the best place to put these since
    // the controller is in charge of creating the flattened representation.
    this.showVariations_ = sgfOptions.showVariations || undefined;
    this.markLastMove_ = sgfOptions.markLastMove;
    this.markKo_ = sgfOptions.markKo;

    this.initialize();
    return this;
  },

  /**
   * Initialize the:
   *  - initPosition -- Description of where to start.
   *  - treepath -- The path to the current position.  An array of variaton
   *    numbers.
   *  - movetree -- Tree of move nodes from the SGF.
   *  - goban -- Data structure describing the go board.  Really, the goban is
   *    useful for telling you where stones can be placed, and (after placing)
   *    what stones were captured.
   *  - capture history -- The history of the captures.
   *
   * @param {string=} opt_treepath Because we may want to reinitialize the
   *    GoBoard, we optionally pass in the treepath from the beginning and use
   *    that instead of the initialPosition treepath.
   */
  initialize: function(opt_treepath) {
    var rules = glift.rules;
    var initTreepath = opt_treepath || this.rawInitialPosition;
    this.treepath = rules.treepath.parseInitialPath(initTreepath);

    this.movetree = rules.movetree.getFromSgf(this.sgfString, this.treepath, this.parseType);
    var gobanData = rules.goban.getFromMoveTree(
        /** @type {!glift.rules.MoveTree} */ (this.movetree), this.treepath);

    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
    this.clearHistory = gobanData.clearHistory;
    this.extraOptions(); // Overridden by implementers
    return this;
  },

  /**
   * It's expected that this will be implemented by those extending this base
   * class.  This is called during initOptions above.
   * @param {glift.api.SgfOptions=} opt_options
   */
  extraOptions: function(opt_options) { /* Implemented by other controllers. */ },

  /**
   * Add a stone.  This is intended to be overwritten.
   *
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {?glift.flattener.Flattened} The flattened representation.
   */
  addStone: function(point, color) { throw "Not Implemented"; },

  /**
   * Creates a flattener state.
   * @return {!glift.flattener.Flattened}
   */
  flattenedState: function() {
    var newFlat = glift.flattener.flatten(this.movetree, {
      goban: this.goban,
      showNextVariationsType: this.showVariations_,
      markLastMove: this.markLastMove_,
      markKo: this.markKo_,
      nextMovesPath: this.nextMovesPath_,
      problemConditions: this.problemConditions,
      selectedNextMove: this.selectedNextMove(),
    });
    return newFlat;
  },

  /**
   * Get the current move number.
   * @return {number}
   */
  currentMoveNumber: function() {
    return this.movetree.node().getNodeNum();
  },

  /**
   * Gets the variation number of the next move. This will be something different
   * if we've used setNextVariation or if we've already played into a variation.
   * Otherwise, it will be 0.
   *
   * @return {number}
   */
  nextVariationNumber: function() {
    return this.treepath[this.currentMoveNumber()] || 0;
  },

  /**
   * Return the next 'selected' move equivalent to the using the next variation
   * number correlated with the next moves in the movetree.
   * @return {?glift.rules.Move}
   */
  selectedNextMove: function() {
    var nextVar = this.nextVariationNumber();
    var nextMoves = this.movetree.nextMoves();
    if (nextMoves.length) {
      return nextMoves[nextVar] || null;
    }
    return null;
  },

  /**
   * Sets what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   *
   * @param {number} num
   * @return {!glift.controllers.BaseController} this
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber());
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /**
   * Gets the treepath to the current position.
   * @return {!glift.rules.Treepath}.
   */
  pathToCurrentPosition: function() {
    return this.movetree.treepathToHere();
  },

  /**
   * Gets the game info key-value pairs. This consists of global data about the
   * game, such as the names of the players, the result of the game, the
   * name of the tournament, etc.
   * @return {!Array<!glift.rules.PropDescriptor>}
   */
  getGameInfo: function() {
    return this.movetree.getTreeFromRoot().properties().getGameInfo();
  },

  /**
   * Get the captures that occured for the current move.
   *
   * @return {!glift.rules.CaptureResult}
   */
  getCaptures: function() {
    if (this.captureHistory.length === 0) {
      return { BLACK: [], WHITE: [] };
    }
    return this.captureHistory[this.currentMoveNumber() - 1];
  },

  /**
   * Get the captures count. Returns an object of the form
   * @return {{
   *  BLACK: number,
   *  WHITE: number
   * }}
   */
  getCaptureCount: function() {
    var countObj = { BLACK: 0, WHITE: 0 };
    for (var i = 0; i < this.captureHistory.length; i++ ) {
      var obj = this.captureHistory[i];
      for (var color in obj) {
        countObj[color] += obj[color].length;
      }
    }
    return countObj;
  },

  /**
   * Return true if a Stone can (probably) be added to the board and false
   * otherwise.
   *
   * Note, this method isn't always totally accurate. This method must be very
   * fast since it's expected that this will be used for hover events.
   *
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   * @return {boolean}
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point);
  },

  /**
   * Returns a State (either BLACK or WHITE). Needs to be fast since it's used
   * to display the hover-color in the display.
   *
   * This will be undefined until initialize is called, so the clients of the
   * controller must make sure to always initialize the board position
   * first.
   *
   * @return {!glift.enums.states}
   */
  getCurrentPlayer: function() {
    return this.movetree.getCurrentPlayer();
  },

  /** @return {string} The current SGF string. */
  currentSgf: function() {
    return this.movetree.toSgf();
  },

  /** @return {string} The original SGF string. */
  originalSgf: function() {
    return this.sgfString;
  },

  /** @return {number} Returns the number of intersections. */
  getIntersections: function() {
    return this.movetree.getIntersections();
  },

  /**
   * Get the recommended quad-cropping for the bove tree. This is a display
   * consideration, but the knowledge of how to crop is dependent on the
   * movetree, so this method needs to live on the controller.
   *
   * @return {glift.enums.boardRegions} The recommend board region to use.
   */
  getQuadCropFromBeginning: function() {
    return glift.orientation.getQuadCropFromMovetree(
        /** @type {!glift.rules.MoveTree} */ (this.movetree));
  },

  /**
   * Gets the set of correct next moves. This should only apply to problem-based
   * widgets
   *
   * @return {!Array<!glift.rules.Move>}
   */
  getCorrectNextMoves: function() {
    return glift.rules.problems.correctNextMoves(
        /** @type {!glift.rules.MoveTree} */ (this.movetree),
        this.problemConditions);
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
   *     we need to make sure the move/node exists.
   *   - We need to update the Goban.
   *   - We need to store the captures.
   *   - We need to update the current move number.
   *
   * @param {number=} opt_varNum
   *
   * @return {?glift.flattener.Flattened} The flattened representation or null
   *    if there is no next move.
   */
  nextMove: function(opt_varNum) {
    if (this.treepath[this.currentMoveNumber()] !== undefined &&
        (opt_varNum === undefined || this.nextVariationNumber() === opt_varNum)) {
      // If possible, we prefer taking the route defined by a previously
      // traversed treepath. In otherwords, don't mess with the treepath, if
      // we're 'on variation'.
      this.movetree.moveDown(this.nextVariationNumber());
    } else {
      // There is no existing treepath.
      var varNum = opt_varNum === undefined ? 0 : opt_varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        // We prefer taking 'move' nodes over nonmove nodes.
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        // There were no 'moves' available. However, it's possible there is some
        // node next that doesn't have a move.
        if (this.movetree.node().numChildren() > 0) {
          this.setNextVariation(varNum);
          this.movetree.moveDown(varNum);
        } else {
          return null; // No moves available
        }
      }
    }
    var clears = this.goban.applyClearLocationsFromMovetree(this.movetree);
    var captures = this.goban.loadStonesFromMovetree(this.movetree);
    this.koHistory.push(this.goban.getKo());
    this.captureHistory.push(captures);
    this.clearHistory.push(clears);
    return this.flattenedState();
  },

  /**
   * Go back a move.
   * @return {?glift.flattener.Flattened} The flattened representation or null
   *    if there is no previous move.
   */
  prevMove: function() {
    if (this.currentMoveNumber() === 0) {
      return null;
    }
    var captures = this.getCaptures();
    var clears = this.clearHistory[this.clearHistory.length - 1] || [];
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.captureHistory.length - 1);
    this.clearHistory = this.clearHistory.slice(
        0, this.clearHistory.length - 1);
    this.unloadStonesFromGoban_(allCurrentStones, captures);
    for (var i = 0; i < clears.length; i++) {
      var move = clears[i];
      if (move.point === undefined) {
        throw new Error('Unexpected error! Clear history moves must have points.');
      }
      this.goban.setColor(move.point, move.color);
    }

    this.movetree.moveUp();
    this.koHistory.pop();
    if (this.koHistory.length) {
      var ko = this.koHistory[this.koHistory.length -1];
      if (ko) {
        this.goban.setKo(ko);
      }
    }
    return this.flattenedState();
  },

  /**
   * Go back to the beginning.
   * @return {!glift.flattener.Flattened} The flattened representation.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = [];
    this.clearHistory = [];
    this.koHistory = [];
    return this.flattenedState();
  },

  /**
   * Go to the end.
   * @return {!glift.flattener.Flattened} The flattened representation
   */
  toEnd: function() {
    while (this.nextMove()) {
      // All the action happens in nextMoveNoState.
    }
    return this.flattenedState();
  },

  /////////////////////
  // Private Methods //
  /////////////////////

  /**
   * Back out a movetree addition (used for going back a move).
   *
   * @param {!glift.rules.MoveCollection} stones
   * @param {!glift.rules.CaptureResult} captures
   *
   * @private
   */
  unloadStonesFromGoban_: function(stones, captures) {
    for (var color in stones) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.rules.Move>} */ (stones[c]);
      for (var j = 0; j < arr.length; j++) {
        var move = arr[j];
        if (move.point) {
          this.goban.clearStone(move.point);
        }
      }
    }
    for (var color in captures) {
      var c = /** @type {glift.enums.states} */ (color);
      var arr = /** @type {!Array<!glift.Point>} */ (captures[c]);
      for (var i = 0; i < arr.length; i++) {
        this.goban.addStone(arr[i], c);
      }
    }
  },
};
