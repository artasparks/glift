/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  keyMappings: {
    ARROW_LEFT: 'iconActions.arrowleft.click',
    ARROW_RIGHT: 'iconActions.arrowright.click'
  },

  icons: ['jump-left-arrow', 'jump-right-arrow', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer
};
