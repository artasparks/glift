glift.displays.bboxTest = function() {
  module("Bounding Box Tests");
  var point = glift.util.point,
      displays = glift.displays;
  test("Test that the center is the shifted average", function() {
    var bbox = displays.bboxFromPts(point(1, 1), point(19, 21));
    deepEqual(bbox.center().x(), 10, "center.x() must be 9");
    deepEqual(bbox.center().y(), 11, "center.y() must be 10");
  });

  test("Width and height should be calculated correctly", function() {
    var bbox = displays.bboxFromPts(point(1, 9), point(18, 20));
    deepEqual(bbox.width(), 17, "Width should be br.x() - tl.x()");
    deepEqual(bbox.height(), 11, "Width should be br.y() - tl.y()");

    var bbox = displays.bboxFromPts(point(18, 20), point(1, 9));
    deepEqual(bbox.width(), -17, "Width should be br.x() - tl.x()");
    deepEqual(bbox.height(), -11, "Width should be br.y() - tl.y()");
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

  test("fixedScale test", function() {
    var bbox = displays.bboxFromPts(point(1,10), point(11, 20));
    deepEqual(bbox.width(), 10, "width");
    deepEqual(bbox.height(), 10, "height");

    var smallBbox = bbox.fixedScale(0.5);
    deepEqual(smallBbox.width(), 5, "small width");
    deepEqual(smallBbox.height(), 5, "small height");
    deepEqual(smallBbox.topLeft().x(), bbox.topLeft().x(), 'tl.x');
    deepEqual(smallBbox.topLeft().y(), bbox.topLeft().y(), 'tl.y');
  });

  test("translate test", function() {
    var bbox = displays.bboxFromPts(point(1,10), point(11, 20));
    var newBox = bbox.translate(13, 6);
    deepEqual(newBox.topLeft().x(), bbox.topLeft().x() + 13, 'tl.x');
    deepEqual(newBox.topLeft().y(), bbox.topLeft().y() + 6, 'tl.y');
    deepEqual(newBox.botRight().x(), bbox.botRight().x() + 13, 'br.x');
    deepEqual(newBox.botRight().y(), bbox.botRight().y() + 6, 'br.y');
    deepEqual(newBox.width(), bbox.width(), 'width');
    deepEqual(newBox.height(), bbox.height(), 'height');
  });
};
