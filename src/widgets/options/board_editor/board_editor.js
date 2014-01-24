/**
 * Board Editor options.
 *
 * The Board editor is so complex it needs its own directory!
 */
glift.widgets.options.BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {
    var states = glift.enums.states;
    var marks = glift.enums.marks;
    var curColor = states.EMPTY;
    var mark = undefined;
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    if (iconName === 'twostones') {
      var curColor =  widget.controller.getCurrentPlayer();
    } else if (iconName === 'bstone') {
      var curColor = 'BLACK';
    }
  },

  stoneMouseover: function(event, widget, pt) {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var currentPlayer = widget.controller.getCurrentPlayer();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    if (iconName === 'twostones' ||
        iconName === 'bstone' ||
        iconName === 'wstone') {
      var colorKey = currentPlayer;
      if (iconName === 'bstone') {
        colorKey = 'BLACK';
      } else if (iconName === 'wstone') {
        colorKey = 'WHITE';
      }
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[colorKey])
            .flushStone(pt);
      }
    }
  },

  stoneMouseout: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var iconName = widget.iconBar.getIcon('multiopen').getActive().iconName;
    if (iconName === 'twostones' ||
        iconName === 'bstone' ||
        iconName === 'wstone') {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display && widget.display.intersections()
            .setStoneColor(pt, 'EMPTY')
            .flushStone(pt);
      }
    }
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
