/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.STANDARD_PROBLEM = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var probTypes = glift.enums.problemTypes;
    var callback = widget.sgfOptions.problemCallback;
    if (widget.correctness === undefined) {
      if (data.result === problemResults.CORRECT) {
          widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
          widget.correctness = problemResults.CORRECT;
          callback(problemResults.CORRECT);
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
  icons: ['refresh', 'roadmap', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem
};
