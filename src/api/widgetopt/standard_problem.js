/**
 * Additional options for the standard problems, where the entire problem is
 * stored client-side.
 */
glift.api.widgetopt[glift.WidgetType.STANDARD_PROBLEM] = function() {
  return {
    markLastMove: undefined, // rely on defaults
    keyMappings: undefined, // rely on defaults
    enableMousewheel: undefined, // rely on defaults (false)

    problemConditions: undefined, // rely on defaults, which are set up to work
        // for the Standard problem.

    controllerFunc: glift.controllers.staticProblem,

    // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
    icons: [
      'undo-problem-move',
      'problem-explanation',
      'multiopen-boxonly' // Problem Status
    ],

    showVariations: glift.enums.showVariations.NEVER,

    statusBarIcons: [
      'fullscreen'
    ],

    stoneClick: function(event, widget, pt) {
      var hooks = widget.hooks();
      var currentPlayer = widget.controller.getCurrentPlayer();
      var flattened = widget.controller.addStone(pt, currentPlayer);
      var problemResults = glift.enums.problemResults;
      if (flattened.problemResult() === problemResults.FAILURE) {
        // Illegal move -- nothing to do.  Don't make the player fail based on
        // an illegal move.
        return;
      }
      widget.applyBoardData(flattened);
      if (flattened.problemResult()  === problemResults.CORRECT) {
          widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
          widget.correctness = problemResults.CORRECT;
          hooks.problemCorrect && hooks.problemCorrect(pt, currentPlayer);
      } else if (flattened.problemResult()  === problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        hooks.problemIncorrect && hooks.problemIncorrect(pt, currentPlayer);
      }
    },

    stoneMouseover: undefined,
    stoneMouseout: undefined,
  };
};
