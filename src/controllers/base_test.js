glift.controllers.baseTest = function() {
  module('glift.controllers.baseTest');
  var capturetest = testdata.sgfs.capturetest;
  var complexProblem = testdata.sgfs.complexproblem;
  var ptlistToMap = glift.testUtil.ptlistToMap;
  var conv = glift.util.pointFromSgfCoord;

  test('Successful build a Base Controller', function() {
    var genCont = glift.controllers.base();
    ok(genCont !== undefined, 'must successfully init the controller');
  });

  test('Create a base controller with a basic problem', function() {
    var base = glift.controllers.base().initOptions({sgfString: capturetest});
    ok(base !== undefined, 'must be defined');
    deepEqual(base.sgfString, capturetest, 'String equality');
  });

  test('Test NextMove / Prev Move', function() {
    var base = glift.controllers.base().initOptions({sgfString: capturetest});
    deepEqual(base.currentMoveNumber(), 0);

    var bstone = conv('sb');
    var wstones = glift.sgf.convertFromLabelArray(
        ['sa', 'qb', 'rb', 'qc', 'rc']);

    var data = base.nextMove();
    deepEqual(base.currentMoveNumber(), 1, 'Must number must be 1');

    var captures = base.getCaptures();
    deepEqual(captures.WHITE.length, 5, 'There must be 5 captures');
    var foundPts = ptlistToMap(data.stones.EMPTY);
    deepEqual(data.stones.BLACK[0].toString(), bstone.toString());
    for (var i = 0; i < wstones.length; i++) {
      ok(foundPts[wstones[i].point.toString()] !== undefined, 'Must be defined');
    }

    var data = base.prevMove();
    var foundPts = ptlistToMap(data.stones.WHITE);
    for (var i = 0; i < wstones.length; i++) {
      ok(foundPts[wstones[i].point.toString()] !== undefined, 'Must be defined');
    }
  });

  test('Get/Set variation', function() {
    var base = glift.controllers.base().initOptions({
        sgfString: complexProblem
    });
    deepEqual(base.sgfString, complexProblem);
    deepEqual(base.currentMoveNumber(), 0);
    deepEqual(base.treepath, []);
    deepEqual(base.getNextVariation(), 0);

    base.nextMove(1);
    deepEqual(base.currentMoveNumber(), 1);
    deepEqual(base.getNextVariation(), 0);
    deepEqual(base.treepath, [1]);
    deepEqual(base.movetree.nextMoves().length, 3);

    base.nextMove(2);
    deepEqual(base.currentMoveNumber(), 2);
    deepEqual(base.getNextVariation(), 0);
    deepEqual(base.treepath, [1, 2]);

    base.prevMove();
    deepEqual(base.currentMoveNumber(), 1);
    deepEqual(base.treepath, [1, 2]);
    deepEqual(base.getNextVariation(), 2);

    base.prevMove();
    deepEqual(base.getNextVariation(), 1);

    base.setNextVariation(1);
    deepEqual(base.getNextVariation(), 1);

    base.nextMove();
    deepEqual(base.getNextVariation(), 0);
  });

  test('Initialize with a custom treepath', function() {
    var base = glift.controllers.base().initOptions({
        sgfString: complexProblem
    });
    deepEqual(base.currentMoveNumber(), 0);
    base.initialize('0.0.0');
    deepEqual(base.currentMoveNumber(), 2);
    deepEqual(base.treepath, [0,0]);
  });
};
