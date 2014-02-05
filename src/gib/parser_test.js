glift.gib.gibParserTest = function() {
  module("Gib (Tygem) Parser Test");
  var point = glift.util.point;

  test("Testing basic parser: no exceptions", function() {
    var mt = glift.gib.parse("");
    ok(mt !== undefined);
  });

  test("Parse real gib", function() {
    var mt = glift.gib.parse(testdata.gib.tygemExample);
    deepEqual(mt.properties().getOneValue('PW'), 'Radagast (2K)');
    deepEqual(mt.properties().getOneValue('PB'), 'go48 (2K)');

    mt.moveDown();
    deepEqual(mt.properties().getAsPoint('B'), point(15, 3));
    mt.moveDown();
    deepEqual(mt.properties().getAsPoint('W'), point(3, 16));
  });
};
