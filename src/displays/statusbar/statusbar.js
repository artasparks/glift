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
  },

  fullscreenTouchHandler: function() {
    // TODO(kashomon): Do this... (issues/#67)
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
   * Create a game info object.
   *
   * Takes a object that's transformed into the game info table.
   */
  gameInfo: function(gameInfoObj) {
    var wrapperDivId = this.widget.wrapperDiv,
        suffix = '_gameinfo',
        newDivId = wrapperDivId + suffix + '_wrapper',
        wrapperDivEl = glift.dom.elem(wrapperDivId),
        newDiv = glift.dom.newDiv(newDivId),
        theme = this.theme,
        fullBox = this.positioning.fullWidgetBbox(),
        cssObj = {
          position: 'absolute',
          margin: '0px',
          padding: '0px',
          top: fullBox.top() + 'px',
          left: fullBox.left() + 'px',
          width: fullBox.width() + 'px',
          height: fullBox.height() + 'px',
          // need to change zindex based on fullscreen
          'z-index': 100
        };
    newDiv.css(cssObj);

    var textDiv = glift.dom.newDiv(wrapperDivId + suffix + '_textdiv');
    var textDivCss = {
      position: 'relative',
      margin: '0px',
      padding: '0px',
      height: fullBox.height() + 'px',
      width: fullBox.width() + 'px'
    };
    for (var key in theme.statusBar.gameInfo.div) {
      textDivCss[key] = theme.statusBar.gameInfo.div[key];
    }

    textDiv.css(textDivCss);
    textDiv.on('click', function() {
      newDiv.remove();
    });

    textDiv.append(glift.dom.convertText(
        [
          '<strong>Game Name:</strong> Derp',
          '<strong>Player Black</strong>: Derper',
          '<strong>Player White</strong>: Derper'
        ].join('\n')).css({
          padding: '10px',
          color: '#FFF'
        }));

    newDiv.append(textDiv);

    // Put the X icon in the upper left
    wrapperDivEl.prepend(newDiv);
  },

  /** Make Glift full-screen */
  fullscreen: function() {
    var widget = this.widget,
        wrapperDivId = widget.wrapperDiv,
        newDivId = wrapperDivId + '_fullscreen',
        newDiv = glift.dom.newDiv(newDivId),
        body = glift.dom.elem(document.body),
        state = widget.getCurrentState(),
        manager = widget.manager,
        cssObj = {
          position: 'absolute',
          top: '0px', bottom: '0px', left: '0px', right: '0px',
          margin: '0px', padding: '0px',
          // Some sites set the z-index obnoxiously high (looking at you bootstrap).
          // So, to make it really fullscreen, we need to set the z-index higher
          // =(
          'z-index': 110000
        };
    for (var key in this.theme.statusBar.fullscreen) {
      cssObj[key] = this.theme.statusBar.fullscreen[key];
    }
    newDiv.css(cssObj);

    // TODO(kashomon): Support true fullscreen: issues/69
    // Prevent scrolling outside the div
    body.addClass('glift-fullscreen-no-scroll');

    body.append(newDiv);
    manager.prevScrollTop =
        window.pageYOffset ||
        document.body.scrollTop ||
        document.documentElement.scrollTop || null;
    window.scrollTo(0, 0); // Scroll to the top.
    manager.fullscreenDivId = newDivId;
    widget.destroy();
    widget.wrapperDiv = newDivId;
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
        wrapperDivEl = glift.dom.elem(widget.wrapperDiv),
        state = widget.getCurrentState(),
        manager = widget.manager,
        prevScrollTop = manager.prevScrollTop,
        body = glift.dom.elem(document.body),
        state = widget.getCurrentState();
    widget.destroy();
    wrapperDivEl.remove(); // remove the fullscreen div completely
    widget.wrapperDiv = widget.manager.divId;
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
