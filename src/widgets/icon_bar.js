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
      theme = 'DEFAULT'
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

  if (options.theme !== undefined) {
    this.theme = options.theme;
  }

  for (var i = 0; i < icons.length; i++) {
    if (glift.displays.raphael.icons[icons[i]] === undefined) {
      throw "Icon string undefined in glift.displays.raphael.icons [" +
          icons[i] + "]";
    }
  }

  return new IconBar(paper, boundingBox, theme, icons, vertMargin).init();
};

var IconBar = function(paper, boundingBox, themeName, iconNames, vertMargin) {
  this.paper = paper;
  this.boundingBox = boundingBox;
  this.themeName = themeName;
  this.subTheme = glift.themes.get(themeName).icons;
  this.iconNames = iconNames;
  this.vertMargin = vertMargin;
  this.iconObjects = {}; // init'd by init;
  this.iconButtons = {};
};

IconBar.prototype = {
  init: function() {
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
        this.boundingBox, bboxes, this.vertMargin, 0, 0, 0);
    raph.applyTransforms(transforms, raphObjects);

    // Create the buttons, now that the icons have been resized.
    for (var key in this.iconObjects) {
      var icon = this.iconObjects[key];
      var button = glift.displays.raphael.button(this.paper, icon);
      (function() {
        // Hack to avoid lazy binding.
        var thiskey = key
        button.setHover(
            function() { console.log('in: ' + thiskey) },
            function() { console.log('out: ' + thiskey) });
      })()
      this.iconButtons[name] = button;
    }
    return this;
  },

  attachHandler: function(name, handler) {
    // TODO(kashomon): Add handler attaching for button purposes.
  }
};

})();
