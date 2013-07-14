glift.displays.board.createStarPoints = function(svg, boardPoints, theme) {
  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  svg.selectAll('starpoints').data(starPointData)
    .enter().append('circle')
      .attr('cx', function(ip) {
        return boardPoints.getCoord(ip).coordPt.x()
      })
      .attr('cy', function(ip) {
        return boardPoints.getCoord(ip).coordPt.y()
      })
      .attr('r', size)
      .attr('fill', theme.starPoints.fill);
};
