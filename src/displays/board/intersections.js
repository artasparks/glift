goog.provide('glift.displays.board.Intersections');

goog.require('glift.displays.board');

/**
 * The backing data for the display.
 *
 * @param {string} divId
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.flattener.BoardPoints} boardPoints Board points object from the
 *    gui environment.
 * @param {!glift.themes.base} theme The theme object
 * @param {!glift.enums.rotations} rotation An optional rotation.
 *
 * @package @constructor @final @struct
 */
glift.displays.board.Intersections = function(
    divId, svg, boardPoints, theme, rotation) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.rotation = rotation;
  this.boardPoints = boardPoints;
  this.idGen = glift.displays.svg.ids.gen(this.divId);

  /**
   * Defined during events.
   * @private {?glift.Point}
   */
  this.lastHoverPoint_ = null;

  /**
   * Function for handling the hover-out.
   * @private {?function(!Event)}
   */
  this.hoverOutFunc_ = null;
};

glift.displays.board.Intersections.prototype = {
  /**
   * Sets the color of a stone.  Note: the 'color' is really a key into the
   * Theme, so it should always be BLACK or WHITE, which can then point to any
   * color.
   * @param {!glift.Point} pt
   * @param {glift.enums.states} color
   * @return {!glift.displays.board.Intersections} this
   */
  setStoneColor: function(pt, color) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var key = pt.toString();
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
    this.flushStone_(pt);
    return this;
  },

  /**
   * Flush any stone changes to the board.
   * @param {!glift.Point} pt
   * @private
   */
  flushStone_: function(pt) {
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone && stone.attrObj() && stone.id()) {
      // A stone might not exist if the board is cropped.
      var id = stone.idOrThrow();
      var attrObj = stone.attrObj();
      // this should always be defined here, but this is for the compiler.
      if (!attrObj) { return; } 
      glift.dom.elem(id).setAttrObj(attrObj);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        glift.dom.elem(/** @type {string} */ (stoneShadow.id()))
            .setAttrObj(/** @type {!Object} */ (stoneShadow.attrObj()));
      }
    }
    return this;
  },

  /**
   * Add a mark to the display.
   * @param {!glift.Point} pt
   * @param {!glift.enums.marks} mark
   * @param {?string} label
   * @return {!glift.displays.board.Intersections} this
   */
  addMarkPt: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.markGroup());
    this.addMarkInternal_(container, pt, mark, label);
    return this;
  },

  /**
   * Test whether the board has a mark at the point.
   * @param {!glift.Point} pt
   * @return {boolean}
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
   * @param {!glift.Point} pt
   * @param {!glift.enums.marks} mark
   * @param {?string} label
   * @return {!glift.displays.board.Intersections} this
   */
  addTempMark: function(pt, mark, label) {
    pt = pt.rotate(this.boardPoints.numIntersections, this.rotation);
    var container = this.svg.child(this.idGen.tempMarkGroup());
    return this.addMarkInternal_(container, pt, mark, label);
  },

  /**
   * Like the name says, remove the temporary marks from the backing svg (empty
   * the group container) and remove them from the display.
   *
   * @return {!glift.displays.board.Intersections} this
   */
  clearTempMarks: function() {
    this.clearMarks(this.svg.child(this.idGen.tempMarkGroup()));
    return this;
  },

  /**
   * @param {!glift.svg.SvgObj} container
   * @param {!glift.Point} pt
   * @param {!glift.enums.marks} mark
   * @param {?string} label
   * @return {!glift.displays.board.Intersections} this
   * @private
   */
  addMarkInternal_: function(container, pt, mark, label) {
    // If necessary, clear out intersection lines and starpoints.  This only
    // applies when a stone hasn't yet been set (stoneColor === 'EMPTY').
    this.reqClearForMark_(pt, mark) && this.clearForMark_(pt);
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      var stoneColor = stone.attr('stone_color');
      var stonesTheme = this.theme.stones;
      var marksTheme = stonesTheme[stoneColor].marks;
      // This is a terrible hack. Once we've chosen the marks theme, set the
      // stone color to a real stone color.
      if (stoneColor === 'BLACK_HOVER') {
        stoneColor = glift.enums.states.BLACK;
      } else if (stoneColor === 'WHITE_HOVER') {
        stoneColor = glift.enums.states.WHITE;
      }
      glift.displays.board.addMark(container, this.idGen, this.boardPoints,
          marksTheme, stonesTheme, pt, mark, label, stoneColor);
      this.flushMark_(pt, mark, container);
    }
    return this;
  },

  /**
   * Determine whether an intersection (pt) needs be cleared of lines /
   * starpoints.
   *
   * @param {!glift.Point} pt
   * @param {!glift.enums.marks} mark
   * @return {boolean}
   */
  reqClearForMark_: function(pt, mark) {
    var marks = glift.enums.marks;
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    if (stone) {
      // A stone might not exist at a point if the board is cropped.
      var stoneColor = stone.attr('stone_color');
      return !!(stoneColor === 'EMPTY' && (mark === marks.LABEL
          || mark === marks.VARIATION_MARKER
          || mark === marks.CORRECT_VARIATION
          || mark === marks.LABEL_NUMERIC
          || mark === marks.LABEL_ALPHA));
    } else {
      return false;
    }
  },

  /**
   * Clear a pt of lines / starpoints so that we can place a mark (typically a
   * text-mark) without obstruction.
   *
   * @param {!glift.Point} pt
   * @return {!glift.displays.board.Intersections} the current obj.
   * @private
   */
  clearForMark_: function(pt) {
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

  /**
   * @param {!glift.Point} pt
   * @param {!glift.enums.marks} mark
   * @param {!glift.svg.SvgObj} markGroup
   * @return {!glift.displays.board.Intersections} the current obj.
   * @private
   */
  flushMark_: function(pt, mark, markGroup) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (this.reqClearForMark_(pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        glift.dom.elem(/** @type {string} */ (starp.id()))
            .setAttr('opacity', /** @type {string} */ (starp.attr('opacity')));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      glift.dom.elem(/** @type {string} */ (linept.id()))
          .setAttr('opacity', /** @type {string} */ (linept.attr('opacity')));
    }
    markGroup.child(idGen.mark(pt));
    glift.displays.svg.dom.attachToParent(
        markGroup, /** @type {string} */ (markGroup.id()));
    return this;
  },

  /**
   * Clear marks (optionally) from a group.
   *
   * @param {!glift.svg.SvgObj=} opt_markGroup
   *    Specify a mark group, or generate one.
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
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(
              /** @type {!glift.Point} */ (pt)))
      if (starpoint) {
        glift.displays.svg.dom.updateAttrInDom(
            starpoint.setAttr('opacity', 1), 'opacity');
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(
          /** @type {!glift.Point} */ (pt)))
      if (line) {
        glift.displays.svg.dom.updateAttrInDom(
            line.setAttr('opacity', 1), 'opacity');
      }
    }
    markGroup.emptyChildren();
    glift.dom.elem(/** @type {string} */ (markGroup.id())).empty();
    return this;
  },

  /**
   * Currently unused. Add guideLines for mobile devices.
   * @param {!glift.Point} pt
   * @return {glift.displays.board.Intersections} this
   */
  addGuideLines: function(pt) {
    var container = this.svg.child(this.idGen.markGroup());
    container.rmChild(this.idGen.guideLine());

    var bpt = this.boardPoints.getCoord(pt);
    var boardPoints = this.boardPoints;
    container.append(glift.svg.path()
      .setAttr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .setAttr('stroke-width', 3)
      .setAttr('stroke', 'blue')
      .setId(this.idGen.guideLine()))
    return this;
  },

  /**
   * @return {glift.displays.board.Intersections} this
   */
  clearGuideLines: function() {
    var container = this.svg.child(this.idGen.markGroup())
      .rmChild(this.idGen.guideLine());
    return this;
  },

  /**
   * @param {string} groupId
   * @param {!Object} attrObj
   * @return {glift.displays.board.Intersections} this
   */
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
   * @return {glift.displays.board.Intersections} this
   */
  clearStones: function() {
    var stoneAttrs = {opacity: 0, stone_color: "EMPTY"};
    var shadowAttrs = {opacity: 0};
    this.setGroupAttr(this.idGen.stoneGroup(), stoneAttrs)
        .setGroupAttr(this.idGen.stoneShadowGroup(), shadowAttrs);

    var stones = this.svg.child(this.idGen.stoneGroup()).children();
    for (var i = 0, len = stones.length; i < len; i++) {
      glift.dom.elem(/** @type {string} */ (stones[i].id())).setAttrObj(stoneAttrs);
    }

    var shadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (shadowGroup) {
      var shadows = shadowGroup.children();
      for (var i = 0, len = shadows.length; i < len; i++) {
        glift.dom.elem(/** @type {string} */ (shadows[i].id())).setAttrObj(shadowAttrs);
      }
    }
    return this;
  },

  /**
   * Clear all the marks and the stones.
   * @return {glift.displays.board.Intersections} this
   */
  clearAll: function() {
    this.clearMarks().clearStones();
    return this;
  },

  /**
   * Set events for the button rectangle.
   * @param {string} eventName
   * @param {function(!Event, !glift.Point)} func
   * @return {glift.displays.board.Intersections} this
   */
  setEvent: function(eventName, func) {
    var that = this;
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .id();
    glift.dom.elem(/** @type {string} */ (id)).on(eventName, function(e) {
      var pt = that.buttonEventPt_(e);
      pt && func(e, pt);
    });
    return this;
  },

  /**
   * Clears the hover point, if necessary, by running the hover out function.
   */
  clearHover: function() {
    var dummyEvent = /** @type {!Event} */ ({});
    this.hoverOutFunc_ && this.hoverOutFunc_(dummyEvent);
  },

  /**
   * Set events for the button rectangle.
   * @param {function(!Event, !glift.Point)} hoverInFunc
   * @param {function(!Event, !glift.Point)} hoverOutFunc
   * @return {glift.displays.board.Intersections} this
   */
  setHoverHandlers: function(hoverInFunc, hoverOutFunc) {
    var id = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.fullBoardButton())
        .id();
    glift.dom.elem(/** @type {string} */ (id)).on('mousemove', function(e) {
      var lastpt = this.lastHoverPoint_;
      var curpt = this.buttonEventPt_(e);
      if (curpt && lastpt && !lastpt.equals(curpt)) {
        hoverOutFunc(e, lastpt);
        hoverInFunc(e, curpt);
      } else if (!lastpt && curpt) {
        hoverInFunc(e, curpt);
      }
      this.lastHoverPoint_ = curpt;
    }.bind(this));

    /**
     * Handler for the hover-out. It's useful to be able to access this during.
     * @type {function(!Event)}
     */
    var outHandler = function(e) {
      var lastpt = this.lastHoverPoint_;
      this.lastHoverPoint_ = null;
      if (lastpt) {
        hoverOutFunc(e, lastpt);
      }
    }.bind(this);

    glift.dom.elem(/** @type {string} */ (id)).on('mouseout', outHandler)
    this.hoverOutFunc_ = outHandler;
    return this;
  },

  /**
   * Get the point from an event on the button rectangle.
   * @param {Event} e The event.
   * @return {!glift.Point}
   * @private
   */
  buttonEventPt_: function(e) {
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
