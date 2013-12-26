glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  create: function(cbox, extBox, minIntersects, maxIntersects) {
    return new glift.displays._CropBox(cbox, extBox, minIntersects, maxIntersects);
  },

  getFromRegion: function(region, intersects) {
    var util = glift.util,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        // So that we can 0 index, we subtract one.
        maxIntersects = intersects - 1,
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
          right = halfInts + 1;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;
      default: break;
    };

    var cbox = glift.displays.bboxFromPts(
        util.point(left, top), util.point(right, bot));
    var extBox = glift.displays.bboxFromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension));
    return glift.displays.cropbox.create(
        cbox, extBox, minIntersects, maxIntersects);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 */
glift.displays._CropBox = function(cbox, extBox, minIntersects, maxIntersects) {
  this._cbox = cbox;
  this._extBox = extBox;
};

glift.displays._CropBox.prototype = {
  cbox: function() { return this._cbox; },
  extBox: function() { return this._extBox; },
  xPoints: function() { return this.cbox().width(); },
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
