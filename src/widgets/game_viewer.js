(function() {
glift.widgets.gameViewer = function(options) {
  var divId = '' + (options.divId || 'glift_display');

  return new GameViewer(options, divId).draw();
};

GameViewer = function(options, wrapperDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.controller = glift.controllers.createGameViewer(options);
  this.display = undefined;
  this.gameDisplay = undefined;
  this.commentDisplay = undefined;
  this.iconBar = undefined;
};

GameViewer.prototype = {
  draw: function() {
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, [.70,.20], 'horizontal');
    this.options.divId = this.divInfo[0].id;
    this.display = glift.createDisplay(this.options);

    // note: divInfo[1] is for comments

    var margin = ($('#' +  this.divInfo[0].id).width() -
        this.display.width()) / 2;
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.options.themeName,
      divId: this.divInfo[2].id,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons:  [ 'start', 'end', 'arrowleft', 'arrowright' ]
    });

    this.initIconHandlers();
  },

  initIconHandlers: function() {
    var hoverColors = {
      "BLACK": "BLACK_HOVER",
      "WHITE": "WHITE_HOVER"
    };
    var that = this;

    this.iconBar.forEachIcon(function(icon) {
      that.iconBar.setEvent('mouseover', icon.name, function() {
        d3.select('#' + icon.iconId)
            .attr('fill', 'red');
      }).setEvent('mouseout', icon.name, function() {
        d3.select('#' + icon.iconId)
            .attr('fill', that.iconBar.theme.icons.DEFAULT.fill);
      });
    });

    this.iconBar.setEvent('click', 'arrowright', function() {
      var fullBoardData = that.controller.nextMove();
      glift.bridge.setDisplayState(fullBoardData, that.display);
    });

    this.iconBar.setEvent('click', 'arrowleft', function() {
      var fullBoardData = that.controller.prevMove();
      that.display.intersections().clearAll();
      glift.bridge.setDisplayState(fullBoardData, that.display);
    });

    this.iconBar.setEvent('click', 'start', function() {
      var fullBoardData = that.controller.prevMove();
      that.display.intersections().clearAll();
      glift.bridge.setDisplayState(fullBoardData, that.display);
    });
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
  }
};

})();
