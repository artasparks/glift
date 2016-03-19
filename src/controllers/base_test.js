;(function() {
  module('glift.controllers.baseTest');
  var capturetest = testdata.sgfs.capturetest;
  var complexProblem = testdata.sgfs.complexproblem;
  var ptlistToMap = testUtil.ptlistToMap;
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

    var flattened = base.nextMove();
    deepEqual(base.currentMoveNumber(), 1, 'Must number must be 1');

    var captures = base.getCaptures();
    deepEqual(captures.WHITE.length, 5, 'There must be 5 captures');

    var stoneMap = flattened.stoneMap();
    deepEqual(stoneMap[bstone.toString()], {
      point: bstone,
      color: glift.enums.states.BLACK,
    });

    for (var i = 0; i < wstones.length; i++) {
      var stonePtStr = wstones[i].point.toString();
      ok(stoneMap[wstones[i].point.toString()] === undefined, 
          'Must be *not* be defined since they\'ve been captured');
    }

    flattened = base.prevMove();
    stoneMap = flattened.stoneMap();
    for (var i = 0; i < wstones.length; i++) {
      ok(stoneMap[wstones[i].point.toString()] !== undefined, 'Must be defined');
    }
  });

  test('Get/Set variation', function() {
    var base = glift.controllers.base().initOptions({
        sgfString: complexProblem
    });
    deepEqual(base.sgfString, complexProblem);
    deepEqual(base.currentMoveNumber(), 0);
    deepEqual(base.treepath, []);
    deepEqual(base.nextVariationNumber(), 0);

    base.nextMove(1);
    deepEqual(base.currentMoveNumber(), 1);
    deepEqual(base.nextVariationNumber(), 0);
    deepEqual(base.treepath, [1]);
    deepEqual(base.movetree.nextMoves().length, 3);

    base.nextMove(2);
    deepEqual(base.currentMoveNumber(), 2);
    deepEqual(base.nextVariationNumber(), 0);
    deepEqual(base.treepath, [1, 2]);

    base.prevMove();
    deepEqual(base.currentMoveNumber(), 1);
    deepEqual(base.treepath, [1, 2]);
    deepEqual(base.nextVariationNumber(), 2);

    base.prevMove();
    deepEqual(base.nextVariationNumber(), 1);

    base.setNextVariation(1);
    deepEqual(base.nextVariationNumber(), 1);

    base.nextMove();
    deepEqual(base.nextVariationNumber(), 0);
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
})();
