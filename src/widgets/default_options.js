glift.widgets.defaultOptions = function(options) {
  options.controller = options.controller ||
      glift.controllers.gameViewer(options);
  options.divId = options.divId || 'glift_display';
  options.theme = options.theme || 'DEFAULT';
  options.boardRegion = options.boardRegion || 'ALL';
  // keyMapping is a map from KeyCodes to actions.
  options.keyMapping = options.keyMapping || {
      ARROW_LEFT: 'icons.arrowleft.mouseup',
      ARROW_RIGHT: 'icons.arrowright.mouseup',
  };
  options.showVariations = options.showVariations ||
      glift.enums.showVariations.MORE_THAN_ONE;

  options.useCommentBar = options.useCommentBar === undefined ?
      true : options.useCommentBar;

  options.icons = options.icons ||
      [ 'start', 'end', 'arrowleft', 'arrowright'];

  options.actions = options.actions || {};
  options.actions.stones = options.actions.stones || {};

  var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
  options.actions.stones.mouseup = options.actions.stones.mouseup ||
      function(widget, pt) {
        var currentPlayer = widget.controller.getCurrentPlayer();
        var fullBoardData = widget.controller.addStone(pt, currentPlayer);
        widget.applyPartialData(fullBoardData);
      };

  options.actions.stones.mouseover = options.actions.stones.mouseover ||
      function(widget, pt) {
        var currentPlayer = widget.controller.getCurrentPlayer();
        if (widget.controller.canAddStone(pt, currentPlayer)) {
          widget.display.intersections()
              .setStoneColor(pt, hoverColors[currentPlayer]);
        }
      };

  options.actions.stones.mouseout = options.actions.stones.mouseout ||
      function(widget, pt) {
        var currentPlayer = widget.controller.getCurrentPlayer();
        if (widget.controller.canAddStone(pt, currentPlayer)) {
          widget.display.intersections().setStoneColor(pt, 'EMPTY');
        }
      };

  options.actions.icons = options.actions.icons || {
    start: {
      mouseup:  function(widget) {
        var fullBoardData = widget.controller.toBeginning();
        widget.applyFullBoardData(fullBoardData);
      }
    },
    end: {
      mouseup:  function(widget) {
        var fullBoardData = widget.controller.toEnd();
        widget.applyFullBoardData(fullBoardData);
      }
    },
    arrowright: {
      mouseup: function(widget) {
        var boardData = widget.controller.nextMove();
        widget.applyPartialData(boardData);
      }
    },
    arrowleft: {
      mouseup:  function(widget) {
        var boardData = widget.controller.prevMove();
        widget.applyPartialData(boardData);
      }
    }
  };
  return options;
};
