/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 */
glift.displays.board.markContainer =
    function(divId, svg, boardPoints, theme) {
  var markMapping = {};
  var svgutil = glift.displays.board.svgutil;
  var MARK_CONTAINER = glift.enums.svgElements.MARK_CONTAINER;

  svg.selectAll(MARK_CONTAINER).data([1]) // dummy data;
      .enter().append("g")
          .attr('class', MARK_CONTAINER);
  return markMapping;
};

// This is a static method instead of a method on intersections because, due to
// the way glift is compiled together, there'no s guarantee what order the files
// come in (beyond the base package file).  So, either we need to combine
// intersections.js with board.js or we week this a separate static method.
glift.displays.board.addMark = function(
    divId, svg, boardPoints, theme, pt, mark, label) {
  var svgutil = glift.displays.board.svgutil;
  var elems = glift.enums.svgElements;
  var MARK = elems.MARK;
  var STONE = elems.STONE;
  var STARPOINT = elems.STARPOINT;
  var BOARD_LINE = elems.BOARD_LINE;
  var MARK_CONTAINER = elems.MARK_CONTAINER;
  var rootTwo = 1.41421356237;
  var rootThree = 1.73205080757;
  var marks = glift.enums.marks;
  var coordPt = boardPoints.getCoord(pt).coordPt;
  var stoneColor = svg.select('#' + glift.displays.gui.elementId(divId, STONE, pt))
      .attr('stone_color');
  var marksTheme = theme.stones[stoneColor].marks;

  // If necessary, clear out intersection lines and starpoints.  This only applies
  // when a stone hasn't yet been set (stoneColor === 'EMPTY').
  if (stoneColor === 'EMPTY' &&
      (mark === marks.LABEL
          || mark === marks.VARIATION_MARKER
          || mark === marks.CORRECT_VARIATION)) {
    svg.select('#' + glift.displays.gui.elementId(divId, STARPOINT, pt))
        .attr('opacity', 0);
    svg.select('#' + glift.displays.gui.elementId(divId, BOARD_LINE, pt))
        .attr('opacity', 0);
  }

  var fudge = boardPoints.radius / 8;
  // TODO(kashomon): Move the labels code to a separate function.  It's pretty
  // hacky right now.  It doesn't seem right that there should be a whole
  // separate coditional based on what are essentially color requirements.
  if (mark === marks.LABEL
      || mark == marks.VARIATION_MARKER
      || mark == marks.CORRECT_VARIATION) {
    if (mark === marks.VARIATION_MARKER) {
      marksTheme = marksTheme.VARIATION_MARKER;
    } else if (mark === marks.CORRECT_VARIATION) {
      marksTheme = marksTheme.CORRECT_VARIATION;
    }
    svg.select('.' + MARK_CONTAINER).append('text')
        .text(label)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('class', MARK)
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em') // for vertical centering
        .attr('x', coordPt.x()) // x and y are the anchor points.
        .attr('y', coordPt.y())
        .attr('font-family', theme.stones.marks['font-family'])
        .attr('font-size', boardPoints.spacing * 0.7);

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    svg.select('.' + MARK_CONTAINER).append('rect')
        .attr('x', coordPt.x() - halfWidth)
        .attr('y', coordPt.y() - halfWidth)
        .attr('width', 2 * halfWidth)
        .attr('height', 2 * halfWidth)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    svg.select('.' + MARK_CONTAINER).append('path')
        .attr('d',
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(topLeft) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(topRight) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(botLeft) + ' ' +
            svgutil.svgMovePt(coordPt) + ' ' +
            svgutil.svgLineAbsPt(botRight))
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else if (mark === marks.CIRCLE) {
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = theme.stones.marks['STONE_MARKER'];
    svg.select('.' + MARK_CONTAINER).append('circle')
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('class', MARK)
        .attr('opacity', marksTheme.STONE_MARKER.opacity)
        .attr('fill', marksTheme.STONE_MARKER.fill);
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    svg.select('.' + MARK_CONTAINER).append('path')
        .attr('fill', 'none')
        .attr('d',
            svgutil.svgMovePt(topNode) + ' ' +
            svgutil.svgLineAbsPt(leftNode) + ' ' +
            svgutil.svgLineAbsPt(rightNode) + ' ' +
            svgutil.svgLineAbsPt(topNode))
        .attr('stroke-width', 2)
        .attr('class', MARK)
        .attr('stroke', marksTheme.stroke);
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};
