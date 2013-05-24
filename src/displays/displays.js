glift.displays = {
  create: function(options) {
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed);
    return glift.displays.raphael.create(environment, processed.theme).draw();
  }
};
