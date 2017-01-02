(function() {
  module('glift.flattener.boardTest');
  var pt = glift.util.point;
  var ints = 19

  var markMap = {
    marks: {},
    labels: {}
  };
  markMap.marks[pt(2,2).toString()] = glift.flattener.symbols.TRIANGLE;
  markMap.marks[pt(14,1).toString()] = glift.flattener.symbols.SQUARE;

  var cropbox = glift.orientation.cropbox.get(
      glift.enums.boardRegions.TOP_RIGHT,
      19);

  var stoneMap = {};
  stoneMap[pt(1,1).toString()] = {
    point: pt(1,1),
    color: glift.enums.states.BLACK
  };
  stoneMap[pt(14,1).toString()] = {
    point: pt(14,1),
    color: glift.enums.states.BLACK
  };
  stoneMap[pt(13,3).toString()] = {
    point: pt(13,3),
    color: glift.enums.states.BLACK
  };

  var defaultCreate = function(opts) {
    opts = opts || {};
    return glift.flattener.board.create(
      opts.cropbox || cropbox,
      opts.stoneMap || stoneMap,
      opts.markMap || markMap,
      opts.ints || 19
    );
  };
  var symb = glift.flattener.symbols;

  test('Test create', function() {
    var board = defaultCreate();

    ok(board !== undefined);
    deepEqual(board.maxBoardSize(), 19);

    var i = board.getInt(pt(0,0));
    ok(i !== undefined);
    deepEqual(i.base(), symb.TOP_EDGE);
    deepEqual(i.stone(), symb.EMPTY);
    deepEqual(i.mark(), symb.EMPTY);

    i = board.getIntBoardPt(pt(0,0));
    ok(i === null, 'Out of bounds point should be null.');

    i = board.getIntBoardPt(pt(14,1));
    deepEqual(i.base(), symb.CENTER);
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.SQUARE);
  });

  test('Test get as numbers', function() {
    var board = defaultCreate();
    var i = board.getInt(0, 0);
    deepEqual(i.base(), symb.TOP_EDGE);

    i = board.getIntBoardPt(14,1);
    deepEqual(i.base(), symb.CENTER);
    deepEqual(i.stone(), symb.BSTONE);
    deepEqual(i.mark(), symb.SQUARE);
  });

  test('ptToBoardPt', function() {
    var board = defaultCreate();
    deepEqual(
        board.ptToBoardPt(pt(0,0)).toString(),
        pt(7,0).toString());
    deepEqual(
        board.boardPtToPt(pt(7,0)).toString(),
        pt(0,0).toString());
    deepEqual(
        board.ptToBoardPt(board.boardPtToPt(pt(7,0))).toString(),
        pt(7,0).toString());
    ok(board.isCropped());
  });

  test('topLeft/botRight', function() {
    // TopRight board.
    var board = defaultCreate();
    deepEqual(board.topLeft().toString(), "7,0")
    deepEqual(board.botRight().toString(), "18,10")

    var cropbox = glift.orientation.cropbox.get(
        glift.enums.boardRegions.BOTTOM,
        19);
    board = defaultCreate({
      cropbox: cropbox,
    });
    deepEqual(board.topLeft().toString(), "0,8")
    deepEqual(board.botRight().toString(), "18,18")
    ok(board.isCropped());

    var cropbox = glift.orientation.cropbox.get(
        glift.enums.boardRegions.ALL,
        19);
    board = defaultCreate({
      cropbox: cropbox,
    });
    deepEqual(board.topLeft().toString(), "0,0")
    deepEqual(board.botRight().toString(), "18,18")
    ok(!board.isCropped());

    var cropbox = glift.orientation.cropbox.get(
        glift.enums.boardRegions.ALL,
        13);
    board = defaultCreate({
      cropbox: cropbox,
    });
    deepEqual(board.topLeft().toString(), "0,0")
    deepEqual(board.botRight().toString(), "12,12")
    ok(!board.isCropped());
  });

  test('transform', function() {
    var board = defaultCreate();
    var toStr = glift.flattener.symbolStr;
    var newBoard = board.transform(function(intersect, x, y) {
      if (intersect.mark()) {
        return toStr(intersect.mark());
      } else if (intersect.stone()) {
        return toStr(intersect.stone());
      } else {
        return toStr(intersect.base());
      }
    });
    deepEqual(board._cbox, newBoard._cbox);
    deepEqual(board.maxBoardSize(), newBoard.maxBoardSize());

    deepEqual(newBoard.getIntBoardPt(pt(14, 0)), 'TOP_EDGE');
    deepEqual(newBoard.getIntBoardPt(pt(14, 1)), 'SQUARE');
    deepEqual(newBoard.getIntBoardPt(pt(13, 3)), 'BSTONE');
  });

  test('diff', function() {
    var board = defaultCreate({
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        }
      }
    });
    var diffBoard = defaultCreate({
      stoneMap: {
        '1,1':  { // Out of bounds.
          point: pt(1,1),
          color: glift.enums.states.BLACK
        },
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        },
        '16,2':  {
          point: pt(16,2),
          color: glift.enums.states.WHITE
        },
        '16,3':  {
          point: pt(16,3),
          color: glift.enums.states.WHITE
        }
      }
    });
    var diff = board.diff(diffBoard);
    deepEqual(diff.length, 2, 'Should only have two elements');
    deepEqual(diff[0].boardPt, pt(16,2), 'Should have diffed 16,2');
    ok(diff[0].prevValue.equals(board.getIntBoardPt(16, 2)), 'Should be equal');
    ok(diff[0].newValue.equals(diffBoard.getIntBoardPt(16, 2)), 'Should be equal');
  });

  test('diff: Marks', function() {
    var board = defaultCreate({
      markMap: {
        marks: {}, labels: {},
      },
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        }
      }
    });
    var diffBoard = defaultCreate({
      markMap: {
        marks: {'14,1': glift.flattener.symbols.TRIANGLE},
        labels: {},
      },
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        },
      }
    });
    var diff = board.diff(diffBoard);
    deepEqual(diff.length, 1, 'Should only have two elements');
    deepEqual(diff[0].boardPt, pt(14,1), 'Should have diffed 14,1');
    ok(diff[0].prevValue.equals(board.getIntBoardPt(14, 1)),
        'Prev values: Should be equal');
    ok(diff[0].newValue.equals(diffBoard.getIntBoardPt(14, 1)),
        'New Values: Should be equal');
  });


  test('diff: non-intersection', function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    var EMPTY = glift.enums.states.EMPTY;
    var transf = function(i, x, y) {
      if (i.stone() === glift.flattener.symbols.BSTONE)  {
        return BLACK;
      } else if (i.stone() === glift.flattener.symbols.WSTONE)  {
        return WHITE;
      } else {
        return EMPTY;
      }
    }
    var board = defaultCreate({
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        }
      }
    }).transform(transf);

    var diffBoard = defaultCreate({
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        },
        '16,2':  {
          point: pt(16,2),
          color: glift.enums.states.WHITE
        },
        '16,3':  {
          point: pt(16,3),
          color: glift.enums.states.WHITE
        }
      }
    }).transform(transf);

    var diff = board.diff(diffBoard);
    deepEqual(diff.length, 2, 'Should have two elements');
    deepEqual(diff[0].boardPt, pt(16,2), 'Should have diffed 16,2');

    deepEqual(diff[0].prevValue, board.getIntBoardPt(16, 2),
        'Prev values: Should be equal');
    deepEqual(diff[0].prevValue, EMPTY, 'Prev values: Should be equal');

    deepEqual(diff[0].newValue, diffBoard.getIntBoardPt(16, 2),
        'New values: Should be equal');
    deepEqual(diff[0].newValue, WHITE, 'Prev values: Should be equal');
  });

  test('Display diff', function() {
    var board = defaultCreate({
      stoneMap: {
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        },
        '17,1':  {
          point: pt(17,1),
          color: glift.enums.states.BLACK
        }
      },
      markMap: {
        marks: {'14,1': glift.flattener.symbols.TRIANGLE},
        labels: {}
      }
    });
    var diffBoard = defaultCreate({
      stoneMap: {
        '1,1':  { // out of bounds
          point: pt(1,1),
          color: glift.enums.states.BLACK
        },
        '15,1':  {
          point: pt(15,1),
          color: glift.enums.states.BLACK
        },
        '16,2':  {
          point: pt(16,2),
          color: glift.enums.states.WHITE
        },
        '16,3':  {
          point: pt(16,3),
          color: glift.enums.states.WHITE
        }
      },
      markMap: {
        marks: {'14,1': glift.flattener.symbols.TRIANGLE},
        labels: {}
      }
    });
    var diff = board.differ(diffBoard, glift.flattener.board.displayDiff);
    deepEqual(diff.length, 4, 'Should have four diff elements');
    deepEqual(diff[0].boardPt, pt(14,1), 'Should have diffed 14,1');
    deepEqual(diff[1].boardPt, pt(17,1), 'Should have diffed 17,1');
    deepEqual(diff[2].boardPt, pt(16,2), 'Should have diffed 16,2');
    deepEqual(diff[3].boardPt, pt(16,3), 'Should have diffed 16,3');
  });
})();
