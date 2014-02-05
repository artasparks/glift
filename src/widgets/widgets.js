/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager.
   */
  create: function(options) {
    glift.util.perfInit();
    options = glift.widgets.options.setBaseOptionDefaults(options);
    if (options.sgf && options.sgfList.length === 0) {
      options.sgfList = [options.sgf];
    }
    var manager = new glift.widgets.WidgetManager(
      options.sgfList,
      options.initialListIndex,
      options.allowWrapAround,
      options.sgfDefaults,
      glift.widgets.options.getDisplayOptions(options)).draw();
    glift.util.majorPerfLog('Finish creating manager');
    glift.util.perfDone();
    return manager;
  }
};

/**
 * A convenient alias.
 */
glift.create = glift.widgets.create;
