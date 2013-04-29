(function() {

var pointCache = {};

otre.util.point = function(x,y) {
  var str = otre.util.coordToString(x, y);
  if (pointCache[str] !== undefined) {
    return pointCache[str];
  } else {
    var newpt = new OtrePoint(x, y);
    pointCache[str] = newpt;
    return newpt;
  }
};

// For testing the cache
otre.util._cacheHasPoint = function(x, y) {
  return pointCache[otre.util.coordToString(x, y)] !== undefined;
};

// Private Point Class
var OtrePoint = function(x, y) {
  this.x = x;
  this.y = y;
};

OtrePoint.prototype = {
  toString: function() {
    return otre.util.coordToString(this.x, this.y);
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
    otre.util.logz(this.toString());
  }
};

otre.util.coordToString = function(x, y) {
  return x + ',' + y
};

otre.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0]);
    var y = parseInt(split[1]);
    return otre.util.point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

otre.util.pointFromHash = function(str) {
  return otre.util.pointFromString(str);
};

})();
