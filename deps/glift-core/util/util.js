goog.provide('glift.util');

goog.require('glift');


glift.util = {
  /**
   * Log a message. Allows the for the possibility of overwriting for tests.
   * @param {*} msg
   */
  logz: function(msg) {
    console.log(msg);
  },

  /**
   * Via Crockford / StackOverflow: Determine the type of a value in robust way.
   * @param {*} value
   * @return {string}
   */
  typeOf: function(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (value instanceof Array) {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  },

  /**
   * Checks to make sure a number is inbounds.  In other words, whether a number
   * is between 0 (inclusive) and bounds (exclusive).
   * @param {number} num
   * @param {number} bounds
   * @return {boolean}
   */
  inBounds: function(num, bounds) {
    return ((num < bounds) && (num >= 0));
  },

  /**
   * Checks to make sure a number is out-of-bounds
   * returns true if a number is outside a bounds (inclusive) or negative
   * @param {number} num
   * @param {number} bounds
   * @return {boolean}
   */
  outBounds: function(num, bounds) {
    return ((num >= bounds) || (num < 0));
  },

  // Init a key if the obj is undefined at the key with the given value.
  // Return the value
  getKeyWithDefault: function(obj, key, value) {
    if (obj[key] === undefined) {
      obj[key] = value;
    }
    return obj[key];
  },

  /*
   * Get the size of an object
   */
  sizeOf: function(obj) {
    var size = 0;
    for (var key in obj) {
      size += 1;
    }
    return size;
  },

  /**
   * Set methods in the base object.  Usually used in conjunction with beget.
   * @param {!Object} base
   * @param {!Object} methods
   * @return {!Object}
   */
  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
  },

  /**
   * A utility method -- for prototypal inheritence.
   *
   * @param {T} o
   * @return {T}
   *
   * @template T
   */
  beget: function (o) {
    /** @constructor */
    var F = function () {};
    F.prototype = o;
    return new F();
  },

  /**
   * Simple Clone creates copies for all string, number, boolean, date and array
   * types.  It does not copy functions (which it leaves alone), nor does it
   * address problems with recursive objects.
   *
   * @param {T} obj
   * @return {T}
   *
   * @template T
   */
  simpleClone: function(obj) {
    // Handle immutable types (null, Boolean, Number, String) and functions.
    if (glift.util.typeOf(obj) !== 'array' &&
        glift.util.typeOf(obj) !== 'object') return obj;
    if (obj instanceof Date) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (glift.util.typeOf(obj) === 'array') {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = glift.util.simpleClone(obj[i]);
      }
      return copy;
    }
    if (glift.util.typeOf(obj) === 'object') {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] =
            glift.util.simpleClone(obj[attr]);
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
};
