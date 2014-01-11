/**
 * Options:
 *    - divId (if need to create paper)
 *    - paper (if div already created)
 *    - bounding box (if paper already created)
 *    - icons (an array of icon names)
 *    - vertMargin (in pixels)
 *    - theme (default: DEFAULT)
 */
glift.displays.icons.bar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      vertMargin = options.vertMargin || 0,
      horzMargin = options.horzMargin || 0,
      themeName = options.theme || 'DEFAULT',
      pbox = options.parentBbox;
  if (divId === undefined) {
    throw "Must define an options 'divId' as an option";
  }
  return new glift.displays.icons._IconBar(
      divId, themeName, icons, vertMargin, horzMargin, pbox).draw();
};

glift.displays.icons._IconBar = function(
    divId, themeName, iconsRaw, vertMargin, horzMargin, parentBbox) {
  this.divId = divId;
  this.themeName = themeName;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = parentBbox;
  this.theme = glift.themes.get(themeName);
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(iconsRaw);
  this.nameMapping = {};
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.svg = undefined; // initialized by draw
  this.divBbox = undefined; // initialized by draw

  this.ICON_CONTAINER = "IconBarIconContainer";
  this.BUTTON_CONTAINER = "IconBarButtonContainer";
  this.TEMP_ICON_CLASS = "IconBarTempIcon";

  // Post constructor initializiation
  this._initIconIds(); // Set the ids for the icons above.
  this._initNameMapping(); // Init the name mapping.
};

