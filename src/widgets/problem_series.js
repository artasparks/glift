glift.widgets.createProblemSeries = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var main = 'glift_internal_main_' + glift.util.idGenerator.next();
  var footer = 'glift_internal_footer_' + glift.util.idGenerator.next();
  options.divId = main;
  var series = new glift.widgets._ProblemSeries(options, divId, main, footer);
  return series;
};

glift.widgets._ProblemSeries = function(
    options, wrapperDiv, mainDiv, footerDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.mainDiv = mainDiv;
  this.footerDiv = footerDiv;

  this.createDivs();
  this.resizeDivs();
  this.basicProblm = glift.widgets.createBasicProblem(options);
};

glift.widgets._ProblemSeries.prototype = {
  createDivs: function() {
    $('#' + this.wrapperDiv).append('<div id = "' + this.mainDiv + '"></div>');
    $('#' + this.wrapperDiv).append('<div id = "' + this.footerDiv + '"></div>');
    this.paper = Raphael(this.footerDiv, '100%', '100%');
    this.paper.path("M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 " +
        "23.389,15.999 13.665,25.725z");
    return this;
  },

  resizeDivs: function() {
    var height = $('#' + this.wrapperDiv).height();
    $('#' + this.mainDiv).css({
        position: 'absolute',
        width: '100%',
        height: (height - 50),
        'background-color': 'blue',
        top: 0
    });
    $('#' + this.footerDiv).css({
        'position' : 'absolute',
        'width' : '100%',
        'height' : 50,
        'background-color': 'red',
        'text-align': 'center',
        'bottom' : 0
    });
    return this;
  }
};
