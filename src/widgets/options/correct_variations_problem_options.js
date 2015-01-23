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
                { fill: '#0CC', stroke: '#0CC'});
            callback(problemResults.CORRECT);
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                { fill: '#000', stroke: '#000'});
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.getEntireBoardState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.iconBar.clearTempText('multiopen-boxonly');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'problem-explanation', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem,

  correctVariationsResetTime: 750, // In milliseconds.

  statusBarIcons: [
    'fullscreen'
  ]
};
