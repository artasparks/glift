glift.controllers.boardEditorTest = function() {
  module("Board Editor Controller");
  var sgfs = testdata.sgfs;
  var boardEditor = glift.controllers.boardEditor;

  test("Basic Creation", function() {
    var be = boardEditor({})
    ok(be !== undefined);
  });

  test("Extra option initialization", function() {
    var be = boardEditor({});
    ok(be.numericLabels.length, 100);
    ok(be.alphaLabels.length, 26);
  });
};
