/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 *
 * @param {!glift.svg.SvgObj} svg Base svg obj
 * @param {!glift.displays.svg.IdGenerator} idGen The ID generator for SVG.
 */
glift.displays.board.markContainer = function(svg, idGen) {
  svg.append(glift.svg.group().setId(idGen.markGroup()));
  svg.append(glift.svg.group().setId(idGen.tempMarkGroup()));
};

/**
 * Add a mark of a particular type to the GoBoard
 */
glift.displays.board.addMark = function(
    container, idGen, boardPoints, marksTheme, stonesTheme, pt, mark, label, stoneColor) {
  // Note: This is a static method instead of a method on intersections because,
  // due to the way glift is compiled together, there'no s guarantee what order
  // the files come in (beyond the base package file).  So, either we need to
  // combine intersections.js with board.js or keep this a separate static
  // method.
  var svgpath = glift.svg.pathutils;
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
      || mark === marks.VARIATION_MARKER
      || mark === marks.CORRECT_VARIATION
      || mark === marks.LABEL_ALPHA
      || mark === marks.LABEL_NUMERIC) {
    if (mark === marks.VARIATION_MARKER) {
      marksTheme = marksTheme.VARIATION_MARKER;
    } else if (mark === marks.CORRECT_VARIATION) {
      marksTheme = marksTheme.CORRECT_VARIATION;
    }
    var threeDigitMod = 1;
    if (label.length === 3) {
      // If the labels are 3 digits, we make them a bit smaller to fit on the
      // stones.
      threeDigitMod = .75;
    }
    var strokeWidth = parseInt(marksTheme['stroke-width'] || 1, 10)
    if (stoneColor === glift.enums.states.BLACK) {
      strokeWidth = strokeWidth * 0.4;
    }
    container.append(glift.svg.text()
        .setText(label)
        .setData(pt)
        .setAttr('fill', marksTheme.fill)
        .setAttr('stroke', marksTheme.stroke)
        .setAttr('stroke-width', strokeWidth)
        .setAttr('text-anchor', 'middle')
        .setAttr('dy', '.33em') // for vertical centering
        .setAttr('x', coordPt.x()) // x and y are the anchor points.
        .setAttr('y', coordPt.y())
        .setAttr('font-family', stonesTheme.marks['font-family'])
        .setAttr('font-style', 'normal')
        .setAttr('font-size',
            threeDigitMod * boardPoints.spacing * stonesTheme.marks['font-size'])
        .setId(markId));

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    container.append(glift.svg.rect()
        .setData(pt)
        .setAttr('x', coordPt.x() - halfWidth)
        .setAttr('y', coordPt.y() - halfWidth)
        .setAttr('width', 2 * halfWidth)
        .setAttr('height', 2 * halfWidth)
        .setAttr('fill', 'none')
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    container.append(glift.svg.path()
        .setData(pt)
        .setAttr('d',
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topRight) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botRight))
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else if (mark === marks.CIRCLE) {
    container.append(glift.svg.circle()
        .setData(pt)
        .setAttr('cx', coordPt.x())
        .setAttr('cy', coordPt.y())
        .setAttr('r', boardPoints.radius / 2)
        .setAttr('fill', 'none')
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = stonesTheme.marks['STONE_MARKER'];
    container.append(glift.svg.circle()
        .setData(pt)
        .setAttr('cx', coordPt.x())
        .setAttr('cy', coordPt.y())
        .setAttr('r', boardPoints.radius / 3)
        .setAttr('opacity', marksTheme.STONE_MARKER.opacity)
        .setAttr('fill', marksTheme.STONE_MARKER.fill)
        .setId(markId));
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    container.append(glift.svg.path()
        .setData(pt)
        .setAttr('fill', 'none')
        .setAttr('d',
            svgpath.movePt(topNode) + ' ' +
            svgpath.lineAbsPt(leftNode) + ' ' +
            svgpath.lineAbsPt(rightNode) + ' ' +
            svgpath.lineAbsPt(topNode) + ' ' + 'Z')
        .setAttr('stroke-width', 2)
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else if (mark === marks.KO_LOCATION) {
    container.append(glift.svg.circle()
        .setData(pt)
        .setAttr('cx', coordPt.x())
        .setAttr('cy', coordPt.y())
        .setAttr('r', boardPoints.radius / 2)
        .setAttr('opacity', 0.5)
        .setAttr('fill', 'none')
        .setAttr('stroke', marksTheme.stroke)
        .setId(markId));
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};
