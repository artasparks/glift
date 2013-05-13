(function() {

glift.displays.raphael.Display.prototype.starpoints = function() {
  return new StarPointSet(this.paper, this.environment, this.theme.board);
};

var StarPointSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  // this.starSet -- created with draw()
};

StarPointSet.prototype = {
  draw: function() {
    var point = glift.util.point,
        boardPoints = this.environment.boardPoints,
        size = boardPoints.spacing * this.subtheme.starPointSize,
        intersections = this.environment.intersections,
        pts = {
          9 : [ 4 ],
          13 : [ 3, 6, 9 ],
          19 : [ 3, 9, 15 ]
        }
        thisSet = pts[intersections] || [],
        starSet = this.paper.set();
    for (var i = 0; i < thisSet.length; i++) {
      for (var j = 0; j < thisSet.length; j++) {
        var pt = point(thisSet[i], thisSet[j]);
        if (boardPoints.hasCoord(pt)) {
          var coord = boardPoints.getCoord(pt);
          starSet.push(this.paper.circle(coord.x, coord.y, size));
        }
      }
    }
    starSet.attr({fill: this.subtheme.lineColor});
    this.starSet = starSet;
  },

  redraw: function() {
    return this.draw;
  },

  destroy: function() {
    this.starSet !== undefined && this.starSet.remove();
    return this;
  }
};
})();
