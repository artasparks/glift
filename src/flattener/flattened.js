/**
 * Data used to populate either a display or diagram.
 */
glift.flattener.Flattened = function(
    board, collisions, comment, boardRegion, cropping, isOnMainPath,
    startMoveNum, endMoveNum, mainlineMoveNum, mainlineMove,
    nextMainlineMove, stoneMap) {
  /**
   * Board wrapper. Essentially a double array of intersection objects.
   */
  this._board = board;

  /**
   * Array of collisions objects.  In other words, we record stones that
   * couldn't be placed on the board.
   *
   * Each object in the collisions array looks like:
   * {color: <color>, mvnum: <number>, label: <label>}
   */
  this._collisions = collisions;

  /** Comment string. */
  this._comment = comment;

  /** The board region this flattened representation is meant to display. */
  this._boardRegion = boardRegion;

  /** The cropping object. Probably shouldn't be accessed directly. */
  this._cropping = cropping;

  /** Whether or not the position is on the 'top' (zeroth) variation. */
  this._isOnMainPath = isOnMainPath;

  /**
   * The starting and ending move numbers. These are typically used for
   * labeling diagrams.
   */
  this._startMoveNum = startMoveNum;
  this._endMoveNum = endMoveNum;
  this._mainlineMoveNum = mainlineMoveNum;

  /**
   * The move -- {color: <color>, point: <pt>} at the first mainline move in the
   * parent tree. Can be null if no move exists at the node.
   */
  this._mainlineMove = mainlineMove;
  /**
   * The next mainline move after the mainline move above.. Usually variations
   * are variations on the _next_ move, so it's usually useful to reference the
   * next move.
   */
  this._nextMainlineMove = nextMainlineMove;

  /**
   * All the stones!
   *
   * A map from the point string to a stone object:
   *    {point: <point>, color: <color>}
   */
  this._stoneMap = stoneMap;
};

glift.flattener.Flattened.prototype = {
  /** Returns the board wrapper. */
  board: function() { return this._board; },

  /** Returns the comment. */
  comment: function() { return this._comment; },

  /** Returns the collisions. */
  collisions: function() { return this._collisions; },

  /**
   * Whether or not this position is on the main line or path variation.  For
   * game review diagrams, it's usually nice to distinguish between diagrams for
   * the real game and diagrams for exploratory variations.
   */
  isOnMainPath: function() { return this._isOnMainPath; },

  /** Returns the starting move number. */
  startingMoveNum: function() { return this._startMoveNum; },

  /** Returns the ending move number. */
  endingMoveNum: function() { return this._endMoveNum; },

  /**
   * Returns the first mainline move number in the parent-chain. This will be
   * equal to the startingMoveNum if isOnMainPath = true.
   */
  mainlineMoveNum: function() { return this._mainlineMoveNum; },

  /**
   * Returns the move number of the nextMainlineMove (regardless of whether or
   * not it exists.
   */
  nextMainlineMoveNum: function() { return this.mainlineMoveNum() + 1; },

  /**
   * Returns the first mainline move in the parent-chain. Can be null if no move
   * exists and has the form {color: <color>, pt: <pt>} if defined.
   */
  mainlineMove: function() { return this._mainlineMove; },

  /**
   * Returns the next mainline move after the mainline move in the parent-chain.
   * Can be null if no move exists and has the form {color: <color>, pt: <pt>}
   * if defined.
   */
  nextMainlineMove: function() { return this._nextMainlineMove; },

  /** Returns the stone map. */
  stoneMap: function() { return this._stoneMap; },

  /**
   * Helper for truncating labels if the labels are numbers > 100, which
   * is typically helpful for diagram-display. A no-op for all other labels
   * This used to be done automatically, but there are cases where users may
   * wish to preserve full 3 digit labels.
   *
   * Note: This helper only truncates when branchLength = endNum - startNum <
   * 100.
   *
   * numOrString: The number represented either as a string or a number
   *    (probably the former, but who are we to judge?).
   * return: The processed string label.
   */
  autoTruncateLabel: function(numOrString) {
    var num = numOrString;
    if (typeof numOrString === 'number') {
      // noop
    } else if (typeof numOrString === 'string' && /\d+/.test(numOrString)) {
      num = parseInt(numOrString);
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
