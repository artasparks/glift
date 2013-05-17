glift.displays.getResizedBox = function(divBox, cropbox) {
  var util = glift.util,
      newDims = glift.displays.getCropDimensions(
          divBox.width(),
          divBox.height(),
          cropbox),
      newWidth = newDims.width(),
      newHeight = newDims.height(),
      xDiff = divBox.width() - newWidth,
      yDiff = divBox.height() - newHeight,
      xDelta = xDiff === 0 ? 0 : xDiff / 2,
      yDelta = yDiff === 0 ? 0 : yDiff / 2,
      newLeft = divBox.topLeft().x() + xDelta,
      newTop = divBox.topLeft().y() + yDelta,
      newBox = glift.displays.bbox(
          util.point(newLeft, newTop), newWidth, newHeight);
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
          newTop: newTop,
        };
      };
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
    height: function() { return newHeight; },
    width: function() { return newWidth; }
  };
}
