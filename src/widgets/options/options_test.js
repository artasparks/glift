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

  test('Test: hook option templating', function() {
    var inOpts = {
      hooks: {
        problemCorrect: function() {
        }
      }
    };
    var out = optLib.setOptionDefaults(inOpts);
    ok(typeof out.hooks.problemCorrect === 'function', 'not a function');
    ok(typeof out.hooks.problemIncorrect === 'function', 'not a function');
    ok(out.hooks.problemCorrect === inOpts.hooks.problemCorrect);
    ok(out.hooks.problemCorrect !== inOpts.hooks.problemIncorrect);
  });

  test('Test: hooks available when not specified', function() {
    var inOpts = {
    };
    var out = optLib.setOptionDefaults(inOpts);
    ok(typeof out.hooks.problemCorrect === 'function', 'not a function');
    ok(typeof out.hooks.problemIncorrect === 'function', 'not a function');
    var f = function () {};
    ok(out.hooks.problemCorrect.toString() === f.toString());
    ok(out.hooks.problemIncorrect.toString() === f.toString());
  });
})();
