(function() {
  module('glift.orientation.cropbox');
  var pt = glift.util.point;
  var bbox = glift.orientation.bbox.fromPts;
  var br = glift.enums.boardRegions;
  var getCbox = glift.orientation.cropbox.get;

  test('Construct cropbox', function() {
    var cp = getCbox(br.ALL, 19);
    deepEqual(cp.bbox.width(), 18);
    deepEqual(cp.bbox.height(), 18);

    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });

  test('Corner cropboxes', function() {
    var cp = getCbox(br.TOP_LEFT, 19);
    deepEqual(cp.bbox.width(), 11);
    deepEqual(cp.bbox.height(), 10);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.TOP_RIGHT, 19);
    deepEqual(cp.bbox.width(), 11);
    deepEqual(cp.bbox.height(), 10);
    ok(!cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM_LEFT, 19);
    deepEqual(cp.bbox.width(), 11);
    deepEqual(cp.bbox.height(), 10);
    ok(cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM_RIGHT, 19);
    deepEqual(cp.bbox.width(), 11);
    deepEqual(cp.bbox.height(), 10);
    ok(cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });

  test('half cropboxes', function() {
    var cp = getCbox(br.TOP, 19);
    deepEqual(cp.bbox.width(), 18);
    deepEqual(cp.bbox.height(), 10);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM, 19);
    deepEqual(cp.bbox.width(), 18);
    deepEqual(cp.bbox.height(), 10);
    ok(cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.LEFT, 19);
    deepEqual(cp.bbox.width(), 10);
    deepEqual(cp.bbox.height(), 18);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.RIGHT, 19);
    deepEqual(cp.bbox.width(), 10);
    deepEqual(cp.bbox.height(), 18);
    ok(!cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });
})();
