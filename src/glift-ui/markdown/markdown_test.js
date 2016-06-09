(function() {
  module('glift.markdown');

  test('Testing Rendering: ok', function() {
    var r = glift.markdown.render('foo');
    ok(r);
    deepEqual(r, '<p>foo</p>\n');
  });

  test('Testing RenderingAst: headers', function() {
    var r = glift.markdown.renderAst([
      'foo',
      '#bar',
      'blah',
      '##biff',
      'blahblah',
      '###bam',
      'blahblah',
      '####blam'
    ].join('\n'));
    ok(r);

    var h = r.headers();
    deepEqual(h.length, 4);
    deepEqual(h[0].text, 'bar');
  });
})();
