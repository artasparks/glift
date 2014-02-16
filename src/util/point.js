(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

glift.util.coordToString = function(x, y) {
  return x + ',' + y;
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

  clone: function() {
    return glift.util.point(this.x(), this.y());
  },

  /**
   * Returns an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    return String.fromCharCode(this.x() + 97) +
        String.fromCharCode(this.y() + 97);
  },

  /**
   * Create the form used as a key in objects.
   * TODO(kashomon): Replace with string form.  The term hash() is confusing and
   * it makes it seem like I'm converting it to an int (which I was, long ago).
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

  /**
   * Rotate an (integer) point based on the board size.
   * boardsize: Typically 19, but 9 and 13 are possible.  Note that points are
   * typically 0-indexed.
   *
   * Note: This is an immutable on points.
   */
  rotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations;
    if (maxIntersections < 0 ||
        rotation === undefined ||
        rotation === rotations.NO_ROTATION) {
      return this;
    }
    var point = glift.util.point;
    var mid = (maxIntersections - 1) / 2;
    var normalized = point(this.x() - mid, mid - this.y());

    if (glift.util.outBounds(this.x(), maxIntersections) ||
        glift.util.outBounds(this.x(), maxIntersections)) {
      throw new Error("rotating a point outside the bounds: " +
          this.toString());
    }

    var rotated = normalized;
    if (rotation === rotations.CLOCKWISE_90) {
      rotated = point(normalized.y(), -normalized.x());

    } else if (rotation === rotations.CLOCKWISE_180) {
      rotated = point(-normalized.x(), -normalized.y());

    } else if (rotation === rotations.CLOCKWISE_270) {
      rotated = point(-normalized.y(), normalized.x());
    }

    // renormalize
    return point(mid + rotated.x(), -rotated.y() + mid);
  },

  antirotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations
    if (rotation === rotations.CLOCKWISE_90) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_270)
    } else if (rotation === rotations.CLOCKWISE_180) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_180)
    } else if (rotation === rotations.CLOCKWISE_270) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_90)
    } else {
      return this.rotate(maxIntersections, rotation);
    }
  },

  log: function() {
    glift.util.logz(this.toString());
  }
};

})();
