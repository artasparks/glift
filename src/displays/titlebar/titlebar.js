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
        options.theme).draw();
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

  // Defined on draw.
  /** The dom element */
  this.el = undefined;
};

/** TitleBar methods. */
glift.displays.titlebar._TitleBar.prototype = {
  draw: function() {
    var el = glift.dom.elem(divId);
    el.css({
      'ackground-color': 'red'
    });

    this.el = el;
  }
};
