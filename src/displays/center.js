goog.provide('glift.displays.MultiCenter')
goog.provide('glift.displays.SingleCenter')
goog.provide('glift.displays.Transform')

/**
 * Transform object. Note that that the scale is set immediately, while the
 * xMove and yMove are often set later.
 *
 * @param {number} scale Scaling factor. Not that 1 means that the object should
 *    not be scaled.
 * @param {number=} opt_xMove Defaults to zero if not set.
 * @param {number=} opt_yMove Defaults to zero if not set
 * @constructor @final @struct
 */
glift.displays.Transform = function(scale, opt_xMove, opt_yMove) {
  /**
   * How much to scale the object by.
   * @type {number}
   */
  this.scale = scale;
  /**
   * How much to translate the object along the x-axis.
   * @type {number}
   */
  this.xMove = opt_xMove || 0;
  /**
   * How much to translate the object along the y-axis.
   * @type {number}
   */
  this.yMove = opt_yMove || 0;
};

/**
 * Result of either row-centering or column centering operation
 *
 * @param {!Array<!glift.displays.Transform>} transforms The transformations
 *    to perform.
 * @param {!Array<!glift.orientation.BoundingBox>} bboxes The transformed bounding
 *    boxes.
 * @param {!Array<!glift.orientation.BoundingBox>} unfit Bounding boxes that
 *    didn't fit given the parameters.
 * @constructor @final @struct
 */
glift.displays.MultiCenter = function(transforms, bboxes, unfit) {
  this.transforms = transforms;
  this.bboxes = bboxes;
  this.unfit = unfit;
};

/**
 * Result of either single-element centering.
 *
 * @param {!glift.displays.Transform} transform The transformation
 *    to perform.
 * @param {!glift.orientation.BoundingBox} bbox The transformed bounding
 *    boxes.
 *
 * @constructor @final @struct
 */
glift.displays.SingleCenter = function(transform, bbox) {
  this.transform = transform;
  this.bbox = bbox;
};

/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box. Note: The returned items are guaranteed to be in the order they
 * appeared as inputs.
 *
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 *
 * @return {!glift.displays.MultiCenter}
 */
glift.displays.rowCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.linearCentering_(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'h');
};

/**
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 *
 * @return {!glift.displays.MultiCenter}
 */
glift.displays.columnCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.linearCentering_(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'v');
};

/**
 * Perform linearCentering either vertically or horizontally.
 *
 * @private
 *
 * @param {!glift.orientation.BoundingBox} outerBox
 * @param {!Array<!glift.orientation.BoundingBox>} inBboxes
 * @param {number} vertMargin
 * @param {number} horzMargin
 * @param {number} minSpacing
 * @param {number} maxSpacing Zero indicates no max spacing
 * @param {string} dir Dir must be either 'v' or 'h'.
 *
 * @return {!glift.displays.MultiCenter}
 */
glift.displays.linearCentering_ = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing, dir) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [];
  // TODO(kashomon): Min spacing is totally broken and has no tests.
  // Probably should just remove it.
  minSpacing = minSpacing || 0;
  maxSpacing = maxSpacing || 0;
  dir = (dir === 'v' || dir === 'h') ? dir : 'h';
  var getLongSide = function(bbox, dir) {
    return dir === 'h' ? bbox.width() : bbox.height();
  };

  var outsideLongSide = getLongSide(outerBox, dir);
  // Use some arbitrarily large number as an upper bound default
  maxSpacing = maxSpacing <= 0 ? 10000000 : maxSpacing;
  minSpacing = minSpacing <= 0 ? 0 : minSpacing;

  // Adjust all the bboxes so that they are the right scale.
  var totalElemLength = 0;
  for (var i = 0; i < inBboxes.length; i++) {
    if (innerHeight > innerWidth) {
      var scale = innerWidth / inBboxes[i].width();
    } else {
      var scale = innerHeight / inBboxes[i].height();
    }
    var partialTransform = new glift.displays.Transform(scale);
    var newBbox = inBboxes[i].scale(scale);
    transforms.push(partialTransform);
    newBboxes.push(newBbox);
    totalElemLength += getLongSide(newBbox, dir);
    if (i < inBboxes.length - 1) {
      totalElemLength += minSpacing;
    }
  }

  // Pop off elements that don't fit.
  var unfitBoxes = [];
  while (outsideLongSide < totalElemLength) {
    var outOfBoundsBox = newBboxes.pop();
    transforms.pop();
    totalElemLength -= getLongSide(outOfBoundsBox, dir);
    totalElemLength -= minSpacing;
    unfitBoxes.push(outOfBoundsBox);
  }

  // Find how much space to use for the parts
  if (dir === 'h') {
    var extraSpace = innerWidth - totalElemLength;
  } else {
    var extraSpace = innerHeight - totalElemLength;
  }
  var extraSpacing = extraSpace / (transforms.length + 1);
  var elemSpacing = extraSpacing;
  var extraMargin = extraSpacing;
  if (extraSpacing > maxSpacing) {
    elemSpacing = maxSpacing;
    var totalExtraMargin = extraSpace - elemSpacing * (transforms.length - 1);
    extraMargin = totalExtraMargin / 2;
  }

  var left = outerBox.left() + horzMargin;
  var top = outerBox.top() + vertMargin;
  if (dir === 'h') {
    left += extraMargin;
  } else {
    top += extraMargin;
  }

  // Find the x and y translates.
  var finishedBoxes = []
  for (var i = 0; i < newBboxes.length; i++) {
    var newBbox = newBboxes[i];
    var partialTransform = transforms[i];
    var yTranslate = top - newBbox.top();
    var xTranslate = left - newBbox.left();
    partialTransform.xMove = xTranslate;
    partialTransform.yMove = yTranslate;
    finishedBoxes.push(newBbox.translate(xTranslate, yTranslate));
    if (dir === 'h') {
      left += newBbox.width() + elemSpacing;
    } else {
      top += newBbox.height() + elemSpacing;
    }
  }

  return new glift.displays.MultiCenter(
      transforms, finishedBoxes, unfitBoxes);
};

/**
 * Center an bounding box within another bounding box.
 *
 * @param {!glift.orientation.BoundingBox} outerBbox
 * @param {!glift.orientation.BoundingBox} bbox The bbox to center within the
 *    outerBbox.
 * @param {number} vertMargin
 * @param {number} horzMargin
 *
 * @return {!glift.displays.SingleCenter}
 */
glift.displays.centerWithin = function(
    outerBbox, bbox, vertMargin, horzMargin) {
  var outerWidth = outerBbox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBbox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = undefined,
      newBboxes = undefined,
      elemWidth = 0;

  var scale = 1; // i.e., no scaling;
  if (innerHeight / innerWidth >
      bbox.height() / bbox.width()) {
    // Outer box is a 'more-tall' box than the inner-box.  So, we scale the
    // inner box by width (since the height has more wiggle room).
    scale = innerWidth / bbox.width();
  } else {
    scale = innerHeight / bbox.width();
  }
  var newBbox = bbox.scale(scale);
  var left = outerBbox.left() + horzMargin;
  if (newBbox.width() < innerWidth) {
    left = left + (innerWidth - newBbox.width()) / 2; // Center horz.
  }
  var top = outerBbox.top() + vertMargin;
  if (newBbox.height() < innerHeight) {
    top = top + (innerHeight -  newBbox.height()) / 2;
  }
  var transform = new glift.displays.Transform(
    scale,
    left - newBbox.left(),
    top - newBbox.top());
  newBbox = newBbox.translate(transform.xMove, transform.yMove);
  return new glift.displays.SingleCenter(transform, newBbox);
};
