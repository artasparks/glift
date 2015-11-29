goog.require('glift.displays.board');
goog.require('glift.displays.svg');

/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 *
 * @param {glift.displays.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.ids.Generator} idGen The ID generator for SVG.
 * @param {!glift.displays.BoundingBox} goBox The bounding box of the go board.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  if (theme.board.imagefill) {
    svg.append(glift.displays.svg.image()
      .attr('x', goBox.topLeft().x())
      .attr('y', goBox.topLeft().y())
      .attr('width', goBox.width())
      .attr('height', goBox.height())
      .attr('xlink:href', theme.board.imagefill)
      .attr('preserveAspectRatio', 'none'));
  }

  svg.append(glift.displays.svg.rect()
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

/**
 * @param {string} divId The element ID of the div in which the SVG board lives.
 * @param {glift.displays.svg.SvgObj} svg Base svg obj, in which the filters should be
 *    placed.
 */
glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .attr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .attr("stdDeviation", 2);
};
