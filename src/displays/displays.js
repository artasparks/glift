glift.displays = {
  create: function(options) {
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed),
        theme = glift.themes.get(processed.theme); // get a theme copy.
    if (processed.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, processed.goBoardBackground);
    }
    return glift.displays.board.create(environment, processed.theme, theme)
        .draw();
  }
};
