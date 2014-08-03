glift.controllers.gameViewerTest = function() {
  module('Game Viewer Test');
  var problem = testdata.sgfs.complexproblem;
  var states = glift.enums.states;
  var ptlistToMap = glift.testUtil.ptlistToMap;

  test('Test Create', function() {
    var gameViewer = glift.controllers.gameViewer({ sgfString: problem });
    ok(gameViewer !== undefined, 'Make sure we can actually create an obj');
    deepEqual(gameViewer.currentMoveNumber, 0, 'index init\'d to 0');
    deepEqual(gameViewer.treepath, [], 'Gamepath set to beginning');
  });

  test('Test NextMove / PrevMove', function() {
    var gameViewer = glift.controllers.gameViewer({ sgfString: problem });
    var displayData = gameViewer.nextMove();
    var move = gameViewer.movetree.getLastMove();
    ok(move !== undefined);
    ok(displayData !== undefined);

    // NextMove Assertions
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.treepath, [0]);
    ok(move, 'Must exist');
    deepEqual(move.color, states.BLACK); // m = 12, c = 2;
    deepEqual(move.point.toString(), '12,2');
    var blackPts = ptlistToMap(displayData.stones.BLACK);
    ok(blackPts[move.point.toString()] !== undefined,
        'Black Stone must exist in the full data (next1)');

    // NextMove Assertions
    var displayData = gameViewer.nextMove();
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.treepath, [0, 0]);
    var move = gameViewer.movetree.getLastMove();
    ok(move, 'Must exist');
    deepEqual(move.color, states.WHITE);
    deepEqual(move.point.toString(), '13,2'); // n = 13, c = 2;
    var whitePts = ptlistToMap(displayData.stones.WHITE);
    ok(whitePts[move.point.toString()] !== undefined,
        'White Stone must exist in the full data (next2)');

    // PrevMove Assertions
    var displayData = gameViewer.prevMove();
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.treepath, [0,0]);
    var moveToRemove = move;
    deepEqual(move.point.toString(), '13,2');
    var emptyPts = ptlistToMap(displayData.stones.EMPTY);
    ok(emptyPts[moveToRemove.point.toString()] !== undefined,
        'Black Stone must exist in pts to remove');
  });

  test('Test Simple Change Variations', function() {
    var gameViewer = glift.controllers.gameViewer({ sgfString: problem });
    var fullData = gameViewer.setNextVariation(1).nextMove();
    var move = gameViewer.movetree.getLastMove();
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.treepath, [1]);
    deepEqual(move.color, states.BLACK);
    deepEqual(move.point.toString(), '12,0'); // m = 12, a = 0
    var bstones = ptlistToMap(fullData.stones.BLACK);
    ok(bstones[move.point.toString()] !== undefined, 'Must be defined');
  });

  test('AddStone', function() {
    var gameViewer = glift.controllers.gameViewer({ sgfString: problem });
    var data = gameViewer.addStone(glift.util.point(18,0), states.BLACK);
    deepEqual(data, null);
    var data = gameViewer.addStone(glift.util.point(12,0), states.BLACK);
    var move = gameViewer.movetree.getLastMove();
    var bstones = ptlistToMap(data.stones.BLACK);
    ok(bstones[move.point.toString()] !== undefined, 'Must be defined');
  });

  test('Test complex path', function() {
    var gameViewer = glift.controllers.gameViewer({ sgfString: problem });
    gameViewer.setNextVariation(1).nextMove(); // [1x]
    gameViewer.moveUpVariations(1).nextMove(); // [1,1x]
    gameViewer.moveDownVariations(1).nextMove(); // [1,1,1x]
    gameViewer.nextMove(); // [1,1,1,0x]
    gameViewer.prevMove(); // [1,1,1x,0]
    gameViewer.prevMove(); // [1,1x,1,0]
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.treepath, [1,1,1,0]);
    gameViewer.setNextVariation(0);
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.treepath, [1,1,0]);
  });

  test('Next/Previous comment or branch', function() {
    var gameViewer = glift.controllers.gameViewer({
        sgfString: problem ,
        initialPosition: '0.1.0.0.0.0'
    });
    deepEqual(gameViewer.movetree.properties().getComment(), 'White dies.');
    deepEqual(gameViewer.movetree.node().getNodeNum(), 5)

    gameViewer.previousCommentOrBranch();

    deepEqual(gameViewer.movetree.properties().getComment(), null);
    deepEqual(gameViewer.movetree.node().getNodeNum(), 1);
    deepEqual(gameViewer.movetree.node().numChildren(), 3);

    gameViewer.nextCommentOrBranch();
    deepEqual(gameViewer.movetree.properties().getComment(), 'White dies.');
    deepEqual(gameViewer.movetree.node().getNodeNum(), 5)
  });
};
