goog.provide('glift.displays.statusbar');
goog.provide('glift.displays.statusbar.StatusBar');

glift.displays.statusbar = {
  /**
   * Create a statusbar.  Also does option pre-preprocessing if necessary.
   *
   * @return {!glift.displays.statusbar.StatusBar} The status bar instance.
   */
  create: function(options) {
    return new glift.displays.statusbar.StatusBar(
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
 *
 * @constructor @final @struct
 */
glift.displays.statusbar.StatusBar = function(
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

glift.displays.statusbar.StatusBar.prototype = {
  /**
   * Draws the statusbar.
   * @return {!glift.displays.statusbar.StatusBar} this
   */
  draw: function() {
    this.iconBar.draw();
    this.setPageNumber(this.pageIndex, this.totalPages);
    return this;
  },

  /**
   * Sets the move number for the current move.
   * @param {number} number
   */
  setMoveNumber: function(number) {
    // TODO(kashomon): Note: This hardcodes the move-indicator name.
    if (!this.iconBar.hasIcon('move-indicator')) { return; }
    var num = (number || '0') + ''; // Force to be a string.
    var color = this.theme.statusBar.icons.DEFAULT.fill
    // var mod = num.length > 2 ? 0.35 : null;
    this.iconBar.addTempText(
        'move-indicator',
        num,
        { fill: color, stroke: color },
        null /* size modifier, as float */);
  },

  /**
   * Sets the page number for the current move
   * @param {number} number
   * @param {number} denominator
   */
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
