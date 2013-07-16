glift.displays.board.createIntersections = function(divId, svg, ids, theme) {
  return new glift.displays.board._Intersections(divId, svg, ids, theme);
};

glift.displays.board._Intersections = function(divId, svg, ids, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;

  // elements by id.  Maps from point-string to element ID ('#...')
  this.lineIds = ids.lineIds;
  this.starPointIds = ids.starPointIds;
  this.stoneShadowIds = ids.stoneShadowIds;
  this.stoneIds = ids.stoneIds;
  this.markIds = ids.markIds;
  this.buttons = ids.buttons;

  this.buttonsData = [];
  for (var key in this.buttons) {
    this.buttonsData.push(glift.util.pointFromString(key));
  }
};

glift.displays.board._Intersections.prototype = {
  /**
   * Set the color of a stone. Returns 'this' for the possibility of chaining.
   */
  setStoneColor: function(pt, colorKey) {
    var key = pt.hash();
    if (this.theme.stones[colorKey] === undefined) {
      throw 'Unknown color key [' + colorKey + ']'
    }

    if (this.stoneIds[key] !== undefined) {
      var stoneColor = this.theme.stones[colorKey];
      this.svg.select('#' + this.stoneIds[key])
          .attr('fill', stoneColor.fill)
          .attr('opacity', stoneColor.opacity);
      if (this.stoneShadowIds[key] !== undefined) {
        if (stoneColor.opacity === 1) {
          this.svg.select('#' + this.stoneShadowIds[key]).attr('opacity', 1);
        } else {
          this.svg.select('#' + this.stoneShadowIds[key]).attr('opacity', 0);
        }
      }
    }
    return this;
  },

  addMark: function(pt, mark) {
    // TODO(kashomon): Write. Here to prevent errors
  },

  clearMarks: function() {
    // TODO(kashomon): Write. Here to prevent errors
  },

  setEvent: function(event, func) {
    var BUTTON = glift.enums.svgElements.BUTTON;
    this.svg.selectAll('rect' + '.' + BUTTON).data(this.buttonsData)
      .on(event, function(pt) { func(pt); });
  }
};
