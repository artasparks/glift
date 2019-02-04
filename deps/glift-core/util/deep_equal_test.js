(function() {
  module('glift.util.deepEqualTest');
  var de = glift.util.deepEqual;

  test('basic types', function() {
    ok(de('foo', 'foo'), 'string');
    ok(de(123, 123), 'number');
    ok(de(123, 123.0), 'number');
    ok(de(true, true), 'bool');
    ok(de(null, null), 'null');
    ok(de(undefined, undefined), 'undefined');

    ok(!de('foo', 'bar'), 'bad values');
    ok(!de('foo', 123), 'bad types');
  });

  test('basic objects', function() {
    ok(de({foo: 'bar', biff: 123}, {foo: 'bar', biff: 123}), 'basic objs');
    var zed = {foo: 'bar'};
    ok(de(zed, zed), 'same references');
    ok(de([1,2,'zork'], [1,2,'zork']), 'array');

    ok(!de([1,2,'zork'], [1,2,'zed']), 'bad array');
    ok(!de({foo: 'bar', biff: 123}, {foo: 'bar', biff: 132}), 'basic objs, bad vals');
    ok(!de({foo: 'bar', biff: 123}, {foo: 'bar', bork: 123}), 'basic objs, bad keys');
  });

  test('complex objects', function() {
    ok(de({foo: 'bar', biff: {zed: 123}}, {foo: 'bar', biff: {zed: 123}}), 'complex objs');
    ok(de([{foo: 'bar'}], [{foo: 'bar'}]), 'complex arrays');
    ok(de([[{foo: 'bar'}]], [[{foo: 'bar'}]]), 'complexer arrays');
  });
})();
