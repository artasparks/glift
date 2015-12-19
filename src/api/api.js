goog.provide('glift.api');

/**
 * Namespace for API-related methods. Not all of these are meant to 
 */
glift.api = {
  /**
   * Returns a widgetManager and draw the widget. Users should not use this
   * method directly, instead peferring 'glift.create(<options>)'.
   *
   * @package
   * @param {Object} options
   * @return {glift.widgets.WidgetManager}
   */
  create: function(options) {
    glift.util.perfInit();
    var manager = glift.api.createNoDraw(options);

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
   *
   * @package
   * @param {Object} inOptions
   * @return {glift.widgets.WidgetManager}
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
        options.metadata,
        options.hooks);
  }
};


/**
 * The primary entry point for Glift. Creates a glift instance.
 *
 * api:1.0
 */
glift.create = glift.api.create;
