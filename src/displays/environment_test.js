glift.displays.environmentTest = function() {
module("Environment Test Suite");
  var util = glift.util,
      displays = glift.displays,
      enums = glift.enums,
      env = glift.displays.environment,
      cropbox = displays.cropbox,
      WIDTH = 300,
      HEIGHT = 400;

  test("With resizing, should be square", function() {
    var divBox = displays.bboxFromPts(
        util.point(0,0), util.point(WIDTH, HEIGHT));
    var cb = cropbox.create(
        displays.bboxFromPts(util.point(0,0), 18, 18),
        displays.bboxFromPts(util.point(0,0), util.point(0,0)), 0, 18);
    deepEqual(divBox.width(), 300, "Width must be 300");
    deepEqual(divBox.height(), 400, "Height must be 400");

    var newDims = glift.displays.cropbox.getCropDimensions(
      divBox.width(), divBox.height(), cb);

    var resized = env._getResizedBox(divBox, cb);
    deepEqual(Math.round(resized.width()), 300, "Width must be 300");
    deepEqual(Math.round(resized.height()), 300, "Height must be 300");
  });

  test("Test creation of square go board box", function() {
    var guiEnv = env.getInitialized({
        divId: 'foo',
        displayConfig: { _divHeight: HEIGHT, _divWidth: WIDTH}
    });
    deepEqual(guiEnv.goBoardBox.height(), guiEnv.goBoardBox.width(),
        "Must create a square board for a long box");

    var guiEnv = env.getInitialized({
        divId: 'foo',
        displayConfig: { _divHeight: WIDTH, _divWidth: HEIGHT }
    });
    deepEqual(
        Math.round(guiEnv.goBoardBox.height()),
        Math.round(guiEnv.goBoardBox.width()),
        "Must create a square board for a tall box");
  });

  test("Test creation: tall div, square board", function() {
    var e = env.getInitialized({
        displayConfig: { _divHeight: 400, _divWidth: 200}});
    deepEqual(e.divBox.width(), 200, 'divBox width');
    deepEqual(e.divBox.height(), 400, 'divBox height');
    deepEqual(e.goBoardBox.height(), 200, 'goBoardBox height');
    deepEqual(e.goBoardBox.width(), 200, 'goBoardBox width');
    deepEqual(e.goBoardBox.topLeft().x, 0, 'topLeft x');
    deepEqual(e.goBoardBox.topLeft().y, 100, 'topLeft y');
    deepEqual(e.goBoardBox.botRight().x, 200, 'botRight x');
    deepEqual(e.goBoardBox.botRight().y, 300, 'botRight y');
  });

  test("Test creation: wide div, square board", function() {
    var e = env.getInitialized({
        displayConfig: { _divHeight: 200, _divWidth: 400}});
    deepEqual(e.divBox.width(), 400, 'divBox width');
    deepEqual(e.divBox.height(), 200, 'divBox height');
    deepEqual(e.goBoardBox.height(), 200, 'goBoardBox height');
    deepEqual(e.goBoardBox.width(), 200, 'goBoardBox width');
    deepEqual(e.goBoardBox.topLeft().x, 100, 'topLeft x');
    deepEqual(e.goBoardBox.topLeft().y, 0, 'topLeft y');
    deepEqual(e.goBoardBox.botRight().x, 300, 'botRight x');
    deepEqual(e.goBoardBox.botRight().y, 200, 'botRight y');
  });

  test("Test with real (square) div", function() {
    var env1 = env.getInitialized({
      divId: 'glift_display'
    });
    deepEqual(env1.divHeight, 400);
    deepEqual(env1.divWidth, 400);
    ok(env1.divBox !== undefined);
    deepEqual(env1.divBox.width(), 400);
    deepEqual(env1.divBox.height(), 400);
  });
};
