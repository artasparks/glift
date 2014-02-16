glift.gliftTest = function() {
module("Glift API Test Suite");
  var testUtil = glift.testUtil,
      boardRegions = glift.enums.boardRegions;

  test("Assert exists", function() {
    ok(glift !== undefined);
  });

  test("Test Create: No Options", function() {
    var display = glift.displays.create({
      intersections: 9
    });
    ok(display !== undefined);
    ok(display.divId() !== undefined);
    ok(display.theme() !== undefined);
    ok(display.intersectionPoints() !== undefined);
    deepEqual(display.divId(), 'glift_display', 'div id');
    deepEqual(display.theme(), 'DEFAULT', 'theme name');
    deepEqual(display.intersectionPoints(), 9, 'intersections');
    deepEqual(display.boardRegion(), boardRegions.ALL, 'board region');
    deepEqual(display.rotation(),
        glift.enums.rotations.NO_ROTATION, 'rotation');
    testUtil.assertFullDiv('glift_display')
    display.destroy();
    testUtil.assertEmptyDiv('glift_display')
  });
};
