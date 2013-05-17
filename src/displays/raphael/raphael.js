(function() {

glift.displays.raphael = {
  create: function(environment, theme) {
    return new glift.displays.raphael.Display(environment, theme);
  }
};

glift.displays.raphael.Display = function(inEnvironment, inTheme) {
  var environment = inEnvironment,
      themeName = inTheme,
      theme = glift.themes.get(themeName),
      paper = glift.util.none, // defined on init

      // Due layering issues, we need to keep track of the order in which we
      // created the objects.
      objectHistory = [],
      children = {}; // So the factory can access


  // Methods accessing private data
  this.intersections = function() { return environment.intersections; };
  this.divId = function() { return environment.divId };
  this.themeName = function() { return themeDict; };
  this.theme = function() { return theme; };
  this.boardRegion = function() { return environment.boardRegion; };
  this.paper = function() { return paper; };
  this.setPaper = function(paperIn) { paper = paperIn; };
  this.environment = function() { return environment; };

  this.init = function() {
      environment.init();
      if (paper === glift.util.none) {
        paper = Raphael(environment.divId, "100%", "100%");
      }
      return this;
  };

  this.setTheme = function(themeKey) { /* todo */ };
  this.setBoardRegion = function(region) { /* todo */ };
  this.setBoardRegion = function(region) { /* todo */ };
  this.draw = function(region) { /* todo */ };
};

// Alias for typing convenience
var Display = glift.displays.raphael.Display;

Display.prototype.draw = function() {
  this.environment.initialize();
  for (var i = 0; i < this.objectHistory.length; i++) {
    this.objectHistory[i].destroy();
  }
  this.objectHistory = [
    this.createBoardBase().draw(),
    this.createBoardLines().draw(),
    this.createStarPoints().draw()
  ]

  var stones = this.stones().draw();

  this.children = {
    'stones' : stones // Should use an ENUM here
  };
  this.objectHistory.push(stones);

  return this;
};

Display.prototype.destroy = function() {
  this.paper().remove();
  this.setPaper(glift.util.none);
};

})();
