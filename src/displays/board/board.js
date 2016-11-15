goog.provide('glift.displays.board');
goog.provide('glift.displays.board.Display');

/** @namespace */
glift.displays.board = {};

/**
 * Create a new display Board.
 *
 * @param {string} elemId The DOM element ID for the container
 * @param {!glift.displays.GuiEnvironment} env Glift display environment.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {!glift.enums.rotations} rotation Rotation enum
 */
glift.displays.board.create = function(elemId, env, theme, rotation) {
  return new glift.displays.board.Display(elemId,env, theme, rotation).draw();
};

/**
 * The core Display object returned to the user.
 *
 * @param {string} elemId The DOM element ID for the container
 * @param {!glift.displays.GuiEnvironment} environment Gui environment object.
 * @param {!glift.themes.base} theme A Glift theme.
 * @param {glift.enums.rotations=} opt_rotation Optional rotation to rotate the
 *    points.
 *
 * @constructor @struct @final
 * @package
 */
glift.displays.board.Display = function(elemId, environment, theme, opt_rotation) {
  /** @private {string} */
  this.elemId_ = elemId;

  /** @private {glift.displays.GuiEnvironment} */
  this.environment_ = environment;

  /** @private {!glift.themes.base} */
  this.theme_ = theme;

  /**
   * Rotation indicates whether we should rotate by stones/marks in the display
   * by 90, 180, or 270 degrees,
   * @private {!glift.enums.rotations}
   */
  this.rotation_ = opt_rotation || glift.enums.rotations.NO_ROTATION;

  // Variables defined during draw()
  /** @private {glift.svg.SvgObj} svgBase Root SVG object. */
  this.svg_ = null;

  /** @private {?glift.displays.board.Intersections} */
  this.intersections_ = null;

  /**
   * The flattened representation of the Go board. This should exactly
   * correspond to the data rendered in the SGF.
   *
   * @private {!glift.flattener.Flattened}
   */
  this.flattened_ = glift.flattener.emptyFlattened(this.numIntersections());
};

glift.displays.board.Display.prototype = {
  boardPoints: function() { return this.environment_.boardPoints; },
  /** @return {string} */
  boardRegion: function() { return this.environment_.boardRegion; },
  /** @return {string} */
  divId: function() { return this.elemId_; },
  /** @return {number} */
  numIntersections: function() { return this.environment_.intersections; },
  /** @return {?glift.displays.board.Intersections} */
  intersections: function() { return this.intersections_; },
  /** @return {!glift.enums.rotations} */
  rotation: function() { return this.rotation_; },
  /** @return {boolean} */
  drawBoardCoords: function() { return this.environment_.drawBoardCoords; },
  /** @return {number} */
  width: function() { return this.environment_.goBoardBox.width() },
  /** @return {number} */
  height: function() { return this.environment_.goBoardBox.height() },

  /**
   * Initialize the SVG This allows us to create a base display object without
   * creating all drawing all the parts.
   *
   * @return {!glift.displays.board.Display}
   */
  init: function() {
    if (!this.svg_) {
      this.destroy(); // make sure everything is cleared out of the div.
      this.svg_ = glift.svg.svg({
        height: '100%',
        width: '100%',
        position: 'float',
        top: 0,
        id: this.divId() + '_svgboard'
      });
    }
    this.environment_.init();
    return this;
  },

  /**
   * Draws the GoBoard!
   * @return {!glift.displays.board.Display}
   */
  draw:  function() {
    this.init();
    var board = glift.displays.board;
    var env = this.environment_;
    var boardPoints = env.boardPoints;
    var theme = this.theme_;
    var svg = this.svg_;
    var divId = this.divId();
    var svglib = glift.svg;
    var idGen = glift.displays.svg.ids.gen(divId);
    var goBox = env.goBoardBox;
    if (svg === null) {
      throw new Error('Base SVG object not initialized.');
    }
    if (goBox === null) {
      throw new Error('goBox null: Gui Environment obj not initialized.');
    }
    if (boardPoints === null) {
      throw new Error('boardPoints null: Gui Environment obj not initialized.');
    }

    board.boardBase(svg, idGen, goBox, theme);
    board.initBlurFilter(divId, svg); // in boardBase.  Should be moved.


    var intGrp = svglib.group().setId(idGen.intersections());
    svg.append(intGrp);

    board.boardLabels(intGrp, idGen, boardPoints, theme);

    board.lines(intGrp, idGen, boardPoints, theme);
    board.starpoints(intGrp, idGen, boardPoints, theme);

    board.shadows(intGrp, idGen, boardPoints, theme);
    board.stones(intGrp, idGen, boardPoints, theme);
    board.markContainer(intGrp, idGen);
    board.buttons(intGrp, idGen, boardPoints);

    this.intersections_ = new glift.displays.board.Intersections(
        divId, intGrp, boardPoints, theme, this.rotation());

    this.flush();
    return this; // required
  },

  /**
   * Update the board with a new flattened object. The board stores the previous
   * flattened object and just updates based on the diff between the two.
   *
   * @param {!glift.flattener.Flattened} flattened
   * @return {!glift.displays.board.Display} this
   */
  updateBoard: function(flattened) {
    this.intersections().clearMarks();
    this.intersections().clearHover();

    var diffArr = this.flattened_.board().differ(
        flattened.board(), glift.flattener.board.displayDiff);

    var symb = glift.flattener.symbols;
    var marks = glift.enums.marks
    var symbolStoneToState = glift.flattener.symbolStoneToState;
    var symbolMarkToMark = glift.flattener.symbolMarkToMark;

    for (var i = 0; i < diffArr.length; i++) {
      /** @type {!glift.flattener.BoardDiffPt<glift.flattener.Intersection>} */
      var diffPt = diffArr[i];
      if (diffPt.newValue.stone() !== diffPt.prevValue.stone()) {
        var newStoneStr = diffPt.newValue.stone();
        this.intersections().setStoneColor(
            diffPt.boardPt, symbolStoneToState[newStoneStr]);
      }
      if (diffPt.newValue.mark() !== 0) { // We've already cleared empty marks.
        var newMark = diffPt.newValue.mark();
        var enumMark = symbolMarkToMark[newMark];
        var lbl = null;
        if (enumMark === marks.LABEL ||
            enumMark === marks.VARIATION_MARKER ||
            enumMark === marks.CORRECT_VARIATION) {
          lbl = diffPt.newValue.textLabel();
        }
        this.intersections().addMarkPt(
            diffPt.boardPt, enumMark, lbl);
      }
    }
    this.flattened_ = flattened;
    return this;
  },

  /** @return {!glift.displays.board.Display} this */
  flush: function() {
    if (this.svg_) {
      glift.displays.svg.dom.attachToParent(this.svg_, this.divId());
    }
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   *
   * @return {!glift.displays.board.Display} this
   */
  destroy: function() {
    glift.dom.elem(this.divId()).empty();
    this.svg_ = null;
    this.flattened_ = glift.flattener.emptyFlattened(this.numIntersections());
    this.intersections_ = null;
    return this;
  }
};
