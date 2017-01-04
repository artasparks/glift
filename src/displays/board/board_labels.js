goog.require('glift.displays.board');

/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 *
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.svg.IdGenerator} idGen The ID generator for SVG.
 * @param {!glift.flattener.BoardPoints} boardPoints Board points object.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.boardLabels = function(svg, idGen, boardPoints, theme) {
  var container = glift.svg.group().setId(idGen.boardCoordLabelGroup());
  svg.append(container);
  var labels = boardPoints.edgeLabels;
  for (var i = 0, ii = labels.length; i < ii; i++) {
    var lbl = labels[i];
    container.append(glift.svg.text()
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
