glift.util.pointTest = function() {
  module("Point Test Suite");
  var rules = glift.rules,
      util = glift.util,
      logz = glift.util.logz;

  test("Create, basic methods", function() {
    var pt = util.point(1, 5);
    var pt2 = util.uncachedPoint(1, 5);
    deepEqual(pt.x(), 1, "x val");
    deepEqual(pt.y(), 5, "y val");
    deepEqual(util.coordToString(1, 5), "1,5", "coord to string");;
    ok(pt.equals(pt2), "equals");
  });

  test("hash and unhash", function() {
    var pt = util.point(1, 12);
    deepEqual(pt.toString(), "1,12", "to string must be a comma-sep pair");
    deepEqual(pt.hash(), pt.toString(), "hash and string must be equal");
    var newPt = util.pointFromHash(pt.hash());
    ok(newPt.equals(pt), "pts must be equal")
  });

  test("test point cache", function() {
    var pt = util.point(1, 12);
    ok(glift.util._cacheHasPoint(1, 12), "cache must be populated")
    var otherPt = util.point(1, 12);
    ok(pt === otherPt, "pts must be precisely equal")
  });

  // test("Test immutability", function() {
    // var pt = util.uncachedPoint(1, 3);
    // var pt2 = util.uncachedPoint(1, 3);
    // ok(pt.equals(pt2), "pts must be equal");
    // deepEqual(pt.toString(), pt2.toString());
    // deepEqual(pt.toString(), pt2.toString(), "must have same string" +
        // "representation");
    // ok(pt.equals(pt2), "must still be equal");
  // });
};
