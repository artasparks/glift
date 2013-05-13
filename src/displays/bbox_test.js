glift.displays.bboxTest = function() {
module("Bounding Box Tests");
  var point = glift.util.point,
      displays = glift.displays;
  test("Test that the center is the shifted average", function() {
    var bbox = displays.bboxFromPts(point(1, 1), point(19, 21));
    deepEqual(bbox.center().x, 9, "center.x must be 9");
    deepEqual(bbox.center().y, 10, "center.y must be 10");
  });

  test("Width and height should be calculated correctly", function() {
    var bbox = displays.bboxFromPts(point(1, 9), point(18, 20));
    deepEqual(bbox.width(), 17, "Width should be br.x - tl.x");
    deepEqual(bbox.height(), 11, "Width should be br.y - tl.y");

    var bbox = displays.bboxFromPts(point(18, 20), point(1, 9));
    deepEqual(bbox.width(), -17, "Width should be br.x - tl.x");
    deepEqual(bbox.height(), -11, "Width should be br.y - tl.y");
  });

  test("Equality test", function() {
    var bbox = displays.bboxFromPts(point(1, 9), point(18, 20));
    var bbox_v2 = displays.bbox(point(1, 9), 17, 11);
    var bbox_v3 = displays.bbox(point(1, 10), 17, 11);
    ok(bbox.equals(bbox_v2), "should be equal");
    ok(!bbox.equals(bbox_v3), "shouldn't be equal");
    ok(!bbox_v2.equals(bbox_v3), "shouldn't be equal");
  });

  test("Contains test", function() {
    var bbox = displays.bboxFromPts(point(1,9), point(10, 13));
    ok(bbox.contains(point(10, 9)), "Must contain edge pt");
    ok(bbox.contains(point(1, 13)), "Must contain edge pt");
    ok(bbox.contains(point(4, 11)), "Must contain middle pt");
    ok(!bbox.contains(point(4, 14)), "Must not contain outside pt");
  });
};
