(function() {
  module('glift.controllers.staticProblemTest');
  var cont = glift.controllers,
      util = glift.util,
      conv = glift.util.pointFromSgfCoord,
      sgfs = testdata.sgfs,
      mk = glift.enums.marks,
      states = glift.enums.states,
      options = { sgfString: sgfs.realproblem, problemConditions: {GB: []} },
      msgs = glift.enums.controllerMessages,
      problemResults = glift.enums.problemResults,
      ptlistToMap = testUtil.ptlistToMap;

  test('Test create & initialize problem controller', function() {
    var c = cont.staticProblem(options),
        wstone = conv('pc'),
        bstone = conv('oc');
    ok(c.problemConditions !== undefined, 'problemConditions must be defined');
    ok(c.problemConditions['GB'] !== undefined, 'GB must be specified');
    // deepEqual(c.sgfString, sgfs.realproblem); -- no longer true
    var flattened = c.initialize().flattenedState();

    ok(flattened.stoneMap()[wstone.toString()] !== undefined,
        'Must find a white stone where expected');
    ok(flattened.stoneMap()[bstone.toString()] !== undefined,
        'Must find a black stone where expected');
  });

  test('Test rebase', function() {
    var c = cont.staticProblem({
      sgfString: sgfs.passingExample,
      problemConditions: {GB: []}
    });
    deepEqual(c.movetree.node().getNodeNum(), 0);
    deepEqual(c.movetree.node().getNodeNum(), 0);
  });

  test('Test Current Player Color', function() {
    var c = cont.staticProblem(options)
    deepEqual(c.getCurrentPlayer(), states.BLACK, 'Must get player color');
  });

  test('Test Can-Add Stone', function() {
    var c = cont.staticProblem(options),
        yes1 = conv('ob'),
        yes2 = conv('aa'),
        nope = conv('pc');
    ok(c.canAddStone(yes1, states.BLACK), 'Must be allowed');
    ok(c.canAddStone(yes1, states.WHITE), 'Different color must be allowed');
    ok(c.canAddStone(yes2, states.BLACK), 'Must be allowed for a random position');
    ok(!c.canAddStone(nope, states.BLACK),
        'Must NOT be allowed when a stone already exists there');
  });

  test('Test Add Stone: Failure', function() {
    var c = cont.staticProblem(options),
        pt = conv('pb');
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.FAILURE, 'Must be a failure');
  });

  test('Test Add Stone: Incorrect - no variation', function() {
    var c = cont.staticProblem(options),
        pt = conv('aa');
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INCORRECT, 'Must be incorrect');
  });

  test('Test Add Stone: Incorrect - variation', function() {
    var c = cont.staticProblem(options),
        pt = conv('ob');
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INCORRECT, 'Must be incorrect');
  });

  //13,3; 12,2 Black
  test('Test Add Stone: Continue', function() {
    var c = cont.staticProblem({
        sgfString: sgfs.complexproblem,
        problemConditions: { GB: [] }
    });
    var pt = conv('ma');
    var possNext = [conv('oa'), conv('mc'), conv('nd')];
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INDETERMINATE,
        'The result must be indeterminate');
    var pts = flattened.stoneMap();
    ok(pts[possNext[0].toString()] !== undefined ||
       pts[possNext[1].toString()] !== undefined ||
       pts[possNext[2].toString()] !== undefined,
       'Must show the next white piece in the data.');
  });

  test('Test Add Stone: Correct', function() {
    var c = cont.staticProblem(options),
        pt = conv('nc'),
        nextPt  = conv('md');
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INDETERMINATE,
        'Must be indeterminate: all children correct but position is not');

    flattened = c.addStone(nextPt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.CORRECT,
        'Must be correct: at correct position');
  });

  test('Test Add Stone: Multiple correct variations', function() {
    var opts = { sgfString: sgfs.twoOptions, problemConditions: {C: ['Correct']}};
    var c = cont.staticProblem(opts),
        pt1 = conv('pd'),
        pt2 = conv('qe');

    var flattened = c.addStone(pt2, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.CORRECT, 'Must be correct');

    c.initialize(); // restart
    flattened = c.addStone(pt1, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.CORRECT, 'Must be correct');
  });

  test('Test Play Through', function() {
    var opts = {
        sgfString: testdata.sgfs.gogameguruHard,
        problemConditions: {C: ['Correct']}};
    var c = cont.staticProblem(opts),
        pt = conv('sq');
    var flattened = c.addStone(pt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INCORRECT);
    deepEqual(c.movetree.node().getNodeNum(), 2,
        'Must have moved down two moves');

    c.initialize(); // restart
    var indPt = conv('sr');
    flattened = c.addStone(indPt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INDETERMINATE);
    deepEqual(c.movetree.node().getNodeNum(), 2,
        'Must have moved down two moves');

    c.initialize(); // restart
    indPt = conv('bb');
    flattened = c.addStone(indPt, states.BLACK);
    deepEqual(flattened.problemResult(), problemResults.INCORRECT);
    deepEqual(c.movetree.node().getNodeNum(), 1,
        'Must have moved down one move: no variation');
  });
})();
