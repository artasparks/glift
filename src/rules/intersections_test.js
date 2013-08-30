glift.rules.intersectionsTest = function() {
  module("Intersections Test");
  var sgfs = testdata.sgfs,
      mtm = glift.rules.movetree,
      mks = glift.enums.marks;

  test("Add current marks to the intersection data", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.marky),
        goban = glift.rules.goban.getFromMoveTree(movetree, []),
        foundMarks = glift.rules.intersections.addCurrentMarks({}, movetree),

        cirpts = glift.sgf.allSgfCoordsToPoints(['rb', 'rc', 're']),
        labels = glift.sgf.convertFromLabelArray([
            'pb:3', 'qb:2', 'pc:B', 'qc:1', 'pd:A']),
        squpts = glift.sgf.allSgfCoordsToPoints(['rd']),
        tripts = glift.sgf.allSgfCoordsToPoints(['qd', 'qe']),
        testmap = {
          "CIRCLE" : cirpts,
          "LABEL" : labels,
          "SQUARE" : squpts,
          "TRIANGLE" : tripts
        };
    for (var key in testmap) {
      var pts = testmap[key];
      for (var i = 0; i < pts.length; i++) {
        if (key === "LABEL") {
          deepEqual(foundMarks[pts[i].point.hash()][key], pts[i].value,
              "Must find the correct label");
        } else {
          deepEqual(foundMarks[pts[i].hash()][key], true,
              "Must find that the pt exists for the key");
        }
      }
    }
  });

  test("Test FullBoardData", function() {
    var initPosition = glift.rules.treepath.parseInitPosition(2),
        movetree = mtm.getFromSgf(sgfs.marky, initPosition),
        goban = glift.rules.goban.getFromMoveTree(movetree, initPosition),
        data = glift.rules.intersections.getFullBoardData(movetree, goban),
        datap = data.points,

        conv = glift.util.pointFromSgfCoord,
        mk = glift.enums.marks,
        col = glift.enums.states,

        sqpt = conv("ab"),
        tri = conv("qa"),
        bstone = conv("sa"),
        wstone = conv("fi"),
        abstone = conv("pc"),
        comment = "foo";
    ok(datap[sqpt.hash()][mk.SQUARE], "SQAURE must exist");
    deepEqual(datap[bstone.hash()].stone, col.BLACK, "Must be black");
    deepEqual(datap[wstone.hash()].stone, col.WHITE, "Must be white");
    deepEqual(datap[abstone.hash()].stone, col.BLACK,
        "Also must be black for placements");
    ok(!datap[sqpt.hash()][mk.TRIANGLE], "TRIANGLE must not exist");
    deepEqual(data.comment, "foo", "Comment must be foo");
  });
};
