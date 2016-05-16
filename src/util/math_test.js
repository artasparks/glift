(function() {
  module('glift.mathTest');

  test('That mostly equal is mostly equal', function() {
    ok(glift.math.mostlyEqual(1.00001, 1.00000, 0.00002), 'should be true')
    ok(glift.math.mostlyEqual(0.99999, 1.00000, 0.00002), 'should be true')
  });
})();
