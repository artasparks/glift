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
  var paper = undefined,
      boundingBox = undefined,
      icons = [],
      vertMargin = 0,
      horzMargin = 0,
      theme = 'DEFAULT';
  // TODO(kashomon): Replace this hackiness with legitimate options code.  Much
  // better to keep this code from getting WETter ;).
  if (options.divId !== undefined) {
    paper = Raphael(options.divId, '100%', '100%');
    boundingBox = glift.displays.bboxFromDiv(options.divId);
  } else if (options.paper !== undefined && boundingBox !== undefined) {
    paper = options.paper;
    boundingBox = options.boundingBox;
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
    this.theme = options.theme;
  }

  for (var i = 0; i < icons.length; i++) {
    if (glift.displays.raphael.icons[icons[i]] === undefined) {
      throw "Icon string undefined in glift.displays.raphael.icons [" +
          icons[i] + "]";
    }
  }

  return new IconBar(paper, boundingBox, theme, icons, vertMargin, horzMargin)
      .draw();
};

var IconBar = function(
    paper, boundingBox, themeName, iconNames, vertMargin, horzMargin) {
  this.paper = paper;
  this.boundingBox = boundingBox;
  this.themeName = themeName;
  this.subTheme = glift.themes.get(themeName).icons;
  this.iconNames = iconNames;
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.iconObjects = {}; // init'd by draw
  this.iconButtons = {}; // init'd by draw
};

IconBar.prototype = {
  draw: function() {
    var raph = glift.displays.raphael, raphObjects = [];
    for (var i = 0; i < this.iconNames.length; i++) {
      var name = this.iconNames[i];
      var iconString = raph.icons[name];
      var obj = this.paper.path(iconString);
      if (this.subTheme[name] !== undefined) {
        obj.attr(this.subTheme[name]);
      } else {
        obj.attr(this.subTheme['DEFAULT']);
      }
      this.iconObjects[name] = obj;
      raphObjects.push(obj);
    }
    var bboxes = raph.getBboxes(raphObjects);
    var transforms = raph.rowCenter(
        this.boundingBox, bboxes, this.vertMargin, this.horzMargin, 0, 0).transforms;
    raph.applyTransforms(transforms, raphObjects);

    // Create the buttons (without handlers.
    for (var key in this.iconObjects) {
      this.iconButtons[key] = glift.displays.raphael.button(
          this.paper, {name: name}, this.iconObjects[key]);
    }
    return this;
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
    this.forEachIcon(function(icon) {
      icon.obj.remove();
      icon.button.destroy(); // Destroys handlers also.
    });
    this.iconObjects = {};
    this.iconButtons = {};
    return this;
  }
};

})();
