goog.provide('glift.displays.position.WidgetPositioner');

goog.require('glift.displays.position.WidgetBoxes');
goog.require('glift.displays.position.WidgetColumn');

/**
 * Find the optimal positioning of the widget. Returns the calculated div
 * boxes.
 *
 * divBox: The cropbox for the div.
 * boardRegion: The region of the go board that will be displayed.
 * intersections: The number of intersections (9-19, typically);
 * compsToUse: The board components requseted by the user
 * oneColSplits: The split percentages for a one-column format
 * twoColSplits: The split percentages for a two-column format
 *
 * @return {!glift.displays.position.WidgetPositioner} The widget positioner
 */
glift.displays.position.positioner = function(
    divBox,
    boardRegion,
    intersections,
    componentsToUse,
    oneColSplits,
    twoColSplits) {
  if (!divBox) {
    throw new Error('No Div box. [' + divBox + ']'); 
  }
  if (!boardRegion || !glift.enums.boardRegions[boardRegion]) {
    throw new Error('Invalid Board Region. [' + boardRegion + ']');
  }
  if (!intersections) {
    throw new Error('No intersections. [' + intersections + ']');
  }
  if (!oneColSplits) {
    throw new Error('No one col splits. [' + oneColSplits + ']');
  }
  if (!twoColSplits) {
    throw new Error('No two col splits. [' + twoColSplits + ']');
  }
  return new glift.displays.position.WidgetPositioner(divBox, boardRegion,
      intersections, componentsToUse, oneColSplits, twoColSplits);
};


