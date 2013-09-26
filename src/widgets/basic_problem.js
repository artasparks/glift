glift.widgets.basicProblem = function(options) {
  options.controller = glift.controllers.staticProblem(options);
  options.boardRegion =
      options.boardRegion ||
      glift.bridge.getCropFromMovetree(options.controller.movetree);
  options.showVariations = glift.enums.showVariations.NEVER;
  options.useCommentBar = false;
  options.keyMapping = {}; // TODO(kashomon): Add key mappings for problems.
  options.icons = options.icons || ['play', 'refresh', 'roadmap', 'checkbox'];
  options.actions = {};
  options.actions.stones = {};
  options.actions.stones.mouseup = function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      return; // Illegal move -- nothing to do.
    }
    widget.applyPartialData(data);
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
  };

  options.actions.icons = options.actions.icons || {
    // Get next problem.  This will probably be the most often extended.
    //
    // TODO(kashomon): Think about ways for users to override a single action.
    // Probably this will involve copying the relevant options and using the
    // 'options' file as a template
    play: {
      mouseup: function(widget) {
      }
    },
    // Try again
    refresh: {
      mouseup: function(widget) {
        widget.controller.reload();
        widget.correctness = undefined;
        widget.iconBar.destroyTempIcons();
        widget.applyFullBoardData(
            widget.controller.getEntireBoardState());
      }
    },
    // Go to the explain-board
    roadmap: {
      mouseup: function(widget) {
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
          iconExtensions: ['undo'],
          actionExtensions: {
            icons: {
              undo : {
                mouseup : returnAction
              }
            }
          }
        }
        widget.options = glift.widgets.defaultOptions(optionsCopy);
        widget.controller = glift.controllers.gameViewer(widget.options);
        widget.options.boardRegion = glift.bridge.getCropFromMovetree(
              widget.options.controller.movetree);
        widget.draw();
      }
    }
  };
  glift.widgets.extendIconActions(options);
  return glift.widgets.baseWidget(options);
};
