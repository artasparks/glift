/**
 * Find the optimal positioning of the widget. Creates divs for all the
 * necessary elements and then returns the divIds. Specifically, returns:
 *  {
 *    commentBox: ...
 *    goBox: ...
 *    iconBox: ...
 *  }
 *
 * divBox: The cropbox for the div.
 * boardRegion: The region of the go board that will be displayed.
 * intersections: The number of intersections (9-19, typically);
 * compsToUse: The board components requseted by the user
 * oneColSplits: The split percentages for a one-column format
 * twoColSplits: The split percentages for a two-column format
 */
glift.displays.position.positionWidget = function (
    divBox,
    boardRegion,
    intersections,
    componentsToUse,
    oneColSplits,
    twoColSplits) {
  return new glift.displays.position._WidgetPositioner(divBox, boardRegion,
      intersections, componentsToUse, oneColSplits, twoColSplits);
};


/** Internal widget positioner object */
glift.displays.position._WidgetPositioner = function(
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
glift.displays.position._WidgetPositioner.prototype = {
  /**
   * Calculate the Widget Positioning.  This uses heuristics to determine if the
   * orientation should be horizontally oriented or vertically oriented.
   */
  calcWidgetPositioning: function() {
    if (this.useHorzOrientation()) {
      return this.calcHorzPositioning();
    } else {
      return this.calcVertPositioning();
    }
  },

  /** Calculate the Widget Positioning for a horizontal orientation. */
  calcHorzPositioning: function() {
  },

  /** Calculate the Widget Positioning for a vertical orientation. */
  calcVertPositioning: function() {
  },

  /** Whether or not to use a horizontal orientation */
  useHorzOrientation: function(divBox, boardRegion, componentSet) {
    var longBoxRegions = { TOP: true, BOTTOM: true };
    // Force vert if no comment box or board (does not having a board make
    // sense?).
    if (!componentSet[comps.COMMENT_BOX] ||
        !componentSet[comps.BOARD]) {
      return false;
    } else if (divBox.hwRatio() < 0.45 && longBoxRegions[boardRegion]) {
      return true;
    } else if (divBox.hwRatio() < 0.800 && !longBoxRegions[boardRegion]) {
      // In other words, the width == 1.5 * height;
      return true;
    } else {
      // Default to vertical orientation
      return true;
    }
  },

  // Private helper methods //

  /** Converts the components to use array into a set (object=>true/false) */
  _getComponentSet: function() {
    var out = {};
    for (var i = 0; i < this.compsToUse.length; i++) {
      out[this.compsToUse[i]] = true;
    }
    return out;
  },
};
