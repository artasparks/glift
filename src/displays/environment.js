goog.provide('glift.displays.environment');
goog.provide('glift.displays.GuiEnvironment');

/**
 * The Environment contains:
 *  - The bounding box for the lines.
 *  - The bounding box for the whole board
 *  - The bounding boxes for the sidebars.
 *  - The divId to be used
 */
glift.displays.environment = {
  /**
   * Gets the environment wrapper, passing in the display options. This is the
   * preferred method.  It's expected that the proper display code will
   */
  get: function(divId, boardBox, options) {
    if (!divId) {
      throw new Error('No DivId Specified!')
    }

    // For speed and isolation purposes, it's preferred to define the boardBox
    // rather than to calculate the h/w by inspecting the div here.
    if (divId && !boardBox) {
      boardBox = glift.displays.bbox.fromDiv(divId);
    }

    if (!boardBox) {
      throw new Error('No Bounding Box defined for display environment!')
    }
    return new glift.displays.GuiEnvironment(divId, boardBox, options);
  }
};

/**
 * @param {string} divId
 * @param {!glift.displays.BoundingBox} bbox
 * @param {!Object} options SGF Options.
 *
 * @package
 * @constructor @final @struct
 */
glift.displays.GuiEnvironment = function(divId, bbox, options) {
  /** @type {string} */
  this.divId = divId;
  /** @type {!glift.displays.BoundingBox} */
  this.bbox = bbox; // required
  /** @type {number} */
  this.divHeight = bbox.height();
  /** @type {number} */
  this.divWidth = bbox.width();
  /** @type {!glift.enums.boardRegions} */
  this.boardRegion = options.boardRegion || glift.enums.boardRegions.ALL;
  /** @type {number} */
  this.intersections = options.intersections || 19;
  /** @type {boolean} */
  this.drawBoardCoords = options.drawBoardCoords || false;

  var cropNamespace = glift.displays.cropbox;

  /** @type {!glift.displays.DisplayCropBox} */
  this.cropbox = glift.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections, this.drawBoardCoords);

  // ------- Defined during init ------- //
  /** @type {glift.displays.BoundingBox} */
  this.divBox = null;
  /** @type {glift.displays.BoundingBox} */
  this.goBoardBox = null;
  /** @type {glift.displays.LineBox} */
  this.goBoardLineBox = null;
  /** @type {glift.displays.BoardPoints} */
  this.boardPoints = null;
};

glift.displays.GuiEnvironment.prototype = {
  /**
   * Initialize the internal variables that tell where to place the go
   * broard.
   */
  init: function() {
    var displays = glift.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth = this.divWidth,
        cropbox = this.cropbox,
        dirs = glift.enums.directions,

        // The box for the entire div.
        // TODO(kashomon): This is created twice, which is a little silly (but
        // not expensive) in _resetDimensions. Might want to replace.
        divBox = displays.bbox.fromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.displays.boardPoints(
            goBoardLineBox, this.intersections, this.drawBoardCoords);
    this.divBox = divBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    return this;
  }
};
