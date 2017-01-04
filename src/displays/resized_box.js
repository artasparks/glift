/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 *
 * @param {!glift.orientation.BoundingBox} divBox
 * @param {!glift.displays.DisplayCropBox} cropbox
 * @param {glift.enums.boardAlignments=} opt_alignment
 * @return {!glift.orientation.BoundingBox} The new bounding box.
 */
glift.displays.getResizedBox = function(divBox, cropbox, opt_alignment) {
  var aligns = glift.enums.boardAlignments;
  var alignment = opt_alignment || aligns.CENTER;
  var newDims = glift.displays.getCropDimensions(
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
      newBox = glift.orientation.bbox.fromSides(
          new glift.Point(newLeft, newTop), newWidth, newHeight);
  return newBox;
};

/**
 * Change the dimensions of the box (the height and width) to have the same
 * proportions as cropHeight / cropWidth;
 *
 * @param {number} width
 * @param {number} height
 * @param {!glift.displays.DisplayCropBox} cropbox.
 * @return {{height: number, width: number}}
 */
glift.displays.getCropDimensions = function(width, height, cropbox) {
  var origRatio = height / width,
      cropRatio = cropbox.heightIntersections() / cropbox.widthIntersections(),
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
