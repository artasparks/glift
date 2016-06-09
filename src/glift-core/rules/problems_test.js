(function() {
  module('glift.rules.problemsTest');
  test('IsCorrectPosition: trivial correctness', function() {
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.trivialproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.CORRECT, 'Starting position must be correct');
  });

  test('IsCorrectPosition: Make sure it works for simple cases', function() {
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    movt.moveDown(0);
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INCORRECT, 'Must return incorrect');

    movt.moveUp().moveDown(1);
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE,
        'Must return indeterminate if a move on a correct path but not at the end');
    movt.moveDown().moveDown();
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.CORRECT);
  });

  test('IsCorrectPosition: Indeterminate first position', function() {
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE,
        'Starting position must be indeterminate');
  });

  test('Correct Next Moves: happy case', function() {
    var sgfPoint = glift.util.pointFromSgfCoord('nc');
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.realproblem);
    var out = glift.rules.problems.correctNextMoves(movt, {GB: []});
    deepEqual(out, [{point:sgfPoint, color:glift.enums.states.BLACK}]);
  });

  test('Complex problem', function() {
    var problemResults = glift.enums.problemResults;
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.complexproblem);
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE, 'Should be Indeterminate at beginning');
    movt.moveDown(1); // B's move
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE, 'Should be Indeterminate still');
    movt.moveDown(1); // W's Move
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE, 'Still Indeterminate ');
    movt.moveDown(1); // B's Move
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.INDETERMINATE,
        'Still indeterminate although all children are correct');

    movt.moveDown(); // W's Move
    movt.moveDown(); // B's Move
    deepEqual(glift.rules.problems.positionCorrectness(movt, {GB: []}),
        problemResults.CORRECT,
        'Now at a correct position');
  });

  test('GoGameGuru Problem', function() {
    var problemResults = glift.enums.problemResults;
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.gogameguruHard);
    deepEqual(glift.rules.problems.positionCorrectness(movt,
          {GB: [], C: ['Correct', 'is correct']}),
        problemResults.INDETERMINATE,
        'Should be Indeterminate at beginning');
    movt.moveDown();
    deepEqual(glift.rules.problems.positionCorrectness(movt,
          {GB: [], C: ['Correct', 'is correct']}),
        problemResults.INDETERMINATE,
        'Still indeterminate although all children correct');

    movt.moveDown(); // W
    movt.moveDown(); // B
    movt.moveDown(); // W
    movt.moveDown(); // B
    deepEqual(glift.rules.problems.positionCorrectness(movt,
          {GB: [], C: ['Correct', 'is correct']}),
        problemResults.CORRECT,
        'Position now correct');
  });

  test('Multi-solution-problem', function() {
    var problemResults = glift.enums.problemResults;
    var movt = glift.rules.movetree.getFromSgf(testdata.sgfs.twoOptions);

    movt.moveDown(0);
    deepEqual(glift.rules.problems.positionCorrectness(movt, {C: ['Correct']}),
        problemResults.CORRECT,
        'Should be correct');
    movt.moveUp().moveDown(1);
    deepEqual(glift.rules.problems.positionCorrectness(movt, {C: ['Correct']}),
        problemResults.CORRECT,
        'Should be also correct');
  });
})();
