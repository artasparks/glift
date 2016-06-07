(function() {
  module('glift.util.objTest');
  test('Flat merge: basic', function() {
    var base = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    var repl1 = { c: 'zed' };
    var repl2 = { d: 'zod' };
    deepEqual(
        glift.util.obj.flatMerge(base, repl1, repl2),
        { a: 1, b: 2, c: 'zed', d: 'zod', e: 5 });
  });

  test('Flat merge: edge', function() {
    var base = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    deepEqual(glift.util.obj.flatMerge(base), base);
    ok(glift.util.obj.flatMerge(base) !== base, 'should have different reference');
  });

  test('Is empty', function() {
    ok(glift.util.obj.isEmpty({}));
    ok(!glift.util.obj.isEmpty({a: 'b'}));
  });
})();
