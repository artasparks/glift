glift.displays.board = {
  create: function(env, themeName, theme, rotation) {
    return new glift.displays.board.Display(
        env, themeName, theme, rotation).draw();
  }
};

/**
 * The core Display object returned to the user.
 */
glift.displays.board.Display = function(
    inEnvironment, themeName, theme, rotation) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;

  // Rotation indicates whether we should rotate by stones/marks in the display
  // by 90, 180, or 270 degrees,
  this._rotation = rotation || glift.enums.rotations.NO_ROTATION;
  this._svgBase = undefined; // defined in draw.
  this._svg = undefined; // defined in draw.
  this._intersections = undefined // defined in draw;
  this._buffer = []; // All objects are stuffed into the buffer and are only added
};

glift.displays.board.Display.prototype = {
  boardPoints: function() { return this._environment.boardPoints; },
  boardRegion: function() { return this._environment.boardRegion; },
  divId: function() { return this._environment.divId },
  intersectionPoints: function() { return this._environment.intersections; },
  intersections: function() { return this._intersections; },
  rotation: function() { return this._rotation; },
  theme: function() { return this._themeName; },
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
      this._svg = glift.displays.svg.svg({
        height: '100%',
        width: '100%',
        position: 'float',
        top: 0,
        id: this.divId() + '_svgboard'
      });
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
        divId = this.divId(),
        svglib = glift.displays.svg,
        idGen = glift.displays.ids.generator(divId);

    board.boardBase(svg, idGen, env.goBoardBox, theme);
    board.initBlurFilter(divId, svg); // in boardBase.  Should be moved.

    var intGrp = svglib.group().attr('id', idGen.intersections());
    svg.append(intGrp);

    board.lines(intGrp, idGen, boardPoints, theme);
    board.starpoints(intGrp, idGen, boardPoints, theme);
    board.shadows(intGrp, idGen, boardPoints, theme);
    board.stones(intGrp, idGen, boardPoints, theme);
    board.markContainer(intGrp, idGen, boardPoints, theme);
    board.buttons(intGrp, idGen, boardPoints, this.rotation());
    this._intersections = new glift.displays.board._Intersections(
        divId, intGrp, boardPoints, theme, this.rotation());
    this.flush();
    return this; // required
  },

  flush: function() {
    this._svg.attachToParent(this.divId());
    this.intersections().flushEvents();
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    $('#' + this.divId()).empty();
    this._svg = undefined;
    this._svgBase = undefined;
    this._intersections = undefined;
    return this;
  }
};
