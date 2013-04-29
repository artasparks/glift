(function() {
var util = otre.util;

otre.displays.boardPoints = function() {
  return new BoardPoints();
};

otre.displays.boardPointsFromLineBox = function(linebox) {
  var spacing = linebox.spacing,
      linebbox = linebox.bbox,
      left = linebbox.left + linebox.extensionBox.left * spacing,
      top = linebbox.top + linebox.extensionBox.top * spacing,
      leftPt = linebox.pointTopLeft.x,
      topPt = linebox.pointTopLeft.y,
      boardPoints = otre.displays.boardPoints();
  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = otre.util.point(leftPt + j, topPt + i);
      var coordPt = otre.util.point(xCoord, yCoord);
      boardPoints.add(intPt, coordPt);
    }
  }
  boardPoints.setSpacing(spacing);
  return boardPoints;
};

// BoardPoints maintains a mapping from an intersection on the board
// to a coordinate in pixel-space.
var BoardPoints = function() {
  this.points = {};
  this.spacing = undefined; // to be set by caller
};

BoardPoints.prototype = {
  add: function(intPt, coordPt) {
    if (this.points[intPt.hash()] === undefined) {
      this.points[intPt.hash()] = coordPt;
    }
    return this;
  },

  setSpacing: function(spacing) {
    this.spacing = spacing;
  },

  getCoords: function() {
    return this.points;
  },

  // Test whether there is a
  hasCoord: function(pt) {
    return this.points[pt.hash()] !== undefined;
  },

  // Get the coordinate in the HTML div associated with the
  getCoord: function(pt) {
    return this.points[pt.hash()];
  },

  _debugDraw: function(paper, color) {
    for (var ptHash in this.points) {
      var coordPt = this.points[ptHash];
      var circ = paper.circle(coordPt.x, coordPt.y, this.spacing / 2);
      circ.attr({fill:color, opacity:.3});
    }
  }
}

})();
