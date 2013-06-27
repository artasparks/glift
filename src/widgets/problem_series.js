(function() {
glift.widgets.problemSeries = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var main = 'glift_internal_main_' + glift.util.idGenerator.next();
  var footer = 'glift_internal_footer_' + glift.util.idGenerator.next();
  options.divId = main;
  var series = new ProblemSeries(options, divId, main, footer);
  return series;
};

ProblemSeries = function(
    options, wrapperDiv, mainDiv, footerDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.mainDiv = mainDiv;
  this.footerDiv = footerDiv;
  this.problemDisplay = undefined;
  this.iconBar = undefined;
  this.draw();
};

ProblemSeries.prototype = {
  draw: function() {
    this.createDivs();
    this.resizeDivs();
    this.problemDisplay = glift.widgets.basicProblem(this.options);
    var margin = ($('#' +  this.mainDiv).width() -
        this.problemDisplay.display.width()) / 2;
    this.iconBar = glift.widgets.iconBar({
      divId: this.footerDiv,
      vertMargin:  5,
      horzMargin: margin,
      icons:  ['chevron-left', 'refresh', 'chevron-right', 'roadmap',
          'small-gear']
    });
  },

  createDivs: function() {
    $('#' + this.wrapperDiv).append('<div id = "' + this.mainDiv + '"></div>');
    $('#' + this.wrapperDiv).append('<div id = "' + this.footerDiv + '"></div>');
    return this;
  },

  resizeDivs: function() {
    var height = $('#' + this.wrapperDiv).height();
    $('#' + this.mainDiv).css({
        position: 'absolute',
        width: '100%',
        height: (height - 50),
        top: 0
    });
    $('#' + this.footerDiv).css({
        'position' : 'absolute',
        'width' : '100%',
        'height' : 50,
        'text-align': 'center',
        'bottom' : 0
    });
    return this;
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.problemDisplay && this.problemDisplay.destroy();
    this.iconBar && this.iconBar.destroy();
    $('#' + this.wrapperDiv).empty();
    return this;
  }
};
})();
