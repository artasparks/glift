/**
 * Data used to populate either a display or diagram.
 */
glift.flattener.Flattened = function(
    board, collisions, comment, boardRegion, cropping, isOnMainPath,
    startMoveNum, endMoveNum, stoneMap) {
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

  /** Returns the stone map. */
  stoneMap: function() { return this._stoneMap; }
};
