(function() {
var util = glift.util;
var enums = glift.enums;

/*
 * The Environment contains:
 *  - The bounding box for the lines.
 *  - The bounding box for the whole board
 *  - The bounding boxes for the sidebars.
 *  - The divId to be used
 */
glift.displays.environment = {
  TOPBAR_SIZE: 0.10,
  BOTTOMBAR_SIZE: 0.10,

  get: function(options) {
    return new GuiEnvironment(glift.processOptions(options));
  },

  getInitialized: function(options) {
    return glift.displays.environment.get(options).init();
  }
};

var GuiEnvironment = function(options) {
  this.divId = options.divId;
  this.boardRegion = options.boardRegion
  this.intersections = options.intersections
  this.cropbox = options.displayConfig._cropbox ||
      glift.displays.cropbox.getFromRegion(this.boardRegion, this.intersections);
  this.heightOverride = false;
  this.widthOverride = false;

  // We allow the divHeight and divWidth to be specified explicitly, primarily
  // because it's extremely useful for testing.
  if (options.displayConfig._divHeight !== undefined) {
    this.divHeight = options.displayConfig._divHeight;
    this.heightOverride = true;
  }

  if (options.displayConfig._divWidth !== undefined) {
    this.divWidth = options.displayConfig._divWidth;
    this.widthOverride = true;
  }
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
  init: function() {
    if (!this.heightOverride || !this.widthOverride) {
      this._resetDimensions();
    }

    var displays = glift.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth  = this.divWidth,
        cropbox   = this.cropbox,
        dirs = enums.directions,

        // The box for the entire div
        divBox = displays.bboxFromPts(
            util.point(0, 0), // top left point
            util.point(divWidth, divHeight)), // bottom right point
        resizedBox = glift.displays.getResizedBox(divBox, cropbox),
        goBoardBox = resizedBox,
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),
        boardPoints = glift.displays.boardPointsFromLineBox(goBoardLineBox),
        lineSegments = glift.displays.getLineSegments(goBoardLineBox);

    this.divBox = divBox;
    this.resizedBox = resizedBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    this.lineSegments = lineSegments;
    return this;
  },

  setIntersections: function(intersections) {
    this.intersections = intersections;
  },

  _resetDimensions: function() {
    this.divHeight = ($("#" + this.divId).innerHeight());
    // -- no reason to use jquery
    // document.getElementById(divId).style.height();
    this.divWidth =  ($("#" + this.divId).innerWidth());
    this.needsInitialization = true;
    return this;
  },

  _debugDrawAll: function() {
    var paper = Raphael(this.divId, "100%", "100%")
    this.divBox.draw(paper, 'yellow');
    this.resizedBox.draw(paper, 'red');
    this.goBoardBox.draw(paper, 'orange');
    this.goBoardLineBox.bbox.draw(paper, 'red');
    this.goBoardLineBox._debugDrawLines(paper, 'blue');
    this.boardPoints._debugDraw(paper, 'green');
    this.lineSegments._debugDraw(paper, 'black');
  }
};

})();
