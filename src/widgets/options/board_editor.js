/**
 * Board Editor options.
 *
 * The Board editor is so complex it needs its own directory!
 */
glift.widgets.options.BOARD_EDITOR = {
  _markMap: {
    bstone_a: glift.enums.marks.LABEL_ALPHA,
    bstone_1: glift.enums.marks.LABEL_NUMERIC,
    bstone_square: glift.enums.marks.SQUARE,
    bstone_triangle: glift.enums.marks.TRIANGLE
  },

  _stoneColorMap: {
    twostones: function(widget) {
      return widget.controller.getCurrentPlayer();
    },
    bstone: function() { return glift.enums.states.BLACK },
    wstone: function() { return glift.enums.states.BLACK }
  },

  stoneClick: function(event, widget, pt) {
    var stoneColorMap = glift.widgets.options.BOARD_EDITOR._stoneColorMap;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    var currentPlayer = widget.controller.getCurrentPlayer();

    if (stoneColorMap[iconName] !== undefined) {
      var color = stoneColorMap[iconName](widget);
      var partialData = widget.controller.addStone(pt, currentPlayer);
      // widget.applyBoardData(partialData);
    } else if (iconToMark[iconName] !== undefined) {
      var color = stoneColorMap[iconName](widget);
      var partialData = widget.controller.addStone(
          pt, glift.enums.states.EMPTY, iconToMark[iconName]);
      // widget.applyBoardData(partialData);
    }
    // TODO(kashomon): handle 'nostone-xmark'
  },

  stoneMouseover: function(event, widget, pt) {
    var marks = glift.enums.marks;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var stoneColorMap = glift.widgets.options.BOARD_EDITOR._stoneColorMap;
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var currentPlayer = widget.controller.getCurrentPlayer();
    var intersections = widget.display.intersections();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;

    if (stoneColorMap[iconName] !== undefined) {
      var colorKey = stoneColorMap[iconName](widget);
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, hoverColors[colorKey]);
      }
    }

    if (iconToMark[iconName] && !intersections.hasMark(pt)) {
      var markType = iconToMark[iconName];
      if (markType === marks.LABEL_NUMERIC) {
        intersections.addTempMark(
            pt, markType, widget.controller.currentNumericMark());
      } else if (markType === marks.LABEL_ALPHA) {
        intersections.addTempMark(
            pt, markType, widget.controller.currentAlphaMark());
      } else {
        intersections.addTempMark(pt, markType);
      }
    }
  },

  stoneMouseout: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    var intersections = widget.display.intersections();
    if (iconName === 'twostones' ||
        iconName === 'bstone' ||
        iconName === 'wstone') {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, 'EMPTY');
      }
    }
    intersections.clearTempMarks();
  },

  icons: ['start', 'end', 'arrowleft', 'arrowright',
      [ // Icons for changing click behavior
        'twostones', // normal move
        'bstone', // black placement
        'wstone', // white placement
        'bstone_a', // Label with A-Z
        'bstone_1', // Label with 1+
        'bstone_triangle', // Label with Triangle
        'bstone_square', // Label with square
        'nostone-xmark' // erase
        // TODO(kashomon): Erase, circle
      ]],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
