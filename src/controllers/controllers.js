/*
 * The controllers logical parts of the Go board.
 */
glift.controllers = {
  // Map from glift.enums.controllerTypes to constructor, which takes one argument:
  // (processed) options. This is global static state and thus meant to be
  // immutable.
  controllerMap: {},

  create: function(type, options) {
    glift.util.checkArgsDefined(arguments, 2);
    var map = glift.controllers.controllerMap;
    if (map[type] !== undefined) {
      return map[type](options)
    } else {
      throw "No controller found for type: " + type
    }
  }
};
