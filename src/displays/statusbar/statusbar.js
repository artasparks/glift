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
        state = widget.getCurrentState();
    newDiv.css({
      position: 'absolute',
      // this isn't quite right. 
      top: '0px', bottom: '0px', left: '0px', right: '0px',
      margin: '0px', padding: '0px',
      // Some sites set the z-index obnoxiously high (looking at you bootstrap).
      // So, to make it really fullscreen, we need to set the z-index pretty
      // high.
      'z-index': 11000,
      'zIndex': 11000,
      // TODO(kashomon): Get background color from the themes.
      'background-color': '#000',
      'backgroundColor': '#000'
    });
    body.append(newDiv);
    widget.manager.fullscreenDivId = newDivId;
    widget.destroy();
    widget.wrapperDiv = newDivId;
    widget.draw();
    widget.applyState(state);
    widget.manager.enableFullscreenAutoResize();
  },

  /** Return Glift to non-fullscreen */
  unfullscreen: function() {
    var widget = this.widget,
        wrapperDivEl = glift.dom.elem(widget.wrapperDiv),
        state = widget.getCurrentState(),
        manager = widget.manager,
        state = widget.getCurrentState();

    widget.destroy();
    wrapperDivEl.remove(); // remove the fullscreen div completely
    widget.wrapperDiv = widget.manager.divId;
    manager.fullscreenDivId = null;
    widget.draw();
    widget.applyState(state);
    widget.manager.disableFullscreenAutoResize();
  },

  /** Set the move number for the current move */
  setMoveNumber: function(number) {
    if (!this.iconBar.hasIcon) {
      return;
    }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    var mod = num.length > 2 ? 0.3 : null;
    this.iconBar.addTempText(
        'loading-move-indicator',
        number || '0',
        { fill: color, stroke: color },
        mod);
  }
};
