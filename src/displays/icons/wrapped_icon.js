goog.provide('glift.displays.icons.WrappedIcon');

goog.require('glift.displays.icons');

/**
 * Create a wrapper icon.
 *
 * @param {string} iconName name of the relevant icon.
 * @return {!glift.displays.icons.WrappedIcon}
 */
glift.displays.icons.wrappedIcon = function(iconName) {
  return new glift.displays.icons.WrappedIcon(iconName);
};

/**
 * Wrap an array of iconNames.
 *
 * @param {!Array<string|!Array<string>>} iconsRaw
 * return {Array<glift.displays.icons.WrappedIcon>}
 */
glift.displays.icons.wrapIcons = function(iconsRaw) {
  var out = [];
  for (var i = 0; i < iconsRaw.length; i++) {
    var item = iconsRaw[i];
    if (glift.util.typeOf(item) === 'string') {
      out.push(glift.displays.icons.wrappedIcon(
          /** @type {string} */ (item)));
    } else if (glift.util.typeOf(item) === 'array') {
      var subIcons = item;
      // Looks like we only accept the multiopen icon for this category...
      var outerIcon = glift.displays.icons.wrappedIcon('multiopen')
      for (var j = 0; j < subIcons.length; j++) {
        outerIcon.addAssociatedIcon(subIcons[j]);
      }
      out.push(outerIcon);
    }
  }
  return out;
};

/**
 * Validate that an iconName is valid.
 * @param {string} iconName
 * @return {string}
 */
glift.displays.icons.validateIcon = function(iconName) {
  if (iconName === undefined ||
      glift.displays.icons.svg[iconName] === undefined) {
    throw new Error('Icon unknown: [' + iconName + ']');
  }
  return iconName;
};

/**
 * Icon wrapper for convenience.  All you need is:
 *  - The name of the icon
 *
 * @param {string} iconName Name of the icon.
 *
 * @constructor
 * @final
 */
glift.displays.icons.WrappedIcon = function(iconName) {
  this.iconName = glift.displays.icons.validateIcon(iconName);
  var iconData = glift.displays.icons.svg[iconName];
  this.iconStr = iconData.string;
  this.originalBbox = glift.orientation.bbox.fromPts(
      glift.util.point(iconData.bbox.x, iconData.bbox.y),
      glift.util.point(iconData.bbox.x2, iconData.bbox.y2));
  this.associatedIcons = []; // Added with addAssociatedIcon
  this.activeAssociated = 0; // Index into the above array
  this.bbox = this.originalBbox; // can change on "translate"
  this.transformObj = undefined; // Set if the icon is transformed
  this.elementId = undefined; // set with setElementId.  The id in the DOM.
  this.subboxIcon = undefined; // Set from setSubboxIcon(...);
  if (iconData.subboxName !== undefined) {
    this.setSubboxIcon(iconData.subboxName);
  }
};

/**
 * Wrapped icon methods.
 */
glift.displays.icons.WrappedIcon.prototype = {
  /**
   * Add an associated icon and return the new icon.
   */
  addAssociatedIcon: function(iconName) {
    var newIcon = glift.displays.icons.wrappedIcon(iconName)
    this.associatedIcons.push(newIcon);
    return newIcon;
  },

  /**
   * Add an associated icon and return the icon (for parity with the above).
   */
  _addAssociatedWrapped: function(wrapped) {
    if (wrapped.originalBbox === undefined) {
      throw "Wrapped icon not actually a wrapped icon: " + wrapped;
    }
    this.associatedIcons.push(wrapped);
    return wrapped;
  },

  /**
   * Clear the associated icons, returning the old list.
   */
  clearAssociatedIcons: function() {
    var oldIcons = this.associatedIcons;
    this.associatedIcons = [];
    return oldIcons;
  },

  /**
   * Return a the wrapped icon from the associated icon list. If index isn't
   * specified, the assumption is that the index is the active index;
   */
  getAssociated: function(index) {
    index = index || this.activeAssociated;
    return this.associatedIcons[index];
  },

  /**
   * Get the active associated icon.
   */
  getActive: function() {
    return this.associatedIcons[this.activeAssociated];
  },

  /**
   * Set the 'active' icon. Note: this doesn't refresh the icons on screen.
   * That task is left to the bar or selector.
   */
  setActive: function(iconName) {
    for (var i = 0, len = this.associatedIcons.length; i < len; i++) {
      var icon = this.associatedIcons[i];
      if (icon.iconName === iconName) {
        this.activeAssociated = i;
      }
    }
    return this;
  },

  /**
   * Set the div element id.
   */
  setElementId: function(id) {
    this.elementId = id;
    return this;
  },

  /**
   * Set a subbox, so we can center icons within the subbox.  A caveat is that
   * the subbox must be specified as an icon.
   */
  setSubboxIcon: function(iconName) {
    this.subboxIcon = glift.displays.icons.wrappedIcon(iconName);
    return this.subboxIcon;
  },

  /**
   * Center a icon (specified as a wrapped icon) within a subbox. Returns the
   * wrapped icon with the proper scaling.
   */
  centerWithinSubbox: function(wrapped, vMargin, hMargin) {
    if (this.subboxIcon === undefined) {
      throw "No subbox defined, so cannot centerWithin.";
    }
    var centerObj = glift.displays.centerWithin(
        this.subboxIcon.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * Center a icon (specified as a wrapped icon) within the current icon.
   * Returns the wrapped icon with the proper scaling.
   */
  centerWithinIcon: function(wrapped, vMargin, hMargin) {
    var centerObj = glift.displays.centerWithin(
        this.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * The transform parameter looks like the following:
   *  {
   *    scale: num,
   *    xMove: num,
   *    yMove: num
   *  }
   *
   * This translates the bounding box of the icon.
   *
   * Note that the scale is performed first, then the translate is performed.
   */
  performTransform: function(transformObj) {
    if (transformObj.scale) {
      this.bbox = this.bbox.scale(transformObj.scale)
    }
    if (transformObj.xMove && transformObj.yMove) {
      this.bbox = this.bbox.translate(transformObj.xMove, transformObj.yMove);
    }
    if (this.subboxIcon !== undefined) {
      this.subboxIcon.performTransform(transformObj);
    }
    // TODO(kashomon): Should we transform the associated icons?
    this.transformObj = transformObj;
    return this;
  },

  /**
   * Reset the bounding box to the initial position.
   */
  resetTransform: function() {
    this.bbox = this.originalBbox;
    this.transformObj = undefined;
    return this;
  },

  /**
   * Get the scaling string to be used as a SVG transform parameter.
   *
   * @return {string} the SVG transform string.
   */
  transformString: function() {
    if (this.transformObj != undefined) {
      return 'translate(' + this.transformObj.xMove + ','
          + this.transformObj.yMove + ') '
          + 'scale(' + this.transformObj.scale + ')';
    } else {
      return "";
    }
  },

  /**
  * Create a new wrapper icon.  This 'forgets' all
  */
  rewrapIcon: function() {
    return glift.displays.icons.wrappedIcon(this.iconName);
  }
};
