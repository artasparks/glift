/**
 * The base web UI widget.
 */
glift.widgets.BaseWidget = function(
    divId, sgfOptions, displayOptions, actions, manager) {
  this.wrapperDiv = divId; // We split the wrapper div.
  this.type = sgfOptions.type;
  this.sgfOptions = glift.util.simpleClone(sgfOptions);
  this.displayOptions = glift.util.simpleClone(displayOptions);
  this.actions = actions; // deeply nested -- not worth cloning.
  this.manager = manager;


  // These variables are initialized by draw
  this.controller = undefined;
  this.boardRegion = undefined;

  // The four major components. Also initialized by draw.
  this.display = undefined;
  this.statusBar = undefined;
  this.commentBox = undefined;
  this.iconBar = undefined;

  // Used for problems, exclusively.
  // TODO(kashomon): Factor these out into some sort of problemState.
  this.initialMoveNumber = undefined;
  this.initialPlayerColor = undefined;
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;
};

glift.widgets.BaseWidget.prototype = {
  /** Draw the widget. */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    this.initialMoveNumber = this.controller.movetree.node().getNodeNum();
    this.initialPlayerColor = this.controller.getCurrentPlayer();
    glift.util.majorPerfLog('Created controller');

    this.displayOptions.intersections = this.controller.getIntersections();

    this.displayOptions.boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.sgfOptions.boardRegion;
    this.displayOptions.rotation = this.sgfOptions.rotation;
    glift.util.majorPerfLog('Calculated board regions');

    // This should be the only time we get the base width and height, until the
    // entire widget is re-drawn.
    var parentDivBbox = glift.displays.bboxFromDiv(this.wrapperDiv);
    if (parentDivBbox.width() === 0 || parentDivBbox.height() === 0) {
      throw new Error("Div has has invalid dimensions. Bounding box had " +
          "width: " + parentDivBbox.width() +
          ", height: " + parentDivBbox.height());
    }

    // Recall that positioning returns an object that looks like:
    // {commentBox: ..., boardbox: ..., iconBarBox: ...)
    var positioning = glift.displays.position.positioner(
        parentDivBbox,
        this.displayOptions.boardRegion,
        this.displayOptions.intersections,
        this.sgfOptions.componentsToUse,
        this.displayOptions.oneColumnSplits,
        this.displayOptions.twoColumnSplits).calcWidgetPositioning();

    var divIds = this._createDivsForPositioning(positioning, this.wrapperDiv);
    glift.util.majorPerfLog('Created divs');

    // TODO(kashomon): Remove these hacks. We shouldn't be modifying
    // displayOptions.
    this.displayOptions.divId = divIds.BOARD;

    var theme = glift.themes.get(this.displayOptions.theme);

    // TODO(kashomon): Pass in the theme rather than doing another copy here
    this.display = glift.displays.create(
        this.displayOptions,
        positioning.getBbox('BOARD'));
    glift.util.majorPerfLog('Finish creating display');

    divIds.COMMENT_BOX && this._createCommentBox(
        divIds.COMMENT_BOX,
        positioning.getBbox('COMMENT_BOX'),
        theme);
    glift.util.majorPerfLog('CommentBox');

    divIds.ICONBAR && this._createIconBar(
        divIds.ICONBAR,
        positioning.getBbox('ICONBAR'),
        this.sgfOptions.icons,
        parentDivBbox,
        theme);
    glift.util.majorPerfLog('IconBar');
    divIds.ICONBAR && this.iconBar.initIconActions(
        this, this.actions.iconActions);

    divIds.STATUS_BAR && this._createStatusBar(
        divIds.STATUS_BAR,
        positioning.getBbox('STATUS_BAR'),
        parentDivBbox,
        this.sgfOptions.icons,
        theme);
    glift.util.majorPerfLog('StatusBar');
    divIds.STATUS_BAR && this.statusBar.iconBar.initIconActions(
        this, this.actions.iconActions);

    glift.util.majorPerfLog('Before stone event creation');
    this._initStoneActions(this.actions.stoneActions);
    this._initKeyHandlers();
    glift.util.majorPerfLog('After stone event creation');

    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  /**
   * Create divs from positioning (WidgetBoxes) and the wrapper div id.
   */
  _createDivsForPositioning: function(positioning, wrapperDivId) {
    // Map from component to ID.
    var out = {};
    var createDiv = function(bbox) {
      var newId = wrapperDivId + '_internal_div_' + glift.util.idGenerator.next();
      var newDiv = glift.dom.newDiv(newId);
      var cssObj = {
        top: bbox.top() + 'px',
        left: bbox.left() + 'px',
        width: bbox.width() + 'px',
        height: bbox.height() + 'px',
        position: 'absolute',
        cursor: 'default'
      };
      newDiv.css(cssObj);
      glift.dom.elem(wrapperDivId).append(newDiv);
      glift.displays.setNotSelectable(newId);
      return newId;
    };
    positioning.map(function(key, bbox) {
      out[key] = createDiv(bbox);
    });
    return out;
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

  _createStatusBar: function(divId, bbox, parentBbox, icons, theme)  {
    this.statusBar = glift.displays.statusbar.create({
      divId: divId,
      bbox: bbox,
      parentBbox: parentBbox,
      icons: icons,
      theme: theme
    });
  },

  _createCommentBox: function(commentBoxId, positioning, theme) {
    this.commentBox = glift.displays.commentbox.create(
        commentBoxId, positioning, theme);
  },

  _createIconBar: function(iconId, bbox, icons, parentBbox, theme) {
    this.iconBar = glift.displays.icons.bar({
      theme: theme,
      divId: iconId,
      icons: icons,
      positioning: bbox,
      parentBbox: parentBbox
    });
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function(baseActions) {
    var actions = {};
    actions.mouseover = baseActions.mouseover;
    actions.mouseout = baseActions.mouseout;
    actions.click = this.sgfOptions.stoneClick;
    if (this.sgfOptions.stoneMouseover) {
      actions.mouseover = this.sgfOptions.stoneMouseover;
    }
    if (this.sgfOptions.stoneMouseout) {
      actions.mouseout = this.sgfOptions.stoneMouseout;
    }

    var that = this;
    var wrapAction = function(func) {
      return function(event, pt) {
        that.manager.setActive();
        func(event, that, pt);
      };
    };
    var that = this
    if (actions.mouseover &&
        actions.mouseout &&
        !glift.platform.isMobile()) {
      this.display.intersections().setHover(
          wrapAction(actions.mouseover),
          wrapAction(actions.mouseout));
    }
    if (actions.click) {
      var actionName = 'click';
      if (glift.platform.isMobile()) {
        // Kinda a hack, but necessary to avoid the 300ms delay.
        var actionName = 'touchstart';
      }
      this.display.intersections().setEvent(
          actionName, wrapAction(actions.click));
    }
  },

  /** Assign Key actions to some other action. */
  _initKeyHandlers: function() {
    if (!this.displayOptions.enableKeyboardShortcuts) {
      return;
    }
    for (var keyName in this.sgfOptions.keyMappings) {
      var iconPathOrFunc = this.sgfOptions.keyMappings[keyName];
      glift.keyMappings.registerKeyAction(
          this.manager.id,
          keyName,
          iconPathOrFunc);
    }
    // Lazy initialize the key mappings once.
    glift.keyMappings.initKeybindingListener();
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
      // TODO(kashomon): Remove this hack: The icon should be specified with
      // some sort of options.
      this.iconBar.addTempText(
          'multiopen-boxonly',
          this.numCorrectAnswers + '/' + this.totalCorrectAnswers,
          'black');
    }
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData) {
      this.setCommentBox(boardData.comment);
      glift.bridge.setDisplayState(
          boardData,
          this.display,
          this.sgfOptions.showVariations,
          this.sgfOptions.markLastMove);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   */
  setCommentBox: function(text) {
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text) {
      this.commentBox.setText(text);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  /**
   * Reload the problem.  Note: This is too problem specific and probably needs
   * to be rethought
   */
  reload: function() {
    if (this.correctness !== undefined) {
      this.correctNextSet = undefined;
      this.numCorrectAnswers = undefined;
      this.totalCorrectAnswers = undefined;
    }
    this.redraw();
  },

  /**
   * Gets the current state of the widget, so what we can accurately redraw the
   * widget.
   */
  getCurrentState: function() {
    // TODO(kashomon): Make a full-fledged immutable object.
    return {
      currentTreepath: this.controller.treepathToHere()
    };
  },

  /**
   * Set the widget state from a state object.
   */
  setState: function() {
    throw new Error('Not supported');
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  // TODO(kashomon): See issues/6: Change so that state isn't reset.
  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    var managerId = this.manager.id;
    glift.keyMappings.unregisterInstance(managerId);

    glift.dom.elem(this.wrapperDiv) &&
        glift.dom.elem(this.wrapperDiv).empty();
    this.correctness = undefined;

    if (this.keyHandlerFunc !== undefined) {
      document.body.keydown = null;
    }
    this.keyHandlerFunc = undefined;

    this.display = undefined;
  }
}
