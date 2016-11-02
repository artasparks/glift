goog.provide('glift.displays.icons.IconSelector');

glift.displays.icons.iconSelector = function(parentDivId, iconBarDivId, icon) {
  return new glift.displays.icons.IconSelector(parentDivId, iconBarDivId, icon)
      .draw();
};

/**
 * Icon Selector class.
 *
 * @constructor
 * @package
 * @final
 */
glift.displays.icons.IconSelector = function(parentDivId, iconBarId, icon) {
  // The assumption is currently that there can only be one IconSelector.  This
  // may be incorrect, but it can easily be reevaluated later.
  this.iconBarId = iconBarId;
  this.parentDivId = parentDivId;
  this.icon = icon; // base icon.

  this.baseId = 'iconSelector_' + parentDivId;
  this.wrapperDivId = this.baseId + '_wrapper';

  this.displayedIcons = undefined; // defined on draw.

  // Div ids for the columns.
  this.columnIdList = [];
  // SVG data structures for each column.
  this.svgColumnList = []; // defined on draw. Single array.
  // list of columns rewraped icons.  Thus, a double array.
  this.iconList = [];
};

glift.displays.icons.IconSelector.prototype = {
  draw: function() {
    // TODO(kashomon): This needs to be cleaned up. It's currently quite the
    // mess.
    this.destroy();
    var that = this;
    var parentBbox = glift.displays.bboxFromDiv(this.parentDivId);

    var barElem = glift.dom.elem(this.iconBarId);
    var barPosLeft = barElem.boundingClientRect().left;

    var iconBarBbox = glift.displays.bboxFromDiv(this.iconBarId);
    var iconBbox = this.icon.bbox;
    var columnWidth = iconBbox.height();
    // This assumes that the iconbar is always on the bottom.
    var columnHeight = parentBbox.height() - iconBarBbox.height();
    var paddingPx = 5; // TODO(kashomon): Get from theme.
    var rewrapped = [];

    for (var i = 0; i < this.icon.associatedIcons.length; i++) {
      rewrapped.push(this.icon.associatedIcons[i].rewrapIcon());
    }

    var newWrapperDiv = glift.dom.newDiv(this.wrapperDivId);
    newWrapperDiv.css({
      position: 'absolute',
      height: parentBbox.height() + 'px',
      width: parentBbox.width() + 'px'
    });
    glift.dom.elem(this.parentDivId).append(newWrapperDiv);

    var columnIndex = 0;
    while (rewrapped.length > 0) {
      this.iconList.push([]);
      var columnId = this.baseId + '_column_' + columnIndex;
      this.columnIdList.push(columnId);

      var newColumnDiv = glift.dom.newDiv(columnId);
      newColumnDiv.css({
        bottom: iconBarBbox.height() + 'px',
        height: columnHeight + 'px',
        left: barPosLeft + columnIndex * iconBbox.width() + 'px',
        width: iconBbox.width() + 'px',
        position: 'absolute'
      });
      newWrapperDiv.append(newColumnDiv);

      var columnBox = glift.displays.bboxFromDiv(columnId);
      var transforms = glift.displays.icons.columnCenterWrapped(
          columnBox, rewrapped, paddingPx, paddingPx);

      var svgId = columnId + '_svg';
      var svg = glift.svg.svg()
          .setId(columnId + '_svg')
          .setAttr('height', '100%')
          .setAttr('width', '100%');
      var idGen = glift.displays.svg.ids.gen(columnId);
      var container = glift.svg.group().setId(idGen.iconGroup());
      svg.append(container);
      for (var i = 0, len = transforms.length; i < len; i++) {
        var icon = rewrapped.shift();
        var id = svgId + '_' + icon.iconName;
        icon.setElementId(id);
        this.iconList[columnIndex].push(icon);
        container.append(glift.svg.path()
            .setId(icon.elementId)
            .setAttr('d', icon.iconStr)
            .setAttr('fill', 'black') // replace with theme
            .setAttr('transform', icon.transformString()));
      }
      this.svgColumnList.push(svg);
      columnIndex++;
    }

    this._createIconButtons();
    this._setBackgroundEvent();
    for (var i = 0; i < this.svgColumnList.length; i++) {
      glift.displays.svg.dom.attachToParent(
          this.svgColumnList[i], this.columnIdList[i]);
    }
    return this;
  },

  _createIconButtons: function() {
    for (var i = 0; i < this.iconList.length; i++) {
      var svg = this.svgColumnList[i];
      var idGen = glift.displays.svg.ids.gen(this.columnIdList[i]);
      var iconColumn = this.iconList[i];
      var container = glift.svg.group().setId(idGen.buttonGroup());
      svg.append(container);
      for (var j = 0; j < iconColumn.length; j++) {
        var icon = iconColumn[j]
        container.append(glift.svg.rect()
          .setData(icon.iconName)
          .setAttr('x', icon.bbox.topLeft().x())
          .setAttr('y', icon.bbox.topLeft().y())
          .setAttr('width', icon.bbox.width())
          .setAttr('height', icon.bbox.height())
          .setAttr('fill', 'blue') // color doesn't matter, but need a fill
          .setAttr('opacity', 0)
          .setId(idGen.button(icon.iconName)));
      }
    }
  },

  _setBackgroundEvent: function() {
    var that = this;
    glift.dom.elem(this.wrapperDivId).on('click', function(e) {
      this.remove();
    });
    return this;
  },

  setIconEvents: function(eventName, func) {
    for (var i = 0; i < this.iconList.length; i++) {
      var idGen = glift.displays.svg.ids.gen(this.columnIdList[i]);
      for (var j = 0; j < this.iconList[i].length; j++) {
        var icon = this.iconList[i][j];
        var buttonId = idGen.button(icon.iconName);
        this._setOneEvent(eventName, buttonId, icon, func);
      }
    }
    return this;
  },

  _setOneEvent: function(eventName, buttonId, icon, func) {
    glift.dom.elem(buttonId).on(eventName, function(event) {
      func(event, icon);
    });
    return this;
  },

  destroy: function() {
    glift.dom.elem(this.wrapperDivId) &&
        glift.dom.elem(this.wrapperDivId).remove();
    return this;
  }
};
