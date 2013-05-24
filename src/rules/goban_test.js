glift.rules.gobanTest = function() {
  module("Goban Test");
  var rules = glift.rules,
      util = glift.util,
      logz = glift.util.logz,
      BLACK = glift.enums.states.BLACK,
      WHITE = glift.enums.states.WHITE,
      EMPTY = glift.enums.states.EMPTY;

  test("Successful addStone", function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(1, 1), BLACK);
    deepEqual(result.captures.length, 0, "list must be only 1 long");
    ok(result.successful, "must be successful");
  });

  test("Fail: Out of bounds: <0", function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(-1, 1), BLACK);
    deepEqual(result.captures.length, 0, "list must be only 1 long");
    ok(!result.successful, "must be not be successful");
  });

  test("Fail: Out of bounds: >=19", function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(2, 19), BLACK);
    deepEqual(result.captures.length, 0, "list must be only 1 long");
    ok(!result.successful, "must be not be successful");
  });

  test("Fail: Existing stone", function() {
    var test_goban = rules.goban.getInstance();
    test_goban.addStone(util.point(1, 1), BLACK);
    var result = test_goban.addStone(util.point(1, 1), BLACK);
    deepEqual(result.captures.length, 0, "list must be only 1 long");
    ok(!result.successful, "must be not be successful");
  });

  test("Capture -- center", function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(1, 1), BLACK);
    test_goban.addStone(util.point(0, 2), BLACK);
    test_goban.addStone(util.point(2, 2), BLACK);
    test_goban.addStone(util.point(1, 2), WHITE);
    var result = test_goban.addStone(util.point(1, 3), BLACK);

    deepEqual(result.captures.length, 1, "captures array must be only 1 long");
    ok(result.successful, "must be be successful");
    deepEqual(result.captures[0].toString(), glift.util.point(1,2).toString(),
        "must have captured the white stone");
  });

  test("Capture -- side", function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(0, 1), BLACK);
    test_goban.addStone(util.point(0, 3), BLACK);
    test_goban.addStone(util.point(0, 2), WHITE);
    var result = test_goban.addStone(util.point(1, 2), BLACK);

    deepEqual(result.captures.length, 1, "captures array must be only 1 long");
    ok(result.successful, "must be be successful");
    deepEqual(result.captures[0].toString(), glift.util.point(0,2).toString(),
        "must have captured the white stone");
  });

  test("Capture -- corner", function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(0, 1), BLACK);
    test_goban.addStone(util.point(0, 0), WHITE);
    var result = test_goban.addStone(util.point(1, 0), BLACK);

    deepEqual(result.captures.length, 1, "captures array must be only 1 long");
    ok(result.successful, "must be be successful");
    deepEqual(result.captures[0].toString(), glift.util.point(0,0).toString(),
        "must have captured the white stone");
  });

  test("Init from MoveTree", function() {
    var movetree = glift.rules.movetree.getFromSgf(testdata.sgfs.veryeasy),
        conv = glift.sgf.sgfCoordToPoint,
        initPos = glift.rules.treepath.parseInitPosition('3'),
        goban = glift.rules.goban.getFromMoveTree(movetree, initPos),
        expPoint_pm = conv('ef'),
        expPoint_w = conv('cc'),
        expPoint_b = conv('pd');

    deepEqual(goban.getStone(expPoint_pm), glift.enums.states.WHITE,
        "Must get WHITE");
    deepEqual(goban.getStone(expPoint_w), glift.enums.states.WHITE,
        "Must get WHITE");
    deepEqual(goban.getStone(expPoint_b), glift.enums.states.BLACK,
        "Must get BLACK");
    deepEqual(goban.getStone(glift.util.point(6,6)), glift.enums.states.EMPTY,
        "Must get EMPTY");
  });
};
