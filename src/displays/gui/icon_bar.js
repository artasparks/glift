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
      icons = [],
      vertMargin = 0,
      horzMargin = 0
      themeName = 'DEFAULT';

  // TODO(kashomon): Replace this hackiness with legitimate options code.  Much
  // better to keep this code from getting WETter.
  if (divId === undefined) {
    throw "Must define 'divId' as an option"
  }

  if (options.icons !== undefined) {
    icons = options.icons;
  }

  if (options.vertMargin !== undefined) {
    vertMargin = options.vertMargin;
  }

  if (options.horzMargin !== undefined) {
    horzMargin = options.horzMargin;
  }

  if (options.theme !== undefined) {
    this.themeName = options.theme;
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
};

IconBar.prototype = {
  /**
   * Draw the IconBar!
   */
  draw: function() {
    this.destroy();
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svg = d3.select('#' + this.divId).append("svg")
            // TODO(kashomon): Make height / width directly configurable.
            .attr("width", '100%')
            .attr("height", '100%'),
        gui = glift.displays.gui,
        iconBboxes = [],
        iconStrings = [],
        indicesData = [],
        point = glift.util.point;

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

    var that = this;
    svg.selectAll('icons').data(indicesData)
      .enter().append('path')
        .attr('d', function(i) { return iconStrings[i]; })
        .attr('fill', this.theme.icons['DEFAULT'].fill)
        .attr('id', function(i) { return that.iconId(that.iconNames[i]); })
        .attr('transform', function(i) {
          return glift.displays.gui.scaleAndMoveString(
              centerObj.bboxes[i],
              centerObj.transforms[i]);
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
      iconId: this.iconId(name)
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
