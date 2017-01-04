goog.require('glift.displays.board');

/**
 * Create transparent buttons that overlay each intersection.
 *
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.svg.IdGenerator} idGen The ID generator for SVG.
 * @param {!glift.flattener.BoardPoints} boardPoints Board points object.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var container = glift.svg.group().setId(idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  var len = data.length
  var tl = data[0];
  var br = data[len - 1];

  data = { tl: tl, br: br, spacing: boardPoints.spacing };
  container.append(glift.svg.rect()
    .setData(data)
    .setAttr("x", tl.coordPt.x() - boardPoints.radius)
    .setAttr("y", tl.coordPt.y() - boardPoints.radius)
    .setAttr("width", br.coordPt.x() - tl.coordPt.x() + boardPoints.spacing)
    .setAttr("height", br.coordPt.y() - tl.coordPt.y() + boardPoints.spacing)
    .setAttr('opacity', 0)
    .setAttr('fill', 'red')
    .setAttr('stroke', 'red')
    .setAttr('stone_color', 'EMPTY')
    .setId(idGen.fullBoardButton()));
};
