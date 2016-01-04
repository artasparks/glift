/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.enums.widgetTypes.GAME_VIEWER] = {
  markLastMove: true,

  keyMappings: {
    ARROW_LEFT: 'iconActions.arrowleft.click',
    ARROW_RIGHT: 'iconActions.arrowright.click',
    ',': 'iconActions.arrowleft.click',
    '.': 'iconActions.arrowright.click',
    '<': 'iconActions.jump-left-arrow.click',
    '>': 'iconActions.jump-right-arrow.click',
    /** Toggle the selected variation. */
    ']': function(widget) {
      widget.controller.moveUpVariations();
      widget.applyBoardData(widget.controller.getNextBoardState())
    },
    /** Toggle the selected variation. */
    '[': function(widget) {
      widget.controller.moveDownVariations();
      widget.applyBoardData(widget.controller.getNextBoardState())
    }
  },

  problemConditions: {}, // Disable problem evaluations

  controllerFunc: glift.controllers.gameViewer,

  icons: ['jump-left-arrow', 'jump-right-arrow', 'arrowleft', 'arrowright'],

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
