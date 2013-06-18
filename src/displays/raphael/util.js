glift.displays.raphael.util = {
  // Move the current position to X,Y
  svgMove: function(x, y) {
    return "M" + x + "," + y;
  },

  svgMovePt: function(pt) {
    return glift.displays.raphael.util.svgMove(pt.x(), pt.y());
  },

  // Create a relative SVG line, starting from the 'current' position.
  svgLineRel: function(x, y) {
    return "l" + x + "," + y;
  },

  svgLineRelPt: function(pt) {
    return glift.displays.raphael.util.svgLineRel(pt.x(), pt.y());
  },

  // Create an absolute SVG line -- different from lower case
  svgLineAbs: function(x, y) {
    return "L" + x + "," + y;
  },

  // Create an absolute SVG line -- different from lower case.
  svgLineAbsPt: function(pt) {
    return glift.displays.raphael.util.svgLineAbs(pt.x(), pt.y());
  },

  // Get the transform string, based on the scaliing object, which look like:
  // {
  //  xScale: num,
  //  yScale: num,
  //  xMove: num,
  //  yMove: num
  // }
  transform: function(scalingObj) {
    return "t" + scalingObj.xMove + "," + scalingObj.yMove +
      "s" + scalingObj.xScale + "," + scalingObj.yScale;
  }
};
