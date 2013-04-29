(function() {
// Note: options are already processed by the time they get here.
glift.displays.createBase = function(options) {
  var themeName = options.themeName
      theme = glift.themes.get(themeName);
  return new BaseDisplay(theme);
};

var BaseDisplay = function(type, theme) {
  this.displayType = glift.enums.displayTypes.BASE;
  this.theme = theme;
};

BaseDisplay.prototype = {
  getTheme: function() {
    return this.theme;
  }
};

// theme is available to all display types.
glift.core.options.registerByComponent(
    glift.enums.components.DISPLAY, 'theme', 'default');

glift.core.options.registerByComponent(
    glift.enums.components.DISPLAY, 'graphicsType',
    glift.enums.graphicsTypes.SVG);
})();
