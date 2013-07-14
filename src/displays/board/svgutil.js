glift.displays.board.svgutil = {
  /**
   * Get an ID for a SVG element.
   */
  elementId: function(divId, type, intPt) {
    var base = divId + '_glift_' + type;
    if (intPt !== undefined) {
      return base + '_' + intPt.x() + '_' + intPt.y();
    } else {
      return base;
    }
  },

  /**
   * Move the current position to X,Y.  Usually used in the context of creating a
   * path.
   */
  svgMove: function(x, y) {
    return "M" + x + " " + y;
  },

  svgMovePt: function(pt) {
    return glift.displays.board.svgutil.svgMove(pt.x(), pt.y());
  },

  // Create a relative SVG line, starting from the 'current' position.
  svgLineRel: function(x, y) {
    return "l" + x + " " + y;
  },

  svgLineRelPt: function(pt) {
    return glift.displays.board.svgutil.svgLineRel(pt.x(), pt.y());
  },

  // Create an absolute SVG line -- different from lower case
  svgLineAbs: function(x, y) {
    return "L" + x + " " + y;
  },

  // Create an absolute SVG line -- different from lower case.
  svgLineAbsPt: function(pt) {
    return glift.displays.board.svgutil.svgLineAbs(pt.x(), pt.y());
  }
};
