glift.util = {
  logz: function(msg) {
    var modmsg = msg;
    if (glift.util.typeOf(msg) === "array" ||
        glift.util.typeOf(msg) === "object") {
      modmsg = JSON.stringify(msg);
    }
    console.log("" + modmsg);
    return glift.util.none; // default value to return.
  },

  // A utility method -- for prototypal inheritence.
  beget: function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  },

  // Via Crockford / StackOverflow: Determine the type of a value in robust way.
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

  // Array utility functions
  // is_array is Taken from JavaScript: The Good Parts
  isArray: function (value) {
    return value && typeof value === 'object' && value.constructor === Array;
  },

  // Checks to make sure a number is inbounds
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

  varDefined: function(arg, label) {
    var msg = label || "",
        msg = msg !== "" ? ": " + msg : msg;
    if (arg === undefined) {
      throw "Argument cannot be undefined" + msg
    }
  },

  /*
   * Check to make sure that the variables specified are defined.
   */
  defined: function() { // args...
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === undefined) {
        return false;
      }
    }
    return true;
  },

  assertDefined: function(variable, msg) {
    if (variable === undefined) {
      throw msg;
    }
    return glift.util.none;
  },

  checkArgsDefined: function(args, expected) {
    for (var i = 0; i < expected; i++) {
      if (args[i] === undefined) {
        throw "Argument " + i + " of " + args.length +
            " must be defined, but is undefined";
      }
    }
    return glift.util.none;
  },

  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
  }
};

// A better logging solution.
glift.util.debugl = function(msg) {
  if (glift.debugOn) {
    var modmsg = msg;
    if (glift.util.typeOf(msg) === "array" ||
        glift.util.typeOf(msg) === "object") {
      modmsg = JSON.stringify(msg);
    }
    console.log(msg);
  }
};

(function () {
// Private None Class
var None = function() {
  this.type = "none";
};
None.prototype = {
  toString: function() {
    return "None";
  }
};

// We only need to create one instance of None.
glift.util.none = new None();
})();
