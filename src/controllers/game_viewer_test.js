glift.controllers.gameViewerTest = function() {
  module("Game Viewer Test");
  var problem = testdata.sgfs.complexproblem;
  var states = glift.enums.states;

  test("Test Create", function() {
    var gameViewer = glift.controllers.createGameViewer({ sgfString: problem });
    ok(gameViewer !== undefined, "Make sure we can actually create an obj");
    deepEqual(gameViewer.currentMoveNumber, 0, "index init'd to 0");
    deepEqual(gameViewer.gamePath, [], "Gamepath set to beginning");
  });

  test("Test NextMove / PrevMove", function() {
    var gameViewer = glift.controllers.createGameViewer({ sgfString: problem });
    var fullData = gameViewer.nextMove();
    var move = gameViewer.movetree.getLastMove();
    ok(move !== undefined);
    ok(fullData !== undefined);

    // NextMove Assertions
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.gamePath, [0]);
    ok(move !== glift.util.none, "Must exist");
    deepEqual(move.color, states.BLACK); // m = 12, c = 2;
    deepEqual(move.point.toString(), "12,2");
    ok(fullData.points[move.point.toString()] !== undefined,
        "Stone must exist in the full data (next1)");
    deepEqual(fullData.points[move.point.toString()].stone, states.BLACK);

    // NextMove Assertions
    var fullData = gameViewer.nextMove();
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.gamePath, [0, 0]);
    var move = gameViewer.movetree.getLastMove();
    ok(move !== glift.util.none, "Must exist");
    deepEqual(move.color, states.WHITE);
    deepEqual(move.point.toString(), "13,2"); // n = 13, c = 2;
    ok(fullData.points[move.point.toString()] !== undefined,
        "Stone must exist in the full data (next2)");
    deepEqual(fullData.points[move.point.toString()].stone, states.WHITE);

    // PrevMove Assertions
    var fullData = gameViewer.prevMove();
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.gamePath, [0,0]);
    var move = gameViewer.movetree.getLastMove();
    ok(move !== glift.util.none, "Must exist");
    deepEqual(move.color, states.BLACK);
    deepEqual(move.point.toString(), "12,2");
    ok(fullData.points[move.point.toString()] !== undefined,
        "Stone must exist in the full data (prev)");
    ok(fullData.points["13,2"] === undefined,
        "Stone must not exist in the full data (prev)");
    deepEqual(fullData.points[move.point.toString()].stone, states.BLACK);
  });

  test("Test Simple Change Variations", function() {
    var gameViewer = glift.controllers.createGameViewer({ sgfString: problem });
    var fullData = gameViewer.setNextVariation(1).nextMove();
    var move = gameViewer.movetree.getLastMove();
    deepEqual(gameViewer.currentMoveNumber, 1);
    deepEqual(gameViewer.gamePath, [1]);
    deepEqual(move.color, states.BLACK);
    deepEqual(move.point.toString(), "12,0"); // m = 12, a = 0
    ok(fullData.points[move.point.toString()] !== undefined,
        "Stone must exist in the full data (prev)");
    deepEqual(fullData.points[move.point.toString()].stone, states.BLACK);
  });

  test("AddStone", function() {
    var gameViewer = glift.controllers.createGameViewer({ sgfString: problem });
    var data = gameViewer.addStone(glift.util.point(18,0), states.BLACK);
    deepEqual(data, glift.util.none);
    var data = gameViewer.addStone(glift.util.point(12,0), states.BLACK);
    var move = gameViewer.movetree.getLastMove();
    deepEqual(data.points[move.point.toString()].stone, states.BLACK);
  });

  test("Test complex path", function() {
    var gameViewer = glift.controllers.createGameViewer({ sgfString: problem });
    gameViewer.setNextVariation(1).nextMove(); // [1x]
    gameViewer.moveUpVariations(1).nextMove(); // [1,1x]
    gameViewer.moveDownVariations(1).nextMove(); // [1,1,1x]
    gameViewer.nextMove(); // [1,1,1,0x]
    gameViewer.prevMove(); // [1,1,1x,0]
    gameViewer.prevMove(); // [1,1x,1,0]
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.gamePath, [1,1,1,0]);
    gameViewer.setNextVariation(0);
    deepEqual(gameViewer.currentMoveNumber, 2);
    deepEqual(gameViewer.gamePath, [1,1,0]);
  });
};
