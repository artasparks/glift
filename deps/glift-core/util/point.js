goog.provide('glift.Point');
goog.provide('glift.PtStr');
goog.provide('glift.util.point');

goog.require('glift');
goog.require('glift.util');


/**
 * A point string is just a string with the format '<Number>,<Number>'. We use
 * this special type as a reminder to the reader of the code.
 *
 * Example: '12,5'
 *
 * @typedef {string}
 */
glift.PtStr;

/**
 * Create a point.  We no longer cache points
 * @param {number} x
 * @param {number} y
 * @return {!glift.Point}
 */
glift.util.point = function(x, y) {
  return new glift.Point(x, y);
};

/**
 * @param {number} x
 * @param {number} y
 * @return {!glift.PtStr}
 */
glift.util.coordToString = function(x, y) {
  return x + ',' + y;
};

/**
 * @param {glift.PtStr} str
 * @return {!glift.Point}
 */
glift.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0], 10);
    var y = parseInt(split[1], 10);
    return glift.util.point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

/**
 * Convert SGF data from SGF data.
 *
 * Returns an array of points. This exists to handle point-rectangle data sets
 * and point data sets uniformly.
 *
 * Example: TR[aa][ab]... vs TR[aa:cc]
 *
 * @param {string} str The sgf string to pars.
 * @return {!Array<!glift.Point>} An array of points.
 */
glift.util.pointArrFromSgfProp = function(str) {
  if (str.length === 2) {
    // Assume the properties have the form [ab].
    return [glift.util.pointFromSgfCoord(str)];
  } else if (str.length > 2) {
    // Assume a point rectangle. This a weirdness of the SGF spec and the reason
    // why this function exists. See http://www.red-bean.com/sgf/sgf4.html#3.5.1
    var splat = str.split(':');
    if (splat.length !== 2) {
      throw new Error('Expected two points: TopLeft and BottomRight for ' +
        'point rectangle. Instead found: ' + str);
    }
    var out = [];
    var tl = glift.util.pointFromSgfCoord(splat[0]);
    var br = glift.util.pointFromSgfCoord(splat[1]);
    if (br.x() < tl.x() || br.y() < br.y()) {
      throw new Error('Invalid point rectangle: tl: ' + tl.toString() +
          ', br: ' + br.toString());
    }
    var delta = br.translate(-tl.x(), -tl.y());
    for (var i = 0; i <= delta.y(); i++) {
      for (var j = 0; j <= delta.x(); j++) {
        var newX = tl.x() + j, newY = tl.y() + i;
        out.push(glift.util.point(newX, newY));
      }
    }
    return out;
  } else {
    throw new Error('Unknown pointformat for property data: ' + str);
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
 * @param {string} str The SGF string point
 * @return {!glift.Point} the finished point.
 */
glift.util.pointFromSgfCoord = function(str) {
  if (str.length !== 2) {
    throw 'Unknown SGF Coord length: ' + str.length +
        'for property ' + str;
  }
  var a = 'a'.charCodeAt(0);
  return glift.util.point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};


/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 *
 * @param {number} xIn
 * @param {number} yIn
 * @constructor @struct @final
 */
glift.Point = function(xIn, yIn) {
  /**
   * @private {number}
   * @const
   */
  this.x_ = xIn;
  /**
   * @private {number}
   * @const
   */
  this.y_ = yIn;
};

glift.Point.prototype = {
  /** @return {number} x value */
  x: function() { return this.x_; },
  /** @return {number} y value */
  y: function() { return this.y_; },
  /**
   * @param {?Object} inpt
   * @return {boolean} Whether this point equals another obj.
   */
  equals: function(inpt) {
    if (!inpt) { return false; }
    if (!inpt.x && !inpt.y) { return false; }
    var pt = /** @type {!glift.Point} */ (inpt);
    return this.x_ === pt.x() && this.y_ === pt.y();
  },

  /** @return {!glift.Point} */
  clone: function() {
    return glift.util.point(this.x(), this.y());
  },

  /**
   * @return {string}  an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(this.x() + a) +
        String.fromCharCode(this.y() + a);
  },

  /**
   * Return a string representation of the coordinate.  I.e., "12,3".
   * @return {!glift.PtStr}
   */
  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * @param {number} x
   * @param {number} y
   * @return {!glift.Point} a new point that's a translation from this one.
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  /**
   * Rotate an (integer) point based on the board size.
   * Note: This is an immutable transformation on the point.
   *
   * @param {number} maxIntersections The max intersections of the uncropped
   *    board. Typically 19, 13, or 9.
   * @param {glift.enums.rotations} rotation To perform on the point.
   *
   * @return {!glift.Point} A new point that has possibly been rotated.
   */
  rotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations;
    if (maxIntersections < 0 ||
        rotation === undefined ||
        rotation === rotations.NO_ROTATION) {
      return this;
    }

    var point = glift.util.point;

    var normalized = this.normalize(maxIntersections);

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

    return rotated.denormalize(maxIntersections);
  },

  /**
   * The inverse of rotate (see above)}
   * @param {number} maxIntersections Usually 9, 13, or 19.
   * @param {glift.enums.rotations} rotation Usually 9, 13, or 19.
   * @return {!glift.Point} A rotated point.
   */
  antirotate: function(maxIntersections, rotation) {
    var rotations = glift.enums.rotations;
    if (rotation === rotations.CLOCKWISE_90) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_270);
    } else if (rotation === rotations.CLOCKWISE_180) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_180);
    } else if (rotation === rotations.CLOCKWISE_270) {
      return this.rotate(maxIntersections, rotations.CLOCKWISE_90);
    } else {
      return this.rotate(maxIntersections, rotation);
    }
  },

  /**
   * Flip over the X axis (so flip Y points).
   * @param {number} size Usually 9, 13, or 19
   * @return {!glift.Point}
   */
  flipVert: function(size) {
    if (!size) {
      throw new Error('The board size must be defined. Was:' + size);
    }
    var n = this.normalize(size);
    return glift.util.point(n.x(), -n.y()).denormalize(size);
  },

  /**
   * Flip over the Y axis (so flip X points).
   * @param {number} size Usually 9, 13, or 19
   * @return {!glift.Point}
   */
  flipHorz: function(size) {
    if (!size) {
      throw new Error('The board size must be defined. Was:' + size);
    }
    var n = this.normalize(size);
    return glift.util.point(-n.x(), n.y()).denormalize(size);
  },


  /**
   * Makes the 0,0 point in the very center of the board.
   * @param {number} size Usually 9, 13, or 19
   * @return {!glift.Point}
   */
  normalize: function(size) {
    if (!size) {
      throw new Error('Size is required for normalization. Was: ' + size);
    }
    var mid = (size - 1) / 2;
    return glift.util.point(this.x() - mid, mid - this.y());
  },

  /**
   * Makes the 0,0 point in the top left, like normal.
   * @param {number} size Usually 9, 13, or 19
   * @return {!glift.Point}
   */
  denormalize: function(size) {
    var mid = (size - 1) / 2;
    return glift.util.point(mid + this.x(), -this.y() + mid);
  },
};
