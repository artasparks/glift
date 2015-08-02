(function() {
  module('glift.orientation.rotationTests');
  var rotations = glift.enums.rotations;
  var boardRegions = glift.enums.boardRegions;

  var ordering = {
    corner: boardRegions.TOP_RIGHT,
    side: boardRegions.TOP
  };

  test('findCanonicalRotation: corner', function() {
    var find = glift.orientation.findCanonicalRotation;
    var mt = glift.rules.movetree.getFromSgf('(;GM[1];B[aa])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_90);

    mt = glift.rules.movetree.getFromSgf('(;GM[1];B[ma])');
    deepEqual(find(mt, ordering), rotations.NO_ROTATION);

    mt = glift.rules.movetree.getFromSgf('(;GM[1];B[am])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_180);

    mt = glift.rules.movetree.getFromSgf('(;GM[1];B[mm])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_270);
  });

  test('findCanonicalRotation: side', function() {
    var find = glift.orientation.findCanonicalRotation;
    var mt = glift.rules.movetree.getFromSgf('(;GM[1];B[aa];W[ma])');
    deepEqual(find(mt, ordering), rotations.NO_ROTATION);

    var mt = glift.rules.movetree.getFromSgf('(;GM[1];B[aa];W[am])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_90);

    var mt = glift.rules.movetree.getFromSgf('(;GM[1];B[mm];W[am])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_180);

    var mt = glift.rules.movetree.getFromSgf('(;GM[1];B[mm];W[ma])');
    deepEqual(find(mt, ordering), rotations.CLOCKWISE_270);
  });
})();
