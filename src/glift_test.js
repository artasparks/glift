(function() {
  module('glift.gliftTest');
  var boardRegions = glift.enums.boardRegions;

  test('Assert exists', function() {
    ok(glift !== undefined);
  });

  test('Test Create: No Options', function() {
    var theme = glift.themes.get('DEFAULT');
    var boardBox = glift.displays.bboxFromDiv('glift_display');

    var display = glift.displays.create(
        'glift_display', // hardcoded in the HTML
        boardBox,
        theme, // theme
        glift.enums.boardRegions.ALL,
        9, // intersections
        glift.enums.rotations.NO_ROTATION,
        false);
    ok(display !== undefined);
    ok(display.divId() !== undefined);
    ok(display.intersections() !== undefined);
    deepEqual(display.divId(), 'glift_display', 'div id');
    deepEqual(display.numIntersections(), 9, 'intersections');
    deepEqual(display.boardRegion(), boardRegions.ALL, 'board region');
    deepEqual(display.rotation(),
        glift.enums.rotations.NO_ROTATION, 'rotation');
    deepEqual(display.drawBoardCoords(), false, 'draw board coords');
    testUtil.assertFullDiv('glift_display')

    display.destroy();
    testUtil.assertEmptyDiv('glift_display')
  });
})();
