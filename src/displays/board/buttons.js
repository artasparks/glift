goog.require('glift.displays.board');

/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  var len = data.length
  var tl = data[0];
  var br = data[len - 1];

  data = { tl: tl, br: br, spacing: boardPoints.spacing };
  container.append(svglib.rect()
    .data(data)
    .attr("x", tl.coordPt.x() - boardPoints.radius)
    .attr("y", tl.coordPt.y() - boardPoints.radius)
    .attr("width", br.coordPt.x() - tl.coordPt.x() + boardPoints.spacing)
    .attr("height", br.coordPt.y() - tl.coordPt.y() + boardPoints.spacing)
    .attr('opacity', 0)
    .attr('fill', 'red')
    .attr('stroke', 'red')
    .attr('stone_color', 'EMPTY')
    .attr('id', idGen.fullBoardButton()));
};
