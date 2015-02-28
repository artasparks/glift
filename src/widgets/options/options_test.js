(function() {
  module('glift.widgets.options.optionsTest');
  var optLib = glift.widgets.options;
  var template = glift.widgets.options.baseOptions;

  test('Test process defaults', function() {
    var opts = optLib._setDefaults({}, template, 'sgfDefaults');
    var out = opts.sgfDefaults;
    var expected = template.sgfDefaults;
    deepEqual(out.widgetType, expected.widgetType);
  });

  test('Test process display options', function() {
    var inOpts = {
      display: {
        theme: 'DEPTH'
      }
    };
    var out = optLib._setDefaults(inOpts, template, 'sgfDefaults');
    ok(out.display.theme);
    deepEqual(inOpts.display.theme, out.display.theme);
  });
})();
