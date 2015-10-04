/**
 * Definition of the cropbox
 */
glift.orientation.Cropbox = function(bbox, size) {
  /**
   * Points in the bounding box are 0 indexed.
   * ex. 0,8, 0,12, 0,18
   */
  this.bbox = bbox;

  /**
   * Size is 1 indexed (i.e., 19, 13, 9).
   */
  this.size = size;

  if (this.bbox.width() > this.size - 1) {
    throw new Error('BBox width cannot be bigger than the size');
  }

  if (this.bbox.height() > this.size - 1) {
    throw new Error('BBox height cannot be bigger than the size');
  }
};

glift.orientation.Cropbox.prototype = {
  /** Whether or not the top is ragged. */
  hasRaggedTop: function() {
    return this.bbox.topLeft().y() > 0;
  },
  /** Whether or not the left is ragged. */
  hasRaggedLeft: function() {
    return this.bbox.topLeft().x() > 0;
  },
  /** Whether or not the bottom is ragged. */
  hasRaggedBottom: function() {
    return this.bbox.botRight().y() < this.size - 1;
  },
  /** Whether or not the rightis ragged. */
  hasRaggedRight: function() {
    return this.bbox.botRight().x() < this.size - 1;
  },

  // TODO(kashomon): This is confusing: these really be bbox.width() + 1.
  // However, this is for backward compatibility until things settle down.

  /** Number of x points (or columns) minus 1. */
  xPoints: function() { return this.bbox.width(); },
  /** Number of y points (or rows) minus 1. */
  yPoints: function() { return this.bbox.height(); }
};

/**
 * Bounding boxes associated with the corpbox regions.
 */
glift.orientation.cropbox = {
  /**
   * Return a bounding box that indicates the cropbox. The logic is somewhat
   * nuanced:
   *
   * For corners:
   *   - the ragged top/bottom are +/- 1
   *   - the ragged right/left are +/- 2
   *
   * For edges:
   *   - the ragged top/bottom/right/eft are +/- 1
   *
   * For board sizes < 19, the cropbox is the whole board.
   */
  get: function(region, intersects) {
    var point = glift.util.point,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        min = 0,
        max = intersects - 1,
        halfInts = Math.ceil(max / 2),
        top = min,
        left = min,
        bot = max,
        right = max;

    if (intersects < 19) {
      return glift.orientation.Cropbox(
          bbox(pt(min, min), pt(max, max)), intersects);
    }

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL:
          break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          right = halfInts + 2;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          left = halfInts - 2;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          right = halfInts + 2;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          left = halfInts - 2;
          break;

      default:
          // Note: this can happen if we've let AUTO or MINIMAL slip in here
          // somehow.
          throw new Error('Unknown board region: ' + region);
    }
    var bbox = glift.displays.bbox.fromPts;
    var pt = glift.util.point;
    return new glift.orientation.Cropbox(
        bbox(pt(left, top), pt(right, bot)), intersects);
  }
};
