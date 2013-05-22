(function() {
glift.displays.raphael.Display.prototype.createMarks = function() {
  return new Marks(this._paper, this._environment, this._theme.marks)
};

var Marks = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.marks = {}; // map from intersection to mark
};

// TODO(kashomon): Finish writing marks.  This will probably require changing
// how the circle/bounding boxes are created, again, due to layering issues.
Marks.prototype = {
  addMark: function(type, pt, color) {
    switch(type) {
      case "XMARK": _addXMark(pt, color); break;
      default: // do nothing
    }
    return this;
  },

  _addXMark: function(pt, color) {
    var boardPoints = this.environment.boardpoints,
        coordPt = boardpoints.points[pt.hash()],
        spacing = boardpoints.spacing;
  },

  clearMark: function(pt) {

  },

  clearMarks: function() {

  }
};
})();
