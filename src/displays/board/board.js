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
  this._svg = undefined; // defined in draw
  this._intersections = undefined // defined in draw;
};

glift.displays.board.Display.prototype = {
  intersections: function() { return this._intersections; },
  intersectionPoints: function() { return this._environment.intersections; },
  boardPoints: function() { return this._environment.boardPoints; },
  divId: function() { return this._environment.divId },
  theme: function() { return this._themeName; },
  boardRegion: function() { return this._environment.boardRegion; },
  width: function() { return this._environment.goBoardBox.width() },
  height: function() { return this._environment.goBoardBox.height() },

  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.
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
    var boardId = board.boardBase(divId, svg, env.goBoardBox, theme);
    var lineIds = board.lines(divId, svg, boardPoints, theme);
    var starPointIds = board.starPoints(divId, svg, boardPoints, theme);
    var stoneShadowIds = board.shadows(divId, svg, boardPoints, theme);
    var stoneIds = board.stones(divId, svg, boardPoints, theme);
    var markIds = board.markContainer(divId, svg, boardPoints, theme);
    var buttons = board.buttons(divId, svg, boardPoints);
    var intersectionData = {
        lineIds: lineIds,
        starPointIds: starPointIds,
        stoneShadowIds: stoneShadowIds,
        stoneIds: stoneIds,
        markIds: markIds,
        buttons: buttons
    };
    this._intersections = new glift.displays.board._Intersections(
        divId, svg, intersectionData, boardPoints, theme);
    return this; // required
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
  }
};
