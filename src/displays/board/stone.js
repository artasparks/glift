(function(){

/**
 * Create a Stone.
 *
 * This constructor is different than all the other constructors in this
 * diroctory.  Not sure if this is a problem or not.
 */
glift.displays.board.createStone = function(
    paper, intersection, coordinate, spacing, subtheme) {
  return new Stone(paper, intersection, coordinate, spacing, subtheme);
}

var Stone = function(paper, intersection, coordinate, spacing, subtheme) {
  this.paper = paper;
  // intersection: The standard point on the board, (1-indexed?). So, on a 19x19
  // board, this will be a point where x,y are between 1 and 19 inclusive.
  this.intersection = intersection;
  // coordinate: the center of the stone, in pixels.
  this.coordinate = coordinate;
  this.subtheme = subtheme;

  this.spacing = spacing;
  // TODO(kashomon): Change the magic #s to variables or remove
  // The .2 fudge factor is used to account for line width.
  this.radius = spacing / 2 - .2

  // The purpose of colorState is to provide a way to recreate the GoBoard.
  this.colorState = undefined; // set with setColor(...)

  // Set via draw
  this.circle = undefined;
  this.bbox = undefined;

  this.bboxHoverIn = function() { throw "bboxHoverIn not Defined"; };
  this.bboxHoverOut = function() { throw "bboxHoverOut not defined"; };
  this.bboxClick = function() { throw "bboxClick not defined"; };

  // Click handlers are set via setHandler in Stones.
  this.clickHandler = function(intersection) {};
  this.hoverInHandler = function(intersection) {};
  this.hoverOutHandler = function(intersection) {};
};

// TODO(kashomon): Break out into its own file.
Stone.prototype = {
  draw: function() {
    this.destroy();
    var subtheme = this.subtheme, // i.e., THEME.stones
        paper = this.paper,
        r = this.radius,
        coord = this.coordinate,
        intersection = this.intersection,
        that = this; // Avoid lexical 'this' binding problems.
    if (this.key !== "EMPTY" && subtheme['shadows'] !== undefined) {
      this.shadow = paper.circle(coord.x(), coord.y(), r);
      this.shadow.attr(subtheme.shadows);
      var tAmt = r / 5.0; // translateAmount
      this.shadow.attr({transform:"T" + tAmt + "," + tAmt});
      this.shadow.blur(1);
      this.shadow.attr({opacity: 0});
    }
    this.circle = paper.circle(coord.x(), coord.y(), r);

    // Create a bounding box surrounding the stone.  This is what the user
    // actually clicks on, since just using circles leaves annoying gaps.
    // TODO(kashomon): Replace with button code.
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

  // Clone the handlers.  This is useful for recreating the board.  At that
  // point, we recreate each stone with the same handlers as before.
  cloneHandlers: function(stone) {
    var propertiesToCopy = [ 'bboxHoverIn', 'bboxHoverOut', 'bboxClick',
        'clickHandler', 'hoverInHandler', 'hoverOutHandler'];
    for (var i = 0; i < propertiesToCopy.length; i++) {
      if (stone[propertiesToCopy[i]]) {
        this[propertiesToCopy[i]] = stone[propertiesToCopy[i]];
      }
    }
  },

  // Set the color of the stone by retrieving the "key" from the stones
  // sub object.
  setColor: function(key) {
    if (this.circle === undefined) {
      throw "Circle was not initialized, so cannot set color";
    }
    if (!(key in this.subtheme)) {
      glift.util.logz("Key " + key + " not found in theme");
    }
    this.circle.attr(this.subtheme[key]);

    if (key !== "EMPTY" && !key.match("_HOVER") && this.shadow !== undefined ) {
      this.shadow.attr({opacity: 1});
    } else if (key === "EMPTY" && !key.match("_HOVER") && this.shadow !== undefined) {
      this.shadow.attr({opacity: 0});
    }

    this.colorState = key;
  },

  redraw: function() {
    return this.draw();
  },

  destroy: function() {
    this.bbox && this.bbox.unhover(this.bboxHoverIn, this.bboxHoverOut);
    this.bbox && this.bbox.unclick(this.bboxClick);
    this.bbox && this.bbox.remove();
    this.circle && this.circle.remove();
    this.shadow && this.shadow.remove();
    this.mark && this.mark.remove();
    return this;
  },

  _bboxToFront: function() {
    this.bbox && this.bbox !== glift.util.non && this.bbox.toFront();
    return this;
  },

  addMark: function(type, label) {
    this.mark = glift.displays.raphael.mark(
        this.paper, type, this.coordinate, {fill: 'blue'}, this.spacing, label);
    this.bbox.toFront();
    return this;
  },

  clearMark: function() {
    this.mark && this.mark.remove();
  }
};
})();
