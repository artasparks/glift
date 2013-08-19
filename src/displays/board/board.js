glift.displays.board = {
  create: function(env, themeName, theme) {
    return new glift.displays.board.Display(env, themeName, theme).draw();
  }
};

/**
 * The core Display object returned to the user.
 */
glift.displays.board.Display = function(inEnvironment, themeName, theme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;

  // TODO(kashomon): remove stones (or rework into intersections) now that we're
  // using d3.
  this._stones = undefined;
  this.stones = function() { return this._stones; };

  this._svg = undefined; // defined in draw
  this._intersections = undefined // defined in draw;
  this.intersections = function() { return this._intersections; };

  // Methods accessing private data. Most of these are no longer private and
  // need to be moved out.
  this.intersectionPoints = function() { return this._environment.intersections; };
  this.boardPoints = function() { return this._environment.boardPoints; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
  this.width = function() { return this._environment.goBoardBox.width() };
  this.height = function() { return this._environment.goBoardBox.height() };
};

glift.displays.board.Display.prototype = {
  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.

      // Make the text not selectable (there's no point and it's distracting)
      // TODO(kashomon): Is this needed now that each point is covered with a
      // transparent button element?
      this._svg = d3.select('#' + this.divId())
        .style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'moz-none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none')
        .style('cursor', 'default');
      this._svg = d3.select('#' + this.divId())
        .append("svg")
          .attr("width", '100%')
          .attr("height", '100%');
    }
    this._environment.init();
    return this;
  },

  /**
   * Draw the GoBoard!
   */
  draw:  function() {
    this.init();
    var board = glift.displays.board,
        env = this._environment,
        boardPoints = env.boardPoints,
        theme = this._theme,
        svg = this._svg,
        divId = this.divId();

    board.initBlurFilter(divId, svg);
    var boardId = board.createBoardBase(divId, svg, env.goBoardBox, theme);
    var lineIds = board.createLines(divId, svg, boardPoints, theme);
    var starPointIds = board.createStarPoints(divId, svg, boardPoints, theme);
    var stoneShadowIds = board.createShadows(divId, svg, boardPoints, theme);
    var stoneIds = board.createStones(divId, svg, boardPoints, theme);
    var markIds = board.createMarkContainer(divId, svg, boardPoints, theme);
    var buttons = board.createButtons(divId, svg, boardPoints);
    var intersectionData = {
        lineIds: lineIds,
        starPointIds: starPointIds,
        stoneShadowIds: stoneShadowIds,
        stoneIds: stoneIds,
        markIds: markIds,
        buttons: buttons
    };
    this._intersections = glift.displays.board.createIntersections(
        divId, svg, intersectionData, boardPoints, theme);
    return this; // required -- used in create(...);
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    this.divId() && d3.select('#' + this.divId()).selectAll("svg").remove();
    this._svg = undefined;
    this._intersections = undefined;
    return this;
  },

  /**
   * Recreate the GoBoard. This means we create a completely new environment,
   * but we reuse the old Display object.
   *
   * TODO(kashomon): Why is this here?  Why not just give back a completely new
   * display?
   */
  recreate: function(options) {
    this.destroy();
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed);
    this._environment = environment;
    this._themeName = processed.theme
    this._theme = glift.themes.get(processed.theme);
    return this;
  },

  /**
   * Redraw the goboard.
   *
   * TODO(kashomon): Does this still need to exist?
   */
  redraw:  function() {
    this.draw();
  }
};
