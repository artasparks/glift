(function() {
  module('glift.flattener.starpointsTest');
  var sp = glift.flattener.starpoints;

  test('Is starpoint', function() {
    ok(sp.isPt(new glift.Point(4,4), 9));
    ok(sp.isPt(new glift.Point(3,9), 13));
    ok(sp.isPt(new glift.Point(9,15), 19));
    ok(!sp.isPt(new glift.Point(10,15), 19));
    ok(!sp.isPt(new glift.Point(10,15), 10));
  });

  test('Is starpoint', function() {
    ok(sp.allPts(10), [])
    ok(sp.allPts(9), [new glift.Point(4,4)])
    ok(sp.allPts(13), [
      new glift.Point(3,3),
      new glift.Point(3,9),
      new glift.Point(6,6),
      new glift.Point(9,3),
      new glift.Point(9,9)]);
  });
})();
