glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   */
  create: function(options) {
    return new glift.displays.statusbar._StatusBar(
        options.iconBarPrototype,
        options.theme,
        options.widget
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
    iconBarPrototype, theme, widget) {
  this.iconBar = iconBarPrototype;
  this.theme = theme;
  this.widget = widget;
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

  /** Make Glift full-screen */
  fullscreen: function() {
    var widget = this.widget,
        wrapperDivId = widget.wrapperDiv,
        wrapperDivEl = glift.dom.elem(wrapperDivId),
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
          'z-index': 110000,
          'zIndex': 110000
        };
    for (var key in this.theme.statusBar.fullscreen) {
      cssObj[key] = this.theme.statusBar.fullscreen[key];
    }
    newDiv.css(cssObj);

    // Prevent scrolling outside the div
    body.addClass('glift-fullscreen-no-scroll');

    body.append(newDiv);
    manager.prevScrollTop =
        window.pageYOffset ||
        document.body.scrollTop ||
        document.documentElement.scrollTop || null;
    window.scrollTo(0, 0);
    manager.fullscreenDivId = newDivId;
    widget.destroy();
    widget.wrapperDiv = newDivId;
    widget.draw();
    widget.applyState(state);
    manager.enableFullscreenAutoResize();
  },

  /** Return Glift to non-fullscreen */
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

  /** Set the move number for the current move */
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

  /** Set the page number for the current move */
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
