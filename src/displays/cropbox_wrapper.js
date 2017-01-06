goog.provide('glift.displays.cropbox');
goog.provide('glift.displays.DisplayCropBox');

glift.displays.cropbox = {
  /** @const */
  OVERFLOW: .5, // The line spacing that goes around the edge.

  /** @const */
  CROP_PAD: .5, // The extra padding for the cropped-edges.

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
    return new glift.displays.DisplayCropBox(cx, cropbox, drawBoardCoords);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 *
 * @param {!glift.orientation.Cropbox} cbox The wrapped Cropbox.
 * @param {!glift.orientation.Cropbox} cboxNoCoords The cropbox without the
 *    coordinate-labels.
 * @param {boolean} drawBoardCoords
 *
 * @constructor
 */
glift.displays.DisplayCropBox = function(cbox, cboxNoCoords, drawBoardCoords) {
  /** @private {!glift.orientation.Cropbox} */
  this.cbox_ = cbox;

  /** @private {!glift.orientation.Cropbox} */
  this.cboxNoCoords_ = cboxNoCoords;

  /** @private {boolean} */
  this.drawCoords_ = drawBoardCoords;
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
  bboxWithoutCoords: function() { return this.cboxNoCoords_.bbox; },

  /**
   * Returns the bbox for the cropbox.
   * @return {!glift.orientation.BoundingBox}
   */
  bbox: function() { return this.cbox_.bbox; },

  /**
   * The extra padding is a special modification for cropped boards. It makes
   * cropped boards look a little nicer to have consistent whitespace around
   * the edge of the board. This adds a lot of complexity, but the result is
   * much nicer-looking.
   *
   * @return {number}
   * @private
   */
  topPad_: function() {
    return this.cbox_.hasRaggedTop() ? this.croppedEdgePadding() : 0;
  },
  /**
   * @return {number}
   * @private
   */
  botPad_: function() {
    return this.cbox_.hasRaggedBottom() ? this.croppedEdgePadding() : 0;
  },
  /**
   * @return {number}
   * @private
   */
  leftPad_: function() {
    return this.cbox_.hasRaggedLeft() ? this.croppedEdgePadding() : 0;
  },
  /**
   * @return {number}
   * @private
   */
  rightPad_: function() {
    return this.cbox_.hasRaggedRight() ? this.croppedEdgePadding() : 0;
  },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * This includes the intersections for the board, the extra 2 intersections
   * (possibly) for the board coordinates, and any intersections (perhaps
   * fractional) needed for padding.
   *
   * @return {number}
   */
  widthIntersections: function() {
    // We need to add 1 since the bbox is 0-indexed, ranging from 0 to 18
    return (this.cbox().bbox.width()+1) + this.basePadding()*2
        + this.leftPad_() + this.rightPad_();
  },

  /** @return {number} */
  heightIntersections: function() {
    // We need to add 1 since the bbox is 0-indexed, ranging from 0 to 18
    return (this.cbox().bbox.height()+1) + this.basePadding()*2
        + this.topPad_() + this.botPad_();
  },

  /** @return {number} */
  basePadding: function() {
    return glift.displays.cropbox.OVERFLOW / 2;
  },

  /** @return {number} */
  croppedEdgePadding: function() {
    return glift.displays.cropbox.CROP_PAD;
  },
};
