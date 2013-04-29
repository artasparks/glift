(function() {

glift.displays.raphael.Factory.prototype.createBoardLines = function() {
  return new BoardLineSet(this.paper, this.environment, this.theme.board);
};

var BoardLineSet = function(paper, environment, subtheme) {
  this.paper = paper;
  this.environment = environment;
  this.subtheme = subtheme;
  // this.horzSet -- filled in by draw;
  // this.vertSet -- filled in by draw;
};

BoardLineSet.prototype = {
  draw: function() {
    var point = glift.util.point,
        paper = this.paper,
        subt = this.subtheme,
        segments = this.environment.lineSegments,
        maxInts = this.environment.intersections;
    this.horzSet = drawSegments(
        paper, segments.horz, maxInts, subt.lineSize, subt.edgeLineSize);
    this.vertSet = drawSegments(
        paper, segments.vert, maxInts, subt.lineSize, subt.edgeLineSize);
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
