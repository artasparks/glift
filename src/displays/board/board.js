goog.provide('glift.displays.board');
goog.provide('glift.displays.board.Display');

/** @namespace */
glift.displays.board = {};

/**
 * Create a new display Board.
 *
 * @param {!Object} env Glift display environment.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {!glift.enums.rotations} rotation Rotation enum
 */
glift.displays.board.create = function(env, theme, rotation) {
  return new glift.displays.board.Display(env, theme, rotation).draw();
};

/**
 * The core Display object returned to the user.
 *
 * @param {!Object} environment Gui environment object.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {glift.enums.rotations=} opt_rotation Optional rotation to rotate the
 *    points.
 *
 * @constructor
 * @package
 */
glift.displays.board.Display = function(environment, theme, opt_rotation) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];

  this._environment = environment;

  this._theme = theme;

  /**
   * Rotation indicates whether we should rotate by stones/marks in the display
   * by 90, 180, or 270 degrees,
   * @private {!glift.enums.rotations}
   */
  this.rotation_ = opt_rotation || glift.enums.rotations.NO_ROTATION;

  // Variables defined during draw()
  /** @private {glift.displays.svg.SvgObj} svgBase Root SVG object. */
  this._svgBase = null;
  this._svg = null;
  this._intersections = null;

  // All objects are stuffed into the buffer and are only added to the dom
  // during flushes.
  this._buffer = [];
};

glift.displays.board.Display.prototype = {
  boardPoints: function() { return this._environment.boardPoints; },
  /** @return {string} */
  boardRegion: function() { return this._environment.boardRegion; },
  /** @return {string} */
  divId: function() { return this._environment.divId },
  intersectionPoints: function() { return this._environment.intersections; },
  intersections: function() { return this._intersections; },
  /** @return {!glift.enums.rotations} */
  rotation: function() { return this.rotation_; },
  width: function() { return this._environment.goBoardBox.width() },
  height: function() { return this._environment.goBoardBox.height() },

  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   *
   * @return {!glift.displays.board.Display}
   */
  init: function() {
    if (!this._svg) {
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

    var intGrp = svglib.group().setAttr('id', idGen.intersections());
    svg.append(intGrp);

    board.boardLabels(intGrp, idGen, boardPoints, theme);

    board.lines(intGrp, idGen, boardPoints, theme);
    board.starpoints(intGrp, idGen, boardPoints, theme);

    board.shadows(intGrp, idGen, boardPoints, theme);
    board.stones(intGrp, idGen, boardPoints, theme);
    board.markContainer(intGrp, idGen);
    board.buttons(intGrp, idGen, boardPoints);

    this._intersections = new glift.displays.board.Intersections(
        divId, intGrp, boardPoints, theme, this.rotation());
    glift.util.majorPerfLog("After display object creation");

    this.flush();
    glift.util.majorPerfLog("After flushing to display");
    return this; // required
  },

  flush: function() {
    this._svg.attachToParent(this.divId());
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    glift.dom.elem(this.divId()).empty();
    this._svg = null;
    this._svgBase = null;
    this._intersections = null;
    return this;
  }
};