glift.displays.icons._IconBar.prototype = {
  _initNameMapping: function() {
    var that = this;
    this.forEachIcon(function(icon) {
      that.nameMapping[icon.iconName] = icon;
    });
  },

  _initIconIds: function() {
    var that = this;
    this.forEachIcon(function(icon) {
      var elementId = that.iconId(icon.iconName);
      icon.setElementId(elementId);
    });
  },

  draw: function() {
    this.destroy();
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svg = d3.select('#' + this.divId).append("svg:svg")
          .attr("width", '100%')
          .attr("height", '100%'),
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svg;
    glift.displays.icons.rowCenterWrapped(
        divBbox, this.icons, this.vertMargin, this.horzMargin)
    this._createIcons();
    this._createIconButtons();
    return this;
  },

  _createIcons: function() {
    var that = this;
    var group = this.svg.append("svg:g")
    group.attr('id', this.ICON_CONTAINER);
    group.selectAll('icons_toadd').data(this.icons).enter()
      .append('path')
        .attr('d', function(icon) { return icon.iconStr; })
        .attr('fill', that.theme.icons['DEFAULT'].fill)
        .attr('id', function(icon) { return icon.elementId; })
        .attr('transform', function(icon) { return icon.transformString(); });
  },

  _createIconButtons: function() {
    var that = this;
    // this.svg.selectAll(this.BUTTON_CONTAINER).data([1]) // dummy data;
      // .enter().append("g").attr('class', this.BUTTON_CONTAINER);
    this.svg.selectAll('buttons').data(this.icons)
      .enter().append('rect')
        .attr('x', function(icon) { return icon.bbox.topLeft().x(); })
        .attr('y', function(icon) { return icon.bbox.topLeft().y(); })
        .attr('width', function(icon) { return icon.bbox.width(); })
        .attr('height', function(icon) { return icon.bbox.height(); })
        .attr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .attr('opacity', 0)
        .attr('_icon', function(icon) { return icon.iconName; })
        .attr('id', function(icon) { return that.buttonId(icon.iconName); });
  },

  /**
   * Add a temporary associated icon and center it.  If the parentIcon has a
   * subbox specified, then use that.  Otherwise, just center within the
   * parent icon's bbox.
   *
   * If the tempIcon is specified as a string, it is wrapped first.
   */
  addCenteredTempIcon: function(
      parentIconName, tempIcon, color, vMargin, hMargin) {
    // Move these defaults into the Theme.
    var hm = hMargin || 2,
        vm = vMargin || 2;
    var parentIcon = this.nameMapping[parentIconName];
    if (glift.util.typeOf(tempIcon) === 'string') {
      tempIcon = glift.displays.icons.wrappedIcon(tempIcon);
    }

    if (parentIcon.subboxIcon !== undefined) {
      tempIcon = parentIcon.centerWithinSubbox(tempIcon, vm, hm);
    } else {
      tempIcon = parentIcon.centerWithinIcon(tempIcon, vm, hm);
    }
    tempIcon.setElementId(this.iconId(tempIcon.iconName));
    this.svg.select('#' + this.ICON_CONTAINER).append('path')
      .attr('d', tempIcon.iconStr)
      .attr('fill', color) // that.theme.icons['DEFAULT'].fill)
      .attr('id', tempIcon.elementId)
      .attr('class', this.TEMP_ICON_CLASS)
      .attr('transform', tempIcon.transformString());
    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, color) {
    // TODO(kashomon): Remove this hack.
    var bbox = this.getIcon(iconName).bbox;
    var fontSize = bbox.width() * .54;
    var id = this.tempTextId(iconName);
    var boxStrokeWidth = 7
    this.clearTempText(iconName);
    this.svg.append('text')
      .text(text)
      .attr('fill', color)
      .attr('stroke', color)
      .attr('class', 'tempIcon')
      .attr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .attr('font-size', fontSize + 'px')
      .attr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .attr('y', bbox.center().y()) //+ fontSize)
      .attr('dy', '.33em') // Move down, for centering purposes
      .attr('style', 'text-anchor: middle; vertical-align: middle;')
      .attr('id', id)
      .attr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    return this;
  },

  clearTempText: function(iconName) {
    this.svg.select('#' + this.tempTextId(iconName)).remove();
  },

  createIconSelector: function(baseIcon, icons) {

  },

  clearIconSelector: function() {

  },

  destroyTempIcons: function() {
    this.svg.selectAll('.' + this.TEMP_ICON_CLASS).remove();
    return this;
  },

  /** Get the Element ID of the Icon. */
  iconId: function(iconName) {
    return this.divId + '_' + glift.enums.svgElements.ICON + '_' + iconName
      + '_' + glift.util.idGenerator.next();
  },

  /** Get the Element ID of the button. */
  buttonId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
  },

  tempTextId: function(iconName) {
    return this.divId +  '_' + iconName + '_temptext'
  },

  /**
   * Assign an event handler to the icon named with 'iconName'.  Note, that the
   * function 'func' will always be sent the object resulting from getIcon,
   * namely,
   *
   * {
   *  name: name of the icon
   *  iconId: the element id of the icon (for convenience).
   * }
   */
  setEvent: function(event, iconName, func) {
    var that = this; // not sure if this is necessary
    d3.select('#' + this.buttonId(iconName)).on(event, function() {
      func(that.getIcon(iconName));
    });
    return this;
  },

  /** Similar to setEvent, but grab the icon based on the index. */
  setEventIndexedIcon: function(event, index, func) {
    var ic = this.icons[index]
    if (ic === undefined) {
      return this;
    }
    // Note that this means that the icon resolution happens at at the time of
    // event creation.
    d3.select('#' + this.buttonId(ic.iconName)).on(event, function() {
      func(ic);
    });
    return this;
  },

  /**
   * Convenience mothod for adding hover events.  Equivalent to adding mouseover
   * and mouseout.
   */
  setHover: function(name, hoverin, hoverout) {
    this.setEvent('mouseover', name, hoverin);
    this.setEvent('mouseout', name, hoverout);
  },

  /**
   * Return whether the iconBar has instantiated said icon or not
   */
  hasIcon: function(name) {
    return this.newIconBboxes[name] === undefined;
  },

  /**
   * Return a wrapped icon.
   */
  getIcon: function(name) {
    return this.nameMapping[name];
  },

  /**
   * Return a index
   */
  getIconFromIndex: function(index) {
    return this.icons[index || 0];
  },

  /**
   * Convenience method to loop over each icon, primarily for the purpose of
   * adding events.
   */
  forEachIcon: function(func) {
    for (var i = 0; i < this.icons.length; i++) {
      func(this.icons[i]);
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && d3.select('#' + this.divId).selectAll("svg").remove();
    this.svg = undefined;
    this.bbox = undefined;
    return this;
  }
};