/**
 * Internal widget positioner object
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetPositioner = function(
    divBox, boardRegion, ints, compsToUse, oneColSplits, twoColSplits) {
  this.divBox = divBox;
  this.boardRegion = boardRegion;
  this.ints = ints;
  this.compsToUse = compsToUse;
  this.oneColSplits = oneColSplits;
  this.twoColSplits = twoColSplits;

  // Calculated values;
  this.componentSet = this._getComponentSet();
  this.cropbox = glift.displays.cropbox.getFromRegion(boardRegion, ints);
};

/** Methods for the Widget Positioner */
glift.displays.position.WidgetPositioner.prototype = {
  /**
   * Calculate the Widget Positioning.  This uses heuristics to determine if the
   * orientation should be horizontally oriented or vertically oriented.
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcWidgetPositioning: function() {
    if (this.useHorzOrientation()) {
      return this.calcHorzPositioning();
    } else {
      return this.calcVertPositioning();
    }
  },

  /**
   * Determines whether or not to use a horizontal orientation or vertical
   * orientation.
   * Returns: True or False
   */
  useHorzOrientation: function() {
    var divBox = this.divBox,
        boardRegion = this.boardRegion,
        componentSet = this.componentSet,
        comps = glift.BoardComponent,
        hwRatio = divBox.height() / divBox.width(),
        longBoxRegions = { TOP: true, BOTTOM: true };
    if (!componentSet[comps.COMMENT_BOX] ||
        !componentSet[comps.BOARD]) {
      return false; // Force vertical if no comment box or board.
    } else if (hwRatio < 0.45 && longBoxRegions[boardRegion]) {
      return true;
    } else if (hwRatio < 0.800 && !longBoxRegions[boardRegion]) {
      return true;
    } else {
      return false; // Default to vertical orientation
    }
  },

  /**
   * Calculates the Widget Positioning for a vertical orientation. returns a
   * Widget Boxes
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcVertPositioning: function() {
    var recalCol = this.recalcSplits(this.oneColSplits).first;
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.setFirst(this.calculateColumn(
        recalCol,
        this.divBox,
        glift.enums.boardAlignments.TOP,
        0 /* startTop */));
    return boxes;
  },

  /**
   * Position a widget horizontally, i.e.,
   * |   X   X   |
   *
   * Since a resizedBox is designed to fill up either the h or w dimension. There
   * are only three scenarios:
   *  1. The GoBoardBox naturally touches the top & bottom
   *  2. The GoBoardBox naturally touches the left & right
   *  2. The GoBoardBox fits perfectly.
   *
   * Note, we should never position horizontally for TOP and BOTTOM board regions.
   *
   * returns: WidgetBoxes instance.
   *
   * @return {!glift.displays.position.WidgetBoxes}
   */
  calcHorzPositioning: function() {
    var splits = this.recalcSplits(this.twoColSplits);
    var horzSplits = this.splitDivBoxHoriz();
    var boxes = new glift.displays.position.WidgetBoxes();
    boxes.setFirst(this.calculateColumn(
        splits.first,
        horzSplits[0],
        glift.enums.boardAlignments.RIGHT,
        0 /* startTop */));
    boxes.setSecond(this.calculateColumn(
        splits.second,
        horzSplits[1],
        null,
        boxes.first().getBbox(boxes.first().ordering[0]).top()));
    return boxes;
  },

  /**
   * Calculate the a widget column.  General enough that it's used for vertical
   * or horizontal positioning.
   *
   * Returns the completed WidgetColumn.
   */
  calculateColumn: function(recalCol, wrapperDiv, alignment, startTop) {
    var top = startTop || 0;
    var column = new glift.displays.position.WidgetColumn();
    var components = glift.BoardComponent;
    var divBoxSplits = [wrapperDiv];
    var ratios = this._extractRatios(recalCol);
    column.setOrderingFromRatioArray(recalCol);
    if (ratios.length > 1) {
      // We remove the last ratio, so we can be exact about the last component
      // ratio because we assume that:
      // splitN.ratio = 1 - split1.ratio + split2.ratio + ... splitN-1.ratio.
      //
      // This splits a div box into rows.
      divBoxSplits = wrapperDiv.hSplit(ratios.slice(0, ratios.length - 1));
    }

    // Map from component to split.
    var splitMap = {};
    for (var i = 0; i < recalCol.length; i++) {
      splitMap[recalCol[i].component] = divBoxSplits[i];
    }

    var board = null;
    // Reuse the environment calculations, if we have a board available.
    if (splitMap.BOARD) {
      // We defer to the display calculations that come from the environment.
      board = glift.displays.getResizedBox(
          splitMap.BOARD, this.cropbox, alignment);
      column.setComponent(components.BOARD, board);
    }

    var previousComp = null;
    var previousCompTop = null;
    var colWidth = board ? board.width() : wrapperDiv.width();
    var colLeft = board ? board.left() : wrapperDiv.left();
    column.orderFn(function(comp) {
      if (comp === components.BOARD) {
        previousComp = comp;
        top += board.height();
        return;
      }
      var split = splitMap[comp];
      var bbox = glift.orientation.bbox.fromSides(
          glift.util.point(colLeft, top), colWidth, split.height());
      column.setComponent(comp, bbox);
      top += bbox.height();
      previousComp = comp;
    }.bind(this));
    return column;
  },

  /**
   * Recalculates the split percentages based on the components to use.  This
   * works by figuring out the left over area (when pieces are disabled), and
   * then apportioning it out based on the relative size of the other
   * components.
   *
   * This is design to work with both one-column splits or two column splits.
   *
   * Returns a recalculated splits mapping. Has the form:
   * {
   *  first: [
   *    { component: BOARD, ratio: 0.3 },
   *    ...
   *  ],
   *  second: [...]
   * }
   */
  recalcSplits: function(columnSplits) {
    var out = {};
    var compsToUseSet = this.componentSet;
    // Note: this is designed with the outer loop in this way to work with
    // the one-col-split and two-col-split styles.
    for (var colKey in columnSplits) {
      // Grab array of component-ratio objs.
      var col = columnSplits[colKey];
      var colOut = [];
      var extra = 0;

      // Add up the unused pieces.
      var total = 0;
      for (var i = 0; i < col.length; i++) {
        var part = col[i];
        if (compsToUseSet[part.component]) {
          colOut.push({ // perform a copy.
            component: part.component,
            ratio: part.ratio
          });
          total += part.ratio;
        }
      }

      // Apportion the total amount so that the relative ratios are preserved.
      for (var i = 0; i < colOut.length; i++) {
        var part = colOut[i];
        part.ratio = part.ratio / total;
      }
      out[colKey] = colOut;
    }
    return out;
  },

  /**
   * Split the enclosing divbox horizontally.
   *
   * Returns: [
   *    Column 1 BBox,
   *    Column 2 Bbox
   * ]
   */
  splitDivBoxHoriz: function() {
    // Tentatively createa board box to see how much space it takes up.
    var boardBox = glift.displays.getResizedBox(
        this.divBox, this.cropbox, glift.enums.boardAlignments.RIGHT);

    // These are precentages of boardWidth.  We require that the right column be
    // at last 1/2 go board width and at most 3/4 the go board width.
    // TODO(kashomon): Make this configurable.
    var minColPercent = 0.5;
    var minColBoxSize = boardBox.width() * minColPercent;
    var maxColPercent = 0.75;
    var maxColBoxSize = boardBox.width() * maxColPercent;
    var widthDiff = this.divBox.width() - boardBox.width();

    // The boxPercentage is percentage of the width of the goboard that
    // we want the right-side box to be.
    var boxPercentage = maxColPercent;
    if (widthDiff < minColBoxSize) {
      boxPercentage = minColPercent;
    } else if (widthDiff >= minColBoxSize && widthDiff < maxColBoxSize) {
      boxPercentage = widthDiff / boardBox.width();
    }
    // Split percentage is how much we want to split the boxes by.
    var desiredWidth = boxPercentage * boardBox.width();
    var splitPercentage = boardBox.width() / (desiredWidth + boardBox.width());
    var splits = this.divBox.vSplit([splitPercentage]);

    // TODO(kashomon): This assumes a BOARD is the only element in the left
    // column.
    var resizedBox = glift.displays.getResizedBox(
        splits[0], this.cropbox, glift.enums.boardAlignments.RIGHT);

    // Defer to the Go board height calculations.
    var baseRightCol = glift.orientation.bbox.fromPts(
      glift.util.point(splits[1].topLeft().x(), resizedBox.topLeft().y()),
      glift.util.point(splits[1].botRight().x(), resizedBox.botRight().y()));

    // TODO(kashomon): Make max right col size configurable.
    if (splits[1].width() > (0.75 * resizedBox.width())) {
      baseRightCol = baseRightCol.vSplit(
          [0.75 * resizedBox.width() / baseRightCol.width()])[0];
    }
    splits[1] = baseRightCol;
    return splits;
  },

  ////////////////////////////
  // Private helper methods //
  ////////////////////////////

  /** Converts the components to use array into a set (object=>true/false). */
  _getComponentSet: function() {
    var out = {};
    for (var i = 0; i < this.compsToUse.length; i++) {
      out[this.compsToUse[i]] = true;
    }
    return out;
  },

  /** Extracts ratios from either the one-col splits or two col-splits. */
  _extractRatios: function(column) {
    var out = [];
    for (var i = 0; i < column.length; i++) {
      out.push(column[i].ratio);
    }
    return out;
  }
};
