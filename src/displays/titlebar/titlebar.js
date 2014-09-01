glift.displays.titlebar = {
  /**
   * Create a titlebar.  Also does option pre-preprocessing if necessary.
   */
  create: function(options) {
    return new glift.displays.titlebar._TitleBar(
        options.divId,
        options.bbox,
        options.parentBbox,
        options.icons,
        options.theme);
  }
};


/**
 * The title bar component. Displays at the top of Glift and is used to display
 * Game information like move number, settings, and game info.
 */
glift.displays.titlebar._TitleBar = function(
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
};

/** TitleBar methods. */
glift.displays.titlebar._TitleBar.prototype = {

};
