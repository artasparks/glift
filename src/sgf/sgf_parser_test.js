glift.sgf.parserTest = function() {
  module("Parser Test");

  test("Parse simple, real problem", function() {
    var obj = glift.sgf.parser.parse(testdata.sgfs.realproblem);
    ok(obj !== undefined);
  });

  test("Parse complex problem (with passing", function() {
    var obj = glift.sgf.parser.parse(testdata.sgfs.complexproblem);
    ok(obj !== undefined);
  });
};
