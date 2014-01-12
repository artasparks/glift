/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 */
glift.displays.board.lines = function(svg, idGen, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var elementId = glift.displays.gui.elementId;
  var svglib = glift.displays.svg;

  var container = svglib.group().attr('id', idGen.lineGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.path()
      .attr('d', glift.displays.board.intersectionLine(
          pt, boardPoints.radius, boardPoints.numIntersections))
      .attr('stroke', theme.lines.stroke)
      .attr('stroke-width', theme.lines['stroke-width'])
      .attr('stroke-linecap', 'round')
      .attr('id', idGen.line(pt.intPt)));
  }
};

glift.displays.board.intersectionLine = function(
    boardPt, radius, numIntersections) {
  // minIntersects: 0 indexed,
  // maxIntersects: 0 indexed,
  // numIntersections: 1 indexed (it's the number of intersections)
  var minIntersects = 0,
      maxIntersects = numIntersections - 1,
      coordinate = boardPt.coordPt,
      intersection = boardPt.intPt,
      svgpath = glift.displays.svg.pathutils;
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
      svgpath.move(coordinate.x(), top) + ' '
      + svgpath.lineAbs(coordinate.x(), bottom) + ' '
      // Horizontal Line
      + svgpath.move(left, coordinate.y()) + ' '
      + svgpath.lineAbs(right, coordinate.y());
  return line;
};
