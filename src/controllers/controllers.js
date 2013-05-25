/*
 * The controllers logical parts of the Go board.
 */
glift.controllers = {
  // Map from glift.enums.controllerTypes to constructor, which takes one argument:
  // (processed) options. This is global static state and thus meant to be
  // immutable.
  controllerMap: {},

  create: function(rawOptions) {
    var options = glift.controllers.processOptions(rawOptions);
    if (options.controllerType in glift.controllers.controllerMap) {
      return glift.controllers.controllerMap[options.controllerType](options);
    } else {
      throw "No controller found for type: " + options.controllerType;
    }
  }
};
