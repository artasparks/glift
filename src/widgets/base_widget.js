/**
 * Public 'constructor' for the BaseWidget.
 */
glift.widgets.baseWidget = function(options) {
  glift.util.perfInit();
  if (options.enableFastClick) {
    glift.global.enableFastClick();
  }
  glift.util.majorPerfLog("Before Widget Creation");
  var baseWidget = new glift.widgets._BaseWidget(
      glift.widgets.options.setDefaults(options, 'base')).draw();
  glift.util.majorPerfLog("After Widget Creation");
  glift.util.perfDone();
  return baseWidget;
};

/**
 * The base web UI widget.  It can be extended, if necessary.
 */
glift.widgets._BaseWidget = function(options) {
  this.originalOptions = options;
  this.options = undefined; // Defined in draw.

  // Mutable state
  this.sgfString = options.sgfString;
  this.sgfIndex = options.sgfIndex;

  // Used for problems, exclusively
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;

  this.wrapperDiv = options.divId; // We split the wrapper div.
  this.controller = undefined; // Initialized with draw.
  this.display = undefined; // Initialized by draw.
  this.iconBar = undefined; // Initialized by draw.
};

glift.widgets._BaseWidget.prototype = {
  /**
   * Draw the widget.
   */
  draw: function() {
    this.options = glift.util.simpleClone(this.originalOptions);
    this.options.sgfString = this.sgfString;
    this.controller = this.options.controllerFunc(this.options);
    if (this.options.problemType === glift.enums.problemTypes.AUTO) {
      this.options.problemType = this._getProblemType();
    }
    this.options.intersections = this.controller.getIntersections();
    var divSplits = this.options.useCommentBar
        ? this.options.splitsWithComments : this.options.splitsWithoutComments;
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, divSplits, 'horizontal');
    this.goboxDivId = this.divInfo[0].id;
    this._setNotSelectable(this.goboxDivId);
    this.options.boardRegion =
        this.options.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.options.boardRegion;
    this.options.divId = this.goboxDivId;
    this.display = glift.displays.create(this.options);
    var boundingWidth = $('#' +  this.goboxDivId).width();

    if (this.options.useCommentBar) {
      this.commentBoxId = this.divInfo[1].id;
      this._setNotSelectable(this.commentBoxId);
      this._createCommentBox(boundingWidth);
    }

    this.iconBarId = this.options.useCommentBar ? this.divInfo[2].id :
        this.divInfo[1].id;
    this._setNotSelectable(this.iconBarId);
    this._createIconBar(boundingWidth)
    this._initStoneActions();
    this._initIconActions();
    this._initKeyHandlers();
    this._initProblemType();
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
        this.options.theme,
        this.options.goBoardBackground !== undefined);
  },

  _createIconBar: function(boundingWidth) {
    var that = this;
    var margin = (boundingWidth - this.display.width()) / 2;
    var icons = this.options.icons;
    if (this.options.problemType === glift.enums.problemTypes.EXAMPLE) {
      icons = this.options.reducedIconsForExample || icons;
    }
    this.iconBar = glift.displays.gui.iconBar({
      themeName: this.options.themeName,
      divId: that.iconBarId,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons: icons
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
    this.keyHandlerFunc = function(e) {
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
    };
    $('body').keydown(this.keyHandlerFunc);
  },

  /**
   * Initialize properties based on problem type.
   */
  _initProblemType: function() {
    if (this.options.problemType === glift.enums.problemTypes.ALL_CORRECT) {
      // TODO(kashomon): This is a bad hack.  What if we don't include the
      // checkbox?  This ties the problem options to this code in a very strange
      // way / yucky way.
      var correctNext = glift.rules.problems.correctNextMoves(
          this.controller.movetree, this.options.problemConditions);
      // A Set: i.e., a map of points to true
      this.correctNextSet = {};
      this.numCorrectAnswers = 0;
      this.totalCorrectAnswers = correctNext.length;
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
          boardData, this.display, this.options.showVariations);
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

  /**
   * Reload the state of the widget.  This is particularly useful for problems.
   * Unfortunatly, this also probably meants this is too problem-specific.
   */
  reload: function() {
    // this.controller.reload();
    this.redraw();

    // Clear out problem specific values.
    // this.correctness = undefined;

    // this.iconBar.destroyTempIcons();
    // this.applyBoardData(
        // this.controller.getEntireBoardState());
  },

  redraw: function() {
    this.correctness = undefined; // TODO(kashomon): This shouldn't live here.
    this.correctNextSet = undefined;
    this.numCorrectAnswers = undefined;
    this.totalCorrectAnswers = undefined;
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
