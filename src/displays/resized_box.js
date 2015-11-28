/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 */
glift.displays.getResizedBox = function(divBox, cropbox, alignment) {
  var aligns = glift.enums.boardAlignments,
      util = glift.util,
      newDims = glift.displays.getCropDimensions(
          divBox.width(),
          divBox.height(),
          cropbox),
      newWidth = newDims.width,
      newHeight = newDims.height,
      xDiff = divBox.width() - newWidth,
      yDiff = divBox.height() - newHeight,
      // These are used to center the box.  However, it's not always the case
      // that we really do want to center the box.
      xDelta = alignment === aligns.RIGHT ? xDiff : xDiff / 2,
      yDelta = alignment === aligns.TOP ? 0 : yDiff / 2,
      newLeft = divBox.topLeft().x() + xDelta,
      newTop = divBox.topLeft().y() + yDelta,
      newBox = glift.displays.bbox.fromSides(
          util.point(newLeft, newTop), newWidth, newHeight);
  alignment = alignment || aligns.CENTER;
  if (glift.global.debugMode) {
    newBox._debugInfo = function() {
      return {
        newDims: newDims,
        newWidth: newWidth,
        newHeight: newHeight,
        xDiff: xDiff,
        yDiff: yDiff,
        xDelta: xDelta,
        yDelta: yDelta,
        newLeft: newLeft,
        newTop: newTop
      };
    };
  }
  return newBox;
};

// Change the dimensions of the box (the height and width) to have the same
// proportions as cropHeight / cropWidth;
glift.displays.getCropDimensions = function(width, height, cropbox) {
  var origRatio = height / width,
      cropRatio = cropbox.heightMod() / cropbox.widthMod(),
      newHeight = height,
      newWidth = width;
  if (origRatio > cropRatio) {
    newHeight = width * cropRatio;
  } else if (origRatio < cropRatio) {
    newWidth = height / cropRatio;
  }
  return {
    height: newHeight,
    width: newWidth
  };
};
