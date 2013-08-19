(function() {
glift.widgets.problemService = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var url = options.url;
  var service = new ProblemService(options, divId);
  return service.draw();
};


/**
 * A Problem Service is a widget that gets its problems from a single URL.  Thus
 * the ProblemService must be backed by some web server.
 *
 * For static problems, use the ProblemSeries.
 */
ProblemService = function(options, wrapperDiv) {
  this.options = options;
  this.urls = options.urls;
  this.index = 0;
  this.wrapperDiv = wrapperDiv;
  this.problemDisplay = undefined;
  this.iconBar = undefined;
};

ProblemService.prototype = {
  draw: function() {
    return this;
  }
};

})();
