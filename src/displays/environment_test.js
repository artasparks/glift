glift.displays.environmentTest = function() {
  var util = glift.util,
      displays = glift.displays,
      enums = glift.enums,
      env = glift.displays.environment,
      displayTypes = enums.displayTypes,

      WIDTH = 300,
      HEIGHT = 400,
      testbox = displays.bbox(util.point(0,0), WIDTH, HEIGHT),
      tallBox = displays.bbox(util.point(0,0), HEIGHT, WIDTH),
      total = 1 + env.BOTTOMBAR_SIZE + env.TOPBAR_SIZE;

  test("--------Gui Environment Tests--------", function() { ok(true); });

  test("Create the side bars: TOP", function() {
    var topBar = env._getSidebarBox(
        displayTypes.EXPLAIN_BOARD, testbox, enums.directions.TOP);
    deepEqual(topBar.width, WIDTH, "Width must span");
    deepEqual(topBar.height, env.TOPBAR_SIZE * HEIGHT / total,
        "Height must be a fraction of the total");
  });

  test("Create the side bars: BOTTOM", function() {
    var botBar = env._getSidebarBox(
        displayTypes.EXPLAIN_BOARD, testbox, enums.directions.BOTTOM);
    deepEqual(botBar.width, WIDTH, "Width must span");
    deepEqual(
        Math.round(botBar.height),
        Math.round((env.BOTTOMBAR_SIZE) * HEIGHT / total),
        "Height must be a fraction of the total");
    deepEqual(botBar.topLeft.y, HEIGHT - (env.BOTTOMBAR_SIZE) * HEIGHT / total,
        "Vertical pos must be at the bottom");
  });

  test("With resizing (for EXPLAIN_BOARD displayType), " +
       "should be a square without the vertical stretch", function() {
    var resized = env._getResizedBox(
        displayTypes.EXPLAIN_BOARD,
        displays.bbox(util.point(0, 0), WIDTH, HEIGHT),
        displays.bbox(util.point(0,0), 18, 18));
    deepEqual(Math.round(resized.height / total),
        Math.round(resized.width),
        "Width and height must be equal");
  });

  test("Test creation of square go board box", function() {
    var guiEnv = env.getInitialized(
        'foo',
        displayTypes.EXPLORE_BOARD,
        { _divHeight: HEIGHT, _divWidth: WIDTH})
    deepEqual(guiEnv.goBoardBox.height, guiEnv.goBoardBox.width,
        "Must create a square board for a long box");

    var guiEnv = env.getInitialized(
        'foo',
        displayTypes.EXPLORE_BOARD,
        { _divHeight: WIDTH, _divWidth: HEIGHT })
    deepEqual(
        Math.round(guiEnv.goBoardBox.height),
        Math.round(guiEnv.goBoardBox.width),
        "Must create a square board for a tall box");
  });
};
