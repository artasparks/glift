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
  this.stoneMap = {}; // init'd with draw();
  this.markMap = {}; // map from type to array of points
};

Stones.prototype = {
  draw: function() {
    var newStoneMap = {},
        boardPoints = this.environment.boardPoints;
    this.paper.setStart();
    for (var ptHash in boardPoints.points) {
      var coordPt = boardPoints.points[ptHash],
          intersection = glift.util.pointFromHash(ptHash), // 0 indexed
          spacing = boardPoints.spacing,
          stone = glift.displays.board.createStone(
              this.paper, intersection, coordPt, spacing, this.subtheme);

      // var intersectionLines = glift.displays.board.intersectionLine(
          // this.paper, intersection, coordPt,
          // this.environment.intersections - 1, spacing, this.subtheme);

      // This is a hack.  This is here so we can support redrawing the board.
      // However, it conflates the idea of drawing and redrawing which probably
      // ought to be separate.
      if (this.stoneMap && this.stoneMap !== glift.util.none &&
          this.stoneMap[ptHash]) {
        // restore the stone state, if it exists.
        var prevStone = this.stoneMap[ptHash];
        var state = prevStone.colorState;
        stone.draw();
        stone.cloneButtonHandlers(prevStone);
        stone.setColor(state);
        this.stoneMap[ptHash].destroy();
      } else {
        stone.draw();
      }
      newStoneMap[ptHash] = stone;

    }
    this.paper.setFinish();
    // TODO(kashomon): Move to own class.
    this.stoneMap = newStoneMap;
    return this;
  },

  // Set handlers for all the stones.
  setMouseOver: function(fn) {
    this.forEach(function(stone) {
      stone.button && stone.button.setMouseOver(fn);
    });
    return this;
  },

  setMouseOut: function(fn) {
    return this.forEach(function(stone) {
      stone.button && stone.button.setMouseOut(fn);
    });
  },

  setHover: function(fnIn, fnOut) {
    return this.setMouseOver(fnIn).setMouseOut(fnOut);
  },

  setClick: function(fn) {
    return this.forEach(function(stone) {
      stone.button && stone.button.setClick(fn);
    });
  },

  setMouseUp: function(fn) {
    return this.forEach(function(stone) {
      stone.button && stone.button.setMouseUp(fn);
    });
  },

  setMouseDown: function(fn) {
    return this.forEach(function(stone) {
      stone.button && stone.button.setMouseDown(fn);
    });
  },

  forEach: function(func) {
    for (var ptHash in this.stoneMap) {
      func(this.stoneMap[ptHash]);
    }
    return this;
  },

  forceClick: function(pt) {
    this.stoneMap[pt.hash()].button.forceClick();
  },
  forceMouseOver: function(pt) {
    this.stoneMap[pt.hash()].button.forceMouseOver();
  },
  forceMouseOut: function(pt) {
    this.stoneMap[pt.hash()].button.forceMouseOut();
  },
  forceMouseDown: function(pt) {
    this.stoneMap[pt.hash()].button.forceMouseDown();
  },
  forceMouseUp: function(pt) {
    this.stoneMap[pt.hash()].button.forceMouseUp();
  },

  setColor: function(point, key) {
    var stone = this.stoneMap[point.hash()];
    if (stone === undefined) {
      throw "Could not find stone for point: " + point.toString();
    }
    stone.setColor(key);
    return this;
  },

  addMark: function(point, type, label) {
    var stone = this.stoneMap[point.hash()];
    if (stone === undefined) {
      throw "Could not find stone for point: " + point.toString();
    }
    stone.addMark(type, label);

    // store a cache of mark data
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
