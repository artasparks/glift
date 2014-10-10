glift.flattener.boardTest = function() {
  module('glift.flattener.boardTest');
  var pt = glift.util.point;
  var ints = 19

  var markMap = {};
  markMap[pt(2,2).toString()] = glift.flattener.symbols.TRIANGLE;
  markMap[pt(14,1).toString()] = glift.flattener.symbols.SQUARE;

  var cropbox = glift.displays.cropbox.getFromRegion(
      glift.enums.boardRegions.TOP_RIGHT,
      19,
      false /* drawBoardCoords */);

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

  var labelMap = {};
  var defaultCreate = function(opts) {
    opts = opts || {};
    return glift.flattener.board.create(
      opts.cropbox || cropbox,
      opts.stoneMap || stoneMap,
      opts.markMap || markMap,
      opts.labelMap || labelMap,
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
    ok(i === undefined);

    i = board.getIntBoardPt(pt(14,1));
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
};
