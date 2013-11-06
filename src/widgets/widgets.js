/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager.
   */
  create: function(options) {
    options = glift.widgets.options.setBaseOptionDefaults(options);
    if (options.sgf && options.sgfList.length === 0) {
      options.sgfList = [options.sgf];
    }
    if (options.enableFastClick) {
      glift.global.enableFastClick();
    }
    return new glift.widgets.WidgetManager(
      options.sgfList,
      options.initialListIndex,
      options.sgfDefaults,
      glift.widgets.options.getDisplayOptions(options)).draw();
  }
};
