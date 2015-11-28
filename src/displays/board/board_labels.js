goog.require('glift.displays.board');

glift.displays.board.boardLabels = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.boardCoordLabelGroup());
  svg.append(container);
  var labels = boardPoints.edgeCoordLabels;
  for (var i = 0, ii = labels.length; i < ii; i++) {
    var lbl = labels[i];
    container.append(svglib.text()
        .text(lbl.label)
        .attr('fill', theme.boardCoordLabels.fill)
        .attr('stroke', theme.boardCoordLabels.stroke)
        .attr('opacity', theme.boardCoordLabels.opacity)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', lbl.coordPt.x()) // x and y are the anchor points.
        .attr('y', lbl.coordPt.y())
        .attr('font-family', theme.boardCoordLabels['font-family'])
        .attr('font-size', boardPoints.spacing * theme.boardCoordLabels['font-size']));
  }
};
