(function() {
/***
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
    // TODO(kashomon): Remove the processOptions here.  It's only used for
    // tests.
    return new GuiEnvironment(glift.displays.processOptions(options));
  },

  getInitialized: function(options) {
    return glift.displays.environment.get(options).init();
  },

  environmentCopy: function(env) {
    return new GuiEnvironment(glift.displays.processOptions({
      divId: env.divId,
      boardRegion: env.boardRegion,
      intersections: env.intersections
    }));
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
  //
  // TODO(kashomon): Make this a first-class option. I now think it's totally
  // reasonable to set the height/width explicitly.
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
        dirs = glift.enums.directions,

        // The box for the entire div.
        // TODO(kashomon): This is created twice, which is a little silly (but
        // not expensive) in _resetDimensions. Might want to replace.
        divBox = displays.bboxFromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.displays.boardPointsFromLineBox(
            goBoardLineBox, this.intersections);
    this.divBox = divBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    return this;
  },

  _resetDimensions: function() {
    var bbox = glift.displays.bboxFromDiv(this.divId);
    this.divHeight = bbox.height();
    this.divWidth = bbox.width();
    // -- no reason to use jquery
    // this.divWidth =  ($("#" + this.divId).width());
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
