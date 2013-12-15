/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.CORRECT_VARIATIONS_PROBLEM = {
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
        widget.iconBar.destroyTempIcons();
        if (widget.correctNextSet[pt.toString()] === undefined) {
          widget.correctNextSet[pt.toString()] = true;
          widget.numCorrectAnswers++;
          if (widget.numCorrectAnswers === widget.totalCorrectAnswers) {
            widget.correctness = problemResults.CORRECT;
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#0CC');
            callback(problemResults.CORRECT);
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#000');
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.getEntireBoardState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'roadmap', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem,

  correctVariationsResetTime: 500 // In milliseconds.
};
