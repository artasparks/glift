(function() {

// Perhaps this should be removed.  It's hard to preserve immutability when
// there's a global cache.
var pointCache = {};

// Create a point.  Each point is cached, so that each point is only actually
// created once.
glift.util.point = function(x, y) {
  var str = glift.util.coordToString(x, y);
  if (pointCache[str] !== undefined) {
    return pointCache[str];
  } else {
    var newpt = new GliftPoint(x, y);
    pointCache[str] = newpt;
    return newpt;
  }
};

// Create a point, but don't use the cache. The method above is prefered to this
// one, but sometimes it's useful to use an explicitly uncached point.
glift.util.uncachedPoint = function(x, y) {
  return new GliftPoint(x, y);
};

// For testing the cache
glift.util._cacheHasPoint = function(x, y) {
  return pointCache[glift.util.coordToString(x, y)] !== undefined;
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
  hash: function() {
    return this.toString();
  },

  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
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
