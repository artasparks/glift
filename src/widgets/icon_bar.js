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
glift.widgets.iconBar = function(options) {
  var divId = options.divId,
      icons = [],
      vertMargin = 0,
      horzMargin = 0,
      themeName = 'DEFAULT';

  // TODO(kashomon): Replace this hackiness with legitimate options code.  Much
  // better to keep this code from getting WETter ;).
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
  this.iconNames = iconNames;
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.iconObjects = {}; // init'd by draw
  this.iconButtons = {}; // init'd by draw
};

IconBar.prototype = {
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

    svg.selectAll('icons').data(indicesData)
        .enter().append('path')
            .attr('d', function(i) { return iconStrings[i] })
            .attr('fill', this.theme.icons['DEFAULT'].fill)
            .attr('transform', function(i) {
              return glift.displays.gui.scaleAndMoveString(
                  centerObj.bboxes[i],
                  centerObj.transforms[i]);
            });
    // TODO(kashomon): Create buttons
    return this;
  },

  iconId: function(iconName) {
    return this.divId + '_' + iconName
  },

  setHover: function(name, hoverin, hoverout) {
    this.iconButtons[name].setMouseOver(hoverin).setMouseOut(hoverout);
  },

  setClick: function(name, mouseDown, mouseUp) {
    this.iconButtons[name].setClick(mouseDown, mouseUp);
  },

  getIcon: function(name) {
    return {
      name: name,
      obj: this.iconObjects[name],
      button: this.iconButtons[name]
    };
  },

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
    this.iconObjects = {};
    this.iconButtons = {};
    return this;
  }
};

})();
