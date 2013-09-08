/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 */
glift.displays.board.createLines = function(divId, svg, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var lineMapping = {};
  var BOARD_LINE = glift.enums.svgElements.BOARD_LINE;
  svg.selectAll(BOARD_LINE).data(boardPoints.data())
    .enter().append("path")
      .attr('d', function(pt) {
        return glift.displays.board.intersectionLine(
            pt, boardPoints.radius, boardPoints.numIntersections, theme);
      })
      .attr('stroke', theme.lines.stroke)
      .attr('stroke-width', theme.lines['stroke-width'])
      .attr('class', BOARD_LINE)
      .attr('stroke-linecap', 'round')
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, BOARD_LINE, pt.intPt);
        lineMapping[pt.intPt.hash()] = id;
        return id;
      });
  return lineMapping;
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
