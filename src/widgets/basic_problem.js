glift.widgets.basicProblem = function(options) {
  var displayTypes = glift.enums.displayTypes;
  var boardRegions = glift.enums.boardRegions;
  var point = glift.util.point;
  var divId = options.divId;
  var display = glift.createDisplay(options);

  options.controllerType = "STATIC_PROBLEM_STUDY";
  var controller = glift.createController(options);
  var cropping = glift.bridge.getFromMovetree(controller.movetree);
  glift.bridge.setDisplayState(controller.getEntireBoardState(), display);
  return new glift.widgets._BasicProblem(display, controller);
};

// Basic problem function object.  Meant to be private;
glift.widgets._BasicProblem = function(display, controller) {
  this.display = display;
  this.controller = controller;

  var hoverColors = {
    "BLACK": "BLACK_HOVER",
    "WHITE": "WHITE_HOVER"
  };

  display.intersections().setEvent('click', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    var data = controller.addStone(pt, currentPlayer);
    // TODO(kashomon): Remove this debug info
    $('#extra_info').text(data.message + '//' + (data.result || ''));
    if (data.data !== undefined) {
      glift.bridge.setDisplayState(data.data, display);
    }
  });

  display.intersections().setEvent('mouseover', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    if (controller.canAddStone(pt, currentPlayer)) {
      display.intersections().setStoneColor(pt, hoverColors[currentPlayer]);
    }
  });

  display.intersections().setEvent('mouseout', function(pt) {
    var currentPlayer = controller.getCurrentPlayer();
    if (controller.canAddStone(pt, currentPlayer)) {
      display.intersections().setStoneColor(pt, 'EMPTY');
    }
  });
};

glift.widgets._BasicProblem.prototype = {
  redraw: function() {
    this.display.redraw();
  },

  destroy: function() {
    this.display.destroy();
  },

  /**
   * Enable auto-resizing.  This completely destroys and recreates the goboard.
   * However, this
   *
   * TODO(kashomon): Does this need to be reworked for d3? Also, need to provide
   * a way to turn enableAutoResizing off.
   */
  enableAutoResizing: function() {
    var that = this; // for closing over.
    var resizeFunc = function() {
      that.redraw();
    };

    var timeoutId;
    $(window).resize(function(event) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resizeFunc, 100);
    });
  }
};
