/**
 * Game Viewer options for when used as part of a widget
 */
glift.api.widgetopt[glift.enums.widgetTypes.REDUCED_GAME_VIEWER] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer,

  icons: ['arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  statusBarIcons: [
    'game-info',
    'move-indicator',
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  stoneMouseover: undefined, // rely on defaults
  stoneMouseout: undefined, // rely on defaults
};
