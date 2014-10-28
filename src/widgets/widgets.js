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

    glift.init(
        manager.displayOptions.disableZoomForMobile,
        manager.divId);

    glift.util.majorPerfLog('Finish creating manager');
    manager.draw();
    glift.util.majorPerfLog('Finish drawing manager');
    glift.util.perfDone();
    return manager;
  },

  /**
   * Create a widgetManager without performing 'draw'.  This also has the
   * side effect of avoiding init code.
   */
  createNoDraw: function(inOptions) {
    var options = glift.widgets.options.setOptionDefaults(inOptions);
    var actions = {};
    actions.iconActions = options.iconActions;
    actions.stoneActions = options.stoneActions;

    return new glift.widgets.WidgetManager(
        options.divId,
        options.sgfCollection,
        options.sgfMapping,
        options.initialIndex,
        options.allowWrapAround,
        options.loadCollectionInBackground,
        options.sgfDefaults,
        options.display,
        actions,
        options.metadata);
  }
};

/**
 * A convenient alias.  This is the public method that most users of Glift will
 * call.
 *
 * @api(1.0)
 */
glift.create = glift.widgets.create;
