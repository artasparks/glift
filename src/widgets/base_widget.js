(function() {
glift.widgets.baseWidget = function(options) {
  options = initOptions(options);
  return new BaseWidget(options).draw();
};

// TODO(kashomon): The options manipulation should be broken into its own file.
var initOptions = function(options) {
  options.controller = options.controller ||
      glift.controllers.gameViewer(options);
  options.divId = options.divId || 'glift_display';
  // keyMapping is a map from KeyCodes to iconNames
  options.keyMapping = options.keyMapping || {
      ARROW_LEFT: 'arrowleft',
      ARROW_RIGHT: 'arrowright',
      FORWARD_SLASH: 'small-gear'
  };
  options.useCommentBar = options.useCommentBar === undefined ?
      true : options.useCommentBar;
  options.icons = options.icons ||
      [ 'start', 'end', 'arrowleft', 'arrowright', 'small-gear' ];

  options.actions = options.actions || {};
  options.actions.stones = options.actions.stones || {};

  var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
  options.actions.stones.click = function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var fullBoardData = widget.controller.addStone(pt, currentPlayer);
    widget.applyFullBoardData(fullBoardData);
  };
  options.actions.stones.mouseover = function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display.intersections()
          .setStoneColor(pt, hoverColors[currentPlayer]);
    }
  };
  options.actions.stones.mouseout = function(widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    if (widget.controller.canAddStone(pt, currentPlayer)) {
      widget.display.intersections().setStoneColor(pt, 'EMPTY');
    }
  };
  return options;
};

var BaseWidget = function(options) {
  this.options = options;
  this.wrapperDiv = options.divId;
  this.controller = options.controller;
  this.display = undefined; // Initialized by draw.
};

BaseWidget.prototype = {
  draw: function() {
    var divSplits = this.options.useCommentBar ? [.70,.20] : [.90];
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, divSplits, 'horizontal');
    this.goboxDivId = this.divInfo[0].id;
    this.options.divId = this.goboxDivId;
    this.display = glift.createDisplay(this.options);
    var boundingWidth = $('#' +  this.goboxDivId).width();

    if (this.options.useCommentBar) {
      this.commentBoxId = this.divInfo[1].id;
      this._createCommentBox(boundingWidth);
    }

    this.iconBarId = this.options.useCommentBar ? this.divInfo[2].id :
        this.divInfo[1].id;
    this._createIconBar(boundingWidth)
    this.applyFullBoardData(this.controller.getEntireBoardState());
    this._initStoneActions();
    this._initIconHover();
    this._initKeyHandlers();
    return this;
  },

  _createCommentBox: function(boundingWidth) {
    this.commentBox = glift.displays.gui.commentBox(
        this.commentBoxId,
        this.display.width(),
        boundingWidth,
        this.options.themeName);
  },

  _createIconBar: function(boundingWidth) {
    var that = this;
    var margin = (boundingWidth - this.display.width()) / 2;
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.options.themeName,
      divId: that.iconBarId,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons:  this.options.icons
    });
  },

  _initIconHover: function() {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var that = this;
    this.iconBar.forEachIcon(function(icon) {
      that.iconBar.setEvent('mouseover', icon.name, function() {
        d3.select('#' + icon.iconId)
            // TODO(kashomon): Make this color configurable
            .attr('fill', 'red');
      }).setEvent('mouseout', icon.name, function() {
        d3.select('#' + icon.iconId)
            .attr('fill', that.iconBar.theme.icons.DEFAULT.fill);
      });
    });
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function() {
    var stoneActions = this.options.actions.stones;
    var that = this;
    var actions = ['click', 'mouseover', 'mouseout'];
    for (var i = 0; i < actions.length; i++) {
      var action = actions[i];
      if (stoneActions[action] !== undefined) {
        (function(act, fn) { // bind the event -- required due to lazy binding.
          that.display.intersections().setEvent(act, function(pt) {
            fn(that, pt);
          });
        })(action, stoneActions[action]);
      }
    }
  },

  /**
   * Assign Key handlers to icon action.
   *
   * Mapping: from key number to
   */
  _initKeyHandlers: function(mapping) {
    var that = this;
    $('body').keydown(function(e) {
      var name = glift.keyMappings.codeToName(e.which);
      if (name && that.options.keyMapping[name] !== undefined) {
        that.iconBar.forceEvent(that.options.keyMapping[name]);
      }
    });
  },

  applyFullBoardData: function(fullBoardData) {
    // TODO(kashomon): Support incremental changes.
    if (fullBoardData && fullBoardData !== glift.util.none) {
      this.setCommentBox(fullBoardData);
      this.display.intersections().clearAll();
      glift.bridge.setDisplayState(fullBoardData, this.display);
    }
  },

  setCommentBox: function(fullBoardData) {
    if (!this.commentBox) {
      return;
    }

    if (fullBoardData.comment) {
      this.commentBox.setText(fullBoardData.comment);
    } else {
      this.commentBox.clearText();
    }
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    this.display = undefined;
  }
};
})();
