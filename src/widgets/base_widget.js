/**
 * Public 'constructor' for the BaseWidget.
 */
glift.widgets.baseWidget = function(options) {
  return new glift.widgets._BaseWidget(
      glift.widgets.options.setDefaults(options)).draw();
};

/**
 * The base web UI widget.  It can be extended, if necessary.
 */
glift.widgets._BaseWidget = function(options) {
  this.options = options;
  this.wrapperDiv = options.divId; // We split the wrapper div.
  this.controller = options.controllerFunc(options);
  this.display = undefined; // Initialized by draw.
  this.iconBar = undefined; // Initialized by draw.
};

glift.widgets._BaseWidget.prototype = {
  /**
   * Draw the widget.
   * Returns this for convenience.
   */
  draw: function() {
    var divSplits = this.options.useCommentBar
        ? this.options.splitsWithComments : this.options.splitsWithoutComments;
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, divSplits, 'horizontal');
    this.goboxDivId = this.divInfo[0].id;
    this.options.boardRegion =
        this.options.boardRegionType === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.options.boardRegionType;
    this.options.divId = this.goboxDivId;
    this.display = glift.displays.create(this.options);
    var boundingWidth = $('#' +  this.goboxDivId).width();

    if (this.options.useCommentBar) {
      this.commentBoxId = this.divInfo[1].id;
      this._createCommentBox(boundingWidth);
    }

    this.iconBarId = this.options.useCommentBar ? this.divInfo[2].id :
        this.divInfo[1].id;
    this._createIconBar(boundingWidth)
    this._initStoneActions();
    this._initIconActions();
    this._initKeyHandlers();
    this.applyFullBoardData(this.controller.getEntireBoardState());
    return this;
  },

  _createCommentBox: function(boundingWidth) {
    this.commentBox = glift.displays.gui.commentBox(
        this.commentBoxId,
        this.display.width(),
        boundingWidth,
        this.options.theme,
        this.options.goBoardBackground !== undefined);
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

  _initIconActions: function() {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var widget = this;
    var iconActions = this.options.actions.icons;

    for (var iconName in iconActions) {
      iconActions[iconName].mouseover = iconActions[iconName].mouseover ||
          function(widget, name) {
            var id = widget.iconBar.iconId(name);
            d3.select('#' + id).attr('fill', 'red');
          };
      iconActions[iconName].mouseout = iconActions[iconName].mouseout ||
          function(widget, name) {
            var id = widget.iconBar.iconId(name);
            d3.select('#' + id)
                .attr('fill', widget.iconBar.theme.icons.DEFAULT.fill);
          };
      for (var eventName in iconActions[iconName]) {
        (function(eventName, iconNameBound, event) { // lazy binding, bleh.
          widget.iconBar.setEvent(eventName, iconName, function() {
            event(widget, iconNameBound);
          });
        })(eventName, iconName, iconActions[iconName][eventName]);
      }
    }
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function() {
    var stoneActions = this.options.actions.stones;
    var that = this;
    for (var action in stoneActions) {
      (function(act, fn) { // bind the event -- required due to lazy binding.
        that.display.intersections().setEvent(act, function(pt) {
          fn(that, pt);
        });
      })(action, stoneActions[action]);
    }
  },

  /**
   * Assign Key actions to some other action.
   */
  _initKeyHandlers: function() {
    var that = this;
    $('body').keydown(function(e) {
      var name = glift.keyMappings.codeToName(e.which);
      if (name && that.options.keyMapping[name] !== undefined) {
        var actionName = that.options.keyMapping[name];
        // actionNamespaces look like: icons.arrowleft.mouseup
        var actionNamespace = actionName.split('.');
        var action = that.options.actions[actionNamespace[0]];
        for (var i = 1; i < actionNamespace.length; i++) {
          action = action[actionNamespace[i]];
        }
        action(that);
      }
    });
  },

  // TODO(kashomon): The board data object itself should specify whether or not
  // it's partial data.
  applyPartialData: function(data) {
    this._applyBoardData(data, false);
  },

  applyFullBoardData: function(data) {
    this._applyBoardData(data, true);
  },

  _applyBoardData: function(boardData, applyFullBoard) {
    if (boardData && boardData !== glift.util.none) {
      this.setCommentBox(boardData);
      if (applyFullBoard) {
        this.display.intersections().clearAll();
      }
      glift.bridge.setDisplayState(
          boardData, this.display, this.options.showVariations);
    }
  },

  setCommentBox: function(fullBoardData) {
    if (!this.commentBox) {
      // Do nothing -- there is no comment box to set.
    } else if (fullBoardData.comment &&
        fullBoardData.comment !== glift.util.none) {
      this.commentBox.setText(fullBoardData.comment);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  /**
   * Reload the state of the widget.  This is particularly useful for problems.
   * Unfortunatly, this also probably meants this is too problem-specific.
   */
  reload: function() {
    this.controller.reload();
    this.correctness = undefined; // TODO(kashomon): This shouldn't live here.
    this.iconBar.destroyTempIcons();
    this.applyFullBoardData(
        this.controller.getEntireBoardState());
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    this.display = undefined;
  }
};
