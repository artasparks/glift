goog.provide('glift.util');

glift.util = {
  /**
   * @param{T|undefined|null} param
   * @param{string=} opt_msg
   * @return {!T}
   *
   * @template T
   */
  assertDef: function(param, opt_msg) {
    var msg = opt_msg || '';
    if (param === undefined || param === null) {
      throw new Error('Param not defined! ' + msg);
    } else {
      // TODO(kashomon): Currently, this doesn't work the way I'd want to.
      return param;
    }
  },

  /**
   * Log a message. Allows the for the possibility of overwriting for tests.
   */
  logz: function(msg) {
    console.log(msg);
    return null; // default value to return.
  },

  /**
   * Via Crockford / StackOverflow: Determine the type of a value in robust way.
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
   */
  inBounds: function(num, bounds) {
    return ((num < bounds) && (num >= 0));
  },

  // Checks to make sure a number is out-of-bounds
  // returns true if a number is outside a bounds (inclusive) or negative
  outBounds: function(num, bounds) {
    return ((num >= bounds) || (num < 0));
  },

  intersection: function(set1, set2) {
    var out = {};
    for (var key in set1) {
      if (set2[key] !== undefined) {
        out[key] = 1;
      }
    }
    return out;
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
   */
  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
  },

  /**
   * A utility method -- for prototypal inheritence.
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
   * Taken from stack overflow, with some modification to handle functions and
   * to take advantage of util.typeOf above.  Note: This does not handle
   * recursive objects gracefully.
   *
   * Reference:
   * http://stackoverflow.com/questions/728360/
   * most-elegant-way-to-clone-a-javascript-object
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

// A better logging solution.
glift.util.debugl = function(msg) {
  if (glift.debugOn) {
    glift.util.log(msg);
  }
};

// A better logging solution.
glift.util.log = function(msg) {
  var modmsg = msg;
  if (glift.util.typeOf(msg) === "array" ||
      glift.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  if (console !== undefined && console.log !== undefined) {
    console.log(msg);
  }
};
