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
   * @param {!glift.orientation.BoundingBox} boardBox
   * @param {!glift.enums.boardRegions} boardRegion
   * @param {number} intersections Number of intersections (usu. 19).
   * @param {boolean} drawBoardCoords Whether or not to draw the board
   *    coordinates.
   */
  get: function(boardBox, boardRegion, intersections, drawBoardCoords) {
    // For speed and isolation purposes, it's preferred to define the boardBox
    // externally rather than to calculate the h/w by inspecting the div here.

    if (!boardBox) {
      throw new Error('No Bounding Box defined for display environment!')
    }

    return new glift.displays.GuiEnvironment(
        boardBox, boardRegion, intersections, drawBoardCoords);
  }
};

/**
 * @param {!glift.orientation.BoundingBox} bbox
 * @param {!glift.enums.boardRegions} boardRegion
 * @param {number} intersections Number of intersections (usu. 19).
 * @param {boolean} drawBoardCoords Whether or not to draw the board
 *    coordinates.
 *
 * @constructor @final @struct
 */
glift.displays.GuiEnvironment = function(
    bbox, boardRegion, intersections, drawBoardCoords) {
  /** @const {!glift.orientation.BoundingBox} */
  this.bbox = bbox; // required
  /** @const {number} */
  this.divHeight = bbox.height();
  /** @const {number} */
  this.divWidth = bbox.width();
  /** @const {!glift.enums.boardRegions} */
  this.boardRegion = boardRegion;
  /** @const {number} */
  this.intersections = intersections;
  /** @const {boolean} */
  this.drawBoardCoords = drawBoardCoords;

  /** @type {!glift.displays.DisplayCropBox} */
  this.cropbox = glift.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections, this.drawBoardCoords);

  // ------- Defined during init ------- //
  /** @private {glift.orientation.BoundingBox} */
  this.divBox_ = null;

  /**
   * The 'true' outer-draw box for the go board.
   * @type {?glift.orientation.BoundingBox}
   */
  this.goBoardBox = null;

  /**
   * The BoardPoints object is really the thing that we're shooting for: A list
   * of all the intersection-coordinates for drawing the go-board.
   * @type {?glift.flattener.BoardPoints}
   */
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
        divBox = glift.orientation.bbox.fromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        spacing = glift.displays.getSpacing(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.flattener.BoardPoints.fromBbox(
            this.cropbox.bboxWithoutCoords(), spacing, this.intersections, {
              drawBoardCoords: this.drawBoardCoords,
              padding: cropbox.basePadding(),
              croppedEdgePadding: cropbox.croppedEdgePadding(),
              offsetPt: goBoardBox.topLeft(),
            });

    // Private. Largely for debugging.
    this.divBox_ = divBox;

    // Exports.
    this.goBoardBox = goBoardBox;
    this.boardPoints = boardPoints;
    return this;
  }
};
