goog.require('glift.displays.board');

/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  var svglib = glift.displays.svg;
  if (theme.board.imagefill) {
    svg.append(svglib.image()
      .attr('x', goBox.topLeft().x())
      .attr('y', goBox.topLeft().y())
      .attr('width', goBox.width())
      .attr('height', goBox.height())
      .attr('xlink:href', theme.board.imagefill)
      .attr('preserveAspectRatio', 'none'));
  }

  svg.append(svglib.rect()
    .attr('x', goBox.topLeft().x() + 'px')
    .attr('y', goBox.topLeft().y() + 'px')
    .attr('width', goBox.width() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
    .attr('stroke', theme.board.stroke)
    .attr('stroke-width', theme.board['stroke-width'])
    .attr('id', idGen.board()));
};

glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .attr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .attr("stdDeviation", 2);
};
