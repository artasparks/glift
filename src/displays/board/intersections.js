/**
 * The backing data for the display.
 */
glift.displays.board._Intersections = function(divId, svg, boardPoints, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.boardPoints = boardPoints;
  this.idGen = glift.displays.ids.generator(this.divId);

  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      pt: <pt>,
  //      func: func
  //    }
  //  }
  // Note that the funcs take two parameters: event and icon.
  this.events = {};

  // Tracking for which intersections have been modified.
  this.markPts = [];
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

    var stoneGroup = this.svg.child(this.idGen.stoneGroup());
    var stone = stoneGroup.child(this.idGen.stone(pt));
    if (stone !== undefined) {
      var stoneColor = this.theme.stones[colorKey];
      stone.attr('fill', stoneColor.fill)
        .attr('stroke', stoneColor.stroke || 1)
        .attr('stone_color', colorKey)
        .attr('opacity', stoneColor.opacity);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup  !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        if (stoneColor.opacity === 1) {
          stoneShadow.attr('opacity', 1);
        } else {
          stoneShadow.attr('opacity', 0);
        }
      }
    }
    this.flushStone(pt);
    return this;
  },

  /**
   * Flush any stone changes to the board.
   */
  flushStone: function(pt) {
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    $('#' + stone.attr('id')).attr(stone.attrObj());
    var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (stoneShadowGroup !== undefined) {
      var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
      $('#' + stoneShadow.attr('id')).attr(stoneShadow.attrObj());
    }
    return this;
  },

  /**
   * Add a mark to the display.
   */
  addMarkPt: function(pt, mark, label) {
    glift.displays.board.addMark(
        this.svg, this.idGen, this.boardPoints, this.theme, pt, mark, label);
    this.flushMark(pt, mark);
    return this;
  },

  flushMark: function(pt, mark) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (glift.displays.board.reqClearForMark(svg, idGen, pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        $('#' + starp.attr('id')).attr('opacity', starp.attr('opacity'));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      $('#' + linept.attr('id')).attr('opacity', linept.attr('opacity'));
    }
    var markGroup = svg.child(idGen.markGroup());
    markGroup.child(idGen.mark(pt)).attachToParent(markGroup.attr('id'));
    this.markPts.push(pt);
    return this;
  },

  clearMarks: function() {
    var idGen = this.idGen;
    for (var i = 0, len = this.markPts.length; i < len; i++) {
      var pt = this.markPts[i];
      var starpoint =
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starpoint !== undefined) {
        $('#' + starpoint.attr('id')).attr('opacity', 1);
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(pt))
      $('#' + line.attr('id')).attr('opacity', 1);
    }
    this.svg.child(this.idGen.markGroup()).emptyChildren();
    var markGroupId = this.idGen.markGroup();
    $('#' + this.idGen.markGroup()).empty();
    return this;
  },

  /**
   * Currently unused. Add guideLines for mobile devices.
   */
  addGuideLines: function(pt) {
    var elems = glift.enums.svgElements;
    var svglib = glift.displays.svg;
    var container = this.svg.child(this.idGen.markGroup());
    container.rmChild(this.idGen.guideLine());

    var bpt = this.boardPoints.getCoord(pt);
    var boardPoints = this.boardPoints;
    container.append(svglib.path()
      .attr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .attr('stroke-width', 3)
      .attr('stroke', 'blue')
      .attr('id', this.idGen.guideLine()))
  },

  clearGuideLines: function() {
    var elems = glift.enums.svgElements;
    var container = this.svg.child(this.idGen.markGroup())
      .rmChild(this.idGen.guideLine());
    return this;
  },

  setGroupAttr: function(groupId, attrObj) {
    var g = this.svg.child(groupId);
    if (g !== undefined) {
      var children = g.children();
      for (var i = 0, ii = children.length; i < ii; i++) {
        for (var key in attrObj) {
          children[i].attr(key, attrObj[key]);
        }
      }
    }
    return this;
  },

  clearStones: function() {
    var stoneAttrs = {opacity: 0, stone_color: "EMPTY"};
    var shadowAttrs = {opacity: 0};
    this.setGroupAttr(this.idGen.stoneGroup(), stoneAttrs)
        .setGroupAttr(this.idGen.stoneShadowGroup(), shadowAttrs);
    $('.' + glift.enums.svgElements.STONE_SHADOW).attr(shadowAttrs);
    $('.' + glift.enums.svgElements.STONE).attr(stoneAttrs);
    return this;
  },

  clearAll: function() {
    this.clearMarks().clearStones();
    return this;
  },

  /**
   * Set events for the buttons.
   */
  setEvent: function(eventName, func) {
    var buttonGroup = this.svg.child(this.idGen.buttonGroup());
    var children = this.svg.child(this.idGen.buttonGroup()).children();
    for (var i = 0, ii = children.length; i < ii; i++) {
      var button = children[i];
      var id = button.attr('id');
      var pt = button.data();
      var eventsId = id + '#' + eventName;
      this.events[eventsId] = { pt: pt, func: func };
    }
    return this;
  },

  flushEvents: function() {
    for (var buttonId_event in this.events) {
      var splat = buttonId_event.split('#');
      var buttonId = splat[0];
      var eventName = splat[1];
      var eventObj = this.events[buttonId_event];
      this._flushOneEvent(buttonId, eventName, eventObj);
    }
  },

  _flushOneEvent: function(buttonId, eventName, eventObj) {
    $('#' + buttonId).on(eventName, function(event) {
      eventObj.func(event, eventObj.pt);
    });
  }
};
