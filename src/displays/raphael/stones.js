(function(){
// Create the entire grid of stones and immediately call draw()
glift.displays.raphael.Display.prototype.createStones = function() {
  return new Stones(this.paper(), this.environment(), this.theme().stones)
      .draw();
};

// Stones is a container for all the go stones.  Usually stones are accessed
// through the Stones container
var Stones = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;

  // Map from PtHash to Stone
  this.stoneMap = {}; // init'd with draw();
};

Stones.prototype = {
  draw: function() {
    var stoneMap = {},
        boardPoints = this.environment.boardPoints;
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash],
          intersection = glift.util.pointFromHash(ptHash),
          spacing = boardPoints.spacing,
          stone = new Stone(this.paper, intersection, coordPt, spacing,
              this.subtheme);
      stoneMap[ptHash] = stone.draw();
    }
    this.stoneMap = stoneMap;
    return this;
  }
};

var Stone = function(paper, intersection, coordinate, spacing, subtheme) {
  this.paper = paper;
  // intersection: The standard point on the board, (1-indexed?). So, on a 19x19
  // board, this will be a point where x,y are between 1 and 19 inclusive.
  this.intersection = intersection;
  // coordinate: the center of the stone, in pixels.
  this.coordinate = coordinate;
  this.subtheme = subtheme;
  // TODO(kashomon): Change the magic #s to variables
  this.radius = this.spacing / 2 - .2 // .2 -> account for line width

  this.clickHandler = function() { };
  this.hoverHandlerIn = function() { };
  this.hoverHandlerOut = function() { };
};

Stone.prototype = {
  draw: function() {
    var subtheme = this.subtheme,
        paper = this.paper,
        radius = this.radius
        coord = this.coordinate;

    this.circle = paper.circle(coord.x(), coord.y(), radius);
    this.circle.attr({fill:"blue", opacity:0})

    this.bbox = paper.rect(coord.x() - radius, coord.y() -
        radius, 2 * radius, 2 * radius)
    this.bbox.attr({fill: "white", opacity: 0});

    var circle = this.circle; // closure variable.
    this.bbox_hover_in = function() {
      var state = getController().getCurrentColor()
      circle.attr({opacity: subtheme.hoverOpacity});
    };
    this.bbox_hover_out = function() {
      circle.attr({opacity: 0});
    };

    this.bbox.hover(this.bbox_hover_in, this.bbox_hover_out);
    return this;
  }
};

})();
