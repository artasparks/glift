/**
 * Options:
 *    - divId: the divId for this object
 *    - positioning: bounding box for the bar
 *    - parentBox: bounding box for the parent widget
 *    - icons: an array of icon names)
 *    - vertMargin: in pixels
 *    - horzMargin: in pixels
 *    - theme: The theme. default is the DEFAULT theme, of course
 */
glift.displays.icons.bar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      theme = options.theme,
      pbox = options.parentBbox,
      position = options.positioning,
      allDivIds = options.allDivIds,
      allPositioning = options.allPositioning;
  if (!theme) {
    throw new Error("Theme undefined in iconbar");
  }
  if (!divId) {
    throw new Error("Must define an options 'divId' as an option");
  }
  return new glift.displays.icons._IconBar(
      divId, position, icons, pbox, theme, allDivIds, allPositioning);
};

glift.displays.icons._IconBar = function(
    divId, position, iconsRaw, parentBbox, theme,
    allDivIds, allPositioning) {
  this.divId = divId;
  this.position = position;
  this.divBbox = glift.displays.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(position.width(), position.height()));
  this.theme = theme;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = parentBbox;
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(iconsRaw);

  // The positioning information for all divs.
  this.allDivIds = allDivIds;
  this.allPositioning = allPositioning;

  // Map of icon name to icon object. initialized with _initNameMapping
  // TODO(kashomon): Make this non-side-affecting.
  this.nameMapping = {};

  this.vertMargin = this.theme.icons.vertMargin;
  this.horzMargin = this.theme.icons.horzMargin;
  this.svg = undefined; // initialized by draw
  this.idGen = glift.displays.ids.generator(this.divId);

  // Data related to tool tips.
  this.tooltipTimer = undefined;
  this.tooltipId = undefined;

  // Post constructor initializiation
  this._initIconIds(); // Set the ids for the icons above.
  this._initNameMapping(); // Init the name mapping.
};

