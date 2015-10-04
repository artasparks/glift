(function() {
  module('glift.orientation.cropbox');
  var pt = glift.util.point;
  var bbox = glift.displays.bbox.fromPts;
  var br = glift.enums.boardRegions;
  var getCbox = glift.orientation.cropbox.get;

  test('Construct cropbox', function() {
    var cp = getCbox(br.ALL, 19);
    deepEqual(cp.xPoints(), 18);
    deepEqual(cp.yPoints(), 18);

    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });

  test('Corner cropboxes', function() {
    var cp = getCbox(br.TOP_LEFT, 19);
    deepEqual(cp.xPoints(), 11);
    deepEqual(cp.yPoints(), 10);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.TOP_RIGHT, 19);
    deepEqual(cp.xPoints(), 11);
    deepEqual(cp.yPoints(), 10);
    ok(!cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM_LEFT, 19);
    deepEqual(cp.xPoints(), 11);
    deepEqual(cp.yPoints(), 10);
    ok(cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM_RIGHT, 19);
    deepEqual(cp.xPoints(), 11);
    deepEqual(cp.yPoints(), 10);
    ok(cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });

  test('half cropboxes', function() {
    var cp = getCbox(br.TOP, 19);
    deepEqual(cp.xPoints(), 18);
    deepEqual(cp.yPoints(), 10);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.BOTTOM, 19);
    deepEqual(cp.xPoints(), 18);
    deepEqual(cp.yPoints(), 10);
    ok(cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());

    cp = getCbox(br.LEFT, 19);
    deepEqual(cp.xPoints(), 10);
    deepEqual(cp.yPoints(), 18);
    ok(!cp.hasRaggedTop());
    ok(!cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(cp.hasRaggedRight());

    cp = getCbox(br.RIGHT, 19);
    deepEqual(cp.xPoints(), 10);
    deepEqual(cp.yPoints(), 18);
    ok(!cp.hasRaggedTop());
    ok(cp.hasRaggedLeft());
    ok(!cp.hasRaggedBottom());
    ok(!cp.hasRaggedRight());
  });
})();
