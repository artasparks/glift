glift.controllers.boardEditor = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  // var newController = glift.util.setMethods(baseController,
          // glift.controllers.StaticProblemMethods);
  baseController.initOptions(sgfOptions);
  return baseController;
};
