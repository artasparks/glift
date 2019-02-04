(function() {
  module('glift.flattener.flattenTest');
  var symb = glift.flattener.symbols;
  var boardRegions = glift.enums.boardRegions;
  var sgfs = testdata.sgfs;
  var flattener  = glift.flattener;
  var toPt = glift.util.pointFromSgfCoord;
  var point = glift.util.point;

  test('Basic Flattened', function() {
    var basicSgf = '(;GB[1]C[foo]AW[aa]AB[ab]LB[ab:z]SQ[cc])';
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

    deepEqual(f.board().width(), 19);
    deepEqual(f.board().height(), 19);

    deepEqual(f.marks()[toPt('cc').toString()], symb.SQUARE);
    deepEqual(f.marks()[toPt('ab').toString()], symb.TEXTLABEL);
    deepEqual(f.labels()[toPt('ab').toString()], 'z');
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
      nextMovesPath: [0,0]
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

  test('Simple next moves + ignoring labeling', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
      ignoreLabels: true,
    });

    var i = f.board().getIntBoardPt(toPt('aa'));
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.EMPTY);
    deepEqual(i.textLabel(), null);

    i = f.board().getIntBoardPt(toPt('ab'));
    deepEqual(i.stone(), symb.WSTONE);
    deepEqual(i.mark(), symb.EMPTY);
    deepEqual(i.textLabel(), null);
  });

  test('Init position', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(mt, {
      initPosition: [0],
    });
    deepEqual(f.comment(), 'zo')
  });

  test('Init position + next moves', function() {
    var basicSgf = '(;GB[1];B[aa]C[zo];W[ab]C[zed])';
    var mt = glift.rules.movetree.getFromSgf(basicSgf);
    var f = flattener.flatten(mt, {
      initPosition: '1',
      nextMovesPath: [0]
    });
    deepEqual(f.comment(), 'zed')
  });

  test('Create collision labels', function() {
    var sgf = '(;GB[1]AW[aa][ba]AB[ab][bb][cb]' +
        ';B[jj]' +
        ';W[ca]' + // for move numbering.
        ';B[da]' + // capture
        ';W[ca];B[ba])'; // collisions
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0,0,0,0],
    });

    deepEqual(f.collisions().length, 2);
    var col = f.collisions();
    deepEqual(col[0].color, 'WHITE');
    deepEqual(col[0].mvnum, 4);
    deepEqual(col[0].label, '2');

    deepEqual(col[1].color, 'BLACK');
    deepEqual(col[1].mvnum, 5);
    deepEqual(col[1].label, 'a');
  });

  test('Create collision labels -- manual labels', function() {
    var sgf = '(;GB[1]AW[aa][ba]AB[ab][bb]' +
        ';B[ca]' + // capture
        ';W[aa]LB[aa:X])'; // collision + labels
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
    });
    deepEqual(f.collisions().length, 1);
    var col = f.collisions();
    deepEqual(col[0].color, 'WHITE');
    deepEqual(col[0].mvnum, 2);
    deepEqual(col[0].label, 'X');
  });

  test('isOnMainPath', function() {
    var sgf = '(;GB[1](;B[aa])(;B[ab]))';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    var f = flattener.flatten(mt, {
      nextMovesPath: [0]
    });

    f = flattener.flatten(mt, {
      nextMovesPath: [1]
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
    findNum = glift.flattener.findStartingMoveNum_;
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
    deepEqual(f.baseMoveNum(), 2, 'At 2 move before next moves');
    deepEqual(f.startingMoveNum(), 3, 'no next path, start');
    deepEqual(f.endingMoveNum(), 3, 'no next path, end');
    deepEqual(f.mainlineMoveNum(), 2, 'mainline move num');

    var mainpathSgf = '(;GB[1];B[aa];W[bb];B[cc];W[dd];B[ee];W[ff])';
    mt = glift.rules.movetree.getFromSgf(mainpathSgf, '1');
    f = flattener.flatten(mt, {
      nextMovesPath: [0,0,0,0]
    });
    deepEqual(f.baseMoveNum(), 1, 'At move 1 before next moves');
    deepEqual(f.startingMoveNum(), 2, 'next path on main line');
    deepEqual(f.endingMoveNum(), 5, 'next path on main line');
    deepEqual(f.mainlineMoveNum(), 1, 'mainline move num');
    deepEqual(f.isOnMainPath(), true);

    var variationSgf = '(;GB[1];B[aa];W[bb](;B[kk])(;B[cc];W[dd];B[ee];W[ff]))';
    mt = glift.rules.movetree.getFromSgf(variationSgf, '2');
    f = flattener.flatten(mt, {
      nextMovesPath: [1,0,0,0]
    });
    deepEqual(f.baseMoveNum(), 2, 'At move 2 before next moves');
    deepEqual(f.startingMoveNum(), 1, '1st move into the variation');
    deepEqual(f.endingMoveNum(), 4);
    deepEqual(f.mainlineMoveNum(), 2, 'mainline move num');
    deepEqual(f.isOnMainPath(), false);

    mt = glift.rules.movetree.getFromSgf(variationSgf, '2.1');
    f = flattener.flatten(mt, {
      nextMovesPath: [0,0,0]
    });
    deepEqual(f.baseMoveNum(), 3, 'At move 3 before next moves');
    deepEqual(f.startingMoveNum(), 2, '2nd move into the variation');
    deepEqual(f.endingMoveNum(), 4);
    deepEqual(f.mainlineMoveNum(), 2, 'mainline move num');
    deepEqual(f.isOnMainPath(), false);
  });

  test('Move numbers > 100', function() {
    var mt = glift.rules.movetree.getFromSgf(sgfs.yearbookExample, '99');
    deepEqual(mt.node().getNodeNum(), 99);
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0,0,0,0,0,0,0]
    });
    var stones = ['go', 'fo', 'ho', 'il', 'ej', 'jn', 'jm', 'in'];
    for (var i = 0; i < stones.length; i++) {
      var s = stones[i];
      var pt = glift.util.pointFromSgfCoord(s);
      var intpt  = f.board().getIntBoardPt(pt);
      deepEqual(intpt.textLabel(), i + 100 + '');
    }
  });

  test('Auto-truncation for labels', function() {
    var mt = glift.rules.movetree.getFromSgf(sgfs.yearbookExample, '121');
    deepEqual(mt.node().getNodeNum(), 121);
    var f = flattener.flatten(mt);
    deepEqual(f.autoTruncateLabel('a'), 'a');
    deepEqual(f.autoTruncateLabel(10), '10');
    deepEqual(f.autoTruncateLabel('10'), '10');
    deepEqual(f.autoTruncateLabel('100'), '100');
    deepEqual(f.autoTruncateLabel('101'), '1');
    deepEqual(f.autoTruncateLabel('222'), '22');
    deepEqual(f.autoTruncateLabel(222), '22');
  });

  test('Auto-truncation for labels: Long Branch', function() {
    var mt = glift.rules.movetree.getFromSgf(sgfs.yearbookExample, '90');
    deepEqual(mt.node().getNodeNum(), 90);
    var f = flattener.flatten(mt, {
      nextMovesPath: [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      ]
    });
    deepEqual(f.autoTruncateLabel('a'), 'a');
    deepEqual(f.autoTruncateLabel(10), '10');
    deepEqual(f.autoTruncateLabel('10'), '10');
    deepEqual(f.autoTruncateLabel('100'), '100');
    deepEqual(f.autoTruncateLabel('101'), '101');
    deepEqual(f.autoTruncateLabel('222'), '222');
    deepEqual(f.autoTruncateLabel(222), '222');
  });

  test('Test autocrop on next moves: Top', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc];B[re];W[ee])',
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2, 'sanity check');
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
      autoBoxCropOnNextMoves: true,
    });
    deepEqual(f.board().width(), 19);
    deepEqual(f.board().height(), 11);
  });

  test('Test crop restriction + crop on next moves', function() {
    // top crop
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc];B[re];W[ee])',
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2, 'sanity check');
    var f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
      autoBoxCropOnNextMoves: true,
      regionRestrictions: [
        glift.enums.boardRegions.TOP,
        glift.enums.boardRegions.LEFT,
      ]
    });
    deepEqual(f.board().width(), 19);
    deepEqual(f.board().height(), 11);

    // Region isn't correct
    f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
      autoBoxCropOnNextMoves: true,
      regionRestrictions: [
        glift.enums.boardRegions.LEFT,
      ]
    });
    deepEqual(f.board().width(), 19);
    deepEqual(f.board().height(), 19);

    // top-left crop
    mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' + // full board base
        ';B[bb];W[cc];B[dd];W[ee])',
        [0,0]);
    // Region is super-set
    f = flattener.flatten(mt, {
      nextMovesPath: [0,0],
      autoBoxCropOnNextMoves: true,
      regionRestrictions: [
        glift.enums.boardRegions.TOP,
        glift.enums.boardRegions.LEFT,
      ]
    });
    deepEqual(f.board().width(), 19);
    deepEqual(f.board().height(), 11);
  });

  test('Getting moves', function() {
    var initPos = [0,0,0,0,1];
    var sgf =
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[bb];W[cc];B[dd];W[ee](;B[fa];W[fb])(;B[fb];W[fc]))';
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    var f = flattener.flatten(mt, {});
    ok(f);
    deepEqual(f.mainlineMove().point, toPt('ee'));
    deepEqual(f.nextMainlineMove().point, toPt('fa'));

    initPos = [];
    mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    f = flattener.flatten(mt, {});
    deepEqual(f.mainlineMove(), null, 'mainline');
    deepEqual(f.mainlineMoveNum(), 0, 'mainline num');
    deepEqual(f.nextMainlineMove().point, toPt('bb'), 'next mainline pt');
    deepEqual(f.nextMainlineMoveNum(), 1, 'mainline num');

    initPos = [0,0,0,0,0,0,0];
    mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    f = flattener.flatten(mt, {});
    deepEqual(f.mainlineMove().point, toPt('fb'), 'mainline end');
    deepEqual(f.mainlineMoveNum(), 6, 'mainline num end');
    deepEqual(f.nextMainlineMove(), null, 'next mainline pt end');
    deepEqual(f.nextMainlineMoveNum(), 7, 'mainline num end');
  });

  test('Ko', function() {
    var initPos = [0,0,0,0,0,0];
    var kosgf =
        '(;GM[1]SZ[19]' +
        ';B[ba];W[ca];B[ab];W[bb];B[bc];W[aa])';
    var mt = glift.rules.movetree.getFromSgf(kosgf, initPos);
    var f = flattener.flatten(mt, {
      markKo: true,
    });
    ok(f);
    deepEqual(f.marks()[toPt('ba').toString()], glift.flattener.symbols.KO_LOCATION,
      'Ko Location');

    // Now, without othe option set
    var mt = glift.rules.movetree.getFromSgf(kosgf, initPos);
    var f = flattener.flatten(mt, {});
    ok(f);
    deepEqual(f.marks()[toPt('ba').toString()], undefined)

    // Ko doesn't make sense when a nextMovesPath is specified, and so must be
    // null.
    mt = glift.rules.movetree.getFromSgf(kosgf)
    var f = flattener.flatten(mt, {
      nextMovesPath: initPos
    });
    ok(f);
    deepEqual(f.marks()[toPt('ba').toString()], glift.flattener.symbols.TEXTLABEL);
  });
})();
