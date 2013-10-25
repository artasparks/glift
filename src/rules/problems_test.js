glift.rules.problemsTest = function() {
  module("Problems Tests");
  var sgfs = testdata.sgfs;
  test("IsCorrectPosition: trivial correctness", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.trivialproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(glift.rules.problems.isCorrectPosition(movt),
        problemResults.CORRECT, "Starting position must be correct");
  });

  test("IsCorrectPosition: Make sure it works for simple cases", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    movt.moveDown(0);
    deepEqual(glift.rules.problems.isCorrectPosition(movt),
        problemResults.INCORRECT, "Must return incorrect");
    movt.moveUp().moveDown(1);
    deepEqual(glift.rules.problems.isCorrectPosition(movt),
        problemResults.CORRECT,
        "Must return correct if a move is correct");
  });

  test("IsCorrectPosition: Indeterminate first position", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(glift.rules.problems.isCorrectPosition(movt),
        problemResults.INDETERMINATE,
        "Starting position must be indeterminate");
  });

  test("Correct Next Moves: happy case", function() {
    var sgfPoint = glift.util.pointFromSgfCoord('nc');
    var movt = glift.rules.movetree.getFromSgf(sgfs.realproblem);
    var out = glift.rules.problems.correctNextMoves(movt);
    deepEqual(out, [{point:sgfPoint, color:glift.enums.states.BLACK}]);
  });
};
