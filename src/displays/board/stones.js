/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().setAttr('id', idGen.stoneGroup());
  svg.append(container);
  var data = boardPoints.data()
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .setAttr('cx', pt.coordPt.x())
      .setAttr('cy', pt.coordPt.y())
      .setAttr('r', boardPoints.radius - .4) // subtract for stroke
      .setAttr('opacity', 0)
      .setAttr('stone_color', 'EMPTY')
      .setAttr('fill', 'blue') // dummy color
      .setAttr('class', glift.enums.svgElements.STONE)
      .setAttr('id', idGen.stone(pt.intPt)));
  }
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 */
glift.displays.board.shadows = function(svg, idGen, boardPoints, theme) {
  if (theme.stones.shadows === undefined) { return {}; }
  var svglib = glift.displays.svg;
  var container = svglib.group().setAttr('id', idGen.stoneShadowGroup());
  svg.append(container);
  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .setAttr('cx', pt.coordPt.x() + boardPoints.radius / 7)
      .setAttr('cy', pt.coordPt.y() + boardPoints.radius / 7)
      .setAttr('r', boardPoints.radius - 0.4)
      .setAttr('opacity', 0)
      .setAttr('fill', theme.stones.shadows.fill)
      // .setAttr('stroke', theme.stones.shadows.stroke)
      // .setAttr('filter', 'url(#' + divId + '_svg_blur)')
      .setAttr('class', glift.enums.svgElements.STONE_SHADOW)
      .setAttr('id', idGen.stoneShadow(pt.intPt)));
  }
};
