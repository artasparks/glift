goog.provide('glift.api');

/**
 * Namespace for API-related methods. Not all of these are meant to be exposed
 * as public methods.
 */
glift.api = {
  /**
   * Returns a widgetManager and draw the widget. Users should not use this
   * method directly, instead peferring 'glift.create(<options>)'.
   *
   * @package
   * @param {!Object} inOptions A Glift's options obj (typically specified as an object
   *    literal). See glift.api.Options. We don't technically specify the type
   *    her as glift.api.Options because the expectation is that the object will
   *    be an object literal rather than a constructed obj.
   * @return {glift.widgets.WidgetManager}
   */
  create: function(inOptions) {
    var manager = glift.api.createNoDraw(inOptions);

    glift.init(
        manager.displayOptions.disableZoomForMobile,
        manager.divId);

    manager.draw();
    return manager;
  },

  /**
   * Create a widgetManager without performing 'draw'.  This also has the
   * side effect of avoiding init code.
   *
   * This is public because it's sometimes useful to create a Glift instance
   * this way.
   *
   * @param {!Object} inOptions
   * @return {glift.widgets.WidgetManager}
   */
  createNoDraw: function(inOptions) {
    var options = new glift.api.Options(
        /** @type {!glift.api.Options} */ (inOptions));
    return new glift.widgets.WidgetManager(options);
  }
};


/**
 * The primary entry point for Glift. Creates and draws a glift instance.
 *
 * api:1.0
 */
glift.create = glift.api.create;
