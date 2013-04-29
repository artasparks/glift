(function(){
glift.displays.raphael.Factory.prototype.stones = function() {
  return new Stones(
      this.paper, this.environment, this.getController, this.theme.stones);
};

var Stones = function(paper, environment, getController, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.getController = getController;
  this.subtheme = subtheme;

  // Map from PtHash
  this.stoneMap = {};
};

Stones.prototype = {
  draw: function() {
    var stoneMap = {},
        boardPoints = this.environment.boardPoints;
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash];
      var intersection = glift.util.pointFromHash(ptHash);
      var spacing = boardPoints.spacing;
      var stone = new Stone(this.paper, this.getController, intersection,
          coordPt, spacing, this.subtheme)
      stoneMap[ptHash] = stone.draw();
    }
    this.stoneMap = stoneMap;
    return this;
  }
};

var Stone = function(paper, getController, intersection, coordinate, spacing,
    subtheme) {
  this.paper = paper;
  this.getController = getController;
  this.intersection = intersection;
  this.coordinate = coordinate;
  this.subtheme = subtheme;
  this.spacing = spacing;
};

Stone.prototype = {
  draw: function() {
    var subtheme = this.subtheme,
        paper = this.paper,
        radius = this.spacing / 2 - .2,
        getController = this.getController,
        coord = this.coordinate;

    this.circle = paper.circle(coord.x, coord.y, radius);
    this.circle.attr({fill:"blue", opacity:0})

    this.bbox = paper.rect(coord.x - radius, coord.y -
        radius, 2 * radius, 2 * radius)
    this.bbox.attr({fill: "white", opacity: 0});

    var circle = this.circle; // closure variable.
    this.bbox_hover_in = function() {
      var state = getController().getCurrentColor()
      circle.attr({opacity: subtheme.hoverOpacity});
    };
    this.bbox_hover_out = function() {
      circle.attr({opacity: 0});
    }

    this.bbox.hover(this.bbox_hover_in, this.bbox_hover_out);

    return this;
  }
};

})();
