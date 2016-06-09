(function() {
  module('glift.arrayTest');
  test('Remove Elem', function() {
    var arr = ['foo', 'bar', 'biff'];
    deepEqual(glift.array.remove(arr, 'bar'), ['foo', 'biff']);
    arr = ['foo', 'bar', 'biff'];
    deepEqual(glift.array.remove(arr, 'zed'), ['foo', 'bar', 'biff']);
  });

  test('Replace Elem', function() {
    var arr = ['foo', 'bar', 'biff'];
    deepEqual(glift.array.replace(arr, 'bar', 'zed'), ['foo', 'zed', 'biff']);
    arr = ['foo', 'bar', 'biff'];
    deepEqual(glift.array.replace(arr, 'zed', 'zod'), ['foo', 'bar', 'biff']);
  });
})();
