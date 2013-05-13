(function() {
glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bbox = function(topLeft, width, height) {
  return new BoundingBox(
      topLeft, glift.util.point(topLeft.x + width, topLeft.y + height));
}


// Might be nice to use the closure to create private variables.
// A bounding box, generally for a graphical object.
var BoundingBox = function(topLeftPt, botRightPt) {
  this.topLeft = function() { return topLeftPt; };
  this.botRight = function() { return botRightPt; };
  this.center = function() {
    return glift.util.point(
      glift.math.abs((botRightPt.x - topLeftPt.x) / 2),
      glift.math.abs((botRightPt.y - topLeftPt.y) / 2));
  };
  this.width = function() { return botRightPt.x - topLeftPt.x; };
  this.height = function() { return botRightPt.y - topLeftPt.y; };
  this.top = function() { return topLeft.y; };
  this.left = function() { return topLeft.x; };
  this.bottom = function() { return botRight.y; };
  this.right = function() { return botRight.x; };
};


BoundingBox.prototype = {
  // Draw the bbox (for debugging);
  draw: function(paper, color) {
    var obj = paper.rect(
        this.topLeft().x, this.topLeft().y, this.width(), this.height());
    obj.attr({fill:color, opacity:0.5});
  },

  contains: function(point) {
   return point.x >= this.topLeft().x
      && point.x <= this.botRight().x
      && point.y >= this.topLeft().y
      && point.y <= this.botRight().y;
  },

  // Log the points to the console (for debugging);
  log: function() {
    glift.util.logz("TopLeft: " + JSON.stringify(this.topLeft()));
    glift.util.logz("BotRight: " + JSON.stringify(this.botRight()));
    glift.util.logz("Width: " + this.width());
    glift.util.logz("Height: " + this.height());
  },

  equals: function(other) {
    return other.topLeft && this.topLeft().equals(other.topLeft()) &&
        other.botRight && this.botRight().equals(other.botRight());
  }
};


})();
