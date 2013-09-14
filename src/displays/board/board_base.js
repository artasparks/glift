/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.boardBase = function(divId, svg, goBox, theme) {
  var BOARD = glift.enums.svgElements.BOARD;
  var id = glift.displays.gui.elementId(divId, BOARD)

  if (theme.board.imagefill) {
    svg.selectAll('goBoardRect').data([BOARD])
      .enter().append('svg:image')
        .attr('x', goBox.topLeft().x())
        .attr('y', goBox.topLeft().y())
        .attr('width', goBox.width())
        .attr('height', goBox.height())
        .attr('xlink:href', theme.board.imagefill)
        .attr('preserveAspectRatio', 'none')
        .attr('id', id);
  }

  svg.selectAll('goBoardRect').data([BOARD])
    .enter().append('rect')
      .attr('x', goBox.topLeft().x() + 'px')
      .attr('y', goBox.topLeft().y() + 'px')
      .attr('width', goBox.width() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('height', goBox.height() + 'px')
      .attr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
      .attr('stroke', theme.board.stroke)
      .attr('stroke-width', theme.board['stroke-width'])
      .attr('id', id);
  return id;
};
