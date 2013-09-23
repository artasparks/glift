(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

glift.util.coordToString = function(x, y) {
  return x + ',' + y
};

glift.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0]);
    var y = parseInt(split[1]);
    return glift.util.point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

/**
 * Take an SGF point (e.g., 'mc') and return a GliftPoint.
 * SGFs are indexed from the Upper Left:
 *    _  _  _
 *   |aa ba ca ...
 *   |ab bb
 *   |.
 *   |.
 *   |.
 */
glift.util.pointFromSgfCoord = function(str) {
  if (str.length != 2) {
    throw "Unknown SGF Coord length: " + str.length;
  }
  var a = 'a'.charCodeAt(0)
  return glift.util.point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
};


/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 */
var GliftPoint = function(xIn, yIn) {
  this._x = xIn;
  this._y = yIn;
};

GliftPoint.prototype = {
  x: function() { return this._x },
  y: function() { return this._y },
  equals: function(pt) {
    return this._x === pt.x() && this._y === pt.y();
  },

  /**
   * Returns an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    return String.fromCharCode(this.x() + 97) +
        String.fromCharCode(this.y() + 97);
  },

  /**
   * Create the form used in objects.
   * TODO(kashomon): Replace with string form.  The term hash() is confusing and
   * it makes it seem like I'm converting it to an int (which I was, long ago)
   */
  hash: function() {
    return this.toString();
  },

  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * Return a new point that's a translation from this one
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  log: function() {
    glift.util.logz(this.toString());
  }
};

})();
