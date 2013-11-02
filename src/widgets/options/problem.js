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
  problemIndex: 0,

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
          // Illegal move -- nothing to do.  Don't make the player fail based on
          // an illegal move.
          return;
        }
        widget.applyBoardData(data);
        if (widget.correctness === undefined &&
            !glift.util.arrayEquals(widget.iconBar.iconNames,
                widget.options.reducedIconsForExample)) {
          widget.options.problemCallback(data.result);
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
      _nextProblemInternal: function(widget, indexChange) {
        if (widget.options.sgfStringList.length > 0 ||
            widget.options.sgfUrlList.length > 0) {
          var listLength = widget.options.sgfUrlList.length > 0 ?
              widget.options.sgfUrlList.length:
              widget.options.sgfStringList.length;
          var index = (widget.options.problemIndex
              + indexChange + listLength) % listLength;
          widget.options.problemIndex = index

          // Internal function used for ajax / non-ajax calls
          var loadSgfString = function(inputString) {
            widget.options.sgfString = inputString;
            widget.redraw();
          }

          if (widget.options.sgfStringList.length > 0) {
            loadSgfString(widget.options.sgfStringList[index]);
          } else if (widget.options.sgfUrlList.length > 0) {
            var url = widget.options.sgfUrlList[index];
            $.get(url, function(data) {
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
          widget._problemControllor = widget.controller;
          widget._problemOptions = widget.options;
          widget.destroy();
          var returnAction = function(widget) {
            widget.destroy();
            widget.options = widget._problemOptions;
            widget.controller = widget._problemControllor;
            widget.draw();
          };
          var optionsCopy = {
            divId: widget.options.divId,
            theme: widget.options.theme,
            sgfString: widget.options.sgfString,
            showVariations: glift.enums.showVariations.ALWAYS,
            problemConditions:
                widget.options.problemConditions,
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
