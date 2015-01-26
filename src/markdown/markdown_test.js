glift.markdownTest = function() {
  module('glift.markdown');

  test('Testing Rendering: ok', function() {
    var r = glift.markdown.renderAst('foo');
    ok(r);
  });

  test('Testing: Header', function() {
    var r = glift.markdown.renderAst([
      '',
      '#foo bar biff',
      '',
      'Zed'
    ].join('\n'));

    var headers = r.getHeaders();
    deepEqual(headers.length, 1);
    deepEqual(headers[0].type, 'header');
    deepEqual(headers[0].content, 'foo bar biff');
  });

  test('Testing: italic', function() {
    var r = glift.markdown.renderAst('*aoeu*');
    ok(r);
  })
};
