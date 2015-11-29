goog.provide('glift.displays');

glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which creates an SVG
   * based Go Board.
   */
  create: function(divId, boardBox, theme, options) {
    glift.util.majorPerfLog("Before environment creation");

    var env = glift.displays.environment.get(divId, boardBox, options);

    glift.util.majorPerfLog("After environment creation");
    return glift.displays.board.create(env, theme, options.rotation);
  },

  /** Return the bounding box for a div. */
  bboxFromDiv: function(divId) {
    var elem = glift.dom.elem(divId);
    return glift.orientation.bbox.fromSides(
        glift.util.point(0,0), elem.width(), elem.height());
  }
};
