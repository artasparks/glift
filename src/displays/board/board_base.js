/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.createBoardBase = function(svg, environment, theme) {
  var goBox = environment.goBoardBox;
  svg.selectAll('goBoardRect').data(['goboard'])
    .enter().append('rect')
      .attr('x', goBox.topLeft().x() + 'px')
      .attr('y', goBox.topLeft().y() + 'px')
      .attr('width', goBox.width() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('fill', theme.board.fill)
      .attr('stroke', theme.board.stroke);
};
