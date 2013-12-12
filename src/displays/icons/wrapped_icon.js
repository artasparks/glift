/**
 * Create a wrapper icon.
 */
glift.displays.icons.wrappedIcon = function(iconName) {
  return new glift.displays.icons._WrappedIcon(iconName);
};

/**
 * Validate that an iconName is valid.
 */
glift.displays.icons.validateIcon = function(iconName) {
  if (iconName === undefined ||
      glift.displays.icons.svg[iconName] === undefined) {
    throw "Icon unknown: [" + iconName + "]";
  }
  return iconName;
};

/**
 * Icon wrapper for convenience.  All you need is:
 *  - The name of the icon
 */
glift.displays.icons._WrappedIcon = function(iconName) {
  this.iconName = glift.displays.icons.validateIcon(iconName);
  var iconData = glift.displays.icons.svg[iconName];
  this.iconStr = iconData.string;
  this.originalBbox = glift.displays.bboxFromPts(
      glift.util.point(iconData.bbox.x, iconData.bbox.y),
      glift.util.point(iconData.bbox.x2, iconData.bbox.y2));
  this.associatedIcons = [];
  this.bbox = this.originalBbox; // can change on "translate"

  this._transform = undefined; // Set if the icon is transformed
  this.subboxIcon = undefined; // Set from setSubboxIcon(...);
};

/**
 * Wrapped icon methods.
 */
glift.displays.icons._WrappedIcon.prototype = {
  /**
   * Add an associated icon.
   */
  addAssociatedIcon: function(iconName) {
    this.associatedIcons.push(glift.displays.icons.wrappedIcon(iconName));
  },

  /**
   * Add an associated icon.
   */
  addAssociatedWrapped: function(wrapped) {
    if (wrapped.originalBbox === undefined) {
      throw "Wrapped icon not actually a wrapped icon: " + wrapped;
    }
    this.associatedIcons.push(wrapped);
  },

  /**
   * Clear the associated icons.  This is useful for handling temporary icons.
   */
  clearAssociatedIcons: function() {
    this.associatedIcons = [];
  },

  /**
   * Return a the wrapped icon from the associated icon list. If index isn't
   * specified, the assumption is that the index is 0;
   */
  fromAssociated: function(index) {
    index = index || 0;
    return this.associatedIcons[index];
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
   * Center a icon (specified with iconName) within a subbox. Returns a new
   * wrapped icon with the proper scaling.
   */
  centerWithinSubbox: function(iconName, vMargin, hMargin) {
    if (this.subboxIcon === undefined) {
      throw "No subbox defined, so cannot centerWithin.";
    }
    var wrapped = glift.displays.icons.wrappedIcon(iconName);
    var centerObj = glift.displays.gui.centerWithin(
        this.subboxIcon.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    this.addAssociatedWrapped(wrapped);
    return wrapped;
  },

  /**
   * Center a icon (specified with iconName) within the cur icon. Returns a new
   * wrapped icon with the proper scaling.
   */
  centerWithinIcon: function(iconName, vMargin, hMargin) {
    var wrapped = glift.displays.icons.wrappedIcon(iconName);
    var centerObj = glift.displays.gui.centerWithin(
        this.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    this.addAssociatedWrapped(wrapped);
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
    this._transform = transformObj;
    return this;
  },

  /**
   * Reset the bounding box to the initial position.
   */
  resetTransform: function() {
    this.bbox = this.originalBbox;
    this._transform = undefined;
    return this;
  },

  /**
   * Get the scaling string to be used as a SVG transform parameter.
   */
  getTransformString: function() {
    if (this._transform != undefined) {
      return 'translate(' + this._transform.xMove + ','
          + this._transform.yMove + ') '
        + 'scale(' + this._transform.scale + ')';
    } else {
      return "";
    }
  }
};
