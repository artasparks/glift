(function() {
  module('glift.enumsTest');

  test('toCamelCase', function() {
    var toCamelCase = glift.enums.toCamelCase;
    deepEqual(toCamelCase('FOO'), 'foo');
    deepEqual(toCamelCase('FOO_BAR'), 'fooBar');
    deepEqual(toCamelCase('FOO_BAR_BIFF'), 'fooBarBiff');
    deepEqual(toCamelCase('FOO_BAR_BIFF_'), 'fooBarBiff');
  });
})();
