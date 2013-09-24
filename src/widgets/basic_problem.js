glift.widgets.basicProblem = function(options) {
  // Controller: The brains of the widget
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
      // TODO(kashomon): Change the icons
    } else if (data.result == problemResults.INCORRECT) {
      // TODO(kashomon): Change the icons
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

      }
    }
  };

  return glift.widgets.baseWidget(options);
};
