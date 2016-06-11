(function() {

/**
 * Board Editor options.
 */
glift.api.widgetopt[glift.WidgetType.BOARD_EDITOR] = function() {
  var iconToMark = {
    bstone_a: glift.enums.marks.LABEL_ALPHA,
    bstone_1: glift.enums.marks.LABEL_NUMERIC,
    bstone_square: glift.enums.marks.SQUARE,
    bstone_triangle: glift.enums.marks.TRIANGLE
  };

  // Map from icon name to color.
  var placementMap = {
    bstone: glift.enums.states.BLACK,
    wstone: glift.enums.states.WHITE
  };

  return {
    markLastMove: undefined, // rely on defaults
    enableMousewheel: undefined, // rely on defaults
    keyMappings: undefined, // rely on defaults

    problemConditions: {},

    controllerFunc: glift.controllers.boardEditor,

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

    showVariations: glift.enums.showVariations.ALWAYS,

    statusBarIcons: [
      'game-info',
      'move-indicator',
      'fullscreen'
    ],

    stoneClick: function(event, widget, pt) {
      widget.display.intersections().clearTempMarks();
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
      } else if (iconName === 'twostones') {
        var partialData = widget.controller.addStone(pt, currentPlayer);
        if (partialData) {
          widget.applyBoardData(partialData);
        }
      }
      // TODO(kashomon): handle 'nostone-xmark' -- i.e., clearing an intersection.
    },

    stoneMouseover: function(event, widget, pt) {
      var marks = glift.enums.marks;
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
        currentPlayer = widget.controller.getCurrentPlayer();
        if (widget.controller.canAddStone(pt, currentPlayer)) {
          intersections.setStoneColor(pt, 'EMPTY');
        }
      }
      intersections.clearTempMarks();
    },
  };
};

})();
