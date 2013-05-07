glift.displays = {
  getImpl: function(options) {
    var theme = glift.themes.get(options.theme);
  },

  initialize: function(options) {
    var theme = glift.displays.getTheme(options.theme);
    // Return the uninitialized environment
    var environment = glift.displays.environment.get(
        options.divId, options.displayType, options.displays);
    return glift.displays.getFactory(options.graphicsType, environment, theme);
  },

  getFactory: function(graphicsType, environment, controller, theme) {
    var graphicsType = graphicsType || glift.enums.graphicsType.SVG;
    if (graphicsType === glift.enums.graphicsTypes.SVG) {
      return glift.displays.raphael.getFactory(environment, controller, theme);
    } else {
      // TODO: Support a rasterized go board.
      throw new "Unsupported graphics type: " + graphicsType;
    }
  }
};
