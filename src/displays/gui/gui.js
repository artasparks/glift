/**
 * Extra GUI methods and data.
 */
glift.displays.gui = {
  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  elementId: function(divId, type, extraData) {
    var base = divId + "_" + type;
    if (extraData !== undefined) {
      if (extraData.x !== undefined) {
        return base + '_' + extraData.x() + "_" + extraData.y();
      } else {
        return base + '_' + extraData.toString();
      }
    } else {
      return base;
    }
  }
};
