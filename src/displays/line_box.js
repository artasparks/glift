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
  var lineBoxBoundingBox = glift.displays.bboxFromPts(
      glift.util.point(left + leftBase, top + topBase),
      glift.util.point(right + leftBase, bot + topBase));

  var out = new glift.displays._LineBox(
      lineBoxBoundingBox, xSpacing, cropbox);
  return out;
};

glift.displays._LineBox = function(boundingBox, spacing, cropbox) {
  this.bbox = boundingBox;
  this.spacing = spacing;
  this.extensionBox = cropbox.extBox();
  this.pointTopLeft = cropbox.cbox().topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};
