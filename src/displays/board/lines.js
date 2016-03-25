goog.require('glift.displays.board');

/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 *
 * @param {!glift.displays.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.ids.Generator} idGen The ID generator for SVG.
 * @param {!glift.displays.BoardPoints} boardPoints Board points object.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.lines = function(svg, idGen, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) pt string to id;
  var svglib = glift.displays.svg;

  var container = svglib.group().setId(idGen.lineGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.path()
      .setAttr('d', glift.displays.board.intersectionLine(
          pt, boardPoints.radius, boardPoints.numIntersections))
      .setAttr('stroke', theme.lines.stroke)
      .setAttr('stroke-width', theme.lines['stroke-width'])
      .setAttr('stroke-linecap', 'round')
      .setId(idGen.line(pt.intPt)));
  }
};

/**
 * @param {!glift.displays.BoardPt} boardPt A
 * @param {!number} radius Size of the space between the lines
 * @param {!number} numIntersections Number of intersecitons on the board.
 */
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
