/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.createStones = function(divId, svg, boardPoints, theme) {
  var STONE = glift.enums.svgElements.STONE;
  var svgutil = glift.displays.board.svgutil;
  var stoneIdMap = {};
  svg.selectAll(STONE).data(boardPoints.data())
    .enter().append("circle")
      .attr("cx", function(pt) { return pt.coordPt.x(); })
      .attr("cy", function(pt) { return pt.coordPt.y(); })
      .attr("r", boardPoints.radius - .4) // for stroke
      .attr("opacity", 0)
      .attr("fill", 'blue') // dummy color
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = svgutil.elementId(divId, STONE, intPt);
        stoneIdMap[intPt.hash()] = id;
        return id;
      });
  return stoneIdMap;
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 *
 * TODO(kashomon): Probably, this should be merged with createStarPoints.
 */
glift.displays.board.createShadows = function(
    divId, svg, boardPoints, theme) {
  if (theme.stones.shadows === undefined) {
    return {};
  }
  var STONE_SHADOW = glift.enums.svgElements.STONE_SHADOW;
  var svgutil = glift.displays.board.svgutil;
  var shadowMap = {};
  svg.selectAll(STONE_SHADOW).data(boardPoints.data())
    .enter().append("circle")
      .attr("cx", function(pt) {
          return pt.coordPt.x() + boardPoints.radius / 7;
      })
      .attr("cy", function(pt) {
          return pt.coordPt.y() + boardPoints.radius / 7;
      })
      .attr("r", boardPoints.radius - 0.4)
      .attr("opacity", 0)
      .attr("fill", theme.stones.shadows.fill)
      .attr("stroke", theme.stones.shadows.stroke)
      .attr("filter", 'url(#' + divId + "_svg_blur)")
      .attr("id", function(pt) {
        var intPt = pt.intPt;
        var id = svgutil.elementId(divId, STONE_SHADOW, intPt);
        shadowMap[intPt.hash()] = id;
        return id;
      });
  return shadowMap;
};


glift.displays.board.initBlurFilter = function(divId, svg) {
  svg.append("svg:defs")
    .append("svg:filter")
      .attr("id", divId + '_svg_blur')
    .append("svg:feGaussianBlur")
      .attr("stdDeviation", 2);
};
