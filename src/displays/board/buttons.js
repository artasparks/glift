/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints, rotation) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    var dataPt = pt.intPt.antirotate(boardPoints.numIntersections, rotation);
    container.append(svglib.rect()
      .data(dataPt)
      .attr("x", pt.coordPt.x() - boardPoints.radius)
      .attr("y", pt.coordPt.y() - boardPoints.radius)
      .attr("width", boardPoints.spacing)
      .attr("height", boardPoints.spacing)
      .attr('opacity', 0)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stone_color', 'EMPTY')
      .attr('id', idGen.button(dataPt)));
  }
};
