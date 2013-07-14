/**
 * Create the marks.  For layering purposes, dummy marks are created on each
 * intersection at go board creating time.
 */
glift.displays.board.createMarks = function(divId, svg, boardPoints, theme) {
  var markMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var MARK = glift.enums.svgElements.MARK;
  svg.selectAll(MARK).data(boardPoints.data())
    .enter().append("text")
      .text('\u25A2')
      .attr('x', function(pt) { return pt.coordPt.x() })
      .attr('y', function(pt) { return pt.coordPt.y() })
      .attr('fill', theme.marks.fill)
      .attr('stroke', theme.marks.stroke);
  return markMapping;
};
