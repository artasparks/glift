(function() {
  module('glift.dom.sanitizeTest');
  var sanitize = glift.dom.sanitize;

  test('Testing simple tag sanitize', function() {
    deepEqual(sanitize('foo<zed>bar'), 'foo&lt;zed&gt;bar');
  });

  test('Testing nested tag', function() {
    deepEqual(sanitize('foo<<zed>>bar'), 'foo&lt;&lt;zed&gt;&gt;bar');
  });

  test('Testing script tag', function() {
    deepEqual(
        sanitize('foo<script>zed</script>bar'), 
        'foo&lt;script&gt;zed&lt;/script&gt;bar');
  });

  test('Testing whitelist', function() {
    var str = 'foo<b><i><br><strong><u><em>zed</b></i></br></strong></u></em>';
    deepEqual(sanitize(str), str);
  });

  test('Testing whitelist for tags with props', function() {
    var str = 'foo<b class="zed">';
    deepEqual(sanitize(str), 'foo&lt;b class="zed"&gt;');
  });

  test('Testing misc chares', function() {
    var str = '&\'"/';
    deepEqual(sanitize(str), '&amp;&#x27;&quot;&#x2F;');
  });
})();
