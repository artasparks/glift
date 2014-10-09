/**
 * Data used to populate either a display or diagram.
 */
glift.flattener.Flattened = function(
    intersections, collisions, comment, boardRegion, cropping) {
  /**
   * Double Array of intersection objects. Must be rectangular and dense.
   */
  this._intersections = intersections;

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
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant
   * intersection.  Note, this uses the board indexing as opposed to the indexing
   * in the array.
   */
  getIntBoardIdx: function(pt) {
    var row = this._intersections[pt.y() - this._cropping.cbox().top()];
    if (row === undefined) { return row; }
    return row[pt.x() - this._cropping.cbox().left()];
  },

  /**
   * Get an intersection from a the intersection table. Uses the absolute array
   * positioning.
   */
  getInt: function(pt) {
    var row = this._intersections[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /** Turns a 0 indexed pt to a point that's board-indexed. */
  ptToBoardPt: function(pt) {
    return glift.util.point(
        pt.x() + this._cropping.cbox().left(),
        pt.y() + this._cropping.cbox().top());
  },

  /** Returns the comment. */
  comment: function() { return this._comment; },

  /** Returns the collisions. */
  collisions: function() { return this._collisions; }
};
