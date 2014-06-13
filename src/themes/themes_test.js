glift.themes.themesTest = function() {
  module("Themes Test");
  var themes = glift.themes;

  test("Has", function() {
    ok(themes.has('DEFAULT'), 'has');
    ok(!themes.has('FOO'), 'not has');
  });

  test("Get", function() {
    deepEqual(themes.get('DEFAULT'), themes.registered.DEFAULT, 'get');
    deepEqual(themes.get('FOO'), null, "non-get");
  });

  test('DeepCopy', function() {
    var textbook = themes.get('TEXTBOOK');
    deepEqual(textbook.board.fill, '#FFF', 'background');
    deepEqual(textbook.board.stroke, '#000000', 'bg stroke');
    deepEqual(textbook.stones.BLACK.fill, 'black', 'stone fill');

    var depth = themes.get('DEPTH');
    ok(depth.stones.shadows !== undefined, 'must not be undefined');
    // deepEqual(depth.stones.shadows.fill, '#555', 'background');
  });
};
