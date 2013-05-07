(function() {

glift.displays.raphael = {
  create: function(environment, theme) {
    return new glift.displays.raphael.Factory(environment,  theme);
  }
};

glift.displays.raphael.Factory = function(environment, controller, theme) {
  this.environment = environment;
  this.theme = theme;
  this.paper = Raphael(environment.divId, "100%", "100%");
  // Due layering issues, we need to keep track of the order in which we created
  // the objects.
  this.objectHistory = [];
  this.children = {}; // So the factory can access
};
var Factory = glift.displays.raphael.Factory;

Factory.prototype.draw = function() {
  this.environment.initialize();
  for (var i = 0; i < this.objectHistory.length; i++) {
    this.objectHistory[i].destroy();
  }
  this.objectHistory = [
    this.board().draw(),
    this.boardlines().draw(),
    this.starpoints().draw()
  ]

  var stones = this.stones().draw();

  this.children = {
    'stones' : stones // Should use an ENUM here
  };
  this.objectHistory.push(stones);

  return this;
};

})();
