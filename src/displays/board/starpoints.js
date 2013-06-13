(function() {

// Create the starPoints object and immediately call draw()
glift.displays.board.Display.prototype.createStarPoints = function() {
  return new StarPointSet(this._paper, this._environment, this._theme.board)
      .draw();
};

var StarPointSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.starSet = glift.util.none; // init'd with draw()
};

StarPointSet.prototype = {
  draw: function() {
    this.destroy(); // remove if it already exists.
    var point = glift.util.point,
        boardPoints = this.environment.boardPoints,
        size = boardPoints.spacing * this.subtheme.starPointSize,
        intersections = this.environment.intersections,
        pts = {
          9 : [[ 2, 6 ], [ 4 ]],
          13 : [[ 3, 9 ], [6]],
          19 : [[ 3, 9, 15 ]]
        },
        outerSet = pts[intersections] || [],
        starSet = this.paper.set();
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (boardPoints.hasCoord(pt)) {
            var coord = boardPoints.getCoord(pt);
            starSet.push(this.paper.circle(coord.x(), coord.y(), size));
          }
        }
      }
    }
    starSet.attr({fill: this.subtheme.lineColor});
    this.starSet = starSet;
    return this;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.starSet && this.starSet !== glift.util.none && this.starSet.remove();
    return this;
  }
};
})();
