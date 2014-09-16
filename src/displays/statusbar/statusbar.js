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
};

/** TitleBar methods. */
glift.displays.statusbar._StatusBar.prototype = {
  draw: function() {
    this.iconBar.draw();
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
          // So, to make it really fullscreen, we need to set the z-index pretty
          // high.
          'z-index': 110000,
          'zIndex': 110000
        };
    for (var key in this.theme.statusBar.fullscreen) {
      cssObj[key] = this.theme.statusBar.fullscreen[key];
    }
    newDiv.css(cssObj);
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
        prevScrollTop = manager.
        state = widget.getCurrentState();
    widget.destroy();
    wrapperDivEl.remove(); // remove the fullscreen div completely
    widget.wrapperDiv = widget.manager.divId;
    window.scrollTo(0, manager.prevScrollTop || 0);
    manager.fullscreenDivId = null;
    manager.prevScrollTop = null;
    widget.draw();
    widget.applyState(state);
    widget.manager.disableFullscreenAutoResize();
  },

  /** Set the move number for the current move */
  setMoveNumber: function(number) {
    if (!this.iconBar.hasIcon) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    var mod = num.length > 2 ? 0.35 : null;
    this.iconBar.addTempText(
        'loading-move-indicator',
        number || '0',
        { fill: color, stroke: color },
        mod);
  }
};
