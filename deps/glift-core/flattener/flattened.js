goog.provide('glift.flattener.Flattened');
goog.provide('glift.flattener.FlattenedParams');

/**
 * The Flattened object is complex. We pass in a strongly parameter object for
 * convenience.
 *
 * @typedef {{
 *  board: !glift.flattener.Board,
 *  collisions: !Array<!glift.flattener.Collision>,
 *  comment: string,
 *  isOnMainPath: boolean,
 *  baseMoveNum: number,
 *  startingMoveNum: number,
 *  endMoveNum: number,
 *  mainlineMoveNum: number,
 *  mainlineMove: ?glift.rules.Move,
 *  nextMainlineMove: ?glift.rules.Move,
 *  stoneMap: !Object<glift.PtStr, !glift.rules.Move>,
 *  markMap: !glift.flattener.MarkMap,
 *  correctNextMoves: !Object<glift.PtStr, !glift.rules.Move>,
 *  problemResult: ?glift.enums.problemResults
 * }}
 */
glift.flattener.FlattenedParams;


/** @private {!Object<number, !glift.flattener.Flattened>} */
glift.flattener.emptyFlattenedCache_ = {};

/**
 * Public method for returning an empty flattened object of a specific size.
 * Sometimes it's useful to have an empty flattened board, especially if one is
 * doing a 'diff' operation.
 *
 * @param {number} size
 * @return {!glift.flattener.Flattened}
 */
glift.flattener.emptyFlattened = function(size) {
  if (glift.flattener.emptyFlattenedCache_[size]) {
    return glift.flattener.emptyFlattenedCache_[size];
  }
  var mt = glift.rules.movetree.getInstance(size);
  var flat = glift.flattener.flatten(mt);
  glift.flattener.emptyFlattenedCache_[size] = flat;
  return flat;
};

/**
 * Data used to populate either a display or diagram.
 *
 * @param {!glift.flattener.FlattenedParams} params
 * @constructor @final @struct
 */
glift.flattener.Flattened = function(params) {
  /**
   * Board wrapper. Essentially a double array of intersection objects.
   * @private {!glift.flattener.Board}
   */
  this.board_ = params.board;

  /**
   * @private {!Array<!glift.flattener.Collision>}
   * @const
   */
  this.collisions_ = params.collisions;

  /**
   * @private {string}
   * @const
   */
  this.comment_ = params.comment;

  /**
   * Whether or not the position is on the 'top' (zeroth) variation.
   * @private {boolean}
   * @const
   */
  this.isOnMainPath_ = params.isOnMainPath;

  /**
   * The base move number before applying the next moves path. Equivalent to the
   * nodeNum of the movetree before applying the next move path.
   *
   * @private {number}
   * @const
   */
  this.baseMoveNum_ = params.baseMoveNum;

  /**
   * The starting and ending move numbers. These should be used for labeling
   * diagrams, and is only relevant in the context of a next-moves-path diagram.
   *
   * @private {number}
   * @const
   */
  this.startMoveNum_ = params.startingMoveNum;

  /** @const @private {number} */
  this.endMoveNum_ = params.endMoveNum;

  /**
   * The move number of the first mainline move in the parent-chain. Can be
   * useful for print-diagram creation, when referencing the mainlinemove.
   * @const @private {number}
   */
  this.mainlineMoveNum_ = params.mainlineMoveNum;

  /**
   * The move -- {color: <color>, point: <pt>} at the first mainline move in the
   * parent tree. Can be null if no move exists at the node.
   * @private {?glift.rules.Move}
   * @const
   */
  this.mainlineMove_ = params.mainlineMove;

  /**
   * The next mainline move after the mainline move above.. Usually variations
   * are variations on the _next_ move, so it's usually useful to reference the
   * next move.
   * @private {?glift.rules.Move}
   * @const
   */
  this.nextMainlineMove_ = params.nextMainlineMove;

  /**
   * All the stones for O(1) convenience =D.
   * @private {!Object<glift.PtStr, !glift.rules.Move>}
   * @const
   */
  this.stoneMap_ = params.stoneMap;

  /**
   * All the marks!
   * @private {!glift.flattener.MarkMap}
   * @const
   */
  this.markMap_ = params.markMap;

  /**
   * The variations that, according to the problem conditions supplied are
   * correct. By default, variations are considered incorrect.
   * @private {!Object<glift.PtStr, !glift.rules.Move>}
   * @const
   */
  this.correctNextMoves_ = params.correctNextMoves;

  /**
   * Problem result. Whether or not a particular problem position should be
   * considered correct or incorret.
   * @private {?glift.enums.problemResults}
   */
  this.problemResult_ = params.problemResult;
};

