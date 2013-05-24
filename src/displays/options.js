glift.displays.processOptions = function(rawOptions) {
  var DisplayOptionError = function(message) {
    this.name = "DisplayOptionError";
    this.message = message;
  };
  DisplayOptionError.prototype = new Error();

  // Default keys
  var defaults = {
    intersections: 19,
    divId: "glift_display",
    theme: "DEFAULT",
    boardRegion: "ALL",
    displayConfig: {}
  };

  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {
      case 'intersections':
        if (glift.util.typeOf(value) == 'number' && value > 0) {
          defaults.intersections = value;
        } else {
          throw new DisplayOptionError("Intersection value : " + key);
        }
        break;

      case 'theme':
        if (glift.themes.has(value)) {
          defaults.theme = value;
        } else {
          throw new DisplayOptionError("Unknown theme: " + value);
        }
        break;

      case 'divId':
        var elem = document.getElementById(value);
        if (elem !== null) {
          defaults.divId = value
        } else {
          throw new DisplayOptionError("Could not find div with id: " + value);
        }
        break;

      // BoardRegion defines the cropping box.
      case 'boardRegion':
        if (glift.enums.boardRegions[value] !== undefined) {
          defaults.boardRegion = value;
        } else {
          throw new DisplayOptionError("Unknown board region: " + value);
        }
        break;

      // displayConfig is object containing an assortment of debug attributes.
      case 'displayConfig':
        if (glift.util.typeOf(value) === 'object') {
          defaults.displayConfig = value;
        } else {
          throw new DisplayOptionError("displayConfig not an object: " + value);
        }
        break;

      default:
        glift.util.logz("Unknown option key: " + key);
    }
  }
  return defaults;
};
