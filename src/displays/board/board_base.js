/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.createBoardBase = function(divId, svg, goBox, theme) {
  var svgutil = glift.displays.board.svgutil;
  var BOARD = glift.enums.svgElements.BOARD;
  var id = svgutil.elementId(divId, BOARD)
  svg.selectAll('goBoardRect').data([BOARD])
    .enter().append('rect')
      .attr('x', goBox.topLeft().x() + 'px')
      .attr('y', goBox.topLeft().y() + 'px')
      .attr('width', goBox.width() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('fill', theme.board.fill)
      .attr('stroke', theme.board.stroke)
      .attr('id', id);
  return id;
};
