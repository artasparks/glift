/**
 * Additional Options for the GameViewers
 */
glift.api.widgetopt[glift.WidgetType.CORRECT_VARIATIONS_PROBLEM] = function() {
  return {
    markLastMove: undefined, // rely on defaults
    keyMappings: undefined, // rely on defaults
    enableMousewheel: undefined, // rely on defaults (false)

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
      var flattened = widget.controller.addStone(pt, currentPlayer);
      var problemResults = glift.enums.problemResults;
      if (flattened.problemResult() === problemResults.FAILURE) {
        // Illegal move -- nothing to do.  Don't make the player fail based on
        // an illegal move.
        return;
      }
      var hooks = widget.hooks();
      widget.applyBoardData(flattened);

      if (widget.correctness === undefined) {
        if (flattened.problemResult()=== problemResults.CORRECT) {
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
                widget.applyBoardData(widget.controller.flattenedState());
              }, widget.sgfOptions.correctVariationsResetTime);
            }
          }
        } else if (flattened.problemResult() == problemResults.INCORRECT) {
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
  }
};
