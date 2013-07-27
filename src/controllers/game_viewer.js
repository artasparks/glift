(function() {
glift.controllers.createGameViewer = function(rawOptions) {
  var options = glift.controllers.processOptions(rawOptions),
      controllers = glift.controllers,
      baseController = glift.util.beget(controllers.createBase()),
      newController = glift.util.setMethods(baseController, methods);
};

var methods = {
  /**
   * Called during initOptions, in the BaseController.
   */
  extraOptions: function(options) {
    this.path = [];
  },

  getCurrentPath: function(path) {
    return this.path;
  },

  addStone: function(point, color) {

  },

  moveDown: function() {

  }
};
})();
