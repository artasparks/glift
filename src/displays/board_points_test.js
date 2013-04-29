otre.displays.boardpointsTest = function() {
  var displays = otre.displays,
      util = otre.util,
      point = otre.util.point;
  test("--------BoardPoints Tests--------", function() { ok(true); });

  test("Test for creating boardPoints from sc", function() {
    var bp = displays.boardPoints();
    bp.add(point(1,2), point(1.2, 55));
    ok(bp.hasCoord(point(1,2)), "Must have the Coordinate at point 1,2");

    bp.add(point(1,3), point(35.2, 55));
    deepEqual(bp.getCoords()[point(1,2)], point(1.2, 55),
        "Must get the right coordinate at point 1,2");
  });
}
