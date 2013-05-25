glift.controllers.staticProblemStudyTest = function() {
  module("Static Problem Study Controller");
  var cont = glift.controllers,
      util = glift.util,
      conv = glift.sgf.sgfCoordToPoint,
      sgfs = testdata.sgfs,
      mk = glift.enums.marks,
      states = glift.enums.states,
      options = { sgfString: sgfs.realproblem },
      msgs = glift.enums.controllerMessages,
      problemResults = glift.enums.problemResults;

  test("Test create & initialize problem controller", function() {
    var c = cont.staticProblemStudy._create(options),
        wstone = conv("pc"),
        bstone = conv("oc");
    ok(true);
    deepEqual(c.sgfString, sgfs.realproblem);
    var result = c.initialize();
    deepEqual(result.points[wstone.hash()][mk.STONE], states.WHITE,
        "Must find a white stone where expected");
    deepEqual(result.points[bstone.hash()][mk.STONE], states.BLACK,
        "Must find a black stone where expected");
  });

  test("Test Current Player Color", function() {
    var c = cont.staticProblemStudy._create(options)
    c.initialize();
    deepEqual(c.getCurrentPlayer(), states.BLACK, "Must get player color");
  });

  test("Test Can-Add Stone", function() {
    var c = cont.staticProblemStudy._create(options),
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
    var c = cont.staticProblemStudy._create(options),
        pt = conv("pb");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.message, msgs.FAILURE, "Must be a failure");
    deepEqual(result.reason, "Cannot add stone", "reason: cannot add");
  });

  test("Test Add Stone: Incorrect - no variation", function() {
    var c = cont.staticProblemStudy._create(options),
        pt = conv("aa");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.message, msgs.DONE, "Must be done");
    deepEqual(result.result, problemResults.INCORRECT, "Must be incorrect");
  });

  test("Test Add Stone: Incorrect - variation", function() {
    var c = cont.staticProblemStudy._create(options),
        pt = conv("ob");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.message, msgs.DONE, "Must be done");
    deepEqual(result.result, problemResults.INCORRECT, "Must be incorrect");
  });

  test("Test Add Stone: Correct", function() {
    var c = cont.staticProblemStudy._create(options),
        pt = conv("nc");
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.message, msgs.DONE, "Must be done");
    deepEqual(result.result, problemResults.CORRECT, "Must be correct");
  });

  //13,3; 12,2 Black
  test("Test Add Stone: Continue", function() {
    var c = cont.staticProblemStudy._create({sgfString: sgfs.complexproblem}),
        pt = conv("ma"),
        possNext = [conv('oa'), conv('mc'), conv('nd')];
    c.initialize();
    var result = c.addStone(pt, states.BLACK);
    deepEqual(result.message, msgs.CONTINUE, "Must not be done");
    deepEqual(result.result, problemResults.INDETERMINATE,
        "The result must be indeterminate");
    var pts = result.data.points;
    ok(pts[possNext[0].hash()] !== undefined ||
       pts[possNext[1].hash()] !== undefined ||
       pts[possNext[2].hash()] !== undefined,
       "Must show the next white piece in the data.");
  });
};
