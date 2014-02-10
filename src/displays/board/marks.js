/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 */
glift.displays.board.markContainer = function(svg, idGen) {
  svg.append(glift.displays.svg.group().attr('id', idGen.markGroup()));
  svg.append(glift.displays.svg.group().attr('id', idGen.tempMarkGroup()));
};

/**
 * Add a mark of a particular type to the GoBoard
 */
glift.displays.board.addMark = function(
    container, idGen, boardPoints, marksTheme, stonesTheme, pt, mark, label) {
  // Note: This is a static method instead of a method on intersections because,
  // due to the way glift is compiled together, there'no s guarantee what order
  // the files come in (beyond the base package file).  So, either we need to
  // combine intersections.js with board.js or keep this a separate static
  // method.
  var svgpath = glift.displays.svg.pathutils;
  var svglib = glift.displays.svg;
  var rootTwo = 1.41421356237;
  var rootThree = 1.73205080757;
  var marks = glift.enums.marks;
  var coordPt = boardPoints.getCoord(pt).coordPt;
  var markId = idGen.mark(pt);

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
    container.append(svglib.text()
        .text(label)
        .data(pt)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', coordPt.x()) // x and y are the anchor points.
        .attr('y', coordPt.y())
        .attr('font-family', stonesTheme.marks['font-family'])
        .attr('font-size', boardPoints.spacing * 0.7)
        .attr('id', markId));

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    container.append(svglib.rect()
        .data(pt)
        .attr('x', coordPt.x() - halfWidth)
        .attr('y', coordPt.y() - halfWidth)
        .attr('width', 2 * halfWidth)
        .attr('height', 2 * halfWidth)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    container.append(svglib.path()
        .data(pt)
        .attr('d',
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topRight) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botRight))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.CIRCLE) {
    container.append(svglib.circle()
        .data(pt)
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = stonesTheme.marks['STONE_MARKER'];
    container.append(svglib.circle()
        .data(pt)
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('opacity', marksTheme.STONE_MARKER.opacity)
        .attr('fill', marksTheme.STONE_MARKER.fill)
        .attr('id', markId));
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    container.append(svglib.path()
        .data(pt)
        .attr('fill', 'none')
        .attr('d',
            svgpath.movePt(topNode) + ' ' +
            svgpath.lineAbsPt(leftNode) + ' ' +
            svgpath.lineAbsPt(rightNode) + ' ' +
            svgpath.lineAbsPt(topNode))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};
