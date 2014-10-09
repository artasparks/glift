glift.flattener.flattenTest = function() {
  module('glift.flattener.flattenTest');
  var symb = glift.flattener.symbols;
  var boardRegions = glift.enums.boardRegions;
  var sgfs = testdata.sgfs;
  var flattener  = glift.flattener;
  var toPt = glift.util.pointFromSgfCoord;
  var point = glift.util.point;

  test('Basic Flattened', function() {
    var basicSgf = '(;GB[1]C[foo]AW[aa]AB[ab]LB[ab:z])';
    var movetree = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(movetree);
    deepEqual(f.comment(), 'foo');

    var board = f.board();
    deepEqual(board.intersections().length, 19);
    deepEqual(board.intersections()[0].length, 19);

    var i = board.getIntBoardIdx(toPt('aa'));
    ok(i !== undefined);
    deepEqual(i.base(), symb.TL_CORNER);
    deepEqual(i.stone(), symb.WSTONE);
    deepEqual(i.mark(), symb.EMPTY);

    i = board.getIntBoardIdx(toPt('ab'));
    deepEqual(i.base(), symb.LEFT_EDGE);
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.TEXTLABEL);
  });

  test('Goban auto-recalculation', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    mt.moveDown().moveDown();
    var f = flattener.flatten(mt);

    deepEqual(f.comment(), 'zed');
    deepEqual(f.board().getIntBoardIdx(toPt('aa')).stone(), symb.BSTONE);
    deepEqual(f.board().getIntBoardIdx(toPt('ab')).stone(), symb.WSTONE);
  });

  test('Simple next moves + labeling', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0]
    });

    var i = f.board().getIntBoardIdx(toPt('aa'));
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.TEXTLABEL);
    deepEqual(i.textLabel(), '1');

    i = f.board().getIntBoardIdx(toPt('ab'));
    deepEqual(i.stone(), symb.WSTONE);
    deepEqual(i.mark(), symb.TEXTLABEL);
    deepEqual(i.textLabel(), '2');
  });

  test('Create collision labels', function() {
    var sgf = '(;GB[1]AW[aa][ba]AB[ab][bb][cb]' +
        ';B[jj]' +
        ';W[ca]' + // for move numbering.
        ';B[da]' + // capture
        ';W[ca];B[ba])'; // collisions
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0,0,0,0]
    });

    deepEqual(f.collisions().length, 2);
    var col = f.collisions();
    deepEqual(col[0].color, 'WHITE');
    deepEqual(col[0].mvnum, '4');
    deepEqual(col[0].label, '2');

    deepEqual(col[1].color, 'BLACK');
    deepEqual(col[1].mvnum, '5');
    deepEqual(col[1].label, 'a');
  });

  test('Create collision labels -- manual labels', function() {
    var sgf = '(;GB[1]AW[aa][ba]AB[ab][bb]' +
        ';B[ca]' + // capture
        ';W[aa]LB[aa:X])'; // collision + labels
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0]
    });
    deepEqual(f.collisions().length, 1);
    var col = f.collisions();
    deepEqual(col[0].color, 'WHITE');
    deepEqual(col[0].mvnum, '2');
    deepEqual(col[0].label, 'X');
  });
};