glift.flattener.Flattened.prototype = {
  /**
   * Return the constructed board.
   * @return {!glift.flattener.Board}
   */
  board: function() { return this.board_; },

  /**
   * The comment for the position.
   * @return {string}
   */
  comment: function() { return this.comment_; },

  /**
   * A structure illustrating the board collisions. Only relevant for positions
   * with a next moves path. Will always be defined, but could be empty.
   *
   * Array of collisions objects.  In other words, we record stones that
   * couldn't be placed on the board.
   *
   * Each object in the collisions array looks like:
   *    {color: <color>, mvnum: <number>, label: <label>}
   * (although the source of truth is in the typedef).
   *
   * @return {!Array<!glift.flattener.Collision>}
   */
  collisions: function() { return this.collisions_; },

  /**
   * Whether or not this position is on the main line or path variation.  For
   * game review diagrams, it's usually nice to distinguish between diagrams for
   * the real game and diagrams for exploratory variations.
   *
   * @return {boolean}
   */
  isOnMainPath: function() { return this.isOnMainPath_; },

  /**
   * Returns the base move number before applying the next moves path. In an
   * interactive viewer, this would be considered the current move number.
   *
   * @return {number}
   */
  baseMoveNum: function() { return this.baseMoveNum_; },

  /**
   * Returns the starting move number. Should only be used in the context of a
   * next-moves-path diagram.
   *
   * Note that the starting move number (and ending move numbers) are labeled
   * based on whether or not the variation is on the 'main path'. If on the main
   * path, the starting/ending move numbers are equivalent to the move-node
   * number. If on a variation, counting starts over based from 1, where 1 is
   * the first move off the main line.
   *
   * @return {number}
   */
  startingMoveNum: function() { return this.startMoveNum_; },

  /**
   * Returns the ending move number. Should be tha same as the starting move
   * number if no nextMovesPath is specified.
   *
   * @return {number}
   */
  endingMoveNum: function() { return this.endMoveNum_; },

  /**
   * Returns the first mainline move number in the parent-chain. This will be
   * equal to the startingMoveNum if isOnMainPath = true.
   *
   * @return {number}
   */
  mainlineMoveNum: function() { return this.mainlineMoveNum_; },

  /**
   * Returns the move number of the nextMainlineMove (regardless of whether or
   * not it exists.
   *
   * @return {number}
   */
  nextMainlineMoveNum: function() { return this.mainlineMoveNum() + 1; },

  /**
   * Returns the first mainline move in the parent-chain. Can be null if no move
   * exists and has the form {color: <color>, pt: <pt>} if defined.
   *
   * @return {?glift.rules.Move}
   */
  mainlineMove: function() { return this.mainlineMove_; },

  /**
   * Returns the next mainline move after the mainline move in the parent-chain.
   * Can be null if no move exists and has the form {color: <color>, pt: <pt>}
   * if defined.
   *
   * @return {?glift.rules.Move}
   */
  nextMainlineMove: function() { return this.nextMainlineMove_; },

  /**
   * Returns the stone map. An object with the following structure:
   *
   * @return {!Object<glift.PtStr, !glift.rules.Move>}
   */
  stoneMap: function() { return this.stoneMap_; },

  /**
   * Returns the labels map. An object with the following structure:
   *
   * @return {!Object<glift.PtStr, string>}
   */
  labels: function() {
    return this.markMap_.labels;
  },

  /**
   * Returns the marks map. An object with the following structure:
   * where the numbers correspond to an entry in glift.flattener.symbols.
   *
   * Note: This will include the TEXTLABEL symbol, even though the labels map
   * duplicates this information to some degree.
   *
   * @return {!Object<glift.PtStr, glift.flattener.symbols>}
   */
  marks: function() {
    return this.markMap_.marks;
  },

  /**
   * Currently, the flattener does not compute problem correctness, so it is up
   * to the user to manually set problem correctness.
   *
   * @param {glift.enums.problemResults} result
   */
  // TODO(kashomon): Remove once this is set from the flattener.
  setProblemResult: function(result) {
    this.problemResult_ = result;
  },

  /**
   * The problem-status. One of correct, incorrect, or indeterminate, if
   * specified; null, otherwise.
   *
   * @return {?glift.enums.problemResults} The problem correctness.
   */
  problemResult: function() { return this.problemResult_ },

  /**
   * Helper for truncating labels if the labels are numbers > 100, which
   * is typically helpful for diagram-display. A no-op for all other labels
   * This used to be done automatically, but there are cases where users may
   * wish to preserve full 3 digit labels.
   *
   * Note: This helper only truncates when branchLength = endNum - startNum <
   * 100.
   *
   * @param {(number|string)} numOrString: The number represented either as a
   *    string or a number (probably the former, but who are we to judge?).
   * @return {string} The processed string label.
   */
  autoTruncateLabel: function(numOrString) {
    var num = numOrString;
    if (typeof numOrString === 'number') {
      // noop
    } else if (typeof numOrString === 'string' && /\d+/.test(numOrString)) {
      num = parseInt(numOrString, 10);
    } else {
      return numOrString;
    }
    var branchLength = this.endingMoveNum() - this.startingMoveNum();
    if (num > 100 && branchLength < 100 && num % 100 !== 0) {
      // Truncation time!
      num = num % 100;
    }
    return num + '';
  }
};
