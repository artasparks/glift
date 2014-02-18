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
    deepEqual(be.alphaLabels.slice(0, 3), ['A', 'B', 'C']);
    deepEqual(be.numericLabels.slice(0, 3), [1, 2, 3]);
  });

  test("SGF with labels removes available labels", function() {
    var be = boardEditor({sgfString: '(;LB[aa:A][ab:B][ac:1][ad:3][ae:c])'});
    ok(be.numericLabels.length, 98);
    ok(be.alphaLabels.length, 24);
    deepEqual(be.alphaLabels.slice(0, 3), ['C', 'D', 'E']);
    deepEqual(be.numericLabels.slice(0, 3), [2, 4, 5]);
    deepEqual(be.currentAlphaMark(), 'C');
    deepEqual(be.currentNumericMark(), 2);
  });
};
