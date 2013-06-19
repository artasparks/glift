glift.displays.centerTest = function() {
  module("Center Tests");
  var point = glift.util.point,
      rowCenter = glift.displays.rowCenter,
      bboxFromPts = glift.displays.bboxFromPts,
      baseBox = bboxFromPts(point(0,0), point(250, 50));

  test("Simple object row-center", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var transforms = rowCenter(baseBox, [oneBox], 0, 0, 0, 0);
    var trans = transforms[0];
    deepEqual(trans.xScale, 5, 'xscale');
    deepEqual(trans.yScale, 5, 'yscale');
    deepEqual(trans.xMove, 100, 'xMove');
    deepEqual(trans.yMove, 0, 'yMove');
  });

  test("RowCenter two objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 0, 0, 0, 0);
    var transOne = transforms[0];
    deepEqual(transOne.xScale, 5, 'xscale');
    deepEqual(transOne.yScale, 5, 'yscale');
    deepEqual(transOne.xMove, 50, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transTwo.xScale, 2, 'xscale');
    deepEqual(transTwo.yScale, 2, 'yscale');
    deepEqual(transTwo.xMove, 150, 'xMove');
    deepEqual(transTwo.yMove, 0, 'yMove');
  });

  test("RowCenter three objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var threeBox = bboxFromPts(point(0, 0), point(20, 20));
    var transforms = rowCenter(baseBox, [oneBox, twoBox, threeBox], 0, 0, 0, 0);
    var transOne = transforms[0];
    // 250 - 150 = 100; 100 / 4 = 25.
    deepEqual(transOne.xScale, 5, 'xscale');
    deepEqual(transOne.yScale, 5, 'yscale');
    deepEqual(transOne.xMove, 25, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transTwo.xScale, 2, 'xscale');
    deepEqual(transTwo.yScale, 2, 'yscale');
    deepEqual(transTwo.xMove, 100, 'xMove');
    deepEqual(transTwo.yMove, 0, 'yMove');
    var transThree = transforms[2];
    deepEqual(transThree.xScale, 2.5, 'xscale');
    deepEqual(transThree.yScale, 2.5, 'yscale');
    deepEqual(transThree.xMove, 175, 'xMove');
    deepEqual(transThree.yMove, 0, 'yMove');
  });

  test("RowCenter: Vert margin -- two objects", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 5, 0, 0, 0);
    var transOne = transforms[0];
    deepEqual(transOne.xScale, 4, 'xscale');
    deepEqual(transOne.yScale, 4, 'yscale');
    deepEqual(transOne.yMove, 5, 'yMove');
    var transTwo = transforms[1];
    deepEqual(transOne.xScale, 4, 'xscale');
    deepEqual(transOne.yScale, 4, 'yscale');
    deepEqual(transOne.yMove, 5, 'yMove');
  });

  test("RowCenter: Horz margin -- two objects", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var transforms = rowCenter(baseBox, [oneBox, twoBox], 0, 75, 0, 0);
    var transOne = transforms[0];
    ok(transOne !== undefined, 'transOne');
    deepEqual(transOne.xScale, 5, 'xscale');
    deepEqual(transOne.yScale, 5, 'yscale');
    deepEqual(transOne.xMove, 75, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');
    var transTwo = transforms[1];
    ok(transTwo !== undefined, 'transTwo');
    deepEqual(transTwo.xScale, 2, 'xscale t2');
    deepEqual(transTwo.yScale, 2, 'yscale t2');
    deepEqual(transTwo.xMove, 125, 'yMove t2');
    deepEqual(transOne.yMove, 0, 'xMove t2');
  });
};
