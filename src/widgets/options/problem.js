/**
 * Option defaults used by the Problem Widget.
 */
glift.widgets.options.problem = {
  /**
   * List of problem strings to cycle through.
   */
  sgfStringList: [],

  /**
   * Index into the above array.  It seems unlikely that anybody would want to
   * override this setting, but it's here or clarity.
   */
  problemIndex: 0,

  /**
   * The function that produces the problem controller.
   */
  controllerFunc: glift.controllers.staticProblem,

  /**
   * We want the problem widget to be smart about the relevant board region.
   */
  boardRegionType: glift.enums.boardRegions.AUTO,

  /**
   * Icons specified by the problem widget.
   */
  icons: ['play', 'refresh', 'roadmap', 'checkbox'],

  /**
   * Turn off the comment box, by default
   */
  // TODO(kashomon): Nevisit this idea later. Maybe problems just need a smaller
  // comment box?
  useCommentBar: false,

  /**
   * Don't show variations for problems, of course =).
   */
  showVariations: glift.enums.showVariations.NEVER,

  /**
   * Keymappings for the problem widget
   */
  // TODO(kashomon): Add key mappings for problems.
  keyMapping: {},

  /**
   * Problem-specific actions.
   */
  actions: {
    stones: {
      /**
       * Add a stone and report if it was correct.
       */
      click: function(widget, pt) {
        var currentPlayer = widget.controller.getCurrentPlayer();
        var data = widget.controller.addStone(pt, currentPlayer);
        var problemResults = glift.enums.problemResults;
        if (data.result === problemResults.FAILURE) {
          return; // Illegal move -- nothing to do.
        }
        widget.applyBoardData(data);
        if (widget.correctness === undefined) {
          if (data.result === problemResults.CORRECT) {
            widget.iconBar.addTempIcon(
                'check', widget.iconBar.getIcon('checkbox').newBbox, '#0CC');
            widget.correctness = problemResults.CORRECT;
          } else if (data.result == problemResults.INCORRECT) {
            widget.iconBar.addTempIcon(
                'cross', widget.iconBar.getIcon('checkbox').newBbox, 'red');
            widget.correctness = problemResults.INCORRECT;
          }
        }
      }
    },

    icons: {
      // Get next problem.
      play: {
        click: function(widget) {
          if (widget.options.sgfStringList.length > 0) {
            widget.options.problemIndex = (widget.options.problemIndex + 1) %
                widget.options.sgfStringList.length;
            widget.options.sgfString = widget.options.sgfStringList[
                widget.options.problemIndex];
            widget.controller = glift.controllers.staticProblem(
                widget.options);
            widget.reload();
          }
        }
      },
      // Try again
      refresh: {
        click: function(widget) {
          widget.reload();
        }
      },

      // Go to the explain-board.
      roadmap: {
        click: function(widget) {
          widget.problemControllor = widget.controller;
          widget.problemOptions = widget.options;
          widget.destroy();
          var returnAction = function(widget) {
            widget.destroy();
            widget.options = widget.problemOptions;
            widget.controller = widget.problemControllor;
            widget.draw();
          };
          var optionsCopy = {
            divId: widget.options.divId,
            theme: widget.options.theme,
            sgfString: widget.options.sgfString,
            showVariations: glift.enums.showVariations.ALWAYS,
            showCorrectVariations: true,
            boardRegionType: glift.enums.boardRegions.AUTO,
            icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo'],
            actions: {
              icons: {
                undo : {
                  click: returnAction
                }
              }
            }
          }
          widget.options = glift.widgets.options.setDefaults(optionsCopy, 'base');
          widget.controller = glift.controllers.gameViewer(widget.options);
          widget.draw();
        }
      }
    }
  }
};
