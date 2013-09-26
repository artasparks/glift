glift.widgets.basicProblem = function(options) {
  options.controller = glift.controllers.staticProblem(options);

  options.boardRegion =
      options.boardRegion ||
      glift.bridge.getCropFromMovetree(options.controller.movetree);
  options.showVariations = glift.enums.showVariations.NEVER;
  options.useCommentBar = false;

  options.keyMapping = {}; // TODO(kashomon): Add problem mappings

  options.icons = options.icons ||
      [ 'play', 'refresh', 'roadmap', 'checkbox' ];

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
    if (data.result === problemResults.CORRECT) {
      widget.iconBar.addNewObject(
          'check', widget.iconBar.getIcon('checkbox').newBbox, '#0CC');
    } else if (data.result == problemResults.INCORRECT) {
      widget.iconBar.addNewObject(
          'cross', widget.iconBar.getIcon('checkbox').newBbox, 'red');
    }
  };

  options.actions.icons = options.actions.icons || {
    play: {
      // Get next problem.
      mouseup: function(widget) {

      }
    },
    refresh: {
      // Try again
      mouseup: function(widget) {
        widget.controller.reload();
        widget.applyFullBoardData(
            widget.controller.getEntireBoardState());
      }
    },
    roadmap: {
      // Go to the explain-board
      mouseup: function(widget) {
        widget.problemDisplay = widget.display;
        widget.problemControllor = widget.controller;
        widget.problemOptions = widget.options;
        widget.destroy();
        var divId = widget.options.divId;
        var theme = widget.options.theme;
        var optionsCopy = {
          divId: widget.options.divId,
          theme: widget.options.theme,
          sgfString: widget.options.sgfString,
          showVariations: glift.enums.showVariations.ALWAYS
        }
        var options = glift.widgets.defaultOptions(optionsCopy);
        widget.options = options;
        widget.controller = glift.controllers.gameViewer(options);
        widget.options.boardRegion = glift.bridge.getCropFromMovetree(
              options.controller.movetree);
        widget.draw();
      }
    }
  };

  return glift.widgets.baseWidget(options);
};
