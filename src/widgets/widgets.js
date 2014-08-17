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
  createNoDraw: function(inOptions) {
    var options = glift.widgets.options.setOptionDefaults(inOptions);
    var actions = {};
    actions.iconActions = options.iconActions;
    actions.stoneActions = options.stoneActions;

    glift.init(
        options.display.disableZoomForMobile,
        options.divId);

    return new glift.widgets.WidgetManager(
        options.divId,
        options.sgfCollection,
        options.initialListIndex,
        options.allowWrapAround,
        options.sgfDefaults,
        options.display,
        options.globalBookData,
        actions);
  }
};

/**
 * A convenient alias.  This is the public method that most users of Glift will
 * call.
 */
glift.create = glift.widgets.create;
