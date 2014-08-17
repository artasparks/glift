glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which creates an SVG
   * based Go Board.
   */
  create: function(options, boardBox) {
    glift.util.majorPerfLog("Before environment creation");
    options.boardBox = boardBox;

    // Create an environment wrapper, which performs all the calculations
    // necessary to draw the board.
    var env = glift.displays.environment.get(options);

    glift.util.majorPerfLog("After environment creation");
    var themeKey = options.theme || 'DEFAULT';
    var theme = glift.themes.get(themeKey); // Get a theme copy.
    if (options.goBoardBackground && options.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, options.goBoardBackground);
    }
    return glift.displays.board.create(env, themeKey, theme, options.rotation);
  }
};
