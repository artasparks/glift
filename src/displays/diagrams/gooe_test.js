glift.displays.diagrams.gooeTest = function() {
  module("Gooe");
  var sgfs = testdata.sgfs;
  var flatten = glift.bridge.flattener.flatten;
  var gooeDiagramArray = glift.displays.diagrams.gooe.diagramArray;

  test("Char mapping is sensible", function() {
    var symb = glift.bridge.flattener.symbols;
    for (var key in glift.displays.diagrams.gooe.charMapping) {
      var splat = key.split("_");
      ok(symb[key] !== undefined ||
          (symb[splat[0]] !== undefined && symb[splat[1]] !== undefined),
          "Couldn't find symbol for " + key);
    }
  });

  test("Test Gooe array generation", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.marktest);
    var goban = glift.rules.goban.getFromMoveTree(movetree, []).goban;
    var f = flatten(movetree, goban);
    var gooeArray = gooeDiagramArray(f);
    ok(gooeArray !== undefined);
  });

  test("Test Gooe string generation", function() {
    var movetree = glift.rules.movetree.getFromSgf(sgfs.marktest);
    var goban = glift.rules.goban.getFromMoveTree(movetree, []).goban;
    var f = flatten(movetree, goban);
    var gooeArray = gooeDiagramArray(f);
    var strOut = glift.displays.diagrams.gooe.diagramArrToString(gooeArray);
    ok(strOut !== undefined);
  });
};
