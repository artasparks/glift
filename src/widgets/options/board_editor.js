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

  _placementMap: {
    bstone: glift.enums.states.BLACK,
    wstone: glift.enums.states.WHITE
  },

  stoneClick: function(event, widget, pt) {
    widget.display.intersections().clearTempMarks();
    var placementMap = glift.widgets.options.BOARD_EDITOR._placementMap;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    var currentPlayer = widget.controller.getCurrentPlayer();

    if (placementMap[iconName]) {
      var color = placementMap[iconName];
      var partialData = widget.controller.addPlacement(pt, color);
      widget.applyBoardData(partialData);
    } else if (iconToMark[iconName]) {
      var partialData = widget.controller.addMark(pt, iconToMark[iconName]);
      if (partialData) {
        widget.applyBoardData(partialData);
      }
    }
    // TODO(kashomon): handle 'nostone-xmark' -- i.e., clearing an intersection.
  },

  stoneMouseover: function(event, widget, pt) {
    var marks = glift.enums.marks;
    var iconToMark = glift.widgets.options.BOARD_EDITOR._markMap;
    var placementMap = glift.widgets.options.BOARD_EDITOR._placementMap;
    var hoverColors = { 'BLACK': 'BLACK_HOVER', 'WHITE': 'WHITE_HOVER' };
    var currentPlayer = widget.controller.getCurrentPlayer();
    var intersections = widget.display.intersections();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;

    if (placementMap[iconName] !== undefined) {
      var colorKey = placementMap[iconName];
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, hoverColors[colorKey]);
      }
    } else if (iconName === 'twostones') {
      var colorKey = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        intersections.setStoneColor(pt, hoverColors[colorKey]);
      }
    } else if (iconToMark[iconName] && !intersections.hasMark(pt)) {
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
