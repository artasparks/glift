/**
 * The base web UI widget.  It can be extended, if necessary.
 */
glift.widgets.BaseWidget = function(sgfOptions, displayOptions, manager) {
  this.type = sgfOptions.type;
  this.sgfOptions = glift.util.simpleClone(sgfOptions);
  this.displayOptions = glift.util.simpleClone(displayOptions);
  this.manager = manager;

  // Used for problems, exclusively
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;

  this.wrapperDiv = displayOptions.divId; // We split the wrapper div.
  this.controller = undefined; // Initialized with draw.
  this.display = undefined; // Initialized by draw.
  this.iconBar = undefined; // Initialized by draw.
  this.boardRegion = undefined; // Initialized by draw.
};

glift.widgets.BaseWidget.prototype = {
  /**
   * Draw the widget.
   */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    var divSplits = this.displayOptions.useCommentBar ?
        this.displayOptions.splitsWithComments :
        this.displayOptions.splitsWithoutComments;
    if (this.sgfOptions.icons.length === 0) {
      divSplits = this.displayOptions.splitsWithOnlyComments;
    }
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, divSplits, 'horizontal');
    this.goboxDivId = this.divInfo[0].id;
    this._setNotSelectable(this.goboxDivId);
    this.displayOptions.boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.sgfOptions.boardRegion;

    // TODO(kashomon): Remove these hacks. We shouldn't be modifying
    // displayOptions.
    this.displayOptions.intersections = this.controller.getIntersections();
    this.displayOptions.divId = this.goboxDivId;
    this.display = glift.displays.create(this.displayOptions);
    var boundingWidth = $('#' +  this.goboxDivId).width();

    if (this.displayOptions.useCommentBar) {
      this.commentBoxId = this.divInfo[1].id;
      this._setNotSelectable(this.commentBoxId);
      this._createCommentBox(boundingWidth);
    }

    if (this.sgfOptions.icons.length > 0) {
      this.iconBarId = this.displayOptions.useCommentBar ?
          this.divInfo[2].id :
          this.divInfo[1].id;
      this._setNotSelectable(this.iconBarId);
      this._createIconBar(boundingWidth)
    }
    this._initStoneActions();
    this._initIconActions();
    this._initKeyHandlers();
    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  _getProblemType: function() {
    var props = this.controller.movetree.properties();
    var probTypes = glift.enums.problemTypes;
    if (props.contains('EV')) {
      var value = props.getOneValue('EV').toUpperCase();
      if (probTypes[value] !== undefined && value !== probTypes.AUTO) {
        return value;
      }
    }
    if (this.controller.movetree.nextMoves().length === 0) {
      return probTypes.EXAMPLE;
    }
    return probTypes.STANDARD;
  },

  _setNotSelectable: function(divId) {
    $('#' + divId).css({
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'moz-none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        '-webkit-highlight': 'none',
        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
        'cursor': 'default'
    });
    return this;
  },

  _createCommentBox: function(boundingWidth) {
    this.commentBox = glift.displays.gui.commentBox(
        this.commentBoxId,
        this.display.width(),
        boundingWidth,
        this.displayOptions.theme,
        this.displayOptions.goBoardBackground !== undefined);
  },

  _createIconBar: function(boundingWidth) {
    var margin = (boundingWidth - this.display.width()) / 2;
    var icons = this.sgfOptions.icons;
    if (this.type === glift.enums.widgetTypes.EXAMPLE) {
      icons = this.displayOptions.reducedIconsForExample || icons;
    }
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.displayOptions.theme,
      divId: this.iconBarId,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons: icons
    });
  },

  _initIconActions: function() {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var widget = this;
    var iconActions = this.displayOptions.iconActions;
    var icons = this.sgfOptions.icons;
    for (var i = 0; i < icons.length; i++) {
      var iconName = icons[i];
      if (!iconActions.hasOwnProperty(iconName)) {
        continue;
      }
      iconActions[iconName].mouseover = iconActions[iconName].mouseover ||
        function(event, widget, name) {
          var id = widget.iconBar.iconId(name);
          d3.select('#' + id).attr('fill', 'red');
        };
      iconActions[iconName].mouseout = iconActions[iconName].mouseout ||
        function(event, widget, name) {
          var id = widget.iconBar.iconId(name);
          d3.select('#' + id)
              .attr('fill', widget.iconBar.theme.icons.DEFAULT.fill);
        };
      iconActions[iconName].touchend = iconActions[iconName].touchend ||
        function(event, widget, name) {
          event.preventDefault && event.preventDefault();
          event.stopPropagation && event.stopPropagation();
          widget.displayOptions.iconActions[name].click(event, widget);
        };
      for (var eventName in iconActions[iconName]) {
        (function(eventName, iconNameBound, event) { // lazy binding pattern.
          widget.iconBar.setEvent(eventName, iconName, function() {
            event(d3.event, widget, iconNameBound);
          });
        })(eventName, iconName, iconActions[iconName][eventName]);
      }
    }
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function() {
    var stoneActions = this.displayOptions.stoneActions
    stoneActions.click = this.sgfOptions.stoneClick;
    var that = this;
    for (var action in stoneActions) {
      (function(act, fn) { // bind the event -- required due to lazy binding.
        that.display.intersections().setEvent(act, function(pt) {
          fn(d3.event, that, pt);
      });
      })(action, stoneActions[action]);
    }
  },

  /**
   * Assign Key actions to some other action.
   */
  _initKeyHandlers: function() {
    var that = this;
    this.keyHandlerFunc = function(e) {
      var name = glift.keyMappings.codeToName(e.which);
      if (name && that.sgfOptions.keyMappings[name] !== undefined) {
        var actionName = that.sgfOptions.keyMappings[name];
        // actionNamespaces look like: icons.arrowleft.mouseup
        var actionNamespace = actionName.split('.');
        var action = that.displayOptions[actionNamespace[0]];
        for (var i = 1; i < actionNamespace.length; i++) {
          action = action[actionNamespace[i]];
        }
        action(e, that);
      }
    };
    $('body').keydown(this.keyHandlerFunc);
  },

  /**
   * Initialize properties based on problem type.
   */
  _initProblemData: function() {
    if (this.sgfOptions.widgetType ===
        glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM) {
      var correctNext = glift.rules.problems.correctNextMoves(
          this.controller.movetree, this.sgfOptions.problemConditions);
      // A Set: i.e., a map of points to true
      this.correctNextSet = this.correctNextSet || {};
      this.numCorrectAnswers = this.numCorrectAnswers || 0;
      this.totalCorrectAnswers = this.totalCorrectAnswers
          || this.sgfOptions.totalCorrectVariationsOverride
          || correctNext.length;
      this.iconBar.addTempText(this.iconBar.getIcon('checkbox').newBbox,
          this.numCorrectAnswers + '/' + this.totalCorrectAnswers, '#000');
    }
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData && boardData !== glift.util.none) {
      this.setCommentBox(boardData.comment);
      glift.bridge.setDisplayState(
          boardData, this.display, this.sgfOptions.showVariations);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   */
  setCommentBox: function(text) {
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text && text !== glift.util.none) {
      this.commentBox.setText(text);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  reload: function() {
    if (this.correctness !== undefined) {
      this.correctNextSet = undefined;
      this.numCorrectAnswers = undefined;
      this.totalCorrectAnswers = undefined;
    }
    this.redraw();
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  redraw: function() {
    this.correctness = undefined;
    this.destroy();
    this.draw();
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    this.keyHandlerFunc !== undefined
      && $('body').unbind('keydown', this.keyHandlerFunc);
    this.keyHandlerFunc = undefined;
    this.display = undefined;
  }
}
