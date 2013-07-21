glift.gliftTest = function() {
module("Glift API Test Suite");
  var testUtil = glift.testUtil,
      boardRegions = glift.enums.boardRegions;

  test("Assert exists", function() {
    ok(glift !== undefined);
  });

  test("Test Create: No Options", function() {
    var display = glift.createDisplay({
      intersections: 9
    });
    ok(display !== undefined);
    ok(display.divId() !== undefined);
    ok(display.theme() !== undefined);
    ok(display.intersectionPoints() !== undefined);
    deepEqual(display.divId(), 'glift_display', "div id");
    deepEqual(display.theme(), 'DEFAULT', "theme name");
    deepEqual(display.intersectionPoints(), 9, "intersections");
    deepEqual(display.boardRegion(), boardRegions.ALL, "board region");

    testUtil.assertFullDiv('glift_display')
    display.destroy();
    testUtil.assertEmptyDiv('glift_display')
  });

  // TODO(kashomon): Add this back in at some point. Maybe. It's actually much
  // easier for clients to recreate the board because they are aware of state in
  // a way that the go display itself shouldn't be.
  //
  // test("Test ReCreate", function() {
    // var display = glift.createDisplay({
        // intersections: 7,
        // divId: 'glift_display1'
    // });
    // ok(display !== undefined);
    // ok(display.divId() !== undefined);
    // ok(display.theme() !== undefined);
    // ok(display.intersectionPoints() !== undefined);
    // deepEqual(display.divId(), 'glift_display1', "div id");
    // deepEqual(display.theme(), 'DEFAULT', "theme name");
    // deepEqual(display.intersectionPoints(), 7, "intersections");
    // deepEqual(display.boardRegion(), boardRegions.ALL, "board region");

    // display.recreate({
      // divId: 'glift_display1',
      // intersections: 13,
      // boardRegion: boardRegions.LEFT
    // });
    // ok(display._theme !== undefined, "_theme shouldn't be undefined");
    // deepEqual(display._themeName, "DEFAULT", "ThemeName: Default");
    // ok(display._theme.board !== undefined, "theme.board shouldn't be undefined");
    // deepEqual(display._theme.board.boardAttr.fill, "#f5be7e");
    // ok(display !== undefined);
    // ok(display.divId() !== undefined);
    // ok(display.theme() !== undefined);
    // ok(display.intersectionPoints() !== undefined);
    // deepEqual(display.divId(), 'glift_display1', "div id");
    // deepEqual(display.intersectionPoints(), 13, "intersections");
    // deepEqual(display.boardRegion(), boardRegions.LEFT, "board region");
    // display.draw();

    // testUtil.assertFullDiv('glift_display1')
    // display.destroy();
    // testUtil.assertEmptyDiv('glift_display1')
  // });
};
