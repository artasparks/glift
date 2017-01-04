/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 *
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.svg.IdGenerator} idGen The ID generator for SVG.
 * @param {!glift.flattener.BoardPoints} boardPoints Board points object.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.starpoints = function(svg, idGen, boardPoints, theme) {
  var container = glift.svg.group().setId(idGen.starpointGroup());
  svg.append(container);

  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  for (var i = 0, ii = starPointData.length; i < ii; i++) {
    var pt = starPointData[i];
    var coordPt = boardPoints.getCoord(pt).coordPt;
    container.append(glift.svg.circle()
      .setAttr('cx', coordPt.x())
      .setAttr('cy', coordPt.y())
      .setAttr('r', size)
      .setAttr('fill', theme.starPoints.fill)
      .setAttr('opacity', 1)
      .setId(idGen.starpoint(pt)));
  }
};
