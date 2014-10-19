glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   */
  create: function(options) {
    return new glift.displays.statusbar._StatusBar(
        options.iconBarPrototype,
        options.theme,
        options.widget,
        options.allPositioning
    );
  }
};

/**
 * The status bar component. Displays at the top of Glift and is used to display
 * Game information like move number, settings, and game info.
 */
glift.displays.statusbar._StatusBar = function(
    iconBarPrototype, theme, widget, positioning) {
  this.iconBar = iconBarPrototype;
  this.theme = theme;
  // TODO(kashomon): Restructure in such a way so the status bar doesn't need to
  // depend on the widget object
  this.widget = widget;

  // Bboxes for all components.
  this.positioning = positioning;

  // TODO(kashomon): Don't depend on manager data.
  this.totalPages = widget.manager.sgfCollection.length;
  this.pageIndex = widget.manager.sgfColIndex + 1;
};

/** TitleBar methods. */
glift.displays.statusbar._StatusBar.prototype = {
  draw: function() {
    this.iconBar.draw();
    this.setPageNumber(this.pageIndex, this.totalPages);
    return this;
  },

  /**
   * Create a game info object. Takes a array of game info data.
   *
   * Note: Key bindings are set in the base_widget.
   */
  gameInfo: function(gameInfoArr, captureCount) {
    var wrapperDivId = this.widget.wrapperDivId,
        suffix = '_gameinfo',
        newDivId = wrapperDivId + suffix + '_wrapper',
        wrapperDivEl = glift.dom.elem(wrapperDivId),
        newDiv = glift.dom.newDiv(newDivId),
        gameInfoTheme = this.theme.statusBar.gameInfo,
        fullBox = this.positioning.fullWidgetBbox(),
        // This CSS shouldn't be modified.
        cssObj = {
          position: 'absolute',
          margin: '0px',
          padding: '0px',
          top: fullBox.top() + 'px',
          left: fullBox.left() + 'px',
          width: fullBox.width() + 'px',
          height: fullBox.height() + 'px',
          'z-index': 100,
          MozBoxSizing: 'border-box',
          boxSizing: 'border-box'
        };
    newDiv.css(cssObj);

    var textDiv = glift.dom.newDiv(wrapperDivId + suffix + '_textdiv');
    var textDivCss = glift.obj.flatMerge({
        position: 'relative',
        margin: '0px',
        padding: '0px',
        'overflow-y': 'auto',
        height: fullBox.height() + 'px',
        width: fullBox.width() + 'px',
        MozBoxSizing: 'border-box',
        boxSizing: 'border-box'
      }, gameInfoTheme.textDiv);

    textDiv.css(textDivCss);
    if (glift.platform.isMobile()) {
      textDiv.on('touchend', function() { newDiv.remove(); });
    } else {
      textDiv.on('click', function() { newDiv.remove(); });
    }

    // This is a hack until a better solution for captures can be crafted.
    var captureArr = [
      {displayName: 'Captured White Stones', value: captureCount.WHITE},
      {displayName: 'Captured Black Stones', value: captureCount.BLACK}
    ];
    gameInfoArr = captureArr.concat(gameInfoArr);

    var textArray = [];
    for (var i = 0; i < gameInfoArr.length; i++) {
      var obj = gameInfoArr[i];
      textArray.push('<strong>' + obj.displayName + ': </strong>' + obj.value);
    }

    textDiv
      .append(glift.dom.newElem('h3')
        .appendText('Game Info')
        .css(glift.obj.flatMerge(gameInfoTheme.textTitle, gameInfoTheme.text)))
      .append(glift.dom.convertText(textArray.join('\n'),
            glift.obj.flatMerge(gameInfoTheme.textBody, gameInfoTheme.text)))
      .css({ padding: '10px'})
    newDiv.append(textDiv);
    wrapperDivEl.prepend(newDiv);
  },

  /**
   * Make Glift full-screen.
   *
   * Note: Key bindings are set in the base_widget.
   */
  fullscreen: function() {
    var widget = this.widget,
        wrapperDivId = widget.wrapperDivId,
        newDivId = wrapperDivId + '_fullscreen',
        newDiv = glift.dom.newDiv(newDivId),
        body = glift.dom.elem(document.body),
        state = widget.getCurrentState(),
        manager = widget.manager;

    var cssObj = glift.obj.flatMerge({
        position: 'absolute',
        top: '0px', bottom: '0px', left: '0px', right: '0px',
        margin: '0px', padding: '0px',
        // Some sites set the z-index obnoxiously high (looking at you bootstrap).
        // So, to make it really fullscreen, we need to set the z-index higher.
        'z-index': 110000
      }, this.theme.statusBar.fullscreen);
    newDiv.css(cssObj);

    // TODO(kashomon): Support true fullscreen: issues/69

    // Prevent scrolling outside the div
    body.addClass('glift-fullscreen-no-scroll').append(newDiv);
    manager.prevScrollTop =
        window.pageYOffset ||
        document.body.scrollTop ||
        document.documentElement.scrollTop || null;
    window.scrollTo(0, 0); // Scroll to the top.
    manager.fullscreenDivId = newDivId;
    widget.destroy();
    widget.wrapperDivId = newDivId;
    widget.draw();
    widget.applyState(state);
    manager.enableFullscreenAutoResize();
  },

  /** Returns Glift to non-fullscreen */
  unfullscreen: function() {
    if (!this.widget.manager.fullscreenDivId) {
      return; // We're not fullscreened
    }
    var widget = this.widget,
        wrapperDivEl = glift.dom.elem(widget.wrapperDivId),
        state = widget.getCurrentState(),
        manager = widget.manager,
        prevScrollTop = manager.prevScrollTop,
        body = glift.dom.elem(document.body),
        state = widget.getCurrentState();
    widget.destroy();
    wrapperDivEl.remove(); // remove the fullscreen div completely
    widget.wrapperDivId = widget.manager.divId;
    window.scrollTo(0, manager.prevScrollTop || 0);

    // Re-enable scrolling now that we're done with fullscreen.
    body.removeClass('glift-fullscreen-no-scroll');

    manager.fullscreenDivId = null;
    manager.prevScrollTop = null;

    widget.draw();
    widget.applyState(state);
    widget.manager.disableFullscreenAutoResize();
  },

  /** Sets the move number for the current move */
  setMoveNumber: function(number) {
    if (!this.iconBar.hasIcon('move-indicator')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    var mod = num.length > 2 ? 0.35 : null;
    this.iconBar.addTempText(
        'move-indicator',
        num,
        { fill: color, stroke: color },
        mod);
  },

  /** Sets the page number for the current move */
  setPageNumber: function(number, denominator) {
    if (!this.iconBar.hasIcon('widget-page')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var denom = (denominator || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    this.iconBar.addTempText(
        'widget-page',
        num,
        { fill: color, stroke: color },
        0.85);
  }
};
