goog.provide('glift.displays.icons.bar');
goog.provide('glift.displays.icons.IconBar');
goog.provide('glift.displays.icons.IconBarOptions');

/**
 * Some Notes:
 *  - divId: the divId for this object
 *  - positioning: bounding box for the bar
 *  - parentBox: bounding box for the parent widget
 *  - icons: an array of icon names)
 *  - vertMargin: in pixels
 *  - horzMargin: in pixels
 *  - theme: The theme. default is the DEFAULT theme, of course
 *
 * @typedef {{
 *  divId: string,
 *  icons: !Array<string>,
 *  theme: !glift.themes.base,
 *  positioning: !glift.orientation.BoundingBox,
 *  parentBbox: !glift.orientation.BoundingBox,
 *  allDivIds: !Object<string, string>,
 *  allPositioning: !glift.displays.position.WidgetBoxes
 * }}
 */
glift.displays.icons.IconBarOptions;


/**
 * @param {!glift.displays.icons.IconBarOptions} options
 * @return {!glift.displays.icons.IconBar}
 */
glift.displays.icons.bar = function(options) {
  return new glift.displays.icons.IconBar(options);
};

/**
 * IconBar Object
 *
 * @constructor @struct @final
 * @param {!glift.displays.icons.IconBarOptions} options
 */
glift.displays.icons.IconBar = function(options) {
  if (!options.theme) {
    throw new Error("Theme undefined in iconbar");
  }
  if (!options.divId) {
    throw new Error("Must define an options 'divId' as an option");
  }
  this.divId = options.divId;
  this.position = options.positioning;
  this.divBbox = glift.orientation.bbox.fromPts(
      glift.util.point(0,0),
      glift.util.point(this.position.width(), this.position.height()));
  this.theme = options.theme;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = options.parentBbox;
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(options.icons);

  // The positioning information for all divs.
  this.allDivIds = options.allDivIds;
  this.allPositioning = options.allPositioning;

  // Map of icon name to icon object. initialized with _initNameMapping
  // TODO(kashomon): Make this non-side-affecting.
  this.nameMapping = {};

  this.vertMargin = this.theme.icons.vertMargin;
  this.horzMargin = this.theme.icons.horzMargin;
  this.svg = undefined; // initialized by draw
  this.idGen = glift.displays.svg.ids.gen(this.divId);

  // Data related to tool tips.
  this.tooltipTimer = undefined;
  this.tooltipId = undefined;

  // Post constructor initializiation
  this.initIconIds_(); // Set the ids for the icons above.
  this.initNameMapping_(); // Init the name mapping.

  /** @type {?glift.orientation.BoundingBox} */
  this.bbox = null;
};

