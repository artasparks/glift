glift.util.pointTest = function() {
  module('glift.util.pointTest');
  var rules = glift.rules,
      util = glift.util,
      logz = glift.util.logz;

  test('Create, basic methods', function() {
    var pt = util.point(1, 5);
    var pt2 = util.point(1, 5);
    deepEqual(pt.x(), 1, 'x val');
    deepEqual(pt.y(), 5, 'y val');
    deepEqual(util.coordToString(1, 5), '1,5', 'coord to string');;
    ok(pt.equals(pt2), 'equals');
  });

  test('hash and unhash', function() {
    var pt = util.point(1, 12);
    deepEqual(pt.toString(), '1,12', 'to string must be a comma-sep pair');
    deepEqual(pt.hash(), pt.toString(), 'hash and string must be equal');
    var newPt = util.pointFromHash(pt.hash());
    ok(newPt.equals(pt), 'pts must be equal')
  });

  test('rotation', function() {
    var point = glift.util.point;
    var rotations = glift.enums.rotations;

    var pt = point(2, 3);
    deepEqual(pt.rotate(19, rotations.CLOCKWISE_90), point(15, 2));
    deepEqual(pt.rotate(19, rotations.CLOCKWISE_180), point(16, 15));
    deepEqual(pt.rotate(19, rotations.CLOCKWISE_270), point(3, 16));
    deepEqual(pt.rotate(19, 'foo'), point(2, 3),
        'bad value for rotation should give back same pt');

    var pt = point(9, 1);
    deepEqual(pt.rotate(19, rotations.CLOCKWISE_90), point(17, 9));
  });

  // TODO(kashomon): Add back in now that we no longer cache points.
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
