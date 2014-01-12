/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 */
glift.displays.board.starpoints = function(
    svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.starpointGroup());
  svg.append(container);

  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  for (var i = 0, ii = starPointData.length; i < ii; i++) {
    var pt = starPointData[i];
    var coordPt = boardPoints.getCoord(pt).coordPt;
    container.append(svglib.circle()
      .attr('cx', coordPt.x())
      .attr('cy', coordPt.y())
      .attr('r', size)
      .attr('fill', theme.starPoints.fill)
      .attr('opacity', 1)
      .attr('id', idGen.starpoint(pt)));
  }
};
