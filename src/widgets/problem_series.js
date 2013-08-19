(function() {
glift.widgets.problemSeries = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  var urls = options.urls || [];
  var series = new ProblemSeries(options, divId);
  return series.draw();
};

ProblemSeries = function(options, wrapperDiv) {
  this.options = options;
  this.urls = options.urls;
  this.index = 0;
  this.wrapperDiv = wrapperDiv;
  this.problemDisplay = undefined;
  this.iconBar = undefined;
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
    this.initIconHandlers();
    return this;
  },

  initProblem: function() {
  },

  initIconHandlers: function() {
    var that = this;
    this.iconBar.forEachIcon(function(icon) {
      that.iconBar.setEvent('mouseover', icon.name, function() {
        d3.select('#' + icon.iconId)
            .attr('fill', 'red');
      }).setEvent('mouseout', icon.name, function() {
        d3.select('#' + icon.iconId)
            .attr('fill', that.iconBar.theme.icons.DEFAULT.fill);
      });
    });

    this.iconBar.setEvent('click', 'arrowright', function() {
      this.index = this.index++;
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
