/**
 * Game Viewer options for when used as part of a widget
 */
glift.widgets.options.REDUCED_GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  icons: ['arrowleft', 'arrowright'],

  problemConditions: {},

  keyMappings: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer
};
