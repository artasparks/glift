glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which currently
   * creates an SVG based Go Board.
   */
  create: function(options) {
    glift.util.majorPerfLog("Before environment creation");
    var environment = glift.displays.environment.get(options);

    glift.util.majorPerfLog("After environment creation");
    var themeKey = options.theme || 'DEFAULT';
    var theme = glift.themes.get(themeKey); // Get a theme copy.
    if (options.goBoardBackground && options.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, options.goBoardBackground);
    }
    return glift.displays.board.create(
        environment, themeKey, theme, options.rotation);
  }
};
