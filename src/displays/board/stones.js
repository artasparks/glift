(function(){
// Create the entire grid of stones and immediately call draw()
glift.displays.board.Display.prototype.createStones = function() {
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
  this.stoneMap = glift.util.none; // init'd with draw();
  this.markMap = {}; // map from type to arraf of points
};

Stones.prototype = {
  draw: function() {
    var newStoneMap = {},
        boardPoints = this.environment.boardPoints;
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash],
          intersection = glift.util.pointFromHash(ptHash),
          spacing = boardPoints.spacing,
          stone = glift.displays.board.createStone(
              this.paper, intersection, coordPt, spacing, this.subtheme);

      // This is a hack.  This is here so we can support redrawing the board.
      // However, it conflates the idea of drawing and redrawing which probably
      // ought to be separate.
      if (this.stoneMap && this.stoneMap !== glift.util.none &&
          this.stoneMap[ptHash]) {
        // restore the stone state, if it exists.
        var prevStone = this.stoneMap[ptHash];
        var state = prevStone.colorState;
        stone.cloneHandlers(prevStone);
        stone.draw();
        stone.setColor(state);
        this.stoneMap[ptHash].destroy();
      } else {
        stone.draw();
      }

      newStoneMap[ptHash] = stone;
    }
    this.stoneMap = newStoneMap;
    return this;
  },

  // Set handlers for all the stones.
  setClickHandler: function(fn) { return this._handler('clickHandler', fn); },
  setHoverInHandler: function(fn) { return this._handler('hoverInHandler', fn); },
  setHoverOutHandler: function(fn) { return this._handler('hoverOutHandler', fn); },

  _handler: function(key, fn) {
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

  addMark: function(point, type) {
    var stone = this.stoneMap[point.hash()];
    if (stone === undefined) {
      throw "Could not find stone for point: " + point.toString();
    }
    stone.addMark(type);
    var mapped = this.markMap[type];
    if (mapped !== undefined) {
      this.markMap[type].push(point);
    } else {
      this.markMap[type] = [point]
    }
    return this;
  },

  clearMarks: function() {
    for (var type in this.markMap) {
      var ptarray = this.markMap[type];
      for (var i = 0; i < ptarray.length; i++) {
        var pt = ptarray[i];
        this.stoneMap[pt].clearMark();
      }
    }
    return this;
  },

  redraw: function() {
    return this.draw();
  },

  // Destroy is extremely slow.
  destroy: function() {
    for (var ptHash in this.stoneMap) {
      this.stoneMap[ptHash].destroy();
    }
    this.stoneMap = {};
    this.markMap = {};
  }
};

})();
