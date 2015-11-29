goog.require('glift.displays.board');

/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setAttr('id', idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  var len = data.length
  var tl = data[0];
  var br = data[len - 1];

  data = { tl: tl, br: br, spacing: boardPoints.spacing };
  container.append(svglib.rect()
    .setData(data)
    .setAttr("x", tl.coordPt.x() - boardPoints.radius)
    .setAttr("y", tl.coordPt.y() - boardPoints.radius)
    .setAttr("width", br.coordPt.x() - tl.coordPt.x() + boardPoints.spacing)
    .setAttr("height", br.coordPt.y() - tl.coordPt.y() + boardPoints.spacing)
    .setAttr('opacity', 0)
    .setAttr('fill', 'red')
    .setAttr('stroke', 'red')
    .setAttr('stone_color', 'EMPTY')
    .setAttr('id', idGen.fullBoardButton()));
};
