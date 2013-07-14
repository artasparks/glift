glift.displays.board = {
  create: function(environment, themeName, theme) {
    return new glift.displays.board.Display(environment, themeName, theme)
        .draw();
  }
};

glift.displays.board.Display = function(inEnvironment, themeName, theme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._svg = undefined; // defined in draw
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;

  // TODO(kashomon): remove stones (or rework into intersections) now that we're
  // using d3.
  this._stones = undefined;
  this.stones = function() { return this._stones; };

  // Methods accessing private data
  this.intersectionPoints = function() { return this._environment.intersections; };
  this.boardPoints = function() { return this._environment.boardPoints; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
  this.width = function() { return this._environment.goBoardBox.width() };
  this.height = function() { return this._environment.goBoardBox.height() };
};

// Alias for typing convenience
glift.displays.board.Display.prototype = {
  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.
      this._svg = d3.select('#' + this.divId()).append("svg")
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
        data = boardPoints.data(),
        theme = this._theme,
        svg = this._svg,
        numIntersections = boardPoints.numIntersections,
        radius = boardPoints.radius;

    // We don't ever want
    board.createBoardBase(svg, env, theme);

    // Create board lines.
    svg.selectAll("lines").data(data)
      .enter().append("path")
        .attr('d', function(pt) {
          return board.intersectionLine(pt, radius, numIntersections, theme);
        })
        .attr('stroke', '#000000')
        .attr('stroke-linecap', 'round');

    board.createStarPoints(svg, boardPoints, theme);
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    this.divId() && d3.select('#' + this.divId()).selectAll("svg").remove();
    this._svg = undefined;
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
   * Enable auto-resizing.  This completely destroys and recreates the goboard.
   * However, this
   *
   * TODO(kashomon): Does this need to be reworked for d3? Also, need to provide
   * a way to turn enableAutoResizing off.
   */
  enableAutoResizing: function() {
    var that = this; // for closing over.
    var resizeFunc = function() {
      that.redraw();
    };

    var timeoutId;
    $(window).resize(function(event) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resizeFunc, 100);
    });
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
