/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.GAME_SLICE = {
  _markMap: {
    bstone_a: glift.enums.marks.LABEL_ALPHA,
    bstone_1: glift.enums.marks.LABEL_NUMERIC,
    bstone_square: glift.enums.marks.SQUARE,
    bstone_triangle: glift.enums.marks.TRIANGLE
  },

  // Map from icon name to color.
  _placementMap: {
    bstone: glift.enums.states.BLACK,
    wstone: glift.enums.states.WHITE
  },

  stoneClick: function(event, widget, pt) {},

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.NEVER,

  controllerFunc: glift.controllers.gameSlice,

  // We disable mouseover and mouseout to make it clear you can't interact with
  // the example widget.
  stoneMouseover: function() {},
  stoneMouseout: function() {},

  statusBarIcons: [
    'fullscreen'
  ]

};
