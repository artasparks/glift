/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(divId, svg, boardPoints) {
  var buttonMapping = {};
  var elems = glift.enums.svgElements;
  var BUTTON = elems.BUTTON;
  svg.selectAll(BUTTON).data(boardPoints.data())
    .enter().append("svg:rect")
      .attr("x", function(pt) { return pt.coordPt.x() - boardPoints.radius; })
      .attr("y", function(pt) { return pt.coordPt.y() - boardPoints.radius; })
      .attr("width", boardPoints.spacing)
      .attr("height", boardPoints.spacing)
      .attr("class", BUTTON)
      .attr('opacity', 0)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stone_color', 'EMPTY')
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, BUTTON, pt.intPt);
        buttonMapping[pt.intPt.hash()] = id;
        return id;
      });
  return buttonMapping;
};
