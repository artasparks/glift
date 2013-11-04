glift.widgets.widgetsTest = function() {
  module("Widgets Test");
  var testUtil = glift.testUtil;

  test("Successfully create a basic widget (Game Viewer)", function() {
    var widget = glift.widgets.create({
      sgf: testdata.sgfs.complexproblem
    })
    ok(widget !== undefined);
  });
};
