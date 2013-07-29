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
    var that = this;
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, [.70,.20], 'horizontal');

    this.goboxDivId = this.divInfo[0].id;
    this.commentBoxId = this.divInfo[1].id;
    this.iconBarId = this.divInfo[2].id;

    this.options.divId = this.goboxDivId;
    this.display = glift.createDisplay(this.options);

    var boundingWidth = $('#' +  this.goboxDivId).width();

    // note: divInfo[1] is for comments
    this.commentBox = $('#' + this.commentBoxId);
    this.commentBox.css({
      // "border-radius": "10px",
      // "-moz-border-radius": "10px",
      // "-webkit-border-radius": "10px",
      background: '#CCCCFF',
      left: (boundingWidth - this.display.width()) / 2,
      right: (boundingWidth + this.display.width()) / 2,
      margin: 'auto',
      'font-family': 'Baskerville',
      overflow: 'auto',
      width: this.display.width()
    });

    var margin = (boundingWidth - this.display.width()) / 2;
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.options.themeName,
      divId: that.iconBarId,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons:  [ 'start', 'end', 'arrowleft', 'arrowright' ]
    });

    this.applyFullBoardData(this.controller.getEntireBoardState());
    this.initIconHandlers();
    this.initKeyHandlers();
    return this;
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
      that.applyFullBoardData(fullBoardData);
    });

    this.iconBar.setEvent('click', 'arrowleft', function() {
      var fullBoardData = that.controller.prevMove();
      that.applyFullBoardData(fullBoardData);
    });

    this.iconBar.setEvent('click', 'start', function() {
      var fullBoardData = that.controller.toBeginning();
      that.applyFullBoardData(fullBoardData);
    });

    this.iconBar.setEvent('click', 'end', function() {
      var fullBoardData = that.controller.toEnd();
      that.applyFullBoardData(fullBoardData);
    });
  },

  initKeyHandlers: function() {
    var that = this;
    $('body').keydown(function(e) {
      switch(e.which) {
        case 39: that.iconBar.forceEvent('arrowright'); break;
        case 37: that.iconBar.forceEvent('arrowleft'); break;
      }
    });
  },

  applyFullBoardData: function(fullBoardData) {
    // TODO(kashomon): Support incremental changes.
    this.setCommentBox(fullBoardData);
    this.display.intersections().clearAll();
    glift.bridge.setDisplayState(fullBoardData, this.display);
  },

  setCommentBox: function(fullBoardData) {
    if (fullBoardData.comment) {
      this.commentBox.html('<p>' +
          fullBoardData.comment.replace(/\n/g, '<br><p>'));
    } else {
      this.commentBox.html('');
    }
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
  }
};
})();
