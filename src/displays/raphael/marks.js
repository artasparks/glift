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

Marks.prototype = {
  addMark: function(type, pt, color) {
    switch(type) {
      case "XMARK": _addXMark(pt, color); break;
      default: // do nothing
    }
    return this;
  },

  _addXMark: function(pt, color) {
  },

  clearMark: function(pt) {

  },

  clearMarks: function() {

  }
};

});
