/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager and draw the widget
   */
  create: function(options) {
    glift.util.perfInit();
    var manager = glift.widgets.createNoDraw(options);
    glift.util.majorPerfLog('Finish creating manager');
    manager.draw();
    glift.util.majorPerfLog('Finish drawing manager');
    glift.util.perfDone();
    return manager;
  },

  /**
   * Create a widgetManager without performing 'draw'.
   */
  createNoDraw: function(options) {
    options = glift.widgets.options.setBaseOptionDefaults(options);
    if (options.sgf && options.sgfList.length === 0) {
      options.sgfList = [options.sgf];
    }
    var manager = new glift.widgets.WidgetManager(
      options.sgfList,
      options.initialListIndex,
      options.allowWrapAround,
      options.sgfDefaults,
      glift.widgets.options.getDisplayOptions(options))
    return manager
  }
};

/**
 * A convenient alias.
 */
glift.create = glift.widgets.create;
