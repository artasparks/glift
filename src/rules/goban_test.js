(function() {
  module('glift.rules.gobanTest');
  var rules = glift.rules,
      util = glift.util,
      logz = glift.util.logz,
      BLACK = glift.enums.states.BLACK,
      WHITE = glift.enums.states.WHITE,
      EMPTY = glift.enums.states.EMPTY;

  test('Successful addStone', function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(1, 1), BLACK);
    deepEqual(result.captures.length, 0, 'list must be only 1 long');
    ok(result.successful, 'must be successful');
  });

  test('Fail: Out of bounds: <0', function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(-1, 1), BLACK);
    deepEqual(result.captures.length, 0, 'list must be only 1 long');
    ok(!result.successful, 'must be not be successful');
  });

  test('Fail: Out of bounds: >=19', function() {
    var test_goban = rules.goban.getInstance();
    var result = test_goban.addStone(util.point(2, 19), BLACK);
    deepEqual(result.captures.length, 0, 'list must be only 1 long');
    ok(!result.successful, 'must be not be successful');
  });

  test('Fail: Existing stone', function() {
    var test_goban = rules.goban.getInstance();
    test_goban.addStone(util.point(1, 1), BLACK);
    var result = test_goban.addStone(util.point(1, 1), BLACK);
    deepEqual(result.captures.length, 0, 'list must be only 1 long');
    ok(!result.successful, 'must be not be successful');
  });

  test('Capture -- center', function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(1, 1), BLACK);
    test_goban.addStone(util.point(0, 2), BLACK);
    test_goban.addStone(util.point(2, 2), BLACK);
    test_goban.addStone(util.point(1, 2), WHITE);
    var result = test_goban.addStone(util.point(1, 3), BLACK);

    deepEqual(result.captures.length, 1, 'captures array must be only 1 long');
    ok(result.successful, 'must be be successful');
    deepEqual(result.captures[0].toString(), glift.util.point(1,2).toString(),
        'must have captured the white stone');
    deepEqual(test_goban.getStone(glift.util.point(1,2)), EMPTY,
        'Must be removed');
  });

  test('Capture -- side', function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(0, 1), BLACK);
    test_goban.addStone(util.point(0, 3), BLACK);
    test_goban.addStone(util.point(0, 2), WHITE);
    var result = test_goban.addStone(util.point(1, 2), BLACK);

    deepEqual(result.captures.length, 1, 'captures array must be only 1 long');
    ok(result.successful, 'must be be successful');
    deepEqual(result.captures[0].toString(), glift.util.point(0,2).toString(),
        'must have captured the white stone');
  });

  test('Capture -- corner', function() {
    var test_goban = rules.goban.getInstance(9);
    test_goban.addStone(util.point(0, 1), BLACK);
    test_goban.addStone(util.point(0, 0), WHITE);
    var result = test_goban.addStone(util.point(1, 0), BLACK);

    deepEqual(result.captures.length, 1, 'captures array must be only 1 long');
    ok(result.successful, 'must be be successful');
    deepEqual(result.captures[0].toString(), glift.util.point(0,0).toString(),
        'must have captured the white stone');
  });

  test('Init from MoveTree', function() {
    var movetree = glift.rules.movetree.getFromSgf(testdata.sgfs.veryeasy),
        conv = glift.util.pointFromSgfCoord,
        initPos = glift.rules.treepath.parsePath('3'),
        goban = glift.rules.goban.getFromMoveTree(movetree, initPos).goban,
        expPoint_pm = conv('ef'),
        expPoint_w = conv('cc'),
        expPoint_b = conv('pd');

    deepEqual(goban.getStone(expPoint_pm), glift.enums.states.WHITE,
        'Must get WHITE');
    deepEqual(goban.getStone(expPoint_w), glift.enums.states.WHITE,
        'Must get WHITE');
    deepEqual(goban.getStone(expPoint_b), glift.enums.states.BLACK,
        'Must get BLACK');
    deepEqual(goban.getStone(glift.util.point(6,6)), glift.enums.states.EMPTY,
        'Must get EMPTY');
  });

  test('Get Neighbors', function() {
    var pt = glift.util.point;
    var goban = glift.rules.goban.getInstance()
    // Corner
    var arr = goban.neighbors_(pt(0,0));
    deepEqual(arr.length, 2);
    deepEqual(arr[0].toString(),'1,0');
    deepEqual(arr[1].toString(),'0,1');

    // Right Edge
    var arr = goban.neighbors_(pt(18,15));
    deepEqual(arr.length, 3);
    deepEqual(arr[0].toString(),'17,15');
    deepEqual(arr[1].toString(),'18,14');
    deepEqual(arr[2].toString(),'18,16');

    // Middle
    var arr = goban.neighbors_(pt(10,11));
    deepEqual(arr.length, 4);
    deepEqual(arr[0].toString(),'9,11');
    deepEqual(arr[1].toString(),'11,11');
    deepEqual(arr[2].toString(),'10,10');
    deepEqual(arr[3].toString(),'10,12');
  });

  test('testAddStone', function() {
    var goban = glift.rules.goban.getInstance();
    var pt = glift.util.point;
    // .OX.
    // OX..
    // .O..
    // O...
    goban.addStone(pt(1,0), WHITE);
    goban.addStone(pt(2,0), BLACK);
    goban.addStone(pt(0,1), WHITE);
    goban.addStone(pt(1,1), BLACK);
    goban.addStone(pt(1,2), WHITE);
    goban.addStone(pt(3,0), WHITE);

    ok(goban.testAddStone(pt(0,0), WHITE));
    ok(goban.testAddStone(pt(0,0), BLACK));

    // Collisions
    ok(!goban.testAddStone(pt(0,1), BLACK));
    ok(!goban.testAddStone(pt(0,1), WHITE));
    ok(!goban.testAddStone(pt(1,0), BLACK));
    ok(!goban.testAddStone(pt(1,0), WHITE));

    // Self capture spot
    ok(!goban.testAddStone(pt(2,0), BLACK));
    ok(goban.testAddStone(pt(2,0), WHITE));
  });
})();
