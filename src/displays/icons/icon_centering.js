goog.require('glift.displays.icons');

/**
 * Row center Direcotry
 * @enum {string}
 * @private
 */
glift.displays.icons.CenterDir = {
  H: 'h',
  V: 'v'
};


/**
 * Row-Center an array of wrapped icons.
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number=} opt_minSpacing
 */
glift.displays.icons.rowCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, opt_minSpacing) {
  var minSpacing = opt_minSpacing || 0;
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing,
      glift.displays.icons.CenterDir.H);
}

/**
 * Column-Center an array of wrapped icons.
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number=} opt_minSpacing
 */
glift.displays.icons.columnCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, opt_minSpacing) {
  var minSpacing = opt_minSpacing || 0;
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing,
      glift.displays.icons.CenterDir.V);
}

/**
 * Center wrapped icons
 *
 * @private
 *
 * @param {!glift.orientation.BoundingBox} divBbox
 * @param {!Array<!glift.displays.icons.WrappedIcon>} wrappedIcons
 * @param {number} vMargin
 * @param {number} hMargin
 * @param {number} minSpacing
 * @param {glift.displays.icons.CenterDir} direction
 */
glift.displays.icons._centerWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing, direction) {
  var bboxes = [];
  if (direction !== glift.displays.icons.CenterDir.H &&
      direction !== glift.displays.icons.CenterDir.V) {
    direction = glift.displays.icons.CenterDir.H;
  }
  for (var i = 0; i < wrappedIcons.length; i++) {
    bboxes.push(wrappedIcons[i].bbox);
  }

  // Row center returns: { transforms: [...], bboxes: [...] }
  if (direction === glift.displays.icons.CenterDir.H) {
    var centeringData = glift.displays.rowCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing);
  } else {
    var centeringData = glift.displays.columnCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing)
  }
  var transforms = centeringData.transforms;

  // TODO(kashomon): Can the transforms be less than the centerede icons? I
  // think so.  In any case, this case probably needs to be handled.
  for (var i = 0; i < transforms.length && i < wrappedIcons.length; i++) {
    wrappedIcons[i].performTransform(transforms[i]);
  }
  return transforms;
};
