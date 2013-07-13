glift.displays.board.intersectionLine = function(
    paper, intersection, coordinate, maxIntersects, spacing, subTheme) {
  // maxIntersectsIn: 0 indexed
  // intersection: 0 indexed
  var minIntersects = 0,
      rutil = glift.displays.raphael.util;
  var top = intersection.y() === minIntersects ?
      coordinate.y() : coordinate.y() - spacing / 2;
  var bottom = intersection.y() === maxIntersects ?
      coordinate.y() : coordinate.y() + spacing / 2;
  var left = intersection.x() === minIntersects ?
      coordinate.x() : coordinate.x() - spacing / 2;
  var right = intersection.x() === maxIntersects ?
      coordinate.x() : coordinate.x() + spacing / 2;
  var l1 = paper.path(rutil.svgMove(coordinate.x(), top)
      + ' ' + rutil.svgLineAbs(coordinate.x(), bottom)
      + rutil.svgMove(left, coordinate.y())
      + ' ' + rutil.svgLineAbs(right, coordinate.y()));
  // var set = paper.set();
  // set.push(l1);
  // set.push(l2);
};
