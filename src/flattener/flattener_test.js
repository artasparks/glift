glift.flattener.flattenTest = function() {
  module('glift.flattener.flattenTest');
  var symb = glift.flattener.symbols;
  var boardRegions = glift.enums.boardRegions;
  var showV = glift.enums.showVariations;
  var sgfs = testdata.sgfs;
  var flattener  = glift.flattener;

  var testExpected = function(flattened, expBase, expMarks, expectedLabels) {
    var toPt = glift.util.pointFromSgfCoord;
    for (var keyPt in expBase) {
      var int = flattened.getIntBoardIdx(toPt(keyPt));
      ok(int !== undefined, 
          "undefined at " + toPt(keyPt).toString() + " for keyPt " + keyPt);
      var s = sb.base;
      deepEqual(s, expBase[keyPt],
          "For sgfPt: " + keyPt + ", and point " + toPt(keyPt)
          + ", Expected: " + flattener.symbolStr(expBase[keyPt])
          + ", Found: " + flattener.symbolStr(s));
    }
    for (var keyPt in expMarks) {
      var sb = flattened.getSymbolPairIntPt(toPt(keyPt));
      ok(sb !== undefined,
          "undefined at " + toPt(keyPt).toString() + " for keyPt " + keyPt);
      var s = sb.mark;
      deepEqual(s, expMarks[keyPt],
          "For sgfPt: " + keyPt + ", and point " + toPt(keyPt)
          + ", Expected: " + flattener.symbolFromEnum(expMarks[keyPt])
          + ", Found: " + flattener.symbolFromEnum(s));
      if (s === symb.TEXTLABEL || s === symb.NEXTVARIATION) {
        var lbl = flattened.getLabelIntPt(toPt(keyPt))
        ok(lbl !== undefined)
        deepEqual(lbl, expectedLabels[keyPt]);
      }
    }
  };

  test("Basic Flattened", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.marktest);
    var goban = glift.rules.goban.getFromMoveTree(movetree, []).goban;
    var f = flattener.flatten(movetree, goban);
    ok(f !== undefined, "Flattened must not be undefined");
    deepEqual(f.comment(), "Mark Test");
    deepEqual(f.collisions(), []);
    deepEqual(f._intersections.length, 19);
    deepEqual(f._intersections[0].length, 19);

    // Some assertions based on known contents of the marktest SGF.
    var expected = {
      aa: symb.TL_CORNER,
      as: symb.BL_CORNER,
      ss: symb.BR_CORNER,

      // TR has a stone in it
      ba: symb.TOP_EDGE,
      ab: symb.LEFT_EDGE,

      sj: symb.RIGHT_EDGE,
      es: symb.BOT_EDGE,
      bb: symb.CENTER,
      dd: symb.CENTER_STARPOINT,
      ja: symb.WSTONE,
      jb: symb.BSTONE,

      ja: symb.WSTONE,
      ra: symb.WSTONE,
      qa: symb.WSTONE,
      na: symb.WSTONE,
      ma: symb.WSTONE,

      jb: symb.BSTONE,
      rb: symb.BSTONE,
      qb: symb.BSTONE,
      nb: symb.BSTONE,
      mb: symb.BSTONE,

      jc: symb.CENTER,
      rc: symb.CENTER,
      qc: symb.CENTER,
      nc: symb.CENTER,
      mc: symb.EMPTY,
      la: symb.WSTONE
    };
    var expectedMarks = {
      sa: symb.TRIANGLE,
      sb: symb.TRIANGLE,
      sc: symb.TRIANGLE,
      ra: symb.SQUARE,
      rb: symb.SQUARE,
      rc: symb.SQUARE,
      qa: symb.CIRCLE,
      qb: symb.CIRCLE,
      qc: symb.CIRCLE,
      na: symb.XMARK,
      nb: symb.XMARK,
      nc: symb.XMARK,
      ma: symb.TEXTLABEL,
      mb: symb.TEXTLABEL,
      mc: symb.TEXTLABEL,
      md: symb.TEXTLABEL,
      la: symb.TEXTLABEL,
      lb: symb.TEXTLABEL,
      lc: symb.TEXTLABEL,
      nf: symb.TEXTLABEL,
      pa: symb.TEXTLABEL,
    };
    var expectedText = {
      ma: "\u4e00",
      mb: "\u4e8c",
      mc: "\u4e09",
      md: "\u56db",
      la: "\u516d",
      lb: "\u4e03",
      lc: "\u516b",
      ld: "\u4e5d",
      nf: "15",
      pa: "A",
    };
    testExpected(f, expected, expectedMarks, expectedText);
  });
  /*

  test("NextVariations", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.complexproblem);
    var goban = glift.rules.goban.getFromMoveTree(movetree, []).goban;
    var tp = [1];
    var vars = glift.enums.showVariations.MORE_THAN_ONE;
    var f = flatten(movetree, goban, boardRegions.AUTO, vars, tp, 2);
    ok(f !== undefined);
    deepEqual(f.boardRegion, boardRegions.TOP_RIGHT);
    var expected = {
      sa: symb.TR_CORNER,
      pa: symb.WSTONE,
      na: symb.BSTONE,
    };
    var expectedMarks = {
      ma: symb.TEXTLABEL,
      oa: symb.NEXTVARIATION,
      mc: symb.NEXTVARIATION,
      nd: symb.NEXTVARIATION
    };
    var expectedText = {
      ma: "2",
      oa: "1",
      mc: "2",
      nd: "3"
    };
    ok(f.getSymbolPairIntPt(glift.util.point(0,0)) == undefined);
    testExpected(f, expected, expectedMarks, expectedText);
  });
  */
};
