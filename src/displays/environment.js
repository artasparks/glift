(function() {
var util = otre.util;
var enums = otre.enums;

otre.displays.environment = {
  TOPBAR_SIZE: 0.10,
  BOTTOMBAR_SIZE: 0.10,

  get: function(divId, displayType, options) {
    return new GuiEnvironment(divId, displayType, options);
  },

  getInitialized: function(divId, displayType, options) {
    return otre.displays.environment.get(divId, displayType, options)
      .initialize();
  },

  _getResizedBox: function(displayType, divBox, cropbox) {
    var newDims = otre.displays.cropbox.getCropDimensions(
            divBox.width,
            divBox.height,
            cropbox),
        newWidth = newDims.width,
        newHeight = newDims.height;
    if (displayType === enums.displayTypes.EXPLAIN_BOARD) {
      var modHeight = (1 + this.TOPBAR_SIZE + this.BOTTOMBAR_SIZE) * newHeight;
      var modWidth = newWidth;
      if (modHeight > divBox.height) {
        var shrinkPercent = 1 - (modHeight - divBox.height) / modHeight;
        modHeight = shrinkPercent * modHeight;
        modWidth = shrinkPercent * modWidth
      }
      newWidth = modWidth;
      newHeight = modHeight;
    }
    var xDiff = divBox.width - newWidth,
        yDiff = divBox.height - newHeight,
        xDelta = xDiff === 0 ? 0 : xDiff / 2,
        yDelta = yDiff === 0 ? 0 : yDiff / 2,
        newLeft = divBox.topLeft.x + xDelta,
        newTop = divBox.topLeft.y + yDelta;
    return otre.displays.bbox(util.point(newLeft, newTop), newWidth, newHeight);
  },

  // Get the bounding box of a sidebar.
  _getSidebarBox: function(displayType, resizedBox, direction) {
    var dirs = enums.directions,
        dispt = enums.displayTypes,
        top = resizedBox.topLeft.y,
        bot = resizedBox.botRight.y,
        left = resizedBox.topLeft.x,
        right = resizedBox.botRight.x;
    if (direction === dirs.LEFT) {
      // LEFT not yet used, so let width = 0
      right = resizedBox.topLeft.x;

    } else if (direction === dirs.RIGHT) {
      // RIGHT not yet used, so let width = 0
      left = resizedBox.botRight.x;

    } else if (direction === dirs.TOP) {
      top = resizedBox.topLeft.y
      if (displayType === dispt.EXPLAIN_BOARD) {
        bot = resizedBox.topLeft.y +
            resizedBox.height * (this.TOPBAR_SIZE) /
            (1 + this.BOTTOMBAR_SIZE + this.TOPBAR_SIZE)
      } else {
        bot = resizedBox.topLeft.y;
      }
    } else if (direction === dirs.BOTTOM) {
      bot = resizedBox.botRight.y
      if (displayType === dispt.EXPLAIN_BOARD) {
        top = resizedBox.topLeft.y +
            resizedBox.height - resizedBox.height * (this.BOTTOMBAR_SIZE) /
            (1 + this.BOTTOMBAR_SIZE + this.TOPBAR_SIZE)
      } else {
        top = resizedBox.botRight.y;
      }
    } else {
      return otre.displays.bbox(util.point(0,0), 0, 0);
    }

    return otre.displays.bboxFromPts(
        util.point(left, top), util.point(right, bot));
  }
};

var GuiEnvironment = function(divId, displayType, options) {
  this.divId = divId;
  this.displayType = displayType || enums.displayTypes.SIMPLE_BOARD;
  this.boardRegion = options.boardRegion || enums.boardRegions.ALL;
  this.intersections = options.intersections || 19;
  this.cropbox = options._cropbox || otre.displays.cropbox.getFromRegion(
      this.boardRegion, this.intersections);
  // We allow the divHeight and divWidth to be specified explicitly, primarily
  // because it's extremely useful for testing.
  this.divHeight = options._divHeight || ($("#" + this.divId).innerHeight());
  this.divWidth = options._divWidth || ($("#" + this.divId).innerWidth());

  // A variable to mark whether we need to initialize the go board.  Used in
  // other libraries to note when settings have changed and we need to
  // reinitialize.
  this.needsInitialization = true;
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
  initialize: function() {
    var displays = otre.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth  = this.divWidth,
        cropbox   = this.cropbox,
        displayType = this.displayType,
        dirs = enums.directions,

        // The box for the entire div
        divBox = displays.bboxFromPts(
            util.point(0, 0), // top left point
            util.point(divWidth, divHeight)), // bottom right point
        resizedBox = env._getResizedBox(displayType, divBox, cropbox),

        topBar = env._getSidebarBox(displayType, resizedBox, dirs.TOP),
        leftBar = env._getSidebarBox(displayType, resizedBox, dirs.LEFT),
        bottomBar = env._getSidebarBox(displayType, resizedBox, dirs.BOTTOM),
        rightBar = env._getSidebarBox(displayType, resizedBox, dirs.RIGHT),

        goBoardBox = otre.displays.bboxFromPts(
            util.point(leftBar.botRight.x, topBar.botRight.y),
            util.point(rightBar.topLeft.x, bottomBar.topLeft.y)),
        goBoardLineBox = otre.displays.getLineBox(goBoardBox, cropbox),
        boardPoints = otre.displays.boardPointsFromLineBox(goBoardLineBox),
        lineSegments = otre.displays.getLineSegments(goBoardLineBox);

    this.divBox = divBox;
    this.resizedBox = resizedBox;
    this.topBar = topBar;
    this.leftBar = leftBar;
    this.bottomBar = bottomBar;
    this.rightBar = rightBar;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    this.lineSegments = lineSegments;

    this.needsInitialization = false;
    return this;
  },

  setDisplayType: function(displayType) {
    this.displayType = displayType;
    this.needsInitialization = true;
  },

  setIntersections: function(intersections) {
    this.intersections = intersections;
    this.needsInitialization = true;
  },

  resetDimensions: function() {
    this.divHeight  = ($("#" + this.divId).innerHeight());
    this.divWidth   = ($("#" + this.divId).innerWidth());
    this.needsInitialization = true;
    return this;
  },

  _debugDrawAll: function() {
    var paper = Raphael(this.divId, "100%", "100%")
    this.divBox.draw(paper, 'yellow');
    this.resizedBox.draw(paper, 'red');
    this.topBar.draw(paper, 'blue');
    this.bottomBar.draw(paper, 'blue');
    //TODO: Add left/right bars to debug when supported.
    //this.leftBar.draw(this.paper, 'green');
    //this.rightBar.draw(this.paper, 'green');
    this.goBoardBox.draw(paper, 'orange');
    this.goBoardLineBox.bbox.draw(paper, 'red');
    this.goBoardLineBox._debugDrawLines(paper, 'blue');
    this.boardPoints._debugDraw(paper, 'green');
    this.lineSegments._debugDraw(paper, 'black');
  }
};

})();
