glift.controllers.staticProblemTest = function() {
  module("Static Problem Controller");
  var cont = glift.controllers,
      util = glift.util,
      conv = glift.util.pointFromSgfCoord,
      sgfs = testdata.sgfs,
      mk = glift.enums.marks,
      states = glift.enums.states,
      options = { sgfString: sgfs.realproblem, problemConditions: {GB: []} },
      msgs = glift.enums.controllerMessages,
      problemResults = glift.enums.problemResults,
      ptlistToMap = glift.testUtil.ptlistToMap;

  test("Test create & initialize problem controller", function() {
    var c = cont.staticProblem(options),
        wstone = conv("pc"),
        bstone = conv("oc");
    ok(c.problemConditions !== undefined, 'problemConditions must be defined');
    ok(c.problemConditions['GB'] !== undefined, 'GB must be specified');
    deepEqual(c.sgfString, sgfs.realproblem);
    var data = c.initialize().getEntireBoardState();
    var whiteStones = ptlistToMap(data.stones.WHITE)
    var blackStones = ptlistToMap(data.stones.BLACK)
    ok(whiteStones[wstone.toString()] !== undefined,
        "Must find a white stone where expected");
    ok(blackStones[bstone.toString()] !== undefined,
        "Must find a black stone where expected");

  });

  test("Test Current Player Color", function() {
    var c = cont.staticProblem(options)
    c.initialize();
    deepEqual(c.getCurrentPlayer(), states.BLACK, "Must get player color");
  });

  test("Test Can-Add Stone", function() {
    var c = cont.staticProblem(options),
        yes1 = conv("ob"),
        yes2 = conv("aa"),
        nope = conv("pc");
    c.initialize();
    ok(c.canAddStone(yes1, states.BLACK), "Must be allowed");
    ok(c.canAddStone(yes1, states.WHITE), "Different color must be allowed");
    ok(c.canAddStone(yes2, states.BLACK), "Must be allowed for a random position");
    ok(!c.canAddStone(nope, states.BLACK),
        "Must NOT be allowed when a stone already exists there");
  });

  test("Test Add Stone: Failure", function() {
    var c = cont.staticProblem(options),
        pt = conv("pb");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.result, problemResults.FAILURE, "Must be a failure");
  });

  test("Test Add Stone: Incorrect - no variation", function() {
    var c = cont.staticProblem(options),
        pt = conv("aa");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.result, problemResults.INCORRECT, "Must be incorrect");
  });

  test("Test Add Stone: Incorrect - variation", function() {
    var c = cont.staticProblem(options),
        pt = conv("ob");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.result, problemResults.INCORRECT, "Must be incorrect");
  });

  //13,3; 12,2 Black
  test("Test Add Stone: Continue", function() {
    var c = cont.staticProblem({
        sgfString: sgfs.complexproblem,
        problemConditions: { GB: [] }
    });
    var pt = conv("ma");
    var possNext = [conv('oa'), conv('mc'), conv('nd')];
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.result, problemResults.INDETERMINATE,
        "The result must be indeterminate");
    var pts = ptlistToMap(result.stones.WHITE);
    ok(pts[possNext[0].hash()] !== undefined ||
       pts[possNext[1].hash()] !== undefined ||
       pts[possNext[2].hash()] !== undefined,
       "Must show the next white piece in the data.");
  });

  test("Test Add Stone: Correct", function() {
    var c = cont.staticProblem(options),
        pt = conv("nc");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.result, problemResults.CORRECT, "Must be correct");
  });

  test("Test Add Stone: Multiple correct variations", function() {
    var opts = { sgfString: sgfs.twoOptions, problemConditions: {C: ['Correct']}};
    var c = cont.staticProblem(opts),
        pt1 = conv("pd"),
        pt2 = conv("qe");

    c.initialize(); // reset and try again
    var result = c.addStone(pt2, states.BLACK);
    deepEqual(result.result, problemResults.CORRECT, "Must be correct");

    c.initialize();
    var result = c.addStone(pt1, states.BLACK);
    deepEqual(result.result, problemResults.CORRECT, "Must be correct");
  });
};
