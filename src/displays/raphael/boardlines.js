(function() {
// Create the board lines objects and immediately call draw()
glift.displays.raphael.Display.prototype.createBoardLines = function() {
  return new BoardLineSet(this.paper(), this.environment(), this.theme().board)
      .draw();
};

var BoardLineSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  this.horzSet = glift.util.none; // filled in by draw;
  this.vertSet = glift.util.none; // filled in by draw;
};

BoardLineSet.prototype = {
  draw: function() {
    var _ = this.destroy(),
        point = glift.util.point,
        paper = this.paper,
        subt = this.subtheme,
        segments = this.environment.lineSegments,
        maxInts = this.environment.intersections;
    this.horzSet = drawSegments(
        paper, segments.horz, maxInts, subt.lineSize, subt.edgeLineSize);
    this.vertSet = drawSegments(
        paper, segments.vert, maxInts, subt.lineSize, subt.edgeLineSize);
    return this;
  },

  destroy: function() {
    this.horzSet && this.horzSet !== glift.util.none && this.horzSet.remove();
    this.vertSet && this.vertSet !== glift.util.none && this.vertSet.remove();
    return this;
  }
};

var drawSegments = function(paper, segs, maxInts, normalSize, edgeSize) {
  var lineSet = paper.set(),
      rutil = glift.displays.raphael.rutil;
  for (var i = 0; i < segs.length; i++) {
    var path = paper.path(
        rutil.svgMovePt(segs[i].topLeft) +
        rutil.svgLineAbsPt(segs[i].botRight));
    var ordinal = segs[i].ordinal;
    var size = ordinal === 0 || ordinal  === maxInts - 1 ?
        edgeSize : normalSize;
    path.attr({"stroke-linecap" : "round", "stroke-width" : size});
    lineSet.push(path);
  }
  return lineSet;
};

})();
