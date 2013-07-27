(function() {
glift.widgets.gameViewer = function(options) {
  var divId = '' + (options.divId || 'glift_display');
  return new GameViewer(options, divId).draw();
};

GameViewer = function(options, wrapperDiv) {
  this.options = options;
  this.wrapperDiv = wrapperDiv;
  this.gameDisplay = undefined;
  this.commentDisplay = undefined;
  this.iconBar = undefined;
};

GameViewer.prototype = {
  draw: function() {
    this.divInfo = glift.displays.gui.splitDiv(
        this.wrapperDiv, [.80], 'horizontal');
    this.options.divId = this.divInfo[0].id;
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
  }
};

})();
