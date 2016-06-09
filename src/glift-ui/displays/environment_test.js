(function() {
  module('glift.displays.environmentTest');
  var util = glift.util,
      displays = glift.displays,
      enums = glift.enums,
      env = glift.displays.environment,
      cropbox = displays.cropbox,
      divId = 'zed',
      pt = glift.util.point,
      tl = pt(0,0),
      bbox = glift.orientation.bbox,
      opts = {},
      WIDTH = 300,
      HEIGHT = 400;

  var createEnv = function(opt) {
    var opt = opt || {};
    var divId = opt.divId || 'zed';
    var boardBox = opt.boardBox !== undefined ?
        opt.boardBox :
        bbox.fromPts(tl, pt(WIDTH, HEIGHT));
    var boardRegion = opt.boardRegion || glift.enums.boardRegions.ALL;
    var intersections = opt.intersections || 19;
    var drawBoardCoords = opt.drawBoardCoords || false;
    return env.get(divId, boardBox, boardRegion, intersections, drawBoardCoords);
  };

  test('Creation of env object', function() {
    var envObj = createEnv();
    deepEqual(envObj.bbox.width(), WIDTH);
    deepEqual(envObj.bbox.height(), HEIGHT);
    deepEqual(envObj.divId, divId);
    deepEqual(envObj.divWidth, WIDTH);
    deepEqual(envObj.divHeight, HEIGHT);
    deepEqual(envObj.boardRegion, glift.enums.boardRegions.ALL);
    deepEqual(envObj.intersections, 19);
    deepEqual(envObj.drawBoardCoords, false);
  });

  test('Creation of square go board box', function() {
    var guiEnv = createEnv({
      boardBox: bbox.fromPts(tl, pt(WIDTH, HEIGHT))
    }).init();
    deepEqual(guiEnv.goBoardBox.height(), guiEnv.goBoardBox.width(),
        'Must create a square board for a long box');

    var guiEnv = createEnv({
      boardBox: bbox.fromPts(tl, pt(HEIGHT, WIDTH))
    }).init();
    deepEqual(
        Math.round(guiEnv.goBoardBox.height()),
        Math.round(guiEnv.goBoardBox.width()),
        'Must create a square board for a tall box');
  });

  test('Test creation: tall div, square board', function() {
    var e = createEnv({
      boardBox: bbox.fromPts(tl, pt(200, 400))
    }).init();
    deepEqual(e.divBox.width(), 200, 'divBox width');
    deepEqual(e.divBox.height(), 400, 'divBox height');
    deepEqual(e.goBoardBox.height(), 200, 'goBoardBox height');
    deepEqual(e.goBoardBox.width(), 200, 'goBoardBox width');
    deepEqual(e.goBoardBox.topLeft().x(), 0, 'topLeft x');
    deepEqual(e.goBoardBox.topLeft().y(), 100, 'topLeft y');
    deepEqual(e.goBoardBox.botRight().x(), 200, 'botRight x');
    deepEqual(e.goBoardBox.botRight().y(), 300, 'botRight y');
  });

  test('Test creation: wide div, square board', function() {
    var e = createEnv({
      boardBox: bbox.fromPts(tl, pt(400, 200))
    }).init();
    deepEqual(e.divBox.width(), 400, 'divBox width');
    deepEqual(e.divBox.height(), 200, 'divBox height');
    deepEqual(e.goBoardBox.height(), 200, 'goBoardBox height');
    deepEqual(e.goBoardBox.width(), 200, 'goBoardBox width');
    deepEqual(e.goBoardBox.topLeft().x(), 100, 'topLeft x');
    deepEqual(e.goBoardBox.topLeft().y(), 0, 'topLeft y');
    deepEqual(e.goBoardBox.botRight().x(), 300, 'botRight x');
    deepEqual(e.goBoardBox.botRight().y(), 200, 'botRight y');
  });

  test('Test with real (square) div', function() {
    // Note: This relies an the glift_display div existing in the dom and thus
    // is really more like an integration test.
    // TODO(kashomon): Delete or move to an integration tests target.
    var env1 = createEnv({
      divId: 'glift_display',
      boardBox: null
    }).init();
    deepEqual(env1.divHeight, 400);
    deepEqual(env1.divWidth, 400);
    ok(env1.divBox !== undefined);
    deepEqual(env1.divBox.width(), 400);
    deepEqual(env1.divBox.height(), 400);
  });
})();
