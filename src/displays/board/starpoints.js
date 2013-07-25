/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 */
glift.displays.board.createStarPoints = function(
    divId, svg, boardPoints, theme) {
  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  var STARPOINT = glift.enums.svgElements.STARPOINT;
  var starPointIds = {}; // mapping from int point hash to element ID
  svg.selectAll(STARPOINT).data(starPointData)
    .enter().append('circle')
      .attr('cx', function(ip) { return boardPoints.getCoord(ip).coordPt.x(); })
      .attr('cy', function(ip) { return boardPoints.getCoord(ip).coordPt.y(); })
      .attr('r', size)
      .attr('class', STARPOINT)
      .attr('fill', theme.starPoints.fill)
      .attr('id', function(pt) {
        var id = glift.displays.gui.elementId(divId, STARPOINT, pt);
        starPointIds[pt.hash()] = id;
        return id;
      });
  return starPointIds;
};
