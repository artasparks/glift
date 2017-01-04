/**
 * Get the amount of spacing for each intesection
 *
 * @param {!glift.orientation.BoundingBox} boardBox
 * @param {!glift.displays.DisplayCropBox} cropbox
 * @return {!number}
 */
glift.displays.getSpacing = function(boardBox, cropbox) {
  // Divide the available width by the total number of horz and vert
  // intersections.
  var xSpacing = boardBox.width() / cropbox.widthIntersections();
  var ySpacing = boardBox.height() / cropbox.heightIntersections();
  // Spacing must be equal in both directions.
  return Math.min(xSpacing, ySpacing);
};
