glift.displays.svg.pathutils = {
  /**
   * Move the current position to X,Y.  Usually used in the context of creating a
   * path.
   */
  move: function(x, y) {
    return "M" + x + " " + y;
  },

  movePt: function(pt) {
    return glift.displays.svg.pathutils.move(pt.x(), pt.y());
  },

  /**
   * Create a relative SVG line, starting from the 'current' position.
   */
  lineRel: function(x, y) {
    return "l" + x + " " + y;
  },

  lineRelPt: function(pt) {
    return glift.displays.svg.pathutils.lineRel(pt.x(), pt.y());
  },

  /**
   * Create an absolute SVG line -- different from lower case.
   * This form is usually preferred.
   */
  lineAbs: function(x, y) {
    return "L" + x + " " + y;
  },

  // Create an absolute SVG line -- different from lower case.
  lineAbsPt: function(pt) {
    return glift.displays.svg.pathutils.lineAbs(pt.x(), pt.y());
  }
};
