glift.markdownTest = function() {
  module('glift.markdown');

  test('Testing RenderingAst: ok', function() {
    var r = glift.markdown.renderAst('foo');
    ok(r);
  });

  test('Testing Rendering: ok', function() {
    var r = glift.markdown.render('foo');
    ok(r);
    deepEqual(r, '<p>foo</p>\n');
  });
};
