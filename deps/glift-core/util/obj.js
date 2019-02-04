goog.provide('glift.util.obj');

goog.require('glift.util');

goog.scope(function() {

var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

glift.util.obj = {
  /**
   * A helper for merging obj information (typically CSS or SVG rules).  This
   * method is non-recursive and performs only shallow copy.
   *
   * @param {!Object} base object
   * @param {...!Object} var_args
   * @return {!Object}
   */
  flatMerge: function(base, var_args) {
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

  /**
   * Removes key/value pairs for the 'current' object when they are exactly the
   * same in the defaults object.
   * @param {!Object|!Array} current
   * @param {!Object|!Array} defaults
   */
  removeDefaults: function(current, defaults) {
  },

  /**
   * Returns true if an object is empty. False otherwise.
   * @param {!Object} obj
   * @return {boolean}
   */
  isEmpty: function(obj) {
    for (var key in obj) {
      return false;
    }
    return true;
  },

  /**
   * @param {!Object} obj Any JS object
   * @return {!Array<string>} the keys for the object
   */
  keys: function(obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
  },

  /**
   * Helper to determine if an object is 
   * @param {!Object} obj
   * @return {boolean} true if the object is an arguments arr. From
   *    https://github.com/substack/node-deep-equal
   */
  isArguments: function(obj) {
    if (supportsArgumentsClass) {
      return Object.prototype.toString.call(obj) == '[object Arguments]';
    } else {
      return obj &&
        typeof obj == 'object' &&
        typeof obj.length == 'number' &&
        Object.prototype.hasOwnProperty.call(obj, 'callee') &&
        !Object.prototype.propertyIsEnumerable.call(obj, 'callee') ||
        false;
    }
  },
};

});
