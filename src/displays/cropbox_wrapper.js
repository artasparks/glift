goog.provide('glift.displays.cropbox');
goog.provide('glift.displays.DisplayCropBox');

goog.require('glift.orientation.Cropbox');

glift.displays.cropbox = {
  EXT: .5, // Extension
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  /**
   * Creates a cropbox based on a region, the number of intersections, and a
   * true/false flag for drawing the board coordinates.
   */
  getFromRegion: function(region, intersects, drawBoardCoords) {
    var cropbox = glift.orientation.cropbox.get(region, intersects);
    drawBoardCoords = drawBoardCoords || false;
    var maxIntersects = drawBoardCoords ? intersects + 2 : intersects;
    var top = cropbox.bbox.top(),
        bottom = cropbox.bbox.bottom(),
        left = cropbox.bbox.left(),
        right = cropbox.bbox.right();
    if (drawBoardCoords) {
      bottom += 2;
      right += 2;
    }

    var cx = new glift.orientation.Cropbox(
        glift.displays.bbox.fromPts(
            glift.util.point(left, top),
            glift.util.point(right, bottom)),
        maxIntersects);
    return new glift.displays.DisplayCropBox(cx);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 *
 * @constructor
 */
glift.displays.DisplayCropBox = function(cbox) {
  this._cbox = cbox;
};

glift.displays.DisplayCropBox.prototype = {
  /**
   * Returns the cbox. The cbox is a bounding box that describes what points on
   * the go board should be displayed. Generally, both the width and height of
   * the cbox must be between 0 (exclusive) and maxIntersects (inclusive).
   */
  cbox: function() { return this._cbox; },

  /**
   * Returns the bbox for the cropbox
   */
  bbox: function() { return this._cbox.bbox; },

  /**
   * Returns the maximum board size.  Often referred to as max intersections
   * elsewhere.  Typically 9, 13 or 19.
   */
  maxBoardSize: function() { return this._cbox.size; },

  /**
   * The extensions are a special modification for cropped boards.  Due to some
   * quirks of the way the board is drawn, it's convenient to add this here to
   * indicate an extra amount around the edge necessary for the overflow lines
   * (the ragged crop-edge).
   *
   * Note: the x and y coordinates for these points will either be 0 or 0.5.
   */
  topExt: function() {
    return this._cbox.hasRaggedTop() ? glift.displays.cropbox.EXT: 0;
  },
  botExt: function() { 
    return this._cbox.hasRaggedBottom() ? glift.displays.cropbox.EXT : 0;
  },
  leftExt: function() {
    return this._cbox.hasRaggedLeft() ? glift.displays.cropbox.EXT : 0;
  },
  rightExt: function() {
    return this._cbox.hasRaggedRight() ? glift.displays.cropbox.EXT : 0;
  },

  /**
   * Number of x points (or columns) for the cropped go board.
   */
  xPoints: function() { return this.cbox().bbox.width(); },

  /**
   * Number of y points (or rows) for the cropped go board.
   */
  yPoints: function() { return this.cbox().bbox.height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.width() + this.leftExt() +
        + this.rightExt() + OVERFLOW;
  },

  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.height() + this.topExt() +
        + this.botExt() + OVERFLOW;
  }
};
