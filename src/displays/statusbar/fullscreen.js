/**
 * Makes Glift full-screen. Sort of. True fullscreen isn't supported yet.
 *
 * Note: Key bindings are set in the base_widget.
 */
glift.displays.statusbar._StatusBar.prototype.fullscreen = function() {
  // TODO(kashomon): Support true fullscreen: issues/69
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
};

/** Returns Glift to non-fullscreen */
glift.displays.statusbar._StatusBar.prototype.unfullscreen = function() {
  if (!this.widget.manager.isFullscreen()) {
    return;
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
};
