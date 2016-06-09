(function() {
  module('glift.rules.gobanTest');
  var rules = glift.rules,
      util = glift.util,
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
        initPos = glift.rules.treepath.parseInitialPath('3'),
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
    goban.addStone(pt(0,3), WHITE);
    var allStones = goban.getAllPlacedStones();

    ok(goban.testAddStone(pt(0,0), WHITE));
    ok(goban.testAddStone(pt(0,0), BLACK));

    // Collisions
    ok(!goban.testAddStone(pt(0,1), BLACK));
    ok(!goban.testAddStone(pt(0,1), WHITE));
    ok(!goban.testAddStone(pt(1,0), BLACK));
    ok(!goban.testAddStone(pt(1,0), WHITE));
    ok(!goban.testAddStone(pt(2,0), BLACK));
    ok(!goban.testAddStone(pt(2,0), WHITE));

    // Self Capture
    ok(!goban.testAddStone(pt(0,2), BLACK));
    // Fill
    ok(goban.testAddStone(pt(0,2), WHITE));

    var tharAllStones = goban.getAllPlacedStones();
    var moveToString = function(mv) {
      return mv.point.toString() + '::' + mv.color;
    }

    var out = [];
    for (var i = 0; i < allStones.length; i++) {
      out.push(moveToString(allStones[i]));
    }
    var outr = [];
    for (var i = 0; i < tharAllStones.length; i++) {
      outr.push(moveToString(tharAllStones[i]));
    }
    deepEqual(out, outr, 'Should not change state');
  });

  test('New findConnected', function() {
    var pt = glift.util.point;
    var goban = glift.rules.goban.getInstance();
    // .OX..
    // OXO..
    // .OO..
    // O..O.
    // .....

    // Row 1
    goban.setColor(pt(1, 0), WHITE);
    goban.setColor(pt(2, 0), BLACK);
    // Row 2
    goban.setColor(pt(0, 1), WHITE);
    goban.setColor(pt(1, 1), BLACK);
    goban.setColor(pt(2, 1), WHITE);
    // Row 3
    goban.setColor(pt(1, 2), WHITE);
    goban.setColor(pt(2, 2), WHITE);
    // Row 4
    goban.setColor(pt(0, 3), WHITE);
    goban.setColor(pt(3, 3), WHITE);

    var g = goban.findConnected_(pt(2,2), WHITE);
    deepEqual(g.liberties, 5);
    deepEqual(g.color, WHITE);
    deepEqual(g.group.length, 3);

    var otherg = goban.findConnected_(pt(1,2), WHITE);
    deepEqual(g.seen, otherg.seen);

    g = goban.findConnected_(pt(2,2), BLACK);
    deepEqual(g.group.length, 0);

    g = goban.findConnected_(pt(1,0), WHITE);
    deepEqual(g.group.length, 1);
    deepEqual(g.group[0].point.toString(), '1,0');
    deepEqual(g.liberties, 1);

    g = goban.findConnected_(pt(2,0), BLACK);
    deepEqual(g.group.length, 1);
    deepEqual(g.liberties, 1);

    g = goban.findConnected_(pt(0,1), WHITE);
    deepEqual(g.group.length, 1);
    deepEqual(g.liberties, 2);

    g = goban.findConnected_(pt(1,1), BLACK);
    deepEqual(g.group.length, 1);
    deepEqual(g.liberties, 0);

    g = goban.findConnected_(pt(0,3), WHITE);
    deepEqual(g.group.length, 1);
    deepEqual(g.liberties, 3);

    g = goban.findConnected_(pt(3,3), WHITE);
    deepEqual(g.group.length, 1);
    deepEqual(g.liberties, 4);
  });

  test('Add Stone + Ko!', function() {
    var goban = glift.rules.goban.getInstance();
    var pt = glift.util.point;
    // .OX.
    // OX.X
    // .OX.
    // O...
    goban.setColor(pt(1,0), WHITE);
    goban.setColor(pt(2,0), BLACK);

    goban.setColor(pt(0,1), WHITE);
    goban.setColor(pt(1,1), BLACK);
    goban.setColor(pt(3,1), BLACK);

    goban.setColor(pt(1,2), WHITE);
    goban.setColor(pt(2,2), BLACK);

    goban.setColor(pt(0,3), WHITE);

    var result = goban.addStone(pt(0,0), BLACK);
    ok(result.successful);
    deepEqual(result.koPt, pt(1,0));
    deepEqual(goban.getKo(), pt(1,0));

    ok(!goban.placeable(pt(1,0)))

    goban.clearKo();

    result = goban.addStone(pt(1,0), WHITE);
    ok(result.successful);
    deepEqual(result.koPt, pt(0,0));
    deepEqual(goban.getKo(), pt(0,0));

    goban.clearKo();

    result = goban.addStone(pt(2,1), WHITE);
    ok(result.successful);
    deepEqual(result.koPt, pt(1,1));
    deepEqual(goban.getKo(), pt(1,1));

    goban.clearStone(pt(4,4))
    deepEqual(goban.getKo(), null, 'Must be invalidated by clearStone');

    result = goban.addStone(pt(1,1), BLACK);
    ok(result.successful);
    deepEqual(result.koPt, pt(2,1));
    deepEqual(goban.getKo(), pt(2,1));

    goban.addStone(pt(4,4), BLACK)
    deepEqual(goban.getKo(), null, 'Must be invalidated by addStone');
  });

  test('Load stones and apply clear locations from movetree', function() {
    var mt = glift.rules.movetree.getInstance();
    var pt = glift.util.point;
    var goban = glift.rules.goban.getInstance();
    mt.properties()
      .add('AB', 'ba')
      .add('AB', 'ab')
      .add('AB', 'bc')
      .add('AB', 'ac')
      .add('AW', 'bb')
      .add('AW', 'cc');
    mt.addNode();
    mt.properties()
      .add('B', 'cb') // should capture 'bb'
    mt.addNode();
    mt.properties()
      .add('AE', 'ac')
      .add('AE', 'ad')
      .add('AE', 'bb')
      .add('AE', 'cc');

    var defaultCaps  = {WHITE: [], BLACK: []};

    var mt = mt.getTreeFromRoot();
    goban.loadStonesFromMovetree(mt);
    goban.applyClearLocationsFromMovetree(mt);
    deepEqual(goban.getStone(pt(1,0)), BLACK);
    deepEqual(goban.getStone(pt(0,1)), BLACK);
    deepEqual(goban.getStone(pt(1,2)), BLACK);
    deepEqual(goban.getStone(pt(1,1)), WHITE);
    deepEqual(goban.getStone(pt(2,2)), WHITE);

    mt.moveDown();

    var expectedCaptures = {WHITE: [pt(1,1)], BLACK: []};
    var captures = goban.loadStonesFromMovetree(mt);
    var clears = goban.applyClearLocationsFromMovetree(mt);
    deepEqual(captures, expectedCaptures);
    deepEqual(clears, []);

    mt.moveDown();
    var expectedClears = [
        {point: pt(0, 2), color: BLACK},
        {point: pt(2,2), color: WHITE}];
    captures = goban.loadStonesFromMovetree(mt);
    clears = goban.applyClearLocationsFromMovetree(mt);
    deepEqual(captures, {WHITE: [], BLACK: []});
    deepEqual(clears, expectedClears);

    var output = glift.rules.goban.getFromMoveTree(mt);
    deepEqual(output.captures, [expectedCaptures, defaultCaps], 'captures');
    deepEqual(output.clearHistory, [[], expectedClears], 'clears');
  });
})();

