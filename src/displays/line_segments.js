(function() {
otre.displays.getLineSegments = function(lineBox) {
  var segments = new Segments();
  var point = otre.util.point;
  var logz = otre.util.logz;

  var spacing = lineBox.spacing,
      left = lineBox.bbox.left + lineBox.extensionBox.left * spacing,
      top = lineBox.bbox.top,
      bottom = lineBox.bbox.bottom;
  for (var i = 0; i <= lineBox.xPoints; i++ ) {
    var xPos = left + i * spacing;
    var ordinal = lineBox.pointTopLeft.x + i;
    segments.vert.push(new LineSegment(
        point(xPos, top), point(xPos, bottom), ordinal));
  }

  var left = lineBox.bbox.left,
      right = lineBox.bbox.right,
      top = lineBox.bbox.top + lineBox.extensionBox.top * spacing;
  for (var i = 0; i <= lineBox.yPoints; i++ ) {
    var yPos = top + i * spacing;
    var ordinal = lineBox.pointTopLeft.y + i;
    segments.horz.push(new LineSegment(
        point(left, yPos), point(right, yPos), ordinal));
  }
  return segments;
};

// Segments contains all the line segments, which are eventually turned into
// lines on the board.
var Segments = function() {
  this.horz = [];
  this.vert = [];
};

Segments.prototype._debugDraw = function(paper, color) {
  var rutil = otre.displays.raphael.rutil;
  var segs = [this.horz, this.vert];
  for (var i = 0; i < segs.length; i++) {
    var lines = segs[i];
    for (var j = 0; j < lines.length; j++) {
      paper.path(
          rutil.svgMovePt(lines[j].topLeft) +
          rutil.svgLineAbsPt(lines[j].botRight))
    }
  }
};

// The equation for a line segment, which is eventually turned into a line on
// the board.
var LineSegment = function(tl, br, ordinal) {
  this.topLeft = tl;  // coordinate
  this.botRight = br; // coordinate
  // The ordinal point on the board, i.e., the 0th line, the 2nd line, etc...
  // 0 indexed, of course.
  this.ordinal = ordinal;
};

})();
