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
  this.icon = icon;
  this.displayedIcons = undefined; // defined on draw.
};

glift.displays.icons._IconSelector.prototype = {
  draw: function() {
    // TODO(kashomon): This method is a huge pile of prototyping crapola and
    // needs to be significantly refactored.
    var that = this;
    this.destroy();
    var parentBbox = glift.displays.bboxFromDiv(this.parentDivId);
    var iconBarBbox = this.iconBar.bbox;
    var iconBbox = this.icon.bbox;

    // Width of the column = width of the base icon.
    var columnWidth = iconBbox.width();
    // This assumes that the iconbar is always on the bottom.
    var columnHeight = parentBbox.height() - iconBarBbox.height();
    var padding = 5; // px
    var rewrapped = [];

    for (var i = 0; i < this.icon.associatedIcons.length; i++) {
      rewrapped.push(this.icon.associatedIcons[i].rewrapIcon());
    }
    var $parentDiv = $('#' + this.parentDivId);

    var columnId = this.baseId + '_column_1';

    $parentDiv.append('<div id="' + columnId + '"></div>')
    var $columnDiv = $('#' + columnId);

    $columnDiv.css({
      bottom: iconBarBbox.height(),
      height: columnHeight,
      left: parentBbox.width() - iconBarBbox.width(),
      width: iconBbox.width(),
      position: 'absolute',
      background: '#CCCCCC'
    });

    var columnBox = glift.displays.bboxFromDiv(columnId);

    var transforms = glift.displays.icons.columnCenterWrapped(
        columnBox, rewrapped, 5, 5);

    var svgId = columnId + '_svg'
    $columnDiv.append('<svg width="100%" height="100%" id="'
        + svgId + '"></svg>');
    var $svg = $('#' + svgId);
    var buffer = "";
    for (var i = 0; i < transforms.length; i++) {
      var icon = rewrapped[i];
      buffer += '<path '
        + 'd="' + icon.iconStr + '" '
        + 'fill="red"'
        + 'transform="' + icon.transformString() + '" '
        + '></path>\n';
    }

    $svg.append(buffer);
    $('#' + columnId).html($('#' + columnId).html());
  },

  destroy: function() {
    $('#' + this.id).remove();
  }
};
