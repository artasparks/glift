(function() {

otre.displays.raphael = {
  getFactory: function(environment, controller, theme) {
    return new otre.displays.raphael.Factory(environment, controller, theme);
  }
};

otre.displays.raphael.Factory = function(environment, controller, theme) {
  this.environment = environment;
  this.theme = theme;
  this.paper = Raphael(environment.divId, "100%", "100%");
  // Due layering issues, we need to keep track of the order in which we created
  // the objects.
  this.objectHistory = [];
  this.children = {}; // So the factory can access

  // Closure Variables
  var _controller = controller;

  // Force the users of the Factory controller to get the correct version.
  this.getController = function() {
    return _controller;
  };

  this.setController = function(controller) {
      _controller = controller;
  };
};
var Factory = otre.displays.raphael.Factory;

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
