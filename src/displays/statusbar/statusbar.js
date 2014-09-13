glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   */
  create: function(options) {
    return new glift.displays.statusbar._StatusBar(
        options.divId,
        options.bbox,
        options.parentBbox,
        options.icons,
        options.theme).draw();
  }
};

/**
 * The status bar component. Displays at the top of Glift and is used to display
 * Game information like move number, settings, and game info.
 */
glift.displays.statusbar._StatusBar = function(
    divId, bbox, parentBbox, icons, theme) {
  /** DivId of the title bar. */
  this.divId = divId;
  /** Bounding box of the divId. To save calculation time. */
  this.bbox = bbox;
  /** Bounding box of the parent divId. */
  this.parentBbox = parentBbox;
  /** General icons, including those not for the title bar. */
  this.icons = icons;
  /** Theme information. */
  this.theme = theme;

  // Defined on draw.
  this.iconBar = undefined;
};

/** TitleBar methods. */
glift.displays.statusbar._StatusBar.prototype = {
  draw: function() {
    // TODO(kashomon): Change this to something more realistic.
    this.iconBar = glift.displays.icons.bar({
      divId: this.divId,
      theme: this.theme.statusBar,
      icons: ['game-info', 'loading-move-indicator'],
      positioning: this.bbox,
      parentBbox: this.parentBbox
    })
    this.iconBar.addTempText(
        'loading-move-indicator', '14', 'black');
  }
};
