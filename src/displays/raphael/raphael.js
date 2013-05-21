(function() {

glift.displays.raphael = {
  create: function(environment, theme) {
    return new glift.displays.raphael.Display(environment, theme);
  }
};

glift.displays.raphael.Display = function(inEnvironment, inTheme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._paper = glift.util.none;
  this._environment = inEnvironment;
  this._themeName = inTheme;
  this._theme = glift.themes.get(inTheme);
  this._stones = glift.util.none;

  // Methods accessing private data
  this.intersections = function() { return this._environment.intersections; };
  this.divId = function() { return this._environment.divId };
  this.theme = function() { return this._themeName; };
  this.boardRegion = function() { return this._environment.boardRegion; };
};

// Alias for typing convenience
var Display = glift.displays.raphael.Display;

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
// them from the SVG paper?
Display.prototype.destroy = function() {
  for (var i = 0; i < this._objectHistory.length; i++) {
    this._objectHistory[i].destroy();
  }
  this._objectHistory = [];
  this._paper.remove();
  this._paper = glift.util.none;
  this._stones = glift.util.none;
  // Empty out the div of anything that's left
  $('#' + this.divId()).empty();
};

Display.prototype.recreate = function(options) {
  this.destroy();
  var processed = glift.processOptions(options),
      environment = glift.displays.environment.get(processed);
  this._environment = environment;
  this._themeName = processed.theme
  this._theme = glift.themes.get(processed.theme);
  return this;
};

Display.prototype.setColor = function(point, color) {
  if (this._stones !== glift.util.none) {
    this._stones.setColor(point, color);
    return this;
  } else {
    throw "Stones === none! Cannot setColor";
  }
};

})();
