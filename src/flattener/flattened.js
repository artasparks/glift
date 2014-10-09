/**
 * Data used to populate either a display or diagram.
 */
glift.flattener.Flattened = function(
    board, collisions, comment, boardRegion, cropping) {
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

  /**
   * The cropping object. Probably shouldn't be accessed directly.
   */
  this._cropping = cropping;
};

glift.flattener.Flattened.prototype = {
  /** Returns the board wrapper. */
  board: function() { return this._board; },

  /** Returns the comment. */
  comment: function() { return this._comment; },

  /** Returns the collisions. */
  collisions: function() { return this._collisions; }
};
