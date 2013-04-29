glift.util.pointTest = function() {
  var rules = glift.rules,
      util = glift.util,
      logz = glift.util.logz;

  test("--------Point Test--------", function() { ok(true); });

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
};

