glift.widgets.defaultOptions = function(options) {
  options.controller = options.controller ||
      glift.controllers.gameViewer(options);
  options.divId = options.divId || 'glift_display';
  options.theme = options.theme || 'DEFAULT';
  options.boardRegion = options.boardRegion || 'ALL';
  // keyMapping is a map from KeyCodes to iconNames
  options.keyMapping = options.keyMapping || {
      ARROW_LEFT: 'arrowleft',
      ARROW_RIGHT: 'arrowright',
      FORWARD_SLASH: 'small-gear'
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
        widget.applyFullBoardData(fullBoardData);
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
      click:  function(widget) {
        var fullBoardData = widget.controller.toBeginning();
        widget.applyFullBoardData(fullBoardData);
      }
    },
    end: {
      click:  function(widget) {
        var fullBoardData = widget.controller.toEnd();
        widget.applyFullBoardData(fullBoardData);
      }
    },
    arrowright: {
      click: function(widget) {
        var fullBoardData = widget.controller.nextMove();
        widget.applyFullBoardData(fullBoardData);
      }
    },
    arrowleft: {
      click:  function(widget) {
        var fullBoardData = widget.controller.prevMove();
        widget.applyFullBoardData(fullBoardData);
      }
    }
  };
  return options;
};
