goog.provide('glift.displays.cropbox');
goog.provide('glift.displays.DisplayCropBox');

glift.displays.cropbox = {
  /** @const */
  EXT: .5, // Extension
  /** @const */
  DEFAULT_EXTENSION: 0, // Wut.
  /** @const */
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  /**
   * Creates a cropbox based on a region, the number of intersections, and a
   * true/false flag for drawing the board coordinates.
   *
   * @param {glift.enums.boardRegions} region
   * @param {number} intersects Number of intersections for the Go board.
   * @param {boolean=} opt_drawBoardCoords Whether or not to draw board coordinates.
   *    Optional: Defaults to false.
   */
  getFromRegion: function(region, intersects, opt_drawBoardCoords) {
    var cropbox = glift.orientation.cropbox.get(region, intersects);
    var drawBoardCoords = opt_drawBoardCoords || false;
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
        glift.orientation.bbox.fromPts(
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
 * @param {!glift.orientation.Cropbox} cbox The wrapped Cropbox.
 *
 * @constructor
 */
glift.displays.DisplayCropBox = function(cbox) {
  /** @private {!glift.orientation.Cropbox} */
  this.cbox_ = cbox;
};

glift.displays.DisplayCropBox.prototype = {
  /**
   * Returns the cbox. The cbox is a bounding box that describes what points on
   * the go board should be displayed. Generally, both the width and height of
   * the cbox must be between 0 (exclusive) and maxIntersects (inclusive).
   *
   * @return {!glift.orientation.Cropbox}
   */
  cbox: function() { return this.cbox_; },

  /**
   * Returns the bbox for the cropbox
   *
   * @return {!glift.orientation.BoundingBox}
   */
  bbox: function() { return this.cbox_.bbox; },

  /**
   * Returns the maximum board size.  Often referred to as max intersections
   * elsewhere.  Typically 9, 13 or 19.
   *
   * @return {number}
   */
  maxBoardSize: function() { return this.cbox_.size; },

  /**
   * The extensions are a special modification for cropped boards.  Due to some
   * quirks of the way the board is drawn, it's convenient to add this here to
   * indicate an extra amount around the edge necessary for the overflow lines
   * (the ragged crop-edge).
   *
   * Note: the x and y coordinates for these points will either be 0 or 0.5.
   *
   * @return {number}
   */
  topExt: function() {
    return this.cbox_.hasRaggedTop() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  botExt: function() { 
    return this.cbox_.hasRaggedBottom() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  leftExt: function() {
    return this.cbox_.hasRaggedLeft() ? glift.displays.cropbox.EXT : 0;
  },
  /** @return {number} */
  rightExt: function() {
    return this.cbox_.hasRaggedRight() ? glift.displays.cropbox.EXT : 0;
  },

  /**
   * Number of x points (or columns) for the cropped go board.
   * @return {number}
   */
  xPoints: function() { return this.cbox().bbox.width(); },

  /**
   * Number of y points (or rows) for the cropped go board.
   * @return {number}
   */
  yPoints: function() { return this.cbox().bbox.height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   * @return {number}
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.width() + this.leftExt() +
        + this.rightExt() + OVERFLOW;
  },

  /** @return {number} */
  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().bbox.height() + this.topExt() +
        + this.botExt() + OVERFLOW;
  }
};
