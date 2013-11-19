/**
 * Board Editor options.
 */
glift.widgets.options.BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {},

  icons: ['cross', 'check', 'cross', 'check', 'cross', 'check'],

  extraIcons: ['check', 'cross', 'check', 'cross', 'check', 'cross'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
