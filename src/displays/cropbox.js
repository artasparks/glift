glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  /**
   * Creates a cropbox based on a region, the number of intersections, and a
   * true/false flag for drawing the board coordinates.
   */
  getFromRegion: function(region, intersects, drawBoardCoords) {
    var util = glift.util,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        drawBoardCoords = drawBoardCoords || false,
        // We add an extra position around the edge for labels, so we need a
        // label modifier. 1 or 0.
        lblMod = drawBoardCoords ? 1 : 0,
        // So that we can 0 index, we subtract one.
        maxIntersects = drawBoardCoords ? intersects + 1 : intersects - 1,
        minIntersects = 0,
        defaultExtension = 0,
        lineExtension = .5,
        halfInts = Math.ceil(maxIntersects / 2),

        // Assign Defualts
        top = minIntersects,
        left = minIntersects,
        bot = maxIntersects,
        right = maxIntersects,
        topExtension = this.DEFAULT_EXTENSION,
        leftExtension = this.DEFAULT_EXTENSION,
        botExtension = this.DEFAULT_EXTENSION,
        rightExtension = this.DEFAULT_EXTENSION;

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL: break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1 + lblMod;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2 + lblMod;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1 - lblMod;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2 - lblMod;
          leftExtension = this.LINE_EXTENSION;
          break;

      default:
          // Note: this can happen if we've let AUTO or MINIMAL slip in here
          // somehow.
          throw new Error('Unknown board region: ' + region);
    };

    var cbox = glift.displays.bbox.fromPts(
        util.point(left, top), util.point(right, bot));
    var extBox = glift.displays.bbox.fromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension));
    return new glift.displays._CropBox(cbox, extBox, intersects);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 */
glift.displays._CropBox = function(cbox, extBox, maxIntersects) {
  this._cbox = cbox;
  this._extBox = extBox;
  this._maxInts = maxIntersects;
};

glift.displays._CropBox.prototype = {
  /**
   * Returns the cbox. The cbox is a bounding box that describes what points on
   * the go board should be displayed. Generally, both the width and height of
   * the cbox must be between 0 (exclusive) and maxIntersects (inclusive)
   */
  cbox: function() { return this._cbox; },

  /**
   * Returns the maximum board size.  Often referred to as max intersections
   * elsewhere.  Typically 9, 13 or 19.
   */
  maxBoardSize: function() { return this._maxInts; },

  /**
   * The extension box is a special bounding box for cropped boards.  Due to
   * some quirks of the way the board is drawn, it's convenient to add this here
   * to indicate an extra amount around the edge necessary for the overflow
   * lines (the ragged crop-edge).
   */
  extBox: function() { return this._extBox; },

  /**
   * Number of x points (or columns) for the cropped go board.
   */
  xPoints: function() { return this.cbox().width(); },

  /**
   * Number of y points (or rows) for the cropped go board.
   */
  yPoints: function() { return this.cbox().height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   *    -
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().width() + this.extBox().topLeft().x()
        + this.extBox().botRight().x() + OVERFLOW;
  },

  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().height() + this.extBox().topLeft().y()
        + this.extBox().botRight().y() + OVERFLOW;
  }
};
