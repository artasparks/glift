/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box.
 *
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *  }
 */
// TODO(kashomon): Support column centering.
glift.displays.gui.rowCenter = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [],
      elemWidth = 0;
  if (maxSpacing <= 0) {
    // Use some arbitrarily large number as an upper bound default
    maxSpacing = 10000000;
  }

  // Adjust all the bboxes so that they are the right height.
  for (var i = 0; i < inBboxes.length; i++) {
    var bbox = inBboxes[i];
    if (innerHeight > innerWidth) {
      var vscale = innerWidth / bbox.width();
    } else {
      var vscale = innerHeight / bbox.height();
    }
    var partialTransform = { scale: vscale }
    // we have scale the bbox to account for the transform.
    var newBbox = bbox.scale(vscale);
    transforms.push(partialTransform);
    newBboxes.push(newBbox);
    elemWidth += newBbox.width() + minSpacing;
  }

  // We don't need the final minSpacing, so subtract off.
  elemWidth -= minSpacing

  // Remove elements that don't fit.
  var unfitTransforms = [];
  while (innerWidth < elemWidth) {
    var rightMostBox = newBboxes.pop();
    var transform = transforms.pop();
    elemWidth -= rightMostBox.width() + minSpacing;
    unfitTransforms.push(transform);
  }

  // Find how much space to use for which parts
  var extraSpace = innerWidth - elemWidth;
  var extraSpacing = extraSpace / (transforms.length + 1);
  var elementSpacing = extraSpacing;
  var extraMargin = extraSpacing;
  if (extraSpacing > maxSpacing) {
    elementSpacing = maxSpacing;
    var totalExtraMargin = extraSpace -
        elementSpacing * (transforms.length - 1);
    extraMargin = totalExtraMargin / 2;
  }
  var left = outerBox.left() + horzMargin + extraMargin;
  var top = outerBox.top() + vertMargin;

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
    left += newBbox.width() + elementSpacing;
  }

  return { transforms: transforms, bboxes: finishedBoxes };
};

glift.displays.gui.centerWithin = function(
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
  var transform = {
    xMove: left - newBbox.left(),
    yMove: top - newBbox.top(),
    scale: scale
  };
  newBbox = newBbox.translate(transform.xMove, transform.yMove);
  return { transform: transform, bbox: newBbox};
};
