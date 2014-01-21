/**
 * Board Editor options.
 */
glift.widgets.options.BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {},

  icons: ['start', 'end', 'arrowleft', 'arrowright',
      [ 'twostones', 'bstone', 'wstone', 'bstone_a', 'bstone_1_v2',
        'bstone_triangle'
    ]],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
