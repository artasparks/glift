/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.createButtons = function(divId, svg, boardPoints) {
  var buttonMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var elems = glift.enums.svgElements;
  var BUTTON = elems.BUTTON;
  svg.selectAll(BUTTON).data(boardPoints.data())
    .enter().append("rect")
      .attr("x", function(pt) { return pt.coordPt.x() - boardPoints.radius; })
      .attr("y", function(pt) { return pt.coordPt.y() - boardPoints.radius; })
      .attr("width", boardPoints.spacing)
      .attr("height", boardPoints.spacing)
      .attr('opacity', 0.0)
      .attr('fill', 'red')
      .attr('stroke', '#000000')
      .on('mouseover', function(pt) {
        var circleDiv = svgutil.elementId(divId, elems.STONE, pt.intPt);
        var shadowDiv = svgutil.elementId(divId, elems.STONE_SHADOW, pt.intPt);
        d3.select('#' + circleDiv).attr('opacity', 1);
        d3.select('#' + shadowDiv).attr('opacity', 1);
      })
      .on('mouseout', function(pt) {
        var circleDiv = svgutil.elementId(divId, elems.STONE, pt.intPt);
        var shadowDiv = svgutil.elementId(divId, elems.STONE_SHADOW, pt.intPt);
        d3.select('#' + circleDiv).attr('opacity', 0);
        d3.select('#' + shadowDiv).attr('opacity', 0);
      });
};
