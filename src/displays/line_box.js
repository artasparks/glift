(function() {
otre.displays.getLineBox = function(boardBox, cropbox) {
  var overflow = otre.displays.cropbox.OVERFLOW,
      xSpacing = boardBox.width / cropbox.width,
      ySpacing = boardBox.height / cropbox.height,
      top = ySpacing * overflow / 2,
      left = xSpacing * overflow / 2,
      bot = ySpacing * (cropbox.height - overflow / 2),
      right = xSpacing * (cropbox.width - overflow / 2),
      leftBase = boardBox.topLeft.x,
      topBase = boardBox.topLeft.y,

      // The Line Box is an extended cropbox.
      lineBoxBoundingBox = otre.displays.bboxFromPts(
          otre.util.point(left + leftBase, top + topBase),
          otre.util.point(right + leftBase, bot + topBase));
      return new LineBox(lineBoxBoundingBox, xSpacing, ySpacing, cropbox);
};

var LineBox = function(boundingBox, xSpacing, ySpacing, cropbox) {
  this.bbox = boundingBox;
  this._xSpacing = xSpacing; // For debug -- should be identical
  this._ySpacing = ySpacing; // For debug -- should be identical
  this.spacing = xSpacing;
  this.extensionBox = cropbox.extensionBox;
  this.pointTopLeft = cropbox.topLeft;
  this.xPoints = cropbox.xPoints;
  this.yPoints = cropbox.yPoints;
};

LineBox.prototype = {
  _debugDrawLines: function(paper, color) {
    for (var i = this.bbox.left, j = this.bbox.top;
          i <= this.bbox.right;
          i += this.spacing, j += this.spacing) {
      var obj = paper.rect(i, j, this.spacing, this.spacing);
      obj.attr({fill:color, opacity:0.5});
    }
  }
};


})();
