glift.rules.intersectionsTest = function() {
  module("Intersections Test");
  var sgfs = testdata.sgfs,
      mtm = glift.rules.movetree,
      mks = glift.enums.marks,
      ptlistToMap = glift.testUtil.ptlistToMap;


  test("Add current marks to the intersection data", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.marky),
        goban = glift.rules.goban.getFromMoveTree(movetree, []).goban,
        foundMarks = glift.rules.intersections.getCurrentMarks(movetree, {}),

        cirpts = glift.sgf.allSgfCoordsToPoints(['rb', 'rc', 're']),
        labels = glift.sgf.convertFromLabelArray([
            'pb:3', 'qb:2', 'pc:B', 'qc:1', 'pd:A']),
        squpts = glift.sgf.allSgfCoordsToPoints(['rd']),
        tripts = glift.sgf.allSgfCoordsToPoints(['qd', 'qe']),
        testmap = {
          CIRCLE : cirpts,
          LABEL : labels,
          SQUARE : squpts,
          TRIANGLE : tripts
        };
    for (var key in testmap) {
      var expectedPts = testmap[key];
      var actualPts = foundMarks[key];
      for (var i = 0; i < expectedPts.length; i++) {
        if (key === "LABEL") {
          deepEqual(actualPts[i].point, expectedPts[i].point, "Must be equal");
        } else {
          deepEqual(actualPts[i], expectedPts[i], "Must be equal");
        }
      }
    }
  });

  test("Test FullBoardData", function() {
    var initPosition = glift.rules.treepath.parseInitPosition(2),
        movetree = mtm.getFromSgf(sgfs.marky, initPosition),
        goban = glift.rules.goban.getFromMoveTree(movetree, initPosition).goban,
        data = glift.rules.intersections.getFullBoardData(movetree, goban),
        conv = glift.util.pointFromSgfCoord,
        mk = glift.enums.marks,
        col = glift.enums.states,

        sqpt = conv("ab"),
        tri = conv("qa"),
        bstone = conv("sa"),
        wstone = conv("fi"),
        abstone = conv("pc"),
        comment = "foo";
    var whiteStones = ptlistToMap(data.stones.WHITE);
    var blackStones = ptlistToMap(data.stones.BLACK);
    var squareMarks = ptlistToMap(data.marks.SQUARE);
    //var triangleMarks = ptlistToMap(data.marks.TRIANGLE);
    ok(data.marks.TRIANGLE === undefined, "TRIANGLE must not exist");
    ok(squareMarks[sqpt.hash()] !== undefined, "SQUARE must exist");
    ok(blackStones[bstone.hash()], "BLAK stone must exist");
    ok(whiteStones[wstone.hash()], "WHITE stone must exist");
    ok(blackStones[abstone.hash()], "BLACK placement stone must exist");
    deepEqual(data.comment, "foo", "Comment must be foo");
  });

  test("Pass + movedown + intersections", function() {
    var sgf = '(;C[MDTest];B[ab];W[];B[bb])';
    var mt =  glift.rules.movetree.getFromSgf(sgf);
    var conv = glift.util.pointFromSgfCoord;
    var goban = glift.rules.goban.getFromMoveTree(mt, []).goban;
    var data = glift.rules.intersections.getFullBoardData(mt, goban)

    deepEqual(mt.properties().getOneValue('C'), 'MDTest');
    deepEqual(data.comment, 'MDTest');
    deepEqual(data.stones.WHITE, []);
    deepEqual(data.stones.BLACK, []);
    deepEqual(data.stones.EMPTY, []);

    mt.moveDown();
    var captures = goban.loadStonesFromMovetree(mt);
    var data = glift.rules.intersections.nextBoardData(mt, captures);
    deepEqual(data.stones.BLACK, [conv('ab')]);

    mt.moveDown();
    var captures = goban.loadStonesFromMovetree(mt);
    var data = glift.rules.intersections.nextBoardData(mt, captures);
    deepEqual(data.stones.BLACK, []);
    deepEqual(data.stones.WHITE, []);
    deepEqual(data.stones.EMPTY, []);

    mt.moveDown();
    var captures = goban.loadStonesFromMovetree(mt);
    var data = glift.rules.intersections.nextBoardData(mt, captures);
    deepEqual(data.stones.BLACK, [conv('bb')]);
  });
};
