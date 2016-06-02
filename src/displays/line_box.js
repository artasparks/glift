goog.provide('glift.displays.LineBox');

/**
 * @param {!glift.orientation.BoundingBox} boardBox
 * @param {!glift.displays.DisplayCropBox} cropbox
 * @return {!glift.displays.LineBox} The constructed LineBox.
 */
glift.displays.getLineBox = function(boardBox, cropbox) {
  var totalOverflow = glift.displays.cropbox.OVERFLOW;
  var oneSidedOverflow = totalOverflow / 2;
  // TODO(kashomon): This is very mysterious. Provide more documentation.
  var xSpacing = boardBox.width() / cropbox.widthMod();
  var ySpacing = boardBox.height() / cropbox.heightMod();
  var top = ySpacing * oneSidedOverflow; // Scale the overflow by spacing
  var left = xSpacing * oneSidedOverflow; // Scale the overflow by spacing
  var bot = ySpacing * (cropbox.heightMod() - oneSidedOverflow);
  var right = xSpacing * (cropbox.widthMod() - oneSidedOverflow);
  var leftBase = boardBox.topLeft().x();
  var topBase = boardBox.topLeft().y();

  // The Line Box is an extended cropbox.
  var lineBoxBoundingBox = glift.orientation.bbox.fromPts(
      glift.util.point(left + leftBase, top + topBase),
      glift.util.point(right + leftBase, bot + topBase));

  var out = new glift.displays.LineBox(
      lineBoxBoundingBox, xSpacing, cropbox);
  return out;
};

/**
 * Container for information relating to line-boxes.
 *
 * @param {!glift.orientation.BoundingBox} boundingBox
 * @param {number} spacing
 * @param {!glift.displays.DisplayCropBox} cropbox
 *
 * @constructor @final @struct
 */
glift.displays.LineBox = function(boundingBox, spacing, cropbox) {
  /** @const {!glift.orientation.BoundingBox} */
  this.bbox = boundingBox;
  /** @const {number} */
  this.spacing = spacing;
  /** @const {number} */
  this.topExt = cropbox.topExt();
  /** @const {number} */
  this.botExt = cropbox.botExt();
  /** @const {number} */
  this.leftExt = cropbox.leftExt();
  /** @const {number} */
  this.rightExt = cropbox.rightExt();

  /** @const {!glift.Point} */
  this.pointTopLeft = cropbox.cbox().bbox.topLeft();
  /** @const {number} */
  this.xPoints = cropbox.xPoints();
  /** @const {number} */
  this.yPoints = cropbox.yPoints();
};