glift.displays.icons._IconBar.prototype = {
  _initNameMapping: function() {
    this.forEachIcon(function(icon) {
      this.nameMapping[icon.iconName] = icon;
    }.bind(this));
  },

  _initIconIds: function() {
    this.forEachIcon(function(icon) {
      icon.setElementId(this.idGen.icon(icon.iconName));
    }.bind(this));
  },

  draw: function() {
    this.destroy();
    var svglib = glift.displays.svg;
    var divBbox = this.divBbox,
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svglib.svg()
      .attr('width', '100%')
      .attr('height', '100%');
    glift.displays.icons.rowCenterWrapped(
        divBbox, this.icons, this.vertMargin, this.horzMargin)
    this._createIcons();
    this._createIconButtons();
    this.flush();
    return this;
  },

  /**
   * Actually draw the icon.
   */
  _createIcons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(svglib.group().attr('id', this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      var path = svglib.path()
        .attr('d', icon.iconStr)
        .attr('id', icon.elementId)
        .attr('transform', icon.transformString());
      for (var key in this.theme.icons.DEFAULT) {
        path.attr(key, this.theme.icons.DEFAULT[key]);
      }
      container.append(path);
    }
  },

  /**
   * We draw transparent boxes around the icon to use for touch events.  For
   * complicated icons, it turns out to be obnoxious to try to select the icon.
   */
  _createIconButtons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, len = this.icons.length; i < len; i++) {
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

  // TODO(kashomon): Delete this flush nonsense.  It's not necessary for the
  // iconbar.
  flush: function() {
    this.svg.attachToParent(this.divId);
    var multi = this.getIcon('multiopen');
    if (multi !== undefined) {
      this.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
    }
  },

  /**
   * Add a temporary associated icon and center it.  If the parentIcon has a
   * subbox specified, then use that.  Otherwise, just center within the
   * parent icon's bbox.
   *
   * If the tempIcon is specified as a string, it is wrapped first.
   */
  setCenteredTempIcon: function(
      parentIconNameOrIndex, tempIcon, color, vMargin, hMargin) {
    // Move these defaults into the Theme.
    var svglib = glift.displays.svg;
    var hm = hMargin || 2,
        vm = vMargin || 2;
    var parentIcon = this.getIcon(parentIconNameOrIndex);
    if (glift.util.typeOf(tempIcon) === 'string') {
      tempIcon = glift.displays.icons.wrappedIcon(tempIcon);
    } else {
      tempIcon = tempIcon.rewrapIcon();
    }
    var tempIconId = this.idGen.tempIcon(parentIcon.iconName);

    // Remove if it exists.
    glift.dom.elem(tempIconId) && glift.dom.elem(tempIconId).remove();

    if (parentIcon.subboxIcon !== undefined) {
      tempIcon = parentIcon.centerWithinSubbox(tempIcon, vm, hm);
    } else {
      tempIcon = parentIcon.centerWithinIcon(tempIcon, vm, hm);
    }

    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.path()
      .attr('d', tempIcon.iconStr)
      .attr('fill', color) // theme.icons.DEFAULT.fill
      .attr('id', tempIconId)
      .attr('transform', tempIcon.transformString()));
    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, attrsObj, textMod) {
    var svglib = glift.displays.svg;
    var icon = this.getIcon(iconName);
    var bbox = icon.bbox;
    if (icon.subboxIcon) {
      bbox = icon.subboxIcon.bbox;
    }
    // TODO(kashomon): Why does this constant work?  Replace the 0.50 nonsense
    // with something more sensible.
    var textMultiplier = textMod || 0.50;
    var fontSize = bbox.width() * textMultiplier;
    var id = this.idGen.tempIconText(iconName);
    var boxStrokeWidth = 7
    this.clearTempText(iconName);
    var textObj = svglib.text()
      .text(text)
      .attr('class', 'tempIcon')
      .attr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .attr('font-size', fontSize + 'px')
      .attr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .attr('y', bbox.center().y()) //+ fontSize)
      .attr('dy', '.33em') // Move down, for centering purposes
      .attr('style', 'text-anchor: middle; vertical-align: middle;')
      .attr('id', this.idGen.tempIconText(iconName))
      .attr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    for (var key in attrsObj) {
      textObj.attr(key, attrsObj[key]);
    }
    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(textObj);
    return this;
  },

  clearTempText: function(iconName) {
    var iconId = this.idGen.tempIconText(iconName);
    this.svg.rmChild(iconId);
    var el = glift.dom.elem(iconId);
    el && el.remove();
  },

  createIconSelector: function(baseIcon, icons) {
    // TODO(kashomon): Implement
  },

  destroyIconSelector: function() {
    // TODO(kashomon): Implement
  },

  destroyTempIcons: function() {
    this.svg.child(this.idGen.tempIconGroup()).emptyChildrenAndUpdate();
    return this;
  },

  /** Get the Element ID of the button. */
  buttonId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
  },

  /**
   * Initialize the icon actions.  These actions are received at widget-creation
   * time.
   */
  initIconActions: function(parentWidget, iconActions) {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    this.forEachIcon(function(icon) {
      var iconName = icon.iconName;
      if (!iconActions.hasOwnProperty(icon.iconName)) {
        // Make sure that there exists an action specified in the
        // displayOptions, before we add any options.
        return
      }
      var actionsForIcon = {};

      if (glift.platform.isMobile()) {
        actionsForIcon.touchend = iconActions[iconName].click;
      } else {
        actionsForIcon.click = iconActions[iconName].click;
      }

      // Add hover events for non-mobile browsers.
      if (!glift.platform.isMobile()) {
        actionsForIcon.mouseover = iconActions[iconName].mouseover ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId);
            var theme = widgetRef.iconBar.theme.icons;
            for (var key in theme.DEFAULT_HOVER) {
              elem.attr(key, theme.DEFAULT_HOVER[key]);
            }
          };
        actionsForIcon.mouseout = iconActions[iconName].mouseout ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId)
            if (elem) { // elem can be null during transitions.
              var theme = widgetRef.iconBar.theme.icons;
              for (var key in theme.DEFAULT) {
                elem.attr(key, theme.DEFAULT[key]);
              }
            }
          };
      }
      for (var eventName in actionsForIcon) {
        var eventFunc = actionsForIcon[eventName];
        // We init each action separately so that we avoid the lazy binding of
        // eventFunc.
        this._initOneIconAction(parentWidget, icon, eventName, eventFunc);
      }

      // Initialize tooltips.  Not currently supported for mobile.
      if (iconActions[iconName].tooltip &&
          !glift.platform.isMobile()) {
        this._initializeTooltip(icon, iconActions[iconName].tooltip)
      }
    }.bind(this));
  },

  _initOneIconAction: function(parentWidget, icon, eventName, eventFunc) {
    var buttonId = this.idGen.button(icon.iconName);
    glift.dom.elem(buttonId).on(eventName, function(event) {
      if (eventName === 'click' && this.tooltipTimer) {
        // Prevent the tooltip from appearing.
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = null;
      }
      if (this.tooltipId) {
        // Clear the tool tip div if it exists
        glift.dom.elem(this.tooltipId) &&
            glift.dom.elem(this.tooltipId).remove();
        this.tooltipId = null;
      }

      // We've interacted with this widget.  Set this widget as active for the
      // purposes of key presses.
      parentWidget.manager.setActive();
      eventFunc(event, parentWidget, icon, this);
    }.bind(this));
  },

  /** Initialize the icon tooltips. */
  _initializeTooltip: function(icon, tooltip) {
    var tooltipId = this.divId + '_tooltip';
    var id = this.idGen.button(icon.iconName);
    glift.dom.elem(id).on('mouseover', function(e) {
      var tooltipTimerFunc = function() {
        var newDiv = glift.dom.newDiv(tooltipId);
        newDiv.appendText(tooltip);
        var baseCssObj = {
          position: 'absolute',
          top: -1.2 * (icon.bbox.height()) + 'px',
          'z-index': 2,
          boxSizing: 'border-box'
        };
        for (var key in this.theme.icons.tooltips) {
          baseCssObj[key] = this.theme.icons.tooltips[key];
        }
        newDiv.css(baseCssObj);
        var elem = glift.dom.elem(this.divId);
        if (elem) {
          // Elem can be null if we've started the time and changed the state.
          elem.append(newDiv);
          this.tooltipId = tooltipId;
        }
        this.tooltipTimer = null;
      }.bind(this);
      this.tooltipTimer = setTimeout(
          tooltipTimerFunc, this.theme.icons.tooltipTimeout);
    }.bind(this));
    glift.dom.elem(id).on('mouseout', function(e) {
      if (this.tooltipTimer != null) {
        clearTimeout(this.tooltipTimer);
      }
      this.tooltipTimer = null;
      // Remove if it exists.
      glift.dom.elem(tooltipId) && glift.dom.elem(tooltipId).remove();
    }.bind(this));
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
  // TODO(kashomon): Add test
  hasIcon: function(name) {
    return this.nameMapping[name] !== undefined;
  },

  /**
   * Return a wrapped icon.
   */
  getIcon: function(nameOrIndex) {
    var itype = glift.util.typeOf(nameOrIndex);
    if (itype === 'string') {
      return this.nameMapping[nameOrIndex];
    } else if (itype === 'number') {
      return this.icons[nameOrIndex];
    } else {
      return undefined;
    }
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
    this.divId && glift.dom.elem(this.divId) && glift.dom.elem(this.divId).empty();
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.bbox = undefined;
    return this;
  }
};
