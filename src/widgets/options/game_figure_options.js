/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.GAME_FIGURE = {
  stoneClick: function(event, widget, pt) {},

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.NEVER,

  controllerFunc: glift.controllers.gameFigure,

  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},

  statusBarIcons: [
    'fullscreen'
  ]

};
