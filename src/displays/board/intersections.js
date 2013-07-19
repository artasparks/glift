glift.displays.board.createIntersections = function(
    divId, svg, ids, boardPoints, theme) {
  return new glift.displays.board._Intersections(
      divId, svg, ids, boardPoints, theme);
};

glift.displays.board._Intersections = function(
    divId, svg, ids, boardPoints, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.boardPoints = boardPoints;

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
          .attr('stone_color', colorKey)
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

  addMark: function(pt, mark, label) {
    var svgutil = glift.displays.board.svgutil;
    var MARK = glift.enums.svgElements.MARK;
    var STONE = glift.enums.svgElements.STONE;
    var STARPOINT = glift.enums.svgElements.STARPOINT;
    var BOARD_LINE = glift.enums.svgElements.BOARD_LINE;
    var marks = glift.enums.marks;
    var id = svgutil.elementId(this.divId, MARK, pt);
    var stoneColor = this.svg
        .select('#' + svgutil.elementId(this.divId, STONE, pt))
            .attr('stone_color');
    if (stoneColor === 'EMPTY') {
      this.svg.select('#' + svgutil.elementId(this.divId, STARPOINT, pt))
          .attr('opacity', 0)
      this.svg.select('#' + svgutil.elementId(this.divId, BOARD_LINE, pt))
          .attr('opacity', 0)
    }
    var marksTheme = this.theme.stones[stoneColor].marks;
    var node = this.svg.select('#' + id);
    node.attr('opacity', 1)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke);
    switch(mark) {
      case marks.CIRCLE:
        node.text('\u25EF')
            .attr('dy', '.375em') // for vertical centering
        break;
      case marks.SQUARE:
        node.text('\u25A2')
            //.text('\u2610')
            .attr('dy', '.375em') // for vertical centering
        break;
      case marks.TRIANGLE:
        node.text('\u25B3')
        break;
      case marks.XMARK:
        node.text('\u2715')
        break;
      case marks.LABEL:
        node.text(label)
        break;
    }
    return this;
  },

  clearMarks: function() {
    var MARK = glift.enums.svgElements.MARK;
    this.svg.selectAll('.' + MARK)
        .attr('opacity', 0);
    return this;
  },

  setEvent: function(event, func) {
    var BUTTON = glift.enums.svgElements.BUTTON;
    this.svg.selectAll('rect' + '.' + BUTTON).data(this.buttonsData)
      .on(event, function(pt) { func(pt); });
  }
};
