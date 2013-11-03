(function() {
/**
 * Options:
 *    - divId (if need to create paper)
 *    - paper (if div already created)
 *    - bounding box (if paper already created)
 *    - icons (an array of icon names)
 *    - vertMargin (in pixels)
 *    - theme (default: DEFAULT)
 */
glift.displays.gui.iconBar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      vertMargin = options.vertMargin || 0,
      horzMargin = options.horzMargin || 0,
      themeName = options.theme || 'DEFAULT';
  if (divId === undefined) {
    throw "Must define an options 'divId' as an option";
  }
  for (var i = 0; i < icons.length; i++) {
    if (glift.displays.gui.icons[icons[i]] === undefined) {
      throw "Icon string undefined in glift.displays.gui.icons [" +
          icons[i] + "]";
    }
  }
  return new IconBar(divId, themeName, icons, vertMargin, horzMargin).draw();
};

var IconBar = function(divId, themeName, iconNames, vertMargin, horzMargin) {
  this.divId = divId;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.iconNames = iconNames; // array of names
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.events = {};
  this.newIconBboxes = {}; // initialized by draw
  this.svg = undefined; // initialized by draw
  this.tempIconIds = []; // from addTempIcon.
};

IconBar.prototype = {
  /**
   * Draw the IconBar!
   */
  draw: function() {
    this.destroy();
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svg = d3.select('#' + this.divId).append("svg")
            .attr("width", '100%')
            .attr("height", '100%'),
        gui = glift.displays.gui,
        iconBboxes = [],
        iconStrings = [],
        indicesData = [],
        point = glift.util.point;
    this.svg = svg;

    for (var i = 0; i < this.iconNames.length; i++) {
      var name = this.iconNames[i];
      var iconData = gui.icons[name];
      iconStrings.push(iconData.string);
      iconBboxes.push(glift.displays.bboxFromPts(
          point(iconData.bbox.x, iconData.bbox.y),
          point(iconData.bbox.x2, iconData.bbox.y2)));
      indicesData.push(i);
    }

    // Row center returns: { transforms: [...], bboxes: [...] }
    var centerObj = glift.displays.gui.rowCenter(
        divBbox, iconBboxes, this.vertMargin, this.horzMargin, 0, 0);
    for (var i = 0; i < centerObj.bboxes.length; i++) {
      this.newIconBboxes[this.iconNames[i]] = centerObj.bboxes[i];
    }

    var that = this;
    svg.selectAll('icons').data(indicesData)
      .enter().append('path')
        .attr('d', function(i) { return iconStrings[i]; })
        .attr('fill', this.theme.icons['DEFAULT'].fill)
        .attr('id', function(i) { return that.iconId(that.iconNames[i]); })
        .attr('transform', function(i) {
          return glift.displays.gui.scaleAndMoveString(
              centerObj.bboxes[i], centerObj.transforms[i]);
        });

    var bboxes = centerObj.bboxes;
    svg.selectAll('buttons').data(indicesData)
      .enter().append('rect')
        .attr('x', function(i) { return bboxes[i].topLeft().x(); })
        .attr('y', function(i) { return bboxes[i].topLeft().y(); })
        .attr('width', function(i) { return bboxes[i].width(); })
        .attr('height', function(i) { return bboxes[i].height(); })
        .attr('fill', 'blue') // doesn't matter the color.
        .attr('opacity', 0)
        .attr('_icon', function(i) { return that.iconNames[i]; })
        .attr('id', function(i) { return that.buttonId(that.iconNames[i]); });
    return this;
  },

  addTempIcon: function(bbox, iconName, color) {
    var icon = glift.displays.gui.icons[iconName];
    var iconBbox = glift.displays.bboxFromPts(
        glift.util.point(icon.bbox.x, icon.bbox.y),
        glift.util.point(icon.bbox.x2, icon.bbox.y2));
    var that = this;
    var id = that.iconId(iconName);
    var centerObj = glift.displays.gui.centerWithin(bbox, iconBbox, 2, 2);
    this.svg.append('path')
      .attr('d', icon.string)
      .attr('fill', color) // that.theme.icons['DEFAULT'].fill)
      .attr('id', that.iconId(iconName))
      .attr('class', 'tempIcon')
      .attr('transform', glift.displays.gui.scaleAndMoveString(
          centerObj.bbox, centerObj.transform));
    this.tempIconIds.push(id);
    return this;
  },

  addTempText: function(bbox, text, color) {
    var fontSize = bbox.width() * .54;
    var boxStrokeWidth = 7
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
      // .attr('textLength', bbox.width() - (2 * boxStrokeWidth) + 'px')
      .attr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    return this;
  },

  destroyTempIcons: function() {
    this.svg.selectAll('.tempIcon').remove();
    this.tempIconIds = [];
    return this;
  },

  /**
   * Get the Element ID of the Icon.
   */
  iconId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.ICON, iconName);
  },

  /**
   * Get the Element ID of the button.
   */
  buttonId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
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
    this.events[iconName] = func;
    d3.select('#' + that.buttonId(iconName))
      .on(event, function() { func(that.getIcon(iconName)); });
    return this;
  },

  /**
   * Force an event to be fired.
   */
  // TODO(kashomon): Based on the way widgets are structured now, we might be
  // able to remove this.
  forceEvent: function(iconName) {
    if (this.events[iconName] !== undefined) {
      this.events[iconName]();
    }
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
   * Return a simple object containing the
   *
   * {
   *  name: name of the icon
   *  iconId: the element id of the icon (for convenience)
   * }
   */
  getIcon: function(name) {
    return {
      name: name,
      iconId: this.iconId(name),
      newBbox: this.newIconBboxes[name]
    };
  },

  /**
   * Convenience method to loop over each icon, primarily for the purpose of
   * adding events.
   */
  forEachIcon: function(func) {
    for (var i = 0; i < this.iconNames.length; i++) {
      func(this.getIcon(this.iconNames[i]));
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && d3.select('#' + this.divId).selectAll("svg").remove();
    this.events = {};
    return this;
  }
};

})();
