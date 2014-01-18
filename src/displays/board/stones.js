/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.stoneGroup());
  svg.append(container);
  var data = boardPoints.data()
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr("cx", pt.coordPt.x())
      .attr("cy", pt.coordPt.y())
      .attr("r", boardPoints.radius - .4) // subtract for stroke
      .attr("opacity", 0)
      .attr("stone_color", "EMPTY")
      .attr("fill", 'blue') // dummy color
      .attr('class', glift.enums.svgElements.STONE)
      .attr("id", idGen.stone(pt.intPt)));
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
  var container = svglib.group().attr('id', idGen.stoneShadowGroup());
  svg.append(container);
  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr("cx", pt.coordPt.x() + boardPoints.radius / 7)
      .attr("cy", pt.coordPt.y() + boardPoints.radius / 7)
      .attr("r", boardPoints.radius - 0.4)
      .attr("opacity", 0)
      .attr("fill", theme.stones.shadows.fill)
      // .attr("stroke", theme.stones.shadows.stroke)
      // .attr("filter", 'url(#' + divId + "_svg_blur)")
      .attr('class', glift.enums.svgElements.STONE_SHADOW)
      .attr("id", idGen.stoneShadow(pt.intPt)));
  }
};
