glift.sgf.newParserTest = function() {
  module("New Parser Test");
  var none = glift.util.none;

  test("Parse simple, real problem", function() {
    var mt = glift.sgf.parse(testdata.sgfs.realproblem);
    ok(mt !== undefined, 'must not be undefined');
    var rp = mt.properties();
    ok(rp.get('GM') !== none, 'must find prop: GM');
    deepEqual(rp.get('GM'), ['1'], 'GM must be 1');
  });
};
