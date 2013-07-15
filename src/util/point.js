(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

// Private Point Class.  Because each point is cached, we have to be careful to
// preserve immutability. As such, we use getters to access the x and y values.
// Of course, you could still change functions themselves to be mysterious and
// annoying, but the purpose of using getters is more to prevent accidental
// mistakes.
var GliftPoint = function(xIn, yIn) {
  var privateXval = xIn,
      privateYval = yIn;
  this.x = function() { return privateXval };
  this.y = function() { return privateYval };

  this.equals = function(pt) {
      return privateXval === pt.x() && privateYval === pt.y();
  };
  this.toSgfCoord = function() {
    return String.fromCharCode(privateXval + 97) +
        String.fromCharCode(privateYval + 97);
  };
};

GliftPoint.prototype = {
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

  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  value: function() {
    return this.toString();
  },

  log: function() {
    glift.util.logz(this.toString());
  }
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

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
};

})();
