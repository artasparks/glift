(function() {
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
    return new GuiEnvironment(divId, boardBox, options);
  }
};

var GuiEnvironment = function(divId, bbox, options) {
  this.divId = divId;
  this.bbox = bbox; // required
  this.divHeight = bbox.height();
  this.divWidth = bbox.width();
  this.boardRegion = options.boardRegion || glift.enums.boardRegions.ALL;
  this.intersections = options.intersections || 19;
  this.drawBoardCoords = options.drawBoardCoords || false;

  var cropNamespace = glift.displays.cropbox;
  this.cropbox = glift.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections, this.drawBoardCoords);
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
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
})();
