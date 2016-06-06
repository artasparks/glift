goog.require('glift');

glift.obj = {
  /**
   * A helper for merging obj information (typically CSS or SVG rules).  This
   * method is non-recursive and performs only shallow copy.
   */
  flatMerge: function(base, varargs) {
    var newObj = {};
    if (glift.util.typeOf(base) !== 'object') {
      return newObj;
    }
    for (var key in base) {
      newObj[key] = base[key];
    }
    for (var i = 1; arguments.length >= 2 && i < arguments.length; i++) {
      var arg = arguments[i];
      if (glift.util.typeOf(arg) === 'object') {
        for (var key in arg) {
          newObj[key] = arg[key];
        }
      }
    }
    return newObj;
  },

  /** Returns true if an object is empty. False otherwise. */
  isEmpty: function(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  }
};
