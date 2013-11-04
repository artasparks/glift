/**
 * The SGF is always a dict containing options relevant to the creation and
 * display of a particular SGF.
 */
glift.widgets.options.sgf = {
  /**
   * A literal SGF String.
   */
  sgfString: '',

  /**
   * Tells where to start the SGF.
   */
  initialPosition: '',

  /**
   * A URL used to load an SGF via AJAX.
   */
  url: '', // URL to load a problem

  /**
   * The board region to display.  The boardRegion will be 'guessed' if it's set
   * to 'AUTO'.
   */
  boardRegion: glift.enums.boardRegions.AUTO,

  problemCallback: function() {},

  /**
   * Widget type and problem conditions are set from the widgetOptions defaults.
   */
  widgetType: undefined,
  problemConditions: undefined,

  /**
   * Thes options are configured via the widget type extensions, e.g.,
   * game_viewer_options.js.
   */
  controllerFunc: undefined,
  icons: undefined,
  keyMappings: undefined,
  showVariations: undefined,
  stoneClick: undefined
};
