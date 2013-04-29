otre.displays = {
  create: function(type, options) {
  },

  initialize: function(options) {
    var controllerManager = otre.controllers.getManager(
      options.controllerType, options.controller);
    var theme = otre.displays.getTheme(options.theme);
    // Return the uninitialized environment
    var environment = otre.displays.environment.get(
        options.divId, options.displayType, options.displays);
    return otre.displays.getFactory(
        options.graphicsType, environment, controllerManager, theme);
  },

  getFactory: function(graphicsType, environment, controller, theme) {
    var graphicsType = graphicsType || otre.enums.graphicsType.SVG;
    if (graphicsType === otre.enums.graphicsTypes.SVG) {
      return otre.displays.raphael.getFactory(environment, controller, theme);
    } else {
      // TODO: Support a rasterized go board.
      throw new "Unsupported graphics type: " + graphicsType;
    }
  }
};
