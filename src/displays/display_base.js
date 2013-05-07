(function() {
// Note: options are already processed by the time they get here.
glift.displays.createBase = function(options) {
  var themeName = options.themeName,
      theme = glift.themes.get(themeName);
  return new BaseDisplay(theme);
};

/**
 * In the absence of interfaces in javascript, the BaseDisplay represents the
 * Display interface.
 */
var BaseDisplay = function(type, theme) {
  this.theme = theme;
};

BaseDisplay.prototype = {
  // Set the theme, by providing a registered theme key (e.g., DEFAULT). This
  // causes the board to be redrawn.
  setTheme: function(themeKey) {
    throw "Not implemented";
  },

  // Set the CropBox.  This causes the board to be redrawn.
  setCropBox: function(direction) {
    throw "Not implemented";
  },

  // Set an event handler for the given object.  If more than one object is
  // found, the handler will be applied to all such objects.
  setHandler: function(objKey, func) {
    throw "Not implemented";
  },

  // Redraw the board
  redraw: function() {
    throw "Not implemented";
  },

  // Set a stone at a particular point (bounded
  setStone: function(point, color, mark) {
    throw "Not implemented";
  },

  // The sidebar is managed separately.
  getSidebar: function(direction) {
    throw "Not implemented";
  }
};
})();
