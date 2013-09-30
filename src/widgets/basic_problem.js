/**
 * Create a Basic Problem.
 */
glift.widgets.basicProblem = function(options) {
  options = glift.widgets.options.setDefaults(options, 'problem');
  options = glift.widgets.options.setDefaults(options);
  if (options.sgfStringList.length > 0) {
    options.sgfString = options.sgfString || options.sgfStringList[0];
  }
  return glift.widgets.baseWidget(options);
};
