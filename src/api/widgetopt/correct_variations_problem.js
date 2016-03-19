/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM] = {
  markLastMove: undefined, // rely on defaults
  keyMappings: undefined, // rely on defaults

  problemConditions: undefined, // rely on defaults

  controllerFunc: glift.controllers.staticProblem,

  icons: [
    'refresh',
    'problem-explanation',
    'multiopen-boxonly'
  ],

  showVariations: glift.enums.showVariations.NEVER,

  statusBarIcons: [
    'fullscreen'
  ],

  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    var hooks = widget.hooks();
    widget.applyBoardData(data);
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
            hooks.problemCorrect && hooks.problemCorrect();
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                { fill: '#000', stroke: '#000'});
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(controller.flattenedState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.setCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.iconBar.clearTempText('multiopen-boxonly');
        widget.correctness = problemResults.INCORRECT;
        hooks.problemIncorrect && hooks.problemIncorrect();
      }
    }
  },

  stoneMouseover: undefined, // rely on defaults
  stoneMouseout: undefined, // rely on defaults
};
