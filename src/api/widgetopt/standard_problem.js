/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.enums.widgetTypes.STANDARD_PROBLEM] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: {},

  controllerFunc: glift.controllers.staticProblem,

  // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
  icons: [
    'undo-problem-move',
    'problem-explanation',
    'multiopen-boxonly'
  ],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var hooks = widget.hooks();
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    if (data.result === problemResults.CORRECT) {
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
        widget.correctness = problemResults.CORRECT;
        hooks.problemCorrect && hooks.problemCorrect(pt, currentPlayer);
    } else if (data.result === problemResults.INCORRECT) {
      widget.iconBar.destroyTempIcons();
      widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
      widget.correctness = problemResults.INCORRECT;
      hooks.problemIncorrect && hooks.problemCorrect(pt, currentPlayer);
    }
  },

  stoneMouseover: undefined,
  stoneMouseout: undefined,
};
