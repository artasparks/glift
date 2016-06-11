/**
 * Additional Options for EXAMPLEs
 */
glift.api.widgetopt[glift.WidgetType.EXAMPLE] = function() {
  return {
    markLastMove: undefined, // rely on defaults
    keyMappings: undefined, // rely on defaults
    enableMousewheel: undefined, // rely on defaults (false)

    problemConditions: {},

    controllerFunc: glift.controllers.gameViewer,

    icons: [],

    showVariations: glift.enums.showVariations.NEVER,

    statusBarIcons: [
      // 'game-info',
      'fullscreen'
    ],

    stoneClick: function(event, widget, pt) {},
    // We disable mouseover and mouseout to make it clear you can't interact with
    // the example widget.
    stoneMouseover: function() {},
    stoneMouseout: function() {},
  };
};
