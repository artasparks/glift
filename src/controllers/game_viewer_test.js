glift.controllers.gameViewerTest = function() {
  module("Game Viewer Test");
  var problem = testdata.sgfs.complexproblem;

  test("TestMoveDown", function() {
    // m = 12, c = 2;
    var gameViewer = glift.controllers.createGameViewer({
      sgfString: problem
    });
    ok(gameViewer !== undefined, "Make sure we can actually create an obj");
  });
};
