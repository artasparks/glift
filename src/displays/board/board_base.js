goog.require('glift.displays.board');
goog.require('glift.displays.svg');

/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 *
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.svg.IdGenerator} idGen The ID generator for SVG.
 * @param {!glift.orientation.BoundingBox} goBox The bounding box of the go board.
 * @param {!glift.themes.base} theme The theme object
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  if (theme.board.imagefill) {
    svg.append(glift.svg.image()
      .setAttr('x', goBox.topLeft().x())
      .setAttr('y', goBox.topLeft().y())
      .setAttr('width', goBox.width())
      .setAttr('height', goBox.height())
      .setAttr('xlink:href', theme.board.imagefill)
      .setAttr('preserveAspectRatio', 'none'));
  }

  svg.append(glift.svg.rect()
    .setAttr('x', goBox.topLeft().x() + 'px')
    .setAttr('y', goBox.topLeft().y() + 'px')
    .setAttr('width', goBox.width() + 'px')
    .setAttr('height', goBox.height() + 'px')
    .setAttr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
    .setAttr('stroke', theme.board.stroke)
    .setAttr('stroke-width', theme.board['stroke-width'])
    .setId(idGen.board()));
};

/**
 * @param {string} divId The element ID of the div in which the SVG board lives.
 * @param {glift.svg.SvgObj} svg Base svg obj, in which the filters should be
 *    placed.
 */
glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .setAttr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .setAttr("stdDeviation", 2);
};
