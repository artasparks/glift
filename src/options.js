// Create: Process the options, using defaults where appropriate.
glift.processOptions = function(rawOptions) {

  // Default keys
  var defaults = {
    intersections: 19,
    divId: "glift_display",
    theme: "DEFAULT",
    boardRegion: "ALL"
  };

  for (var key in rawOptions) {
    var value = rawOptions[key];
    switch(key) {
      case 'intersections':
        if (glift.util.typeOf(value) == 'number' && value > 0) {
          defaults.intersections = value;
        } else {
          glift.util.debugl("Intersection value : " + key);
        }
        break;
      case 'theme':
        if (glift.themes.has(value)) {
          defaults.theme = value;
        } else {
          glift.util.debugl("Unknown theme: " + value);
        }
        break;
      case 'divId':
        var elem = document.getElementById(value);
        if (elem !== null) {
          defaults.divId = value
        } else {
          glift.util.debugl("Could not find div with id: " + value);
        }
        break;
      case 'boardRegion':
        if (glift.util.enums.boardRegions[value] !== undefined) {
          defaults.boardRegion = value;
        } else {
          glift.util.debugl("Unknown board region: " + value);
        }
      default:
        glift.util.debugl("Unknown option key: " + key);
    }
  }
  return defaults;
};
