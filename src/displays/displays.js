glift.displays = {
  getImpl: function(options) {
    var environment = glift.displays.environment.get(options);
    var display = glift.displays.raphael.create(environment, options.theme);
    return display;
  }
};
