/**
 * Option defaults used by the Problem Widget.
 */
glift.widgets.options.problem = {
  /**
   * List of problem strings to cycle through.
   */
  sgfStringList: [],

  /**
   * List of URLs from which to load the SGF via AJAX. Note that sgfStringList
   * takes precedence, if it is non-empty
   */
  sgfUrlList: [],

  /**
   * Index into the above array.  It seems unlikely that anybody would want to
   * override this setting, but it's here or clarity.
   */
  sgfIndex: 0,

  /**
   * Conditions for determing whether a branch of a movetree is correct.  A map
   * from property-keys, to an array of substring values.  If the array is
   * empty, then we only test to see if the property exists at the current
   * positien.
   *
   * The default tests whether there is a 'GB' property or a 'C' (comment)
   * property containing 'Correct' or 'is correct'.
   */
  problemConditions: {
    GB: [],
    C: ['Correct', 'is correct']
  },

  /**
   * A callback, so that users can take some action based on the result of a
   * problem. Provides one argument: one of enums.problemResults.INCORRECT.
   */
  problemCallback: function(problemResult) {},

  /**
   * The problem type.
   */
  problemType: glift.enums.problemTypes.AUTO,

  /**
   * The function that produces the problem controller.
   */
  controllerFunc: glift.controllers.staticProblem,

  /**
   * We want the problem widget to be smart about the relevant board region.
   */
  boardRegion: glift.enums.boardRegions.AUTO,

  /**
   * Icons specified by the problem widget.
   */
  icons: ['chevron-left' , 'refresh', 'roadmap', 'checkbox', 'chevron-right'],

  /**
   * A reduced set of Icons used for examples (when there are no variations).
   */
  reducedIconsForExample: ['chevron-left', 'chevron-right'],

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
  keyMapping: {
    ARROW_LEFT: 'icons.chevron-left.click',
    ARROW_RIGHT: 'icons.chevron-right.click'
  },

  /**
   * Problem-specific actions.
   */
  // TODO(kashomon): Move actions to a separate file.
  actions: {
    stones: {
      /**
       * Add a stone and report if it was correct.
       */
      click: function(widget, pt) {
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
        if (widget.correctness === undefined &&
            widget.options.problemType !== probTypes.EXAMPLE) {

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
                  setTimeout(function() {
                    widget.controller.reload();
                    widget.applyBoardData(
                        widget.controller.getEntireBoardState());
                  }, 500);
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
      }
    },

    icons: {
      _nextProblemInternal: function(widget, indexChange) {
        if (widget.options.sgfStringList.length > 0 ||
            widget.options.sgfUrlList.length > 0) {
          var listLength = widget.options.sgfUrlList.length > 0 ?
              widget.options.sgfUrlList.length:
              widget.options.sgfStringList.length;
          var index = (widget.sgfIndex + indexChange + listLength) % listLength;
          widget.sgfIndex = index

          // Internal function used for ajax / non-ajax calls
          var loadSgfString = function(inputString) {
            widget.sgfString = inputString;
            widget.redraw();
          }

          if (widget.options.sgfStringList.length > 0) {
            loadSgfString(widget.options.sgfStringList[index]);
          } else if (widget.options.sgfUrlList.length > 0) {
            var url = widget.options.sgfUrlList[index];
            glift.widgets.loadWithAjax(url, function(data) {
              loadSgfString(data);
            });
          }
        }
      },

      // Get next problem.
      'chevron-right': {
        click: function(widget) {
          widget.options.actions.icons._nextProblemInternal(widget, 1)
        }
      },

      // Get the previous problem.
      'chevron-left': {
        click: function(widget) {
          widget.options.actions.icons._nextProblemInternal(widget, -1)
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
          // This is a terrible hack.  High yuck factor.
          widget._problemOptions = widget.originalOptions;
          widget.destroy();
          var returnAction = function(widget) {
            widget.destroy();
            widget.originalOptions = widget._problemOptions;
            widget.draw();
          };
          var optionsCopy = {
            divId: widget.originalOptions.divId,
            theme: widget.originalOptions.theme,
            sgfString: widget.originalOptions.sgfString,
            showVariations: glift.enums.showVariations.ALWAYS,
            problemConditions: widget.originalOptions.problemConditions,
            controllerFunc: glift.controllers.gameViewer,
            boardRegion: glift.enums.boardRegions.AUTO,
            icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo'],
            actions: { icons: { undo : { click: returnAction }}}
          }
          widget.originalOptions = glift.widgets.options.setDefaults(
            optionsCopy, 'base');
          widget.draw();
        }
      }
    }
  }
};
