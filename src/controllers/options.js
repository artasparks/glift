glift.controllers.processOptions = function(rawOptions) {
  // Default options
  var defaults = {
    // intersections: 19, -- intersections is not necessary, since it's set via
    // the SGF (and the default is 19 anyway).
    controllerType: "STATIC_PROBLEM_STUDY",
    initialPosition: [],
    sgfString: ''
  };
  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {

      case 'controllerType':
        if (glift.util.typeOf(value) == 'string' &&
            value in glift.enums.controllerTypes) {
          defaults.controllerType = value;
        } else {
          throw "Unknown controllerType: " + value;
        }
        break;

      case 'initialPosition':
        // If there's an error, a ParseError will be thrown.
        defaults.initialPosition = glift.rules.parseInitPosition(value);
        break;

      case 'sgfString':
        if (glift.util.typeOf(value) === 'string') {
          defaults.sgfString = value;
        } else {
          throw "Bad type for sgfString: " + value;
        }
        break;

      default:
        // Don't do anything.  This is really convenient for widgets.
    }
  }
  return defaults;
};
