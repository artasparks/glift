goog.require('glift.displays.board');

glift.displays.board.boardLabels = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setId(idGen.boardCoordLabelGroup());
  svg.append(container);
  var labels = boardPoints.edgeCoordLabels;
  for (var i = 0, ii = labels.length; i < ii; i++) {
    var lbl = labels[i];
    container.append(svglib.text()
        .setText(lbl.label)
        .setAttr('fill', theme.boardCoordLabels.fill)
        .setAttr('stroke', theme.boardCoordLabels.stroke)
        .setAttr('opacity', theme.boardCoordLabels.opacity)
        .setAttr('text-anchor', 'middle')
        .setAttr('dy', '.33em') // for vertical centering
        .setAttr('x', lbl.coordPt.x()) // x and y are the anchor points.
        .setAttr('y', lbl.coordPt.y())
        .setAttr('font-family', theme.boardCoordLabels['font-family'])
        .setAttr('font-size',
            boardPoints.spacing * theme.boardCoordLabels['font-size']));
  }
};
