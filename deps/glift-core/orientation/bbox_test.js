(function() {
  module('glift.orientation.bboxTest');
  var point = glift.util.point,
      bboxFromPts = glift.orientation.bbox.fromPts;

  test('Test that the center is the shifted average', function() {
    var bbox = bboxFromPts(point(1, 1), point(19, 21));
    deepEqual(bbox.center().x(), 10, 'center.x() must be 9');
    deepEqual(bbox.center().y(), 11, 'center.y() must be 10');
  });

  test('Width and height should be calculated correctly', function() {
    var bbox = bboxFromPts(point(1, 9), point(18, 20));
    deepEqual(bbox.width(), 17, 'Width should be br.x() - tl.x()');
    deepEqual(bbox.height(), 11, 'Width should be br.y() - tl.y()');

    // We don't support non-standard bboxes where the TL is > BR
    // var bbox = bboxFromPts(point(18, 20), point(1, 9));
    // deepEqual(bbox.width(), -17, 'Width should be br.x() - tl.x()');
    // deepEqual(bbox.height(), -11, 'Width should be br.y() - tl.y()');
  });

  test('Equality test', function() {
    var bbox = bboxFromPts(point(1, 9), point(18, 20));
    var bbox_v2 = glift.orientation.bbox.fromSides(point(1, 9), 17, 11);
    var bbox_v3 = glift.orientation.bbox.fromSides(point(1, 10), 17, 11);
    ok(bbox.equals(bbox_v2), 'should be equal');
    ok(!bbox.equals(bbox_v3), 'shouldn\'t be equal');
    ok(!bbox_v2.equals(bbox_v3), 'shouldn\'t be equal');
  });

  test('Contains test', function() {
    var bbox = bboxFromPts(point(1,9), point(10, 13));
    ok(bbox.contains(point(10, 9)), 'Must contain edge pt');
    ok(bbox.contains(point(1, 13)), 'Must contain edge pt');
    ok(bbox.contains(point(4, 11)), 'Must contain middle pt');
    ok(!bbox.contains(point(4, 14)), 'Must not contain outside pt');
  });

  test('scaletest', function() {
    var bbox = bboxFromPts(point(1,10), point(11, 20));
    deepEqual(bbox.width(), 10, 'width');
    deepEqual(bbox.height(), 10, 'height');

    var smallBbox = bbox.scale(0.5);
    deepEqual(smallBbox.width(), 5, 'small width');
    deepEqual(smallBbox.height(), 5, 'small height');
    deepEqual(smallBbox.topLeft().x(), 0.5, 'tl.x');
    deepEqual(smallBbox.topLeft().y(), 5, 'tl.y');
  });

  test('translate test', function() {
    var bbox = bboxFromPts(point(1,10), point(11, 20));
    var newBox = bbox.translate(13, 6);
    deepEqual(newBox.topLeft().x(), bbox.topLeft().x() + 13, 'tl.x');
    deepEqual(newBox.topLeft().y(), bbox.topLeft().y() + 6, 'tl.y');
    deepEqual(newBox.botRight().x(), bbox.botRight().x() + 13, 'br.x');
    deepEqual(newBox.botRight().y(), bbox.botRight().y() + 6, 'br.y');
    deepEqual(newBox.width(), bbox.width(), 'width');
    deepEqual(newBox.height(), bbox.height(), 'height');
  });

  test('hSplit: basic 50/50 split', function() {
    var bbox = bboxFromPts(point(100, 200), point(300, 400));
    var bboxes = bbox.hSplit([0.5]);
    ok(bboxes !== undefined);
    ok(glift.util.typeOf(bboxes) === 'array');

    var expected1 = bboxFromPts(point(100,200), point(300, 300));
    deepEqual(bboxes[0].topLeft().x(), expected1.topLeft().x(),
      'First hSplit Bbox: tl.x');
    deepEqual(bboxes[0].topLeft().y(), expected1.topLeft().y(),
      'First hSplit Bbox: tl.y');
    deepEqual(bboxes[0].botRight().x(), expected1.botRight().x(),
      'First hSplit Bbox: br.x');
    deepEqual(bboxes[0].botRight().y(), expected1.botRight().y(),
      'First hSplit Bbox: br.y');

    var expected2 = bboxFromPts(point(100, 300), point(300, 400));
    deepEqual(bboxes[1].topLeft().x(), expected2.topLeft().x(),
      'Second hSplit Bbox: tl.x');
    deepEqual(bboxes[1].topLeft().y(), expected2.topLeft().y(),
      'Second hSplit Bbox: tl.y');
    deepEqual(bboxes[1].botRight().x(), expected2.botRight().x(),
      'Second hSplit Bbox: br.x');
    deepEqual(bboxes[1].botRight().y(), expected2.botRight().y(),
      'Second hSplit Bbox: br.y');
  });

  test('vSplit: basic 50/50 split', function() {
    var bbox = bboxFromPts(point(100, 200), point(300, 400));
    var bboxes = bbox.vSplit([0.5]);
    ok(bboxes !== undefined);
    ok(glift.util.typeOf(bboxes) === 'array');

    var expected1 = bboxFromPts(point(100,200), point(200, 400));
    deepEqual(bboxes[0].topLeft().x(), expected1.topLeft().x(),
      'First vSplit Bbox: tl.x');
    deepEqual(bboxes[0].topLeft().y(), expected1.topLeft().y(),
      'First vSplit Bbox: tl.y');
    deepEqual(bboxes[0].botRight().x(), expected1.botRight().x(),
      'First vSplit Bbox: br.x');
    deepEqual(bboxes[0].botRight().y(), expected1.botRight().y(),
      'First vSplit Bbox: br.y');

    var expected2 = bboxFromPts(point(200, 200), point(300, 400));
    deepEqual(bboxes[1].topLeft().x(), expected2.topLeft().x(),
      'Second vSplit Bbox: tl.x');
    deepEqual(bboxes[1].topLeft().y(), expected2.topLeft().y(),
      'Second vSplit Bbox: tl.y');
    deepEqual(bboxes[1].botRight().x(), expected2.botRight().x(),
      'Second vSplit Bbox: br.x');
    deepEqual(bboxes[1].botRight().y(), expected2.botRight().y(),
      'Second vSplit Bbox: br.y');
  });

  test('Splits: 70/20/10 (widget example)', function() {
    var bbox = bboxFromPts(point(100, 200), point(200, 300));
    var bboxes = bbox.hSplit([0.7, 0.2]);
    var expected1 = bboxFromPts(point(100,200), point(200, 270));
    var expected2 = bboxFromPts(point(100,270), point(200, 290));
    var expected3 = bboxFromPts(point(100,290), point(200, 300));
    deepEqual(bboxes, [expected1, expected2, expected3], 'hSplits');

    bboxes = bbox.vSplit([0.7, 0.2]);
    expected1 = bboxFromPts(point(100,200), point(170, 300));
    expected2 = bboxFromPts(point(170,200), point(190, 300));
    expected3 = bboxFromPts(point(190,200), point(200, 300));
    deepEqual(bboxes, [expected1, expected2, expected3], 'hSplits');
  });

  test('Expand a bounding box to contain a new point', function() {
    var base = bboxFromPts(point(100, 200), point(200, 300));

    var newBbox = base.expandToContain(point(90, 180));
    var expected = bboxFromPts(point(90, 180), point(200, 300));
    ok(newBbox.equals(expected), 'Expand to TL');

    newBbox = base.expandToContain(point(210, 320));
    expected = bboxFromPts(point(100, 200), point(210, 320));
    ok(newBbox.equals(expected), 'Expand to BR');

    newBbox = base.expandToContain(point(150, 250));
    ok(newBbox.equals(base), 'Don\'t expand for inside point');
  });

  test('Expand a bounding box: starting with pt', function() {
    var base = bboxFromPts(point(100, 200), point(100, 200));

    var newBbox = base.expandToContain(point(90, 200));
    var expected = bboxFromPts(point(90, 200), point(100, 200));
    ok(newBbox.equals(expected), 'Expand to TL');
  });

  test('Intersecting bboxes', function() {
    var bbox = bboxFromPts(point(10, 10), point(20, 20));
    var obox = bboxFromPts(point(15, 12), point(35, 45));
    var expected = bboxFromPts(point(15, 12), point(20, 20));
    deepEqual(bbox.intersect(obox), expected);
    ok(bbox.covers(expected));
    ok(obox.covers(expected));

    bbox = bboxFromPts(point(10, 10), point(20, 20));
    obox = bboxFromPts(point(15, 12), point(17, 18));
    expected = bboxFromPts(point(15, 12), point(17, 18));
    deepEqual(bbox.intersect(obox), expected);
    ok(bbox.covers(expected));
    ok(obox.covers(expected));

    bbox = bboxFromPts(point(10, 10), point(20, 20));
    obox = bboxFromPts(point(25, 22), point(35, 35));
    expected = null;
    deepEqual(bbox.intersect(obox), expected);
  });
})();
