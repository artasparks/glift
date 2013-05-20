glift.displays = {
  getImpl: function(options) {
    var processed = glift.processOptions(options),
        environment = glift.displays.environment.get(processed);
    return glift.displays.raphael.create(environment, processed.theme).draw();
  }
};
