/**
 * Game Figure type.
 */
// TODO(kashomon):  Temporary testing type. Complete or delete. Should probably
// be combined with example or deleted.
glift.api.widgetopt[glift.enums.widgetTypes.GAME_FIGURE] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {}, // Disable problem evaluations

  controllerFunc: glift.controllers.gameFigure,

  icons: [],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {},
  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},
};
