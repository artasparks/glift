goog.provide('glift.widgets.BaseWidget');

/**
 * The base web UI widget.
 *
 * @param {string} divId
 * @param {!glift.api.SgfOptions} sgfOptions
 * @param {!glift.api.DisplayOptions} displayOptions
 * @param {!glift.api.IconActions} iconActions
 * @param {!glift.api.StoneActions} stoneActions
 * @param {!glift.widgets.WidgetManager} manager
 * @param {!glift.api.HookOptions} hooks
 *
 * @constructor @final @struct
 */
glift.widgets.BaseWidget = function(
    divId, sgfOptions, displayOptions, iconActions, stoneActions, manager, hooks) {
  /** @type {string} */
  // We split the wrapper div, but here we record the original reference.
  this.wrapperDivId = divId;

  /** @type {!glift.api.SgfOptions} */
  this.sgfOptions = sgfOptions;
  console.log(this.sgfOptions);

  /** @type {!glift.api.IconActions} */
  this.displayOptions = displayOptions;

  /** @type {!glift.api.IconActions} */
  this.iconActions = iconActions;

  /** @type {!glift.api.StoneActions} */
  this.stoneActions = stoneActions;

  /** @type {!glift.widgets.WidgetManager} */
  this.manager = manager;

  /** @type {!glift.api.HookOptions} */
  this.externalHooks = hooks;

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
  /** Draws the widget. */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    this.initialMoveNumber = this.controller.currentMoveNumber();
    this.initialPlayerColor = this.controller.getCurrentPlayer();
    glift.util.majorPerfLog('Created controller');

    var intersections = this.controller.getIntersections();
    var boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? this.controller.getQuadCropFromBeginning()
        : this.sgfOptions.boardRegion;

    glift.util.majorPerfLog('Calculated board regions');

    // This should be the only time we get the base width and height, until the
    // entire widget is re-drawn.
    var parentDivBbox = glift.displays.bboxFromDiv(this.wrapperDivId);
    if (parentDivBbox.width() === 0 || parentDivBbox.height() === 0) {
      throw new Error('Div has has invalid dimensions. Bounding box had ' +
          'width: ' + parentDivBbox.width() +
          ', height: ' + parentDivBbox.height());
    }

    var positioning = glift.displays.position.positioner(
        parentDivBbox,
        boardRegion,
        intersections,
        this.getUiComponents_(this.sgfOptions),
        this.displayOptions.oneColumnSplits,
        this.displayOptions.twoColumnSplits).calcWidgetPositioning();

    var divIds = this._createDivsForPositioning(positioning, this.wrapperDivId);
    glift.util.majorPerfLog('Created divs');

    var displayTheme = glift.themes.get(this.displayOptions.theme);

    if (this.displayOptions.goBoardBackground) {
      glift.themes.setGoBoardBackground(
          displayTheme, this.displayOptions.goBoardBackground);
    }

    this.display = glift.displays.create(
        divIds[glift.enums.boardComponents.BOARD],
        positioning.mustGetBbox(glift.enums.boardComponents.BOARD),
        displayTheme,
        boardRegion,
        intersections,
        this.sgfOptions.rotation,
        this.displayOptions.drawBoardCoords);
    glift.util.majorPerfLog('Finish creating display');

    if (divIds[glift.enums.boardComponents.COMMENT_BOX]) {
      this.commentBox = glift.displays.commentbox.create(
          divIds[glift.enums.boardComponents.COMMENT_BOX],
          positioning.mustGetBbox(glift.enums.boardComponents.COMMENT_BOX),
          displayTheme,
          this.displayOptions.useMarkdown);
    }
    glift.util.majorPerfLog('CommentBox');

    if (divIds[glift.enums.boardComponents.ICONBAR]) {
      /** @type {!Array<string>} */
      var icons = glift.util.simpleClone(this.sgfOptions.icons || []);
      if (this.manager.hasNextSgf()) {
        icons.push(this.displayOptions.nextSgfIcon);
      }
      if (this.manager.hasPrevSgf()) {
        icons.unshift(this.displayOptions.previousSgfIcon);
      }
      this.iconBar = glift.displays.icons.bar({
          divId: divIds[glift.enums.boardComponents.ICONBAR],
          positioning: positioning.mustGetBbox(glift.enums.boardComponents.ICONBAR),
          icons: icons,
          parentBbox: parentDivBbox,
          theme: displayTheme,
          allDivIds: divIds,
          allPositioning: positioning,
      }).draw();
    }
    glift.util.majorPerfLog('IconBar');
    divIds.ICONBAR && this.iconBar.initIconActions(this, this.iconActions);

    if (divIds[glift.enums.boardComponents.STATUS_BAR]) {
      // TODO(kashomon): Move this logic into a helper.
      /** @type {!Array<string>} */
      var statusBarIcons = glift.util.simpleClone(this.sgfOptions.statusBarIcons);
      if (this.manager.fullscreenDivId) {
        glift.array.replace(statusBarIcons, 'fullscreen', 'unfullscreen');
      }
      if (this.manager.sgfCollection.length > 1) {
        statusBarIcons.splice(0, 0, 'widget-page');
      }
      var statusBarIconBar = glift.displays.icons.bar({
          divId: divIds[glift.enums.boardComponents.STATUS_BAR],
          positioning: positioning.mustGetBbox(
              glift.enums.boardComponents.STATUS_BAR),
          icons: statusBarIcons,
          parentBbox: parentDivBbox,
          theme: displayTheme,
          allDivIds: divIds,
          allPositioning: positioning
      });
      this.statusBar = glift.displays.statusbar.create({
          iconBarPrototype: statusBarIconBar,
          theme: displayTheme,
          allPositioning: positioning,
          widget: this
      }).draw();
    }
    glift.util.majorPerfLog('StatusBar');
    divIds.STATUS_BAR && this.statusBar.iconBar.initIconActions(
        this, this.iconActions);

    glift.util.majorPerfLog('Before stone event creation');
    this._initStoneActions(this.stoneActions);
    this._initKeyHandlers();
    glift.util.majorPerfLog('After stone event creation');

    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  /**
   * Gets the UI icons to use
   * @param {!glift.api.SgfOptions} sgfOptions
   * @return {!Array<glift.enums.boardComponents>}
   * @private
   */
  getUiComponents_: function(sgfOptions) {
    /** @type {!Array<glift.enums.boardComponents>} */
    var base = sgfOptions.uiComponents;
    base = base.slice(0, base.length); // make a shallow copy.
    /**
     * Helper to remove items from the array.
     * @param {!Array<glift.enums.boardComponents>} arr
     * @param {glift.enums.boardComponents} key
     */
    var rmItem = function(arr, key) {
      var idx = arr.indexOf(key);
      if (idx > -1) {
        arr.splice(idx, 1);
      }
    }
    var bc = glift.enums.boardComponents
    sgfOptions.disableStatusBar && rmItem(base, bc.STATUS_BAR);
    sgfOptions.disableBoard && rmItem(base, bc.BOARD);
    sgfOptions.disableCommentBox && rmItem(base, bc.COMMENT_BOX);
    sgfOptions.disableIconBar && rmItem(base, bc.ICONBAR);
    return base;
  },

  /**
   * Create divs from positioning (WidgetBoxes) and the wrapper div id.
   * @return {!Object<glift.enums.boardComponents, string>} a map from component
   *    name to the div Id.
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
      glift.dom.ux.setNotSelectable(newId);
      return newId;
    };
    positioning.map(function(key, bbox) {
      out[key] = createDiv(bbox);
    });
    return out;
  },

  /** Initialize the stone actions. */
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

    var wrapAction = function(func) {
      return function(event, pt) {
        this.manager.setActive();
        func(event, this, pt);
      }.bind(this);
    }.bind(this);
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
        actionName = 'touchend';
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

    var keyMappings = glift.util.simpleClone(this.sgfOptions.keyMappings);
    if (this.manager.fullscreenDivId) {
      // We're fullscreened.  Add ESC to escape =)
      keyMappings['ESCAPE'] = 'iconActions.unfullscreen.click';
    }

    for (var keyName in keyMappings) {
      var iconPathOrFunc = keyMappings[keyName];
      glift.keyMappings.registerKeyAction(
          this.manager.id,
          keyName,
          iconPathOrFunc);
    }
    // Lazy initialize the key mappings. Only really runs once.
    glift.keyMappings.initKeybindingListener();
  },

  /** Initialize properties based on problem type. */
  _initProblemData: function() {
    if (this.sgfOptions.widgetType ===
        glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM) {
      var correctNext = this.controller.getCorrectNextMoves();
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
          { fill: 'black', stroke: 'black'});
    }
  },

  /** Gets the initialized hooks or set them */
  hooks: function() {
    return this.externalHooks;
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData) {
      this.setCommentBox(boardData.comment);
      this.statusBar &&
          this.statusBar.setMoveNumber(this.controller.currentMoveNumber())
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
   * to be rethought.
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
    return {
      currentTreepath: this.controller.pathToCurrentPosition()
    };
  },

  /**
   * Set the widget state from a state object and redraws.
   */
  applyState: function(stateObj) {
    var types = glift.enums.widgetTypes;
    if (this.sgfOptions.widgetType === types.REDUCED_GAME_VIEWER ||
        this.sgfOptions.widgetType === types.GAME_VIEWER) {
      var treepath = stateObj.currentTreepath;
      this.controller.initialize(treepath);
      this.applyBoardData(this.controller.getEntireBoardState());
    }
    // TODO(kashomon): Support problems here.
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  redraw: function() {
    this.destroy();
    var state = this.getCurrentState();
    this.draw();
    this.applyState(state);
  },

  /** remove the widget and do various cleanups. */
  destroy: function() {
    var managerId = this.manager.id;
    glift.keyMappings.unregisterInstance(managerId);
    glift.dom.elem(this.wrapperDivId) &&
        glift.dom.elem(this.wrapperDivId).empty();
    this.correctness = undefined;
    this.display = undefined;
  }
};
