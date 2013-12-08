/**
 * Board Editor options.
 */
glift.widgets.options.BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {},

  icons: ['start', 'arrowleft', 'arrowright', 'twostones', 'cross'],

  // extraIcons: ['twostones', 'cross', 'check', 'cross', 'check'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
