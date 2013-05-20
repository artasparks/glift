(function(){
// Create the entire grid of stones and immediately call draw()
glift.displays.raphael.Display.prototype.createStones = function() {
  return new Stones(this._paper, this._environment, this._theme.stones)
      .draw();
};

// Stones is a container for all the go stones.  Individual stones are only
// interacted with through this container.
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
  },

  // Set handlers for all the stones.
  setClickHandler: function(fn) {
    return this._setHandler('clickHandler', fn);
  },
  setHoverInHandler: function(fn) {
    return this._setHandler('hoverInHandler', fn);
  },
  setHoverOutHandler: function(fn) {
    return this._setHandler('hoverOutHandler', fn);
  },
  _setHandler: function(key, fn) {
    for (var ptHash in this.stoneMap) {
      var stone = this.stoneMap[ptHash];
      stone[key] = fn;
    }
    return this;
  },

  forceClick: function(pt) { this.stoneMap[pt.hash()].bboxClick(); },
  forceHoverIn: function(pt) { this.stoneMap[pt.hash()].bboxHoverIn(); },
  forceHoverOut: function(pt) { this.stoneMap[pt.hash()].bboxHoverOut(); },
  setColor: function(point, key) {
    var stone = this.stoneMap[point.hash()];
    if (stone === undefined) {
      throw "Could not find stone for point: " + point.toString();
    }
    stone.setColor(key);
    return this;
  },

  // Destroy is extremely slow.
  destroy: function() {
    for (var ptHash in this.stoneMap) {
      this.stoneMap[ptHash].destroy();
    }
    this.stoneMap = {};
  }

  // TODO(kashomon): Add drawing marks on top of the stones.
};

var Stone = function(paper, intersection, coordinate, spacing, subtheme) {
  this.paper = paper;
  // intersection: The standard point on the board, (1-indexed?). So, on a 19x19
  // board, this will be a point where x,y are between 1 and 19 inclusive.
  this.intersection = intersection;
  // coordinate: the center of the stone, in pixels.
  this.coordinate = coordinate;
  this.subtheme = subtheme;
  // TODO(kashomon): Change the magic #s to variables.
  // The .2 fudge factor is used to account for line width.
  this.radius = spacing / 2 - .2

  // Set via draw
  this.circle = glift.util.none;
  this.bbox = glift.util.none;

  this.bboxHoverIn = function() { throw "bboxHoverIn not Defined"; };
  this.bboxHoverOut = function() { throw "bboxHoverOut not defined"; };
  this.bboxClick = function() { throw "bboxClick not defined"; };

  // Click handlers are set via setHandler in Stones.
  this.clickHandler = function(intersection) {};
  this.hoverInHandler = function(intersection) {};
  this.hoverOutHandler = function(intersection) {};
};

Stone.prototype = {
  draw: function() {
    var subtheme = this.subtheme,
        paper = this.paper,
        r = this.radius
        coord = this.coordinate,
        intersection = this.intersection,
        that = this; // Avoid lexical 'this' binding problems.

    this.circle = paper.circle(coord.x(), coord.y(), r);

    // Create a bounding box surrounding the stone.  This is what the user
    // actually clicks on, since just using circles leaves annoying gaps.
    this.bbox = paper.rect(coord.x() - r, coord.y() - r, 2 * r, 2 * r)
    this.bbox.attr({fill: "white", opacity: 0});

    this.bboxHoverIn = function() { that.hoverInHandler(intersection); };
    this.bboxHoverOut = function() { that.hoverOutHandler(intersection); };
    this.bboxClick = function() { that.clickHandler(intersection); };
    this.bbox.hover(this.bboxHoverIn, this.bboxHoverOut);
    this.bbox.click(this.bboxClick);
    this.setColor("EMPTY");
    return this;
  },

  // Set the color of the stone by retrieving the "key" from the stones
  // sub object.
  setColor: function(key) {
    if (this.circle === glift.util.none) {
      throw "Circle was not initialized, so cannot set color";
    }
    if (!(key in this.subtheme)) {
     glift.util.logz("Key " + key + " not found in theme");
    }
    this.circle.attr(this.subtheme[key]);
  },

  destroy: function() {
    if (this.circle === glift.util.none || this.bbox === glift.util.none) {
      return this // not initialized,
    }
    this.bbox.unhover(this.bboxHoverIn, this.bboxHoverOut);
    this.bbox.unclick(this.bboxClick);
    this.bbox.remove();
    this.circle.remove();
    return this;
  }
};

})();
