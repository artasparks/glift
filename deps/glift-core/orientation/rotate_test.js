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

  test('Autorotate: corner', function() {
    var pt = glift.util.point;
    var mt = glift.rules.movetree.getFromSgf(
      '(;GM[1]B[cb]C[foo];W[ac])');

    deepEqual(mt.properties().getAsPoint('B'),  pt(2, 1));
    var nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.TOP_LEFT,
      side: boardRegions.TOP,
      preferRotate: true,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(2, 1));
    deepEqual(nmt.properties().getOneValue('C'), 'foo');

    nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.TOP_RIGHT,
      side: boardRegions.TOP,
      preferRotate: true,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(17, 2));
    deepEqual(nmt.properties().getOneValue('C'), 'foo');
    nmt.moveDown();
    deepEqual(nmt.properties().getAsPoint('W'),  pt(16, 0));

    nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.BOTTOM_RIGHT,
      side: boardRegions.TOP,
      preferRotate: true,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(16, 17));

    nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.BOTTOM_LEFT,
      side: boardRegions.TOP,
      preferRotate: true,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(1, 16));
  });

  test('Autorotate: corner, flip', function() {
    var pt = glift.util.point;
    var sgf = '(;GM[1]B[cb]C[foo];W[ac])';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    deepEqual(mt.properties().getAsPoint('B'),  pt(2, 1));

    // Should be no flip
    var nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.TOP_LEFT,
      preferRotate: false,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(2, 1));
    deepEqual(nmt.properties().getOneValue('C'), 'foo');

    // Horizontal flip
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.TOP_RIGHT,
      preferRotate: false,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(16, 1));
    deepEqual(nmt.properties().getOneValue('C'), 'foo');
    nmt.moveDown();
    deepEqual(nmt.properties().getAsPoint('W'),  pt(18, 2));

    // Vertical flip
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateCrop(mt, {
      corner: boardRegions.BOTTOM_LEFT,
      preferRotate: false,
    });
    deepEqual(nmt.properties().getAsPoint('B'),  pt(2, 17));
    deepEqual(nmt.properties().getOneValue('C'), 'foo');
    nmt.moveDown();
    deepEqual(nmt.properties().getAsPoint('W'),  pt(0, 16));
  });

  test('Autorotate: side, flip', function() {
    var pt = glift.util.point;
    var sgf = '(;GM[1]AB[aa];B[cb]C[foo];W[sc])';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    deepEqual(mt.properties().getAsPoint('AB').toString(),  pt(0, 0).toString());

    // Should be no flip
    var nmt = glift.orientation.autoRotateCrop(mt, {
      side: boardRegions.TOP,
      preferRotate: false,
    });
    nmt.moveDown();
    deepEqual(nmt.properties().getAsPoint('B').toString(),  pt(2, 1).toString());
    deepEqual(nmt.properties().getOneValue('C'), 'foo');

    // Vertical flip
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateCrop(mt, {
      side: boardRegions.BOTTOM,
      preferRotate: false,
    });
    deepEqual(nmt.properties().getAsPoint('AB').toString(),  pt(0, 18).toString());
    nmt.moveDown();
    deepEqual(nmt.properties().getAsPoint('B').toString(),  pt(2, 17).toString());

    // Horizontal flip
    sgf = '(;GM[1]AB[aa];B[cb]C[foo];W[cs])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateCrop(mt, {
      side: boardRegions.RIGHT,
      preferRotate: false,
    });
    deepEqual(nmt.properties().getAsPoint('AB'),  pt(18, 0));
    nmt.moveDown();
    deepEqual(nmt.properties().getOneValue('C'), 'foo');
    deepEqual(nmt.properties().getAsPoint('B'),  pt(16, 1));
  });

  test('Auto rotate: game', function() {
    var sgf = '(;GM[1]AB[aa];B[pd]C[foo];W[sc])';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var nmt = glift.orientation.autoRotateGame(mt);
    nmt.moveDown();
    deepEqual(nmt.properties().getOneValue('B'), 'pd');

    sgf = '(;GM[1]AB[aa];B[dd]C[foo];W[sc])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    nmt.moveDown();
    deepEqual(nmt.properties().getOneValue('B'), 'pd');

    sgf = '(;GM[1]AB[aa];B[dp]C[foo];W[sc])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    nmt.moveDown();
    deepEqual(nmt.properties().getOneValue('B'), 'pd');

    sgf = '(;GM[1]AB[aa];B[pp]C[foo];W[sc])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    nmt.moveDown();
    deepEqual(nmt.properties().getOneValue('B'), 'pd');

    sgf = '(;GM[1]B[as])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    deepEqual(nmt.properties().getOneValue('B'), 'sa');

    sgf = '(;GM[1]B[aa])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    deepEqual(nmt.properties().getOneValue('B'), 'sa');

    sgf = '(;GM[1]B[sa])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    deepEqual(nmt.properties().getOneValue('B'), 'sa');

    sgf = '(;GM[1]B[ss])';
    mt = glift.rules.movetree.getFromSgf(sgf);
    nmt = glift.orientation.autoRotateGame(mt);
    deepEqual(nmt.properties().getOneValue('B'), 'sa');
  });
})();
