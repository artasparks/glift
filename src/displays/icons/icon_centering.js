/**
 * Center an array of wrapped icons.
 */
glift.displays.icons.centerWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin) {
  var bboxes = [];
  for (var i = 0; i < wrappedIcons.length; i++) {
    bboxes.push(wrappedIcons[i].bbox);
  }

  // Row center returns: { transforms: [...], bboxes: [...] }
  var transforms = glift.displays.gui.rowCenter(
    divBbox, bboxes, vMargin, hMargin, 0, 0).transforms;

  // TODO(kashomon): Can the transforms be less than the centerede icons? I
  // think so.  In any case, this case probably needs to be handled.
  for (var i = 0; i < transforms.length && i < wrappedIcons.length; i++) {
    wrappedIcons[i].performTransform(transforms[i]);
  }
  return wrappedIcons;
};
