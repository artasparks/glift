(function() {
  module('glift.displays.centerTest');
  var point = glift.util.point,
      rowCenter = glift.displays.rowCenterSimple,
      columnCenter = glift.displays.columnCenterSimple,
      bboxFromPts = glift.orientation.bbox.fromPts,
      baseBox = bboxFromPts(point(0,0), point(250, 50)),
      baseVBox = bboxFromPts(point(0,0), point(50, 250));

  test("Simple object row-center", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var centerInfo = rowCenter(baseBox, [oneBox], 0, 0);
    var transforms = centerInfo.transforms;
    var trans = transforms[0];
    deepEqual(trans.scale, 5, 'xscale');
    deepEqual(trans.xMove, 100, 'xMove');
    deepEqual(trans.yMove, 0, 'yMove');

    var bbox = centerInfo.bboxes[0];
    deepEqual(bbox.topLeft().x(), 100, 'tl.x');
    deepEqual(bbox.topLeft().y(), 0, 'tl.y');
    deepEqual(bbox.botRight().x(), 150, 'br.x');
    deepEqual(bbox.botRight().y(), 50, 'br.y');
  });

  test("RowCenter two objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 0, 0).transforms;
    var transOne = transforms[0];
    deepEqual(transOne.scale, 5, 'xscale');
    deepEqual(transOne.xMove, 50, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transTwo.scale, 2, 'xscale');
    deepEqual(transTwo.xMove, 150, 'xMove');
    deepEqual(transTwo.yMove, 0, 'yMove');
  });

  test("RowCenter three objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var threeBox = bboxFromPts(point(0, 0), point(20, 20));
    var transforms = rowCenter(baseBox, [oneBox, twoBox, threeBox], 0, 0)
        .transforms;
    var transOne = transforms[0];
    // 250 - 150 = 100; 100 / 4 = 25.
    deepEqual(transOne.scale, 5, 'xscale');
    deepEqual(transOne.xMove, 25, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transTwo.scale, 2, 'xscale');
    deepEqual(transTwo.xMove, 100, 'xMove');
    deepEqual(transTwo.yMove, 0, 'yMove');
    var transThree = transforms[2];
    deepEqual(transThree.scale, 2.5, 'xscale');
    deepEqual(transThree.xMove, 175, 'xMove');
    deepEqual(transThree.yMove, 0, 'yMove');
  });

  test("RowCenter: Vert margin -- two objects", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 5, 0)
        .transforms;
    var transOne = transforms[0];
    deepEqual(transOne.scale, 4, 'xscale');
    deepEqual(transOne.yMove, 5, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transOne.scale, 4, 'xscale');
    deepEqual(transOne.yMove, 5, 'yMove');
  });

  test("RowCenter: Horz margin -- two objects", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25))
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 0, 75).transforms;
    var transOne = transforms[0];
    ok(transOne !== undefined, 'transOne');
    deepEqual(transOne.scale, 5, 'scale');
    deepEqual(transOne.xMove, 75, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    ok(transTwo !== undefined, 'transTwo');
    deepEqual(transTwo.scale, 2, 'scale t2');
    deepEqual(transTwo.xMove, 125, 'yMove t2');
    deepEqual(transOne.yMove, 0, 'xMove t2');
  });

  test("Column Center two objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = columnCenter(baseVBox, [oneBox, twoBox], 0, 0).transforms;
    var transOne = transforms[0];
    deepEqual(transOne.scale, 5, 'xscale');
    deepEqual(transOne.xMove, 0, 'xMove');
    deepEqual(transOne.yMove, 50, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transTwo.scale, 2, 'xscale');
    deepEqual(transTwo.xMove, 0, 'xMove');
    deepEqual(transTwo.yMove, 150, 'yMove');
  });
})();
