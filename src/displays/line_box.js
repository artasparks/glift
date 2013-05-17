(function() {
glift.displays.getLineBox = function(boardBox, cropbox) {
  var overflow = glift.displays.cropbox.OVERFLOW,
      xSpacing = boardBox.width() / cropbox.widthMod(),
      ySpacing = boardBox.height() / cropbox.heightMod(),
      top = ySpacing * overflow / 2,
      left = xSpacing * overflow / 2,
      bot = ySpacing * (cropbox.heightMod() - overflow / 2),
      right = xSpacing * (cropbox.widthMod() - overflow / 2),
      leftBase = boardBox.topLeft().x,
      topBase = boardBox.topLeft().y,

      // The Line Box is an extended cropbox.
      lineBoxBoundingBox = glift.displays.bboxFromPts(
          glift.util.point(left + leftBase, top + topBase),
          glift.util.point(right + leftBase, bot + topBase));
      return new LineBox(lineBoxBoundingBox, xSpacing, ySpacing, cropbox);
};

var LineBox = function(boundingBox, xSpacing, ySpacing, cropbox) {
  this.bbox = boundingBox;
  this._xSpacing = xSpacing; // For debug -- should be identical
  this._ySpacing = ySpacing; // For debug -- should be identical
  this.spacing = xSpacing;
  // todo: Make these methods instead of variables
  this.extensionBox = cropbox.extBox();
  this.pointTopLeft = cropbox.cbox().topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};

LineBox.prototype = {
  _debugDrawLines: function(paper, color) {
    for (var i = this.bbox.left(), j = this.bbox.top();
          i <= this.bbox.right();
          i += this.spacing, j += this.spacing) {
      var obj = paper.rect(i, j, this.spacing, this.spacing);
      obj.attr({fill:color, opacity:0.5});
    }
  }
};


})();
