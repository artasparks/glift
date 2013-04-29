(function() {

var pointCache = {};

glift.util.point = function(x,y) {
  var str = glift.util.coordToString(x, y);
  if (pointCache[str] !== undefined) {
    return pointCache[str];
  } else {
    var newpt = new OtrePoint(x, y);
    pointCache[str] = newpt;
    return newpt;
  }
};

// For testing the cache
glift.util._cacheHasPoint = function(x, y) {
  return pointCache[glift.util.coordToString(x, y)] !== undefined;
};

// Private Point Class
var OtrePoint = function(x, y) {
  this.x = x;
  this.y = y;
};

OtrePoint.prototype = {
  toString: function() {
    return glift.util.coordToString(this.x, this.y);
  },

  hash: function() {
    return this.toString();
  },

  value: function() {
    return this.toString();
  },

  equals: function(point) {
    return this.x === point.x && this.y === point.y;
  },

  toSgfCoord: function() {
    return String.fromCharCode(this.x + 97) + String.fromCharCode(this.y + 97);
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
