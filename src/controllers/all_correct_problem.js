/**
 * The all correct problem controller encapsulates the idea of trying to get
 * everything right about a problem.  Every branch in the tree is thus
 * considered 'correct'.  This is useful for practicing joseki.
 */
glift.controllers.allCorrectProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  var newController = glift.util.setMethods(baseController,
          glift.controllers.AllCorrectProblemMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.AllCorrectProblemMethods = {

};
