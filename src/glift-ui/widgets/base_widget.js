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

  /**
   * The internal wrapper is a box nested just inside the wrapperDivId with the
   * intention of adding a glift-specific class and position: relative.
   * @type {string}
   */
  this.internalWrapperDivId = divId + '-internal-wrapper';

  /** @type {!glift.api.SgfOptions} */
  this.sgfOptions = sgfOptions;

  /** @type {!glift.api.DisplayOptions} */
  this.displayOptions = displayOptions;

  /** @type {!glift.api.IconActions} */
  this.iconActions = iconActions;

  /** @type {!glift.api.StoneActions} */
  this.stoneActions = stoneActions;

  /** @type {!glift.widgets.WidgetManager} */
  this.manager = manager;

  /** @type {!glift.api.HookOptions} */
  this.externalHooks_ = hooks;

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

    var intersections = this.controller.getIntersections();
    var boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? this.controller.getQuadCropFromBeginning()
        : this.sgfOptions.boardRegion;

    this.createInternalWrapperDiv_();
    // This should be the only time we get the base width and height, until the
    // entire widget is re-drawn.
    var parentDivBbox = glift.displays.bboxFromDiv(this.internalWrapperDivId);
    if (parentDivBbox.width() === 0 || parentDivBbox.height() === 0) {
      throw new Error('Div for Glift has has invalid dimensions. ' +
          'Bounding box had ' +
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

    var divIds = this.createDivsForPositioning_(
        positioning, this.internalWrapperDivId);

    var displayTheme = glift.themes.get(this.displayOptions.theme);

    if (this.displayOptions.goBoardBackground) {
      glift.themes.setGoBoardBackground(
          displayTheme, this.displayOptions.goBoardBackground);
    }

    this.display = glift.displays.create(
        divIds[glift.BoardComponent.BOARD],
        positioning.mustGetBbox(glift.BoardComponent.BOARD),
        displayTheme,
        boardRegion,
        intersections,
        this.sgfOptions.rotation,
        this.displayOptions.drawBoardCoords);

    if (divIds[glift.BoardComponent.COMMENT_BOX]) {
      this.commentBox = glift.displays.commentbox.create(
          divIds[glift.BoardComponent.COMMENT_BOX],
          positioning.mustGetBbox(glift.BoardComponent.COMMENT_BOX),
          displayTheme,
          this.displayOptions.useMarkdown);
    }

    if (divIds[glift.BoardComponent.ICONBAR]) {
      /** @type {!Array<string>} */
      var icons = glift.util.simpleClone(this.sgfOptions.icons || []);
      if (this.manager.hasNextSgf()) {
        icons.push(this.displayOptions.nextSgfIcon);
      }
      if (this.manager.hasPrevSgf()) {
        icons.unshift(this.displayOptions.previousSgfIcon);
      }
      this.iconBar = glift.displays.icons.bar({
          divId: divIds[glift.BoardComponent.ICONBAR],
          positioning: positioning.mustGetBbox(glift.BoardComponent.ICONBAR),
          icons: icons,
          parentBbox: parentDivBbox,
          theme: displayTheme,
          allDivIds: divIds,
          allPositioning: positioning,
      }).draw();
    }
    divIds.ICONBAR && this.iconBar.initIconActions(this, this.iconActions);

    if (divIds[glift.BoardComponent.STATUS_BAR]) {
      // TODO(kashomon): Move this logic into a helper.
      /** @type {!Array<string>} */
      var statusBarIcons = glift.util.simpleClone(
          this.sgfOptions.statusBarIcons || []);
      if (this.manager.fullscreenDivId) {
        glift.array.replace(statusBarIcons, 'fullscreen', 'unfullscreen');
      }
      if (this.manager.sgfCollection.length > 1) {
        statusBarIcons.splice(0, 0, 'widget-page');
      }
      var statusBarIconBar = glift.displays.icons.bar({
          divId: divIds[glift.BoardComponent.STATUS_BAR],
          positioning: positioning.mustGetBbox(
              glift.BoardComponent.STATUS_BAR),
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
    divIds.STATUS_BAR && this.statusBar.iconBar.initIconActions(
        this, this.iconActions);

    this.initStoneActions_(this.stoneActions);
    this.initKeyHandlers_();
    this.initMousewheel_(divIds[glift.BoardComponent.BOARD]);

    this.initProblemData_();
    this.applyBoardData(this.controller.flattenedState());
    return this;
  },

  /**
   * Gets the UI icons to use
   * @param {!glift.api.SgfOptions} sgfOptions
   * @return {!Array<glift.BoardComponent>}
   * @private
   */
  getUiComponents_: function(sgfOptions) {
    /** @type {!Array<glift.BoardComponent>} */
    var base = sgfOptions.uiComponents;
    base = base.slice(0, base.length); // make a shallow copy.
    /**
     * Helper to remove items from the array.
     * @param {!Array<glift.BoardComponent>} arr
     * @param {glift.BoardComponent} key
     */
    var rmItem = function(arr, key) {
      var idx = arr.indexOf(key);
      if (idx > -1) {
        arr.splice(idx, 1);
      }
    }
    var bc = glift.BoardComponent;
    sgfOptions.disableStatusBar && rmItem(base, bc.STATUS_BAR);
    sgfOptions.disableBoard && rmItem(base, bc.BOARD);
    sgfOptions.disableCommentBox && rmItem(base, bc.COMMENT_BOX);
    sgfOptions.disableIconBar && rmItem(base, bc.ICONBAR);
    return base;
  },


  /**
   * Create an internal wrapper div to contain the whole go board. This sets
   * position relative on the internal div. Also, sets the minHeight and
   * minWidth if it exists.
   *
   * @private
   */
  createInternalWrapperDiv_: function() {
    var wrapDiv = glift.dom.newDiv(this.internalWrapperDivId);
    var cssObj = {
      height: '100%',
      width: '100%',
      position: 'relative'
    };
    if (this.displayOptions.minHeight) {
      cssObj['min-height'] = this.displayOptions.minHeight;
    }
    if (this.displayOptions.minWidth) {
      cssObj['min-width'] = this.displayOptions.minWidth;
    }

    wrapDiv.css(cssObj);
    glift.dom.elem(this.wrapperDivId).append(wrapDiv);
  },

  /**
   * Create divs from positioning (WidgetBoxes) and the wrapper div id.
   * @return {!Object<glift.BoardComponent, string>} a map from component
   *    name to the div Id.
   * @private
   */
  createDivsForPositioning_: function(positioning, intWrapperDivId) {
    // Map from component to ID.
    var out = {};
    var createDiv = function(bbox) {
      var newId = intWrapperDivId + '_internal_div_' + glift.widgets.idGenerator.next();
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
      glift.dom.elem(intWrapperDivId).append(newDiv);
      glift.dom.ux.setNotSelectable(newId);
      return newId;
    };
    positioning.map(function(key, bbox) {
      out[key] = createDiv(bbox);
    });
    return out;
  },

  /**
   * Initialize the stone actions.
   * @param {!glift.api.StoneActions} baseActions
   * @private
   */
  initStoneActions_: function(baseActions) {
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
      this.display.intersections().setHoverHandlers(
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

  /*
   * Assign Key actions to some other action.
   * @private
   */
  initKeyHandlers_: function() {
    if (!this.displayOptions.enableKeyboardShortcuts) {
      return;
    }

    var keyMappings = glift.util.simpleClone(
        this.sgfOptions.keyMappings || {});
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
    glift.keyMappings.initKeybindingListener(this.wrapperDivId);
  },

  /**
   * Initialize the mousewheel for going through a game.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/Events/wheel -- not to be
   * confused with the deprecated:
   * https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel
   *
   * @param {string} boardId The id of the board div, which we'll apply the
   *    listener to.
   */
  initMousewheel_: function(boardId) {
    if (!this.sgfOptions.enableMousewheel) {
      return;
    }
    var testElem = document.createElement('div');
    if (!('onwheel' in testElem)) {
      // wheel is the standard event. Since it's supported in all major browsers
      // now, it's now worth the caveats here; Mousewheel support is an
      // incremental improvement anyway.
      console.warn('Glift: Standard mouse wheel not supported. ' +
          'Not adding wheel functionality.');
      return;
    }

    /**
     * Simple handler that goes forward/backward in the gam.
     * @param {!WheelEvent} e Standard dom event.
     */
    var handler = function(e) {
      if (!this.controller) {
        // It's possible that we should make sure that the widget type is only
        // a game viewer type.
        return;
      }

      var delta = e.deltaY;
      if (delta < 0) {
        this.applyBoardData(this.controller.prevMove());
        e.preventDefault(); // Prevents scrolling through the page
      } else if (delta > 0) {
        this.applyBoardData(this.controller.nextMove());
        e.preventDefault(); // Prevents scrolling through the page
      }
    }.bind(this);

    var elem = document.getElementById(boardId);
    elem.addEventListener('wheel', handler)
  },

  /**
   * Initialize properties based on problem type.
   * @private
   */
  initProblemData_: function() {
    if (this.sgfOptions.widgetType ===
        glift.WidgetType.CORRECT_VARIATIONS_PROBLEM) {
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

  /**
   * Gets the initialized hooks or set them.
   * @return {!glift.api.HookOptions} the hooks.
   */
  hooks: function() {
    return this.externalHooks_;
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   *
   * @param {?glift.flattener.Flattened} flattened The flattened representation
   *    of the board.
   */
  applyBoardData: function(flattened) {
    if (flattened) {
      this.setCommentBox(flattened);
      this.statusBar &&
          this.statusBar.setMoveNumber(flattened.baseMoveNum())
      this.display.updateBoard(flattened);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   * @param {!glift.flattener.Flattened} flattened object, which may contain a
   * comment.
   * @return {!glift.widgets.BaseWidget} the current instance.
   */
  setCommentBox: function(flattened) {
    var text = flattened.comment();
    var collisions = flattened.collisions();
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text || (collisions && collisions.length)) {
      var collisionsLabel = '';

      // Create a full label, but only if there are any collisions.
      if (collisions && collisions.length) {
        collisionsLabel = glift.flattener.labels.createFullLabel(flattened);
      }
      this.commentBox.setText(text, collisionsLabel);
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
    // TODO(kashomon): Type this.
    return {
      // For games, the treepath is the only state information that's necessary.
      // We can reconstruct all other data.
      currentTreepath: this.controller.pathToCurrentPosition()
    };
  },

  /**
   * Set the widget state from a state object and redraws.
   */
  applyState: function(stateObj) {
    var types = glift.WidgetType;
    if (this.sgfOptions.widgetType === types.REDUCED_GAME_VIEWER ||
        this.sgfOptions.widgetType === types.GAME_VIEWER) {
      var treepath = stateObj.currentTreepath;
      this.controller.initialize(treepath);
      this.applyBoardData(this.controller.flattenedState());
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
