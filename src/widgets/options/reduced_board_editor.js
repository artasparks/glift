/**
 * Board Editor options for when used as part of a widget
 */
glift.widgets.options.REDUCED_BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {},

  icons: ['arrowleft', 'arrowright'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
