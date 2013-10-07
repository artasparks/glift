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

  test("Parse pass", function() {
    var sgf = "(;GM[1]C[It begins];B[]C[pass])";
    var mt = glift.sgf.parse(sgf);
    ok(mt !== undefined);
    var rp = mt.properties();
    deepEqual(rp.get('GM'), ['1']);
    deepEqual(rp.get('C'), ["It begins"]);
    mt.moveDown();
    var rp = mt.properties();
    deepEqual(rp.get('B'), [""]);
    deepEqual(rp.get('C'), ['pass']);
  });
};
