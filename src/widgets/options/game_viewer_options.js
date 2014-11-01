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
    ARROW_RIGHT: 'iconActions.arrowright.click',
    ',': 'iconActions.arrowleft.click',
    '.': 'iconActions.arrowright.click',
    '<': 'iconActions.jump-left-arrow.click',
    '>': 'iconActions.jump-right-arrow.click',
    /** Toggle the selected variation. */
    '[': function(widget) {
      widget.controller.moveUpVariations();
      widget.applyBoardData(widget.controller.getNextBoardState())
    },
    /** Toggle the selected variation. */
    ']': function(widget) {
      widget.controller.moveDownVariations();
      widget.applyBoardData(widget.controller.getNextBoardState())
    }
  },

  icons: ['jump-left-arrow', 'jump-right-arrow', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer
};
