(function() {
  module('glift.parse.tygemTest');
  var point = glift.util.point;

  test('Testing basic parser: no exceptions', function() {
    var mt = glift.parse.tygem('');
    ok(mt !== undefined);
  });

  test('Parse real gib', function() {
    var mt = glift.parse.tygem(testdata.gib.tygemExample);
    deepEqual(mt.properties().getOneValue('PW'), 'Radagast (2K)');
    deepEqual(mt.properties().getOneValue('PB'), 'go48 (2K)');

    mt.moveDown();
    deepEqual(mt.properties().getAsPoint('B').toString(), point(15, 15).toString());
    mt.moveDown();
    deepEqual(mt.properties().getAsPoint('W').toString(), point(3, 2).toString());
  });

  test('Parse real gib: Round Trip', function() {
    var mt = glift.parse.tygem(testdata.gib.tygemExampleNewer);
    deepEqual(mt.properties().getOneValue('PW'), 'Zellnox (2D)');
    deepEqual(mt.properties().getOneValue('PB'), 'pdy1800 (1D)');

    var str = mt.toSgf();
    ok(/PW\[Zellnox \(2D\)\]/.test(str));
    ok(/PB\[pdy1800 \(1D\)\]/.test(str));
  });
})();
