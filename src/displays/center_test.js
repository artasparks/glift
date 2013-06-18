glift.displays.centerTest = function() {
  module("Center Tests");
  var point = glift.util.point,
      rowCenter = glift.displays.rowCenter,
      bboxFromPts = glift.displays.bboxFromPts,
      baseBox = bboxFromPts(point(0,0), point(250, 50));
  test("Simple object row-center", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var translates = rowCenter(baseBox, [oneBox], 0, 0, 0, 0);
    var trans = translates[0];
    deepEqual(trans.xScale, 5, 'xscale');
    deepEqual(trans.yScale, 5, 'yscale');
    deepEqual(trans.xMove, 100, 'xMove');
    deepEqual(trans.yMove, 0, 'yMove');
  });

  test("RowCenter two objects (simple)", function() {
    var oneBox = bboxFromPts(point(0, 0), point(10, 10));
    var twoBox = bboxFromPts(point(0, 0), point(25, 25));
    var translates = rowCenter(baseBox, [oneBox, twoBox], 0, 0, 0, 0);
    var transOne = translates[0];
    deepEqual(transOne.xScale, 5, 'xscale');
    deepEqual(transOne.yScale, 5, 'yscale');
    deepEqual(transOne.xMove, 50, 'xMove');
    deepEqual(transOne.yMove, 0, 'yMove');

    var transTwo = translates[1];
    deepEqual(transTwo.xScale, 2, 'xscale');
    deepEqual(transTwo.yScale, 2, 'yscale');
    deepEqual(transTwo.xMove, 150, 'xMove');
    deepEqual(transTwo.yMove, 0, 'yMove');
  })
};