glift.displays.icons.IconBar.prototype = {
  /**
   * Inializes the name-mapping lookup
   * @private
   */
  initNameMapping_: function() {
    this.forEachIcon(function(icon) {
      this.nameMapping[icon.iconName] = icon;
    }.bind(this));
  },

  /**
   * Creates html element ids for each of the icons.
   * @private
   */
  initIconIds_: function() {
    this.forEachIcon(function(icon) {
      icon.setElementId(this.idGen.icon(icon.iconName));
    }.bind(this));
  },

  /** Draws the icon bar. */
  draw: function() {
    this.destroy();
    var divBbox = this.divBbox,
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = glift.svg.svg()
      .setAttr('width', '100%')
      .setAttr('height', '100%');
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
    var container = glift.svg.group().setId(this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(glift.svg.group().setId(this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      var path = glift.svg.path()
        .setId(icon.elementId)
        .setAttr('d', icon.iconStr)
        .setAttr('transform', icon.transformString());
      for (var key in this.theme.icons.DEFAULT) {
        path.setAttr(key, this.theme.icons.DEFAULT[key]);
      }
      container.append(path);
    }
  },

  /**
   * We draw transparent boxes around the icon to use for touch events.  For
   * complicated icons, it turns out to be obnoxious to try to select the icon.
   */
  _createIconButtons: function() {
    var container = glift.svg.group().setId(this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, len = this.icons.length; i < len; i++) {
      var icon = this.icons[i];
      container.append(glift.svg.rect()
        .setData(icon.iconName)
        .setAttr('x', icon.bbox.topLeft().x())
        .setAttr('y', icon.bbox.topLeft().y())
        .setAttr('width', icon.bbox.width())
        .setAttr('height', icon.bbox.height())
        .setAttr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .setAttr('opacity', 0)
        .setId(this.idGen.button(icon.iconName)));
    }
  },

  // TODO(kashomon): Delete this flush nonsense.  It's not necessary for the
  // iconbar.
  flush: function() {
    if (this.svg) {
      glift.displays.svg.dom.attachToParent(this.svg, this.divId);
    }
    var multi = this.getIcon('multiopen');
    if (multi) {
      this.setCenteredTempIcon('multiopen', multi.getActive(), 'black');
    }
  },

  /**
   * Add a temporary associated icon and center it.  If the parentIcon has a
   * subbox specified, then use that.  Otherwise, just center within the
   * parent icon's bbox.
   *
   * If the tempIcon is specified as a string, it is wrapped first.
   *
   * @param {string} parentIconNameOrIndex Parent icon name.
   * @param {string|!glift.displays.icons.WrappedIcon} tempIcon Temporary icon
   *    to display.
   * @param {string} color Color string
   * @param {number=} opt_vMargin Optional v margin. Defaults to 2px.
   * @param {number=} opt_hMargin Optional h margin. Defaults to 2px.
   */
  setCenteredTempIcon: function(
      parentIconNameOrIndex, tempIcon, color, opt_vMargin, opt_hMargin) {
    // Move these defaults into the Theme.
    var hm = opt_hMargin || 2,
        vm = opt_vMargin || 2;
    var parentIcon = this.getIcon(parentIconNameOrIndex);
    /** @type {!glift.displays.icons.WrappedIcon} */
    var wrappedTemp;
    if (glift.util.typeOf(tempIcon) === 'string') {
      wrappedTemp = glift.displays.icons.wrappedIcon(
        /** @type {string} */ (tempIcon));
    } else {
      wrappedTemp = tempIcon.rewrapIcon();
    }
    var tempIconId = this.idGen.tempIcon(parentIcon.iconName);

    // Remove if it exists.
    glift.dom.elem(tempIconId) && glift.dom.elem(tempIconId).remove();

    if (parentIcon.subboxIcon) {
      wrappedTemp = parentIcon.centerWithinSubbox(wrappedTemp, vm, hm);
    } else {
      wrappedTemp = parentIcon.centerWithinIcon(wrappedTemp, vm, hm);
    }

    var group = this.svg.child(this.idGen.tempIconGroup());
    glift.displays.svg.dom.appendAndAttach(group, glift.svg.path()
      .setId(tempIconId)
      .setAttr('d', wrappedTemp.iconStr)
      .setAttr('fill', color) // theme.icons.DEFAULT.fill
      .setAttr('transform', wrappedTemp.transformString()));
    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, attrsObj, textMod) {
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
    var textObj = glift.svg.text()
      .setId(this.idGen.tempIconText(iconName))
      .setText(text)
      .setAttr('class', 'tempIcon')
      .setAttr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .setAttr('font-size', fontSize + 'px')
      .setAttr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .setAttr('y', bbox.center().y()) //+ fontSize)
      .setAttr('dy', '.33em') // Move down, for centering purposes
      .setAttr('style', 'text-anchor: middle; vertical-align: middle;')
      .setAttr('lengthAdjust', 'spacing'); // also an opt: spacingAndGlyphs
    for (var key in attrsObj) {
      textObj.setAttr(key, attrsObj[key]);
    }
    var gr = this.svg.child(this.idGen.tempIconGroup())
    glift.displays.svg.dom.appendAndAttach(gr, textObj);
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
    glift.displays.svg.dom.emptyChildrenAndUpdate(
        this.svg.child(this.idGen.tempIconGroup()));
    return this;
  },

  /** Get the Element ID of the button. */
  buttonId: function(iconName) {
    return this.idGen.button(iconName);
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
              elem.setAttr(key, theme.DEFAULT_HOVER[key]);
            }
          };
        actionsForIcon.mouseout = iconActions[iconName].mouseout ||
          function(event, widgetRef, icon) {
            var elem = glift.dom.elem(icon.elementId)
            if (elem) { // elem can be null during transitions.
              var theme = widgetRef.iconBar.theme.icons;
              for (var key in theme.DEFAULT) {
                elem.setAttr(key, theme.DEFAULT[key]);
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
    this.bbox = null
    return this;
  }
};
