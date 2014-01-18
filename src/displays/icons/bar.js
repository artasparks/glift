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
  this.idGen = glift.displays.ids.generator(this.divId);


  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      icon: <wrappedIcon>,
  //      func: func
  //    }
  //  }
  //
  // Note that the funcs take two parameters: event and icon.
  this.events = {};

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
      icon.setElementId(that.idGen.icon(icon.iconName));
    });
  },

  draw: function() {
    this.destroy();
    var svglib = glift.displays.svg;
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svglib.svg()
      .attr("width", '100%')
      .attr("height", '100%');
    glift.displays.icons.rowCenterWrapped(
        divBbox, this.icons, this.vertMargin, this.horzMargin)
    this._createIcons();
    this._createIconButtons();
    this.flush();
    return this;
  },

  flush: function() {
    $('#' + this.divId).html(this.svg.render());
    this.flushEvents();
  },

  flushEvents: function() {
    var container = this.svg.child(this.idGen.buttonGroup());
    var that = this;
    for (var buttonId_event in this.events) {
      var splat = buttonId_event.split('#');
      var buttonId = splat[0];
      var eventName = splat[1];
      if (container.child(buttonId) !== undefined) {
        var eventObj = this.events[buttonId_event];
        this._flushOneEvent(buttonId, eventName, eventObj);
      }
    }
  },

  _flushOneEvent: function(buttonId, eventName, eventObj) {
    $('#' + buttonId).on(eventName, function(event) {
        eventObj.func(event, eventObj.icon);
    });
  },

  _createIcons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(svglib.group().attr('id', this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      container.append(svglib.path()
        .attr('d', icon.iconStr)
        .attr('fill', this.theme.icons['DEFAULT'].fill)
        .attr('id', icon.elementId)
        .attr('transform', icon.transformString()));
    }
  },

  _createIconButtons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      container.append(svglib.rect()
        .data(icon.iconName)
        .attr('x', icon.bbox.topLeft().x())
        .attr('y', icon.bbox.topLeft().y())
        .attr('width', icon.bbox.width())
        .attr('height', icon.bbox.height())
        .attr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .attr('opacity', 0)
        .attr('id', this.idGen.button(icon.iconName)));
    }
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
    var svglib = glift.displays.svg;
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

    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.path()
      .attr('d', tempIcon.iconStr)
      .attr('fill', color) // that.theme.icons['DEFAULT'].fill)
      .attr('id', this.idGen.tempIcon(tempIcon.iconName))
      .attr('transform', tempIcon.transformString()));

    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, color) {
    var svglib = glift.displays.svg;
    var bbox = this.getIcon(iconName).bbox;
    var fontSize = bbox.width() * .54;
    var id = this.idGen.tempIconText(iconName);
    var boxStrokeWidth = 7
    this.clearTempText(iconName);
    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.text()
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
      .attr('id', this.idGen.tempIconText(iconName))
      .attr('lengthAdjust', 'spacing')); // also an opt: spacingAndGlyphs
    return this;
  },

  clearTempText: function(iconName) {
    this.svg.rmChild(this.idGen.tempIconText(iconName));
    $('#' + this.idGen.tempIconText(iconName)).remove();
  },

  createIconSelector: function(baseIcon, icons) {
    // TODO(kashomon): Implement
  },

  destroyIconSelector: function() {
    // TODO(kashomon): Implement
  },

  destroyTempIcons: function() {
    this.svg.child(this.idGen.tempIconGroup()).emptyChildren();
    return this;
  },

  /** Get the Element ID of the button. */
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
  setEvent: function(iconName, event, func) {
    var button = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.button(iconName));
    var id = button.attr('id');
    var name = button.data();
    var icon = this.nameMapping[name];
    this._setEvent(id, icon, event, func);
    return this;
  },

  /** Similar to setEvent, but grab the icon based on the index. */
  setEventIndexedIcon: function(index, event, func) {
    var icon = this.icons[index]
    if (icon === undefined) { return this; }
    var buttonId = this.idGen.button(icon.iconName);
    this._setEvent(buttonId, icon, event, func);
    return this;
  },

  _setEvent: function(buttonId, icon, event, func) {
    var id = buttonId + '#' + event;
    this.events[id] = { icon: icon, func: func };
    return this;
  },

  /**
   * Convenience mothod for adding hover events.  Equivalent to adding mouseover
   * and mouseout.
   */
  setHover: function(name, hoverin, hoverout) {
    this.setEvent(name, 'mouseover', hoverin);
    this.setEvent(name, 'mouseout', hoverout);
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
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      func(this.icons[i]);
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && $('#' + this.divId).empty();
    this.bbox = undefined;
    return this;
  }
};
