glift.themes.themesTest = function() {
  module("Glift API Test Suite");
  var themes = glift.themes;

  test("Has", function() {
    ok(themes.has('DEFAULT'), 'has');
    ok(!themes.has('FOO'), 'not has');
  });

  test("Get", function() {
    deepEqual(themes.get('DEFAULT'), themes.registered.DEFAULT, 'get');
    deepEqual(themes.get('FOO'), glift.util.none, "non-get");
  });
}
