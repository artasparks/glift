goog.provide('glift.controllers.BaseController');
goog.provide('glift.controllers.ControllerFunc');

/**
 * A controller function which indicates how to consturct a BaseController.
 *
 * @typedef {function(glift.api.SgfOptions):glift.controllers.BaseController}
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
  /** @package {string} */
  this.sgfString = '';

  /**
   * The raw initial position.
   * @package {string|!Array<number>}
   */
  this.rawInitialPosition = [];

  /**
   * The raw next moves path. Used only for examples (see the Game Figure).
   * Indicates how to create move numbers.
   * @package {!string|!Array<number>}
   */
  this.rawNextMovesPath = [];
  /**
   * Used only for problem-types.
   * @package {!glift.rules.ProblemConditions}
   */
  this.problemConditions = {};

  /** @package {glift.parse.parseType} */
  this.parseType = glift.parse.parseType.SGF;

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
   * @package {!glift.rules.Goban} goban
   */
  this.goban = glift.rules.goban.getInstance(1);

  /**
   * The history of the captures so we can go backwards in time.
   * @package {!Array<!glift.rules.CaptureResult>}
   */
  this.captureHistory = [];

  /**
   * @package the flattened representation.
   */
  this.flattened = glift.flattener.flatten(this.movetree);
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
    if (sgfOptions === undefined) {
      throw 'Options is undefined!  Can\'t create controller'
    }
    this.sgfString = sgfOptions.sgfString || '';
    this.rawNextMovesPath = sgfOptions.nextMovesPath || [];
    this.rawInitialPosition = sgfOptions.initialPosition || [];

    this.parseType = sgfOptions.parseType || glift.parse.parseType.SGF;
    this.problemConditions = sgfOptions.problemConditions || {};
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
    this.treepath = rules.treepath.parsePath(initTreepath);

    // TODO(kashomon): Appending the nextmoves path is hack until the UI
    // supports passing using true flattened data representation.
    if (this.nextMovesPath) {
      this.treepath = this.treepath.concat(
          rules.treepath.parseFragment(this.nextMovesPath));
    }

    this.movetree = rules.movetree.getFromSgf(
        this.sgfString, this.treepath, this.parseType);

    var gobanData = rules.goban.getFromMoveTree(
        /** @type {!glift.rules.MoveTree} */ (this.movetree), this.treepath);

    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
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
   * @param {!glift.Point} point
   * @param {!glift.enums.states} color
   */
  addStone: function(point, color) { throw "Not Implemented"; },

  /**
   * Creates a flattener state.
   * @return {!glift.flattener.Flattened}
   */
  flattenedState: function() {
    var newFlat = glift.flattener.flatten(this.movetree, {
      goban: this.goban
    });
    var diff = newFlat.board().diff(this.flattened.board());
    this.flattened = newFlat;
    return this.flattened;
  },

  /**
   * Applies captures and increments the move number
   *
   * Captures is expected to have the form
   *
   * {
   *  WHITE: []
   *  BLACK: []
   * }
   */
  // TODO(kashomon): Maybe this shouldn't increment move number?
  recordCaptures: function(captures) {
    this.captureHistory.push(captures)
    return this;
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
   *      },
   *      ... etc ...
   *    },
   *    comment : "foo"
   *  }
   */
  getEntireBoardState: function() {
    this.flattenedState();
    return glift.bridge.intersections.getFullBoardData(
        this.movetree,
        this.goban,
        this.problemConditions,
        this.nextVariationNumber());
  },

  /** Return only the necessary information to update the board. */
  // TODO(kashomon): Rename to getCurrentBoardState
  getNextBoardState: function() {
    this.flattenedState();
    return glift.bridge.intersections.nextBoardData(
        this.movetree,
        this.getCaptures(),
        this.problemConditions,
        this.nextVariationNumber());
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
   *  {
   *    BLACK: <number>
   *    WHITE: <number>
   *  }
   * @return {{
   *  BLACK: number,
   *  WHITE: number
   * }}
   */
  // TODO(kashomon): Add tests
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
    return this.goban.placeable(point, color);
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
   *   we need to make sure the move exists.
   *   - We need to update the Goban.
   *   - We need to store the captures.
   *   - We need to update the current move number.
   *
   * @param {number=} opt_varNum
   */
  nextMove: function(opt_varNum) {
    if (this.treepath[this.currentMoveNumber()] !== undefined &&
        (opt_varNum === undefined || this.nextVariationNumber() === opt_varNum)) {
      // Don't mess with the treepath, if we're 'on variation'.
      this.movetree.moveDown(this.nextVariationNumber());
    } else {
      var varNum = opt_varNum === undefined ? 0 : opt_varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        return null; // No moves available
      }
    }
    var captures = this.goban.loadStonesFromMovetree(this.movetree)
    this.recordCaptures(captures);

    return this.getNextBoardState();
  },

  /**
   * Go back a move.
   *
   * Returns null in the case that there is no previous move.
   */
  prevMove: function() {
    if (this.currentMoveNumber() === 0) {
      return null;
    }
    var captures = this.getCaptures();
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber() - 1);
    this.goban.unloadStones(allCurrentStones, captures);
    this.movetree.moveUp();
    var displayData = glift.bridge.intersections.previousBoardData(
        this.movetree,
        allCurrentStones,
        captures,
        this.problemConditions,
        this.nextVariationNumber());
    this.flattenedState();
    return displayData;
  },

  /** Go back to the beginning. */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    return this.getEntireBoardState();
  },

  /** Go to the end. */
  toEnd: function() {
    while (this.nextMove()) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  }
};
