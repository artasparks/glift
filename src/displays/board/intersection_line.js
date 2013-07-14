glift.displays.board.intersectionLine = function(
    boardPt, radius, numIntersections, theme) {
  // minIntersects: 0 indexed,
  // maxIntersects: 0 indexed,
  // numIntersections: 1 indexed (it's the number of intersections)
  var minIntersects = 0,
      maxIntersects = numIntersections - 1,
      coordinate = boardPt.coordPt,
      intersection = boardPt.intPt,
      svgutil = glift.displays.board.svgutil;
  var top = intersection.y() === minIntersects ?
      coordinate.y() : coordinate.y() - radius;
  var bottom = intersection.y() === maxIntersects ?
      coordinate.y() : coordinate.y() + radius;
  var left = intersection.x() === minIntersects ?
      coordinate.x() : coordinate.x() - radius;
  var right = intersection.x() === maxIntersects ?
      coordinate.x() : coordinate.x() + radius;
  var line =
      // Vertical Line
      svgutil.svgMove(coordinate.x(), top) + ' '
      + svgutil.svgLineAbs(coordinate.x(), bottom) + ' '
      // Horizontal Line
      + svgutil.svgMove(left, coordinate.y()) + ' '
      + svgutil.svgLineAbs(right, coordinate.y());
  return line;
};
