(function() {
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
    deepEqual(board.boardArray().length, 19);
    deepEqual(board.boardArray()[0].length, 19);

    var i = board.getIntBoardPt(toPt('aa'));
    ok(i !== undefined);
    deepEqual(i.base(), symb.TL_CORNER);
    deepEqual(i.stone(), symb.WSTONE);
    deepEqual(i.mark(), symb.EMPTY);

    i = board.getIntBoardPt(toPt('ab'));
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
    deepEqual(f.board().getIntBoardPt(toPt('aa')).stone(), symb.BSTONE);
    deepEqual(f.board().getIntBoardPt(toPt('ab')).stone(), symb.WSTONE);
  });

  test('Simple next moves + labeling', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0]
    });

    var i = f.board().getIntBoardPt(toPt('aa'));
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.TEXTLABEL);
    deepEqual(i.textLabel(), '1');

    i = f.board().getIntBoardPt(toPt('ab'));
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
      nextMovesTreepath: [0,0,0,0,0],
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
      nextMovesTreepath: [0,0],
    });
    deepEqual(f.collisions().length, 1);
    var col = f.collisions();
    deepEqual(col[0].color, 'WHITE');
    deepEqual(col[0].mvnum, '2');
    deepEqual(col[0].label, 'X');
  });

  test('Test ensure cropping exists', function() {
    var sgf = '(;GB[1]AW[aa][ba]AB[ab][bb])';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, { boardRegion: 'TOP_LEFT' });
    deepEqual(glift.util.typeOf(f._cropping), 'object');
    deepEqual(f._cropping, glift.displays.cropbox.getFromRegion('TOP_LEFT', 19));
  });

  test('isOnMainPath', function() {
    var sgf = '(;GB[1](;B[aa])(;B[ab]))';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0]
    });

    f = flattener.flatten(mt, {
      nextMovesTreepath: [1]
    });
    var inter = f.board().getIntBoardPt(toPt('ab'));
    deepEqual(inter.stone(), symb.BSTONE);
    ok(!f.isOnMainPath());

    mt = glift.rules.movetree.getFromSgf(sgf, [1]);
    ok(!mt.onMainline());
    f = flattener.flatten(mt);
    ok(!f.isOnMainPath());
  });

  test('findStartingMoveNum', function() {
    findNum = glift.flattener._findStartingMoveNum;
    var sgf = '(;GB[1]' +
        ';B[aa]' +
        '(;W[ba](;B[cc])(;B[dd]))' +
        '(;W[ab](;B[cc])(;B[dd])))';
    var mt = glift.rules.movetree.getFromSgf(sgf, []);
    deepEqual(findNum(mt, []), 1, 'at root');
    deepEqual(findNum(mt, [0]), 1, 'at root with next moves');
    deepEqual(findNum(mt, [1]), 1, 'at root with next moves on var');

    mt.moveDown()
    deepEqual(findNum(mt, []), 2, 'next move mainpath');
    deepEqual(findNum(mt, [0]), 2, 'next move, mainpath, next on root');
    deepEqual(findNum(mt, [1]), 1, 'next move, mainpath, next on variation');

    mt.moveDown(1);
    deepEqual(findNum(mt, [0]), 2, 'next move, variation, next on variation');
    deepEqual(findNum(mt, [1]), 2, 'next move, variation, next on variation');
  });

  test('Move numbers', function() {
    var simpleSgf = '(;GB[1];B[aa];W[bb])';
    var mt = glift.rules.movetree.getFromSgf(simpleSgf, '2');
    deepEqual(mt.node().getNodeNum(), 2);
    var f = flattener.flatten(mt);

    // Note: the next move should be the current position + 1 since it's design
    // for auto-labeling of next-move-paths.
    deepEqual(f.startingMoveNum(), 3, 'no next path, start');
    deepEqual(f.endingMoveNum(), 3, 'no next path, end');
    deepEqual(f.mainlineMoveNum(), 2, 'mainline move num');

    var mainpathSgf = '(;GB[1];B[aa];W[bb];B[cc];W[dd];B[ee];W[ff])';
    mt = glift.rules.movetree.getFromSgf(mainpathSgf, '1');
    f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0,0,0]
    });
    deepEqual(f.startingMoveNum(), 2, 'next path on main line');
    deepEqual(f.endingMoveNum(), 5, 'next path on main line');
    deepEqual(f.mainlineMoveNum(), 1, 'mainline move num');
    deepEqual(f.isOnMainPath(), true);

    var variationSgf = '(;GB[1];B[aa];W[bb](;B[kk])(;B[cc];W[dd];B[ee];W[ff]))';
    mt = glift.rules.movetree.getFromSgf(variationSgf, '2');
    f = flattener.flatten(mt, {
      nextMovesTreepath: [1,0,0,0]
    });
    deepEqual(f.startingMoveNum(), 1);
    deepEqual(f.endingMoveNum(), 4);
    deepEqual(f.mainlineMoveNum(), 2, 'mainline move num');
    deepEqual(f.isOnMainPath(), false);
  });

  test('Move numbers > 100', function() {
    var mt = glift.rules.movetree.getFromSgf(sgfs.yearbookExample, '99');
    deepEqual(mt.node().getNodeNum(), 99);
    var f = flattener.flatten(mt, {
      nextMovesTreepath: [0,0,0,0,0,0,0,0]
    });
    var stones = ['go', 'fo', 'ho', 'il', 'ej', 'jn', 'jm', 'in'];
    for (var i = 0; i < stones.length; i++) {
      var s = stones[i];
      var pt = glift.util.pointFromSgfCoord(s);
      var intpt  = f.board().getIntBoardPt(pt);
      deepEqual(intpt.textLabel(), i + 100 + '');
    }
  });
})();
