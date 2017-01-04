goog.provide('glift.displays.cropbox');
goog.provide('glift.displays.DisplayCropBox');

glift.displays.cropbox = {
  /** @const */
  EXT: .5, // Extension for the ragged edge
  /** @const */
  OVERFLOW: .5, // The line spacing that goes around the edge.

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
    return new glift.displays.DisplayCropBox(cx, cropbox);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 *
 * @param {!glift.orientation.Cropbox} cbox The wrapped Cropbox.
 * @param {!glift.orientation.Cropbox} cboxNoCoords The cropbox without the
 *    coordinate-labels.
 *
 * @constructor
 */
glift.displays.DisplayCropBox = function(cbox, cboxNoCoords) {
  /** @private {!glift.orientation.Cropbox} */
  this.cbox_ = cbox;

  /** @private {!glift.orientation.Cropbox} */
  this.cboxNoCoords = cboxNoCoords;

};

glift.displays.DisplayCropBox.prototype = {
  /**
   * Returns the cbox, which may include coordinate labels. The cbox is a
   * bounding box that describes what points on the go board should be
   * displayed. Generally, both the width and height of the cbox must be
   * between 0 (exclusive) and maxIntersects (inclusive), but could be +2 on
   * each side if there are labels.
   *
   * @return {!glift.orientation.Cropbox}
   */
  cbox: function() { return this.cbox_; },

  /**
   * Returns the bounding box without the coordinate labels.
   * @return {!glift.orientation.BoundingBox}
   */
  bboxWithoutCoords: function() { return this.cboxNoCoords.bbox; },

  /**
   * Returns the bbox for the cropbox.
   * @return {!glift.orientation.BoundingBox}
   */
  bbox: function() { return this.cbox_.bbox; },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * This includes the intersections for the board, the extra 2 intersections
   * (possibly) for the board coordinates, and any intersections (perhaps
   * fractional) needed for padding.
   *
   * @return {number}
   */
  widthIntersections: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    // We need to add 1 since the bbox is 0-indexed, ranging from 0 to 18
    var k = (this.cbox().bbox.width()+1) + OVERFLOW;
    console.log('wid ' + k);
    return k;
  },

  /** @return {number} */
  heightIntersections: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    // We need to add 1 since the bbox is 0-indexed, ranging from 0 to 18
    var k = (this.cbox().bbox.height()+1) + OVERFLOW;
    console.log('height ' + k);
    return k;
  },
};
