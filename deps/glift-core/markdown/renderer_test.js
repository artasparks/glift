(function() {
  module('glift.markdown.rendererTest');

  var testStr = [
    '# I am a title',
    '',
    ' I am a paragraph element',
    '* I am a list element'
    ].join('\n');

  test('Example using a custom renderer with markdown.', function() {
    var renderer = new glift.marked.Renderer();
    renderer.heading = function(text, level) {
      return '\\title{' + text + '}';
    };
    renderer.paragraph = function(text) {
      return '\\paragraph{' + text + '}';
    };
    renderer.list = function(body) {
      return '\\list{' + body+ '}';
    };
    renderer.listitem = function(text) {
      return '\\litem{' + text + '}';
    };
    var rendered = glift.marked(testStr, {
      renderer: renderer
    });

    ok(/title/.test(rendered), 'title');
    ok(/paragraph/.test(rendered), 'paragraph');
    ok(/list/.test(rendered), 'list');
    ok(/litem/.test(rendered), 'listitem');
  });
})();
