(function() {
glift.widgets.problemSeries = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var series = new ProblemSeries(options, divId);
  return series;
};

ProblemSeries = function(options, wrapperDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.problemDisplay = undefined;
  this.iconBar = undefined;
  this.draw();
};

ProblemSeries.prototype = {
  draw: function() {
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, [.90], 'horizontal');
    this.options.divId = this.divInfo[0].id;
    this.problemDisplay = glift.widgets.basicProblem(this.options);

    // We want the icons to be bounded by the go board width, not the parent
    // container width.  Otherwise it looks super goofy.  Recall that margin is
    // applied to both sides, so we need to divide by 2.
    var margin = ($('#' +  this.divInfo[0].id).width() -
        this.problemDisplay.display.width()) / 2;
    this.iconBar = glift.displays.gui.iconBar({
      divId: this.divInfo[1].id,
      vertMargin:  5, // For good measure
      horzMargin: margin,
      icons:  ['chevron-left', 'refresh', 'chevron-right', 'roadmap',
          'small-gear']
    });
  },

  redraw: function() {
    // need special logic here for resetting state information.
    // this.destroy();
    // this.draw();
    return this;
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    return this;
  }
};
})();
