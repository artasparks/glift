/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.STANDARD_PROBLEM = {
  stoneClick: function(widget, pt) {
    if (widget.options.problemType === glift.enums.problemTypes.EXAMPLE) {
      return;
    }
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
    var callback = widget.options.problemCallback;
    if (widget.correctness === undefined) {

      if (data.result === problemResults.CORRECT) {
        if (widget.options.problemType === probTypes.STANDARD) {
          widget.iconBar.addTempIcon(
              widget.iconBar.getIcon('checkbox').newBbox, 'check', '#0CC');
          widget.correctness = problemResults.CORRECT;
          callback(problemResults.CORRECT);

        } else if (widget.options.problemType === probTypes.ALL_CORRECT) {
          widget.iconBar.destroyTempIcons();
          if (widget.correctNextSet[pt.toString()] === undefined) {
            widget.correctNextSet[pt.toString()] = true;
            widget.numCorrectAnswers++;
            if (widget.numCorrectAnswers === widget.totalCorrectAnswers) {
              widget.correctness = problemResults.CORRECT;
              widget.iconBar.addTempText(
                  widget.iconBar.getIcon('checkbox').newBbox,
                  widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                  '#0CC');
              callback(problemResults.CORRECT);
            } else {
              widget.iconBar.addTempText(
                  widget.iconBar.getIcon('checkbox').newBbox,
                  widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                  '#000');
            }
          } else {
            // we've already seen this point
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addTempIcon(
            widget.iconBar.getIcon('checkbox').newBbox, 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  keyMappings: {
    ARROW_LEFT: 'iconActions.chevron-left.click',
    ARROW_RIGHT: 'iconActions.chevron-right.click'
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'roadmap', 'checkbox'],

  controllerFunc: glift.controllers.staticProblem
};
