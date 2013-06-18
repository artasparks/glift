glift.displays.boardTest = function() {
  module("Board Tests");
  var util = glift.util,
      enums = glift.enums,
      none = util.none,
      DEFAULT_THEME = 'DEFAULT' // theme
      theme = glift.themes.get(DEFAULT_THEME),
      boardRegions = glift.enums.boardRegions,
      board = glift.displays.board,
      env = glift.displays.environment.get({
        intersections: 9 // Use a 9x9 to make things a bit faster
      }), // divId: glift_display.
      display = board.create(env, DEFAULT_THEME, theme).init(),
      displayPaper = display._paper,
      testUtil = glift.testUtil,
      // Utility methods
      getAllElements = testUtil.getAllElements,
      assertEmptyPaper = testUtil.assertEmptyPaper;

  test("Create/Destroy base board box", function() {
    var board = display.createBoardBase();
    ok(board.rect !== none);
    board.destroy();
    assertEmptyPaper(displayPaper);
  });

  test("Create/Destroy board lines", function() {
    var lines = display.createBoardLines();
    ok(lines.horzSet !== none);
    ok(lines.horzSet !== undefined);
    ok(lines.vertSet !== none);
    ok(lines.vertSet !== undefined);
    lines.destroy();
    assertEmptyPaper(displayPaper);
  });

  test("Create/Destroy star points", function() {
    var starPoints = display.createBoardLines();
    ok(starPoints.starSet !== none);
    starPoints.destroy();
    assertEmptyPaper(displayPaper);
  });

  test("Create/Destroy stones", function() {
    var stones = display.createStones(),
        numStones = 0,
        clickCounter = 0,
        hoverInCounter = 0,
        hoverOutCounter = 0,
        _ = stones.setClickHandler(function(pt) { clickCounter++; }),
        _ = stones.setHoverInHandler(function(pt) { hoverInCounter += 2; }),
        _ = stones.setHoverOutHandler(function(pt) { hoverOutCounter += 3; });
    for (var key in stones.stoneMap){
      var stone = stones.stoneMap[key],
          pt = glift.util.pointFromHash(key);
      stones.forceClick(pt);
      stones.forceHoverIn(pt);
      stones.forceHoverOut(pt);
      numStones++;
    }
    deepEqual(numStones, 81);
    deepEqual(clickCounter, 81);
    deepEqual(hoverInCounter, 162);
    deepEqual(hoverOutCounter, 243);

    // Individual stone tests
    var testPoint = glift.util.point(1, 3);
    var stone = stones.stoneMap[testPoint.hash()];
    deepEqual(stone.intersection.toString(), testPoint.hash(), "stoneKey");

    stones.destroy();
    assertEmptyPaper(displayPaper);
  });

  test("Remove Paper", function() {
    testUtil.assertFullDiv('glift_display')
    display.destroy();
    testUtil.assertEmptyDiv('glift_display')
  });
};
