/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box.
 *
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *    unfitTransforms: [...]
 *  }
 *
 * Note: The returned items are guaranteed to be in the order they appeared as
 * inputs.
 */
glift.displays.gui.rowCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, 0, 0, 'h');
};

glift.displays.gui.columnCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, 0, 0, 'v');
};

/**
 * Perform linearCentering either vertically or horizontally.
 */
glift.displays.gui._linearCentering = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing, dir) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [];
  var dir = (dir === 'v' || dir === 'h') ? dir : 'h';
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
    var partialTransform = { scale: scale };
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

  // Find how much space to use for which parts
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

  return { transforms: transforms, bboxes: finishedBoxes, unfit: unfitBoxes };
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
