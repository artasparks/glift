glift.displays.icons.iconSelector = function(parentDivId, iconBar, icon) {
  return new glift.displays.icons._IconSelector(parentDivId, iconBar, icon)
      .draw();
};

glift.displays.icons._IconSelector = function(parentDivId, iconBar, icon) {
  // The assumption is currently that there can only be one IconSelector.  This
  // may be incorrect, but it can easily be reevaluated later.
  this.baseId = 'iconSelector_' + parentDivId;
  this.iconBar = iconBar;
  this.parentDivId = parentDivId;
  this.icon = icon; // base icon.

  this.displayedIcons = undefined; // defined on draw.

  this.columnIdList = [];
  this.svgColumnList = []; // defined on draw.
};

glift.displays.icons._IconSelector.prototype = {
  draw: function() {
    this.destroy();
    var that = this;
    var svglib = glift.displays.svg;
    var parentBbox = glift.displays.bboxFromDiv(this.parentDivId);
    var iconBarBbox = this.iconBar.bbox;
    var iconBbox = this.icon.bbox;

    var columnWidth = iconBbox.width();
    // This assumes that the iconbar is always on the bottom.
    var columnHeight = parentBbox.height() - iconBarBbox.height();

    var paddingPx = 5;
    var rewrapped = [];

    for (var i = 0; i < this.icon.associatedIcons.length; i++) {
      rewrapped.push(this.icon.associatedIcons[i].rewrapIcon());
    }
    var $parentDiv = $('#' + this.parentDivId);

    var columnIndex = 0;
    while (rewrapped.length > 0) {
      var columnId = this.baseId + '_column_' + columnIndex;
      this.columnIdList.push(columnId);

      $parentDiv.append('<div id="' + columnId + '"></div>')
      $('#' + columnId).css({
        bottom: iconBarBbox.height(),
        height: columnHeight,
        left: (parentBbox.width() - iconBarBbox.width()) +
            columnIndex * iconBbox.width(),
        width: iconBbox.width(),
        position: 'absolute',
        background: '#CCCCCC'
      });

      var columnBox = glift.displays.bboxFromDiv(columnId);
      var transforms = glift.displays.icons.columnCenterWrapped(
          columnBox, rewrapped, paddingPx, paddingPx);

      var svgId = columnId + '_svg';
      var svg = svglib.svg()
          .attr('id', columnId + '_svg')
          .attr('height', '100%')
          .attr('width', '100%');
      for (var i = 0, len = transforms.length; i < len; i++) {
        var icon = rewrapped.shift();
        svg.append(svglib.path()
            .attr('d', icon.iconStr)
            .attr('fill', 'red')
            .attr('transform', icon.transformString())
            .attr('id', svgId + '_' + icon.iconName))
      }

      svg.attachToParent(columnId);
      this.svgColumnList.push(svg);
      columnIndex++;
    }
  },

  destroy: function() {
    $('#' + this.id).remove();
  }
};
