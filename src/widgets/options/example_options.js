/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.EXAMPLE = {
  stoneClick: function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  keyMappings: {
    ARROW_LEFT: 'iconActions.chevron-left.click',
    ARROW_RIGHT: 'iconActions.chevron-right.click'
  },

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer
};
