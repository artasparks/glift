(function() {
// Note: options are already processed by the time they get here.
otre.displays.createBase = function(options) {
  var themeName = options.themeName
      theme = otre.themes.get(themeName);
  return new BaseDisplay(theme);
};

var BaseDisplay = function(type, theme) {
  this.displayType = otre.enums.displayTypes.BASE;
  this.theme = theme;
};

BaseDisplay.prototype = {
  getTheme: function() {
    return this.theme;
  }
};

// theme is available to all display types.
otre.core.options.registerByComponent(
    otre.enums.components.DISPLAY, 'theme', 'default');

otre.core.options.registerByComponent(
    otre.enums.components.DISPLAY, 'graphicsType',
    otre.enums.graphicsTypes.SVG);
})();
