goog.provide('glift.displays.board.Intersections');

goog.require('glift.displays.board');

/**
 * The backing data for the display.
 *
 * @package
 * @constructor
 */
glift.displays.board.Intersections = function(
    divId, svg, boardPoints, theme, rotation) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.rotation = rotation;
  this.boardPoints = boardPoints;
  this.idGen = glift.displays.ids.generator(this.divId);

  /**
   * Defined during events, the lastHoverPoint allows us to
   */
  this.lastHoverPoint = null;

  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      pt: <pt>,
  //      func: func
  //    }
  //  }
  // Note that the funcs take two parameters: event and icon.
  // TODO(kashomon): delete
  this.events = {};

  /**
   * Tracking for which intersections have been modified with marks.
   */
  this.markPts = [];
};

glift.displays.board.Intersections.prototype = {
  /**
   * Sets the color of a stone.  Note: the 'color' is really a key into the
   * Theme, so it should always be BLACK or WHITE, which can then point to any
   * color.
   */
  setStoneColor: function(pt, color) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var key = pt.hash();
    if (this.theme.stones[color] === undefined) {
      throw 'Unknown color key [' + color + ']';
    }

    var stoneGroup = this.svg.child(this.idGen.stoneGroup());
    var stone = stoneGroup.child(this.idGen.stone(pt));
    if (stone !== undefined) {
      var stoneColor = this.theme.stones[color];
      stone.setAttr('fill', stoneColor.fill)
        .setAttr('stroke', stoneColor.stroke || 1)
        .setAttr('stone_color', color)
        .setAttr('opacity', stoneColor.opacity);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup  !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        if (stoneColor.opacity === 1) {
          stoneShadow.setAttr('opacity', 1);
        } else {
          stoneShadow.setAttr('opacity', 0);
        }
      }
    }
    this._flushStone(pt);
    return this;
  },

  /**
   * Flush any stone changes to the board.
   */
  _flushStone: function(pt) {
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      // A stone might not exist if the board is cropped.
      glift.dom.elem(stone.attr('id')).setAttrObj(stone.attrObj());
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        glift.dom.elem(stoneShadow.attr('id')).attr(stoneShadow.attrObj());
      }
    }
    return this;
  },

  /**
   * Add a mark to the display.
   */
  addMarkPt: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.markGroup());
    return this._addMarkInternal(container, pt, mark, label);
  },

  /**
   * Test whether the board has a mark at the point.
   */
  hasMark: function(pt) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    if (this.svg.child(this.idGen.markGroup()).child(this.idGen.mark(pt))) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Add a temporary mark.  This is meant for display situations (like mousover)
   * where the user is displayed the state before it is recorded in a movetree
   * or goban.
   */
  addTempMark: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.tempMarkGroup());
    return this._addMarkInternal(container, pt, mark, label);
  },

  /**
   * Like the name says, remove the temporary marks from the backing svg (empty
   * the group container) and remove them from the display.
   */
  clearTempMarks: function() {
    this.clearMarks(this.svg.child(this.idGen.tempMarkGroup()));
    return this;
  },

  _addMarkInternal: function(container, pt, mark, label) {
    // If necessary, clear out intersection lines and starpoints.  This only
    // applies when a stone hasn't yet been set (stoneColor === 'EMPTY').
    this._reqClearForMark(pt, mark) && this._clearForMark(pt);
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      var stoneColor = stone.attr('stone_color');
      var stonesTheme = this.theme.stones;
      var marksTheme = stonesTheme[stoneColor].marks;
      glift.displays.board.addMark(container, this.idGen, this.boardPoints,
          marksTheme, stonesTheme, pt, mark, label);
      this._flushMark(pt, mark, container);
    }
    return this;
  },

  /**
   * Determine whether an intersection (pt) needs be cleared of lines /
   * starpoints.
   */
  _reqClearForMark: function(pt, mark) {
    var marks = glift.enums.marks;
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      // A stone might not exist at a point if the board is cropped.
      var stoneColor = stone.attr('stone_color');
      return stoneColor === 'EMPTY' && (mark === marks.LABEL
          || mark === marks.VARIATION_MARKER
          || mark === marks.CORRECT_VARIATION
          || mark === marks.LABEL_NUMERIC
          || mark === marks.LABEL_ALPHA);
    } else {
      return false;
    }
  },

  /**
   * Clear a pt of lines / starpoints so that we can place a mark (typically a
   * text-mark) without obstruction.
   */
  _clearForMark: function(pt) {
    var starpoint = this.svg.child(this.idGen.starpointGroup())
        .child(this.idGen.starpoint(pt))
    if (starpoint) {
      starpoint.setAttr('opacity', 0);
    }
    this.svg.child(this.idGen.lineGroup())
        .child(this.idGen.line(pt))
        .setAttr('opacity', 0);
    return this;
  },

  _flushMark: function(pt, mark, markGroup) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (this._reqClearForMark(pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        glift.dom.elem(starp.attr('id'))
            .setAttr('opacity', starp.attr('opacity'));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      glift.dom.elem(linept.attr('id'))
          .setAttr('opacity', linept.attr('opacity'));
    }
    markGroup.child(idGen.mark(pt)).attachToParent(markGroup.attr('id'));
    this.markPts.push(pt);
    return this;
  },

  /**
   * Clear marks (optionally) from a group.
   * @param {string=} opt_markGroup Specify a mark group ID, or generate one.
   * @return {glift.displays.board.Intersections} the current obj.
   */
  clearMarks: function(opt_markGroup) {
    var markGroup = opt_markGroup || this.svg.child(this.idGen.markGroup());
    var idGen = this.idGen;
    var children = markGroup.children();
    for (var i = 0, len = children.length; i < len; i++) {
      var child = children[i]
      var pt = child.data();
      var starpoint =
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starpoint) {
        starpoint.setAttr('opacity', 1).updateAttrInDom('opacity');
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(pt))
      if (line) {
        line.setAttr('opacity', 1).updateAttrInDom('opacity');
      }
    }
    markGroup.emptyChildren();
    glift.dom.elem(markGroup.attr('id')).empty();
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
      .setAttr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .setAttr('stroke-width', 3)
      .setAttr('stroke', 'blue')
      .setAttr('id', this.idGen.guideLine()))
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
          children[i].setAttr(key, attrObj[key]);
        }
      }
    }
    return this;
  },

  /**
   * Clear all the stones and stone shadows.
   */
  clearStones: function() {
    var stoneAttrs = {opacity: 0, stone_color: "EMPTY"};
    var shadowAttrs = {opacity: 0};
    this.setGroupAttr(this.idGen.stoneGroup(), stoneAttrs)
        .setGroupAttr(this.idGen.stoneShadowGroup(), shadowAttrs);

    var stones = this.svg.child(this.idGen.stoneGroup()).children();
    for (var i = 0, len = stones.length; i < len; i++) {
      glift.dom.elem(stones[i].attr('id')).setAttrObj(stoneAttrs);
    }

    var shadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (shadowGroup) {
      var shadows = shadowGroup.children();
      for (var i = 0, len = shadows.length; i < len; i++) {
        glift.dom.elem(shadows[i].attr('id')).setAttrObj(shadowAttrs);
      }
    }
    return this;
  },

  clearAll: function() {
    this.clearMarks().clearStones();
    return this;
  },

  /** Set events for the button rectangle. */
  setEvent: function(eventName, func) {
    var that = this;
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .attr('id');
    glift.dom.elem(id).on(eventName, function(e) {
      var pt = that._buttonEventPt(e);
      pt && func(e, pt);
    });
    return this;
  },

  /** Set events for the button rectangle. */
  setHover: function(hoverInFunc, hoverOutFunc) {
    var that = this;
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .attr('id');
    glift.dom.elem(id).on('mousemove', function(e) {
      var lastpt = that.lastHoverPoint;
      var curpt = that._buttonEventPt(e);
      if (curpt && lastpt && !lastpt.equals(curpt)) {
        hoverOutFunc(e, lastpt);
        hoverInFunc(e, curpt);
      } else if (!lastpt && curpt) {
        hoverInFunc(e, curpt);
      }
      that.lastHoverPoint = curpt;
    });
    glift.dom.elem(id).on('mouseout', function(e) {
      var lastpt = that.lastHoverPoint;
      that.lastHoverPoint = null;
      if (lastpt) {
        hoverOutFunc(e, lastpt);
      }
    });
  },

  /** Get the point from an event on the button rectangle. */
  _buttonEventPt: function(e) {
    var data = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .data();
    var maxInts = this.boardPoints.numIntersections;
    var offset = glift.dom.elem(this.idGen.fullBoardButton()).offset();

    // X Calculations
    var left = data.tl.intPt.x();
    var pageOffsetX = e.pageX;
    if (e.changedTouches && e.changedTouches[0]) {
      pageOffsetX = e.changedTouches[0].pageX;
    }

    var ptx = (pageOffsetX - offset.left) / data.spacing;

    var intPtx = Math.floor(ptx) + left;
    if (intPtx < left) {
      intPtx = left
    } else if (intPtx > maxInts - 1) {
      intPtx = maxInts - 1
    }

    // TODO(kashomon): Remove copy pasta here.
    // Y calculations
    var top = data.tl.intPt.y();
    var pageOffsetY = e.pageY;
    if (e.changedTouches && e.changedTouches[0]) {
      pageOffsetY = e.changedTouches[0].pageY;
    }

    var pty = (pageOffsetY - offset.top) / data.spacing;
    var intPty = Math.floor(pty) + top;
    if (intPty < top) {
      intPty = top;
    } else if (intPty > maxInts - 1) {
      intPty = maxInts - 1;
    }

    var pt = glift.util.point(intPtx, intPty);
    if (this.rotation != glift.enums.rotations.NO_ROTATION) {
      pt = pt.antirotate(this.boardPoints.numIntersections, this.rotation);
    }
    return pt;
  }
};
