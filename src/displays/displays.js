glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which currently
   * creates an SVG based Go Board.
   */
  create: function(options) {
    var environment = glift.displays.environment.get(options),
        themeKey = options.theme || 'DEFAULT',
        theme = glift.themes.get(themeKey); // Get a theme copy.
    if (options.goBoardBackground && options.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, options.goBoardBackground);
    }
    return glift.displays.board.create(environment, themeKey, theme);
  }
};
