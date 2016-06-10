(function() {
  module('glift.flattener.symbolsTest');

  test('Test get symbol', function() {
    deepEqual(glift.flattener.symbols.TL_CORNER, 2);
  });

  test('Test reverse symbol', function() {
    deepEqual(glift.flattener.symbolStr(2), 'TL_CORNER');
  });

  test('Test reverse all symbols', function() {
    var idx = 0;
    for (var key in glift.flattener.symbols) {
      deepEqual(key, glift.flattener.symbolStr(glift.flattener.symbols[key]),
        'failure at idx ' + idx + ' for key ' + key);
    }
  });
})();
