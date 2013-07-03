(function() {

glift.displays.board = {
  create: function(environment, themeName, theme) {
    return new glift.displays.board.Display(environment, themeName, theme)
        .init();
  }
};

glift.displays.board.Display = function(inEnvironment, themeName, theme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._paper = glift.util.none;
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;
  this._stones = undefined;
  this.stones = function() { return this._stones; };

  // Methods accessing private data
  this.intersectionPoints = function() { return this._environment.intersections; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
  this.width = function() { return this._environment.goBoardBox.width() };
  this.height = function() { return this._environment.goBoardBox.height() };
};

// Alias for typing convenience
var Display = glift.displays.board.Display;

// This allows us to create a base display object without creating all drawing
// all the parts.
Display.prototype.init = function() {
  this._paper = Raphael(this.divId(), "100%", "100%");
  this._environment.init();
  return this;
};

Display.prototype.draw = function() {
  this.init();
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].destroy();
  }
  this._objectHistory = [
    this.createBoardBase(),
    this.createBoardLines(),
    this.createStarPoints()
  ];
  this._stones = this.createStones();
  this._objectHistory.push(this._stones);
  return this;
};

// Maybe I'm working too hard to 'destroy' these objects.  Why not just remove
// them from the SVG element? Or just remove the SVG element itself?
Display.prototype.destroy = function() {
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].destroy();
  }
  this._objectHistory = [];
  this._paper.remove();
  this._paper = undefined;
  this._stones = undefined;

  // Empty out the div of anything that's left
  $('#' + this.divId()).empty();
};

Display.prototype.recreate = function(options) {
  this.destroy();
  var processed = glift.displays.processOptions(options),
      environment = glift.displays.environment.get(processed);
  this._environment = environment;
  this._themeName = processed.theme
  this._theme = glift.themes.get(processed.theme);
  return this;
};

Display.prototype.enableAutoResizing = function() {
  var that = this;
  var resizeFunc = function() {
    that.redraw();
  };

  var timeoutId;
  $(window).resize(function(event) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(resizeFunc, 100);
  });
};

Display.prototype.redraw = function() {
  this._environment.init();
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].redraw();
  }
};

})();
