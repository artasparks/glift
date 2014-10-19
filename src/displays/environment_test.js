glift.displays.environmentTest = function() {
  module('glift.displays.environmentTest');
  var util = glift.util,
      displays = glift.displays,
      enums = glift.enums,
      env = glift.displays.environment,
      cropbox = displays.cropbox,
      divId = 'zed',
      pt = glift.util.point,
      tl = pt(0,0),
      bbox = glift.displays.bbox,
      opts = {},
      WIDTH = 300,
      HEIGHT = 400;

  test('Creation of env object', function() {
    var envObj = env.get(divId, bbox.fromPts(tl, pt(WIDTH, HEIGHT)), opts);
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
    var guiEnv = env.get(divId, bbox.fromPts(tl, pt(WIDTH, HEIGHT)), opts).init();
    deepEqual(guiEnv.goBoardBox.height(), guiEnv.goBoardBox.width(),
        'Must create a square board for a long box');

    var guiEnv = env.get(divId, bbox.fromPts(tl, pt(HEIGHT, WIDTH)), opts).init();
    deepEqual(
        Math.round(guiEnv.goBoardBox.height()),
        Math.round(guiEnv.goBoardBox.width()),
        'Must create a square board for a tall box');
  });

  test('Test creation: tall div, square board', function() {
    var e = env.get(divId, bbox.fromPts(tl, pt(200, 400)), opts).init();
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
    var e = env.get(divId, bbox.fromPts(tl, pt(400, 200)), opts).init();
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
    // Note: This relies an the glift_display div existing in the dom.
    var env1 = env.get('glift_display', null, opts).init();
    deepEqual(env1.divHeight, 400);
    deepEqual(env1.divWidth, 400);
    ok(env1.divBox !== undefined);
    deepEqual(env1.divBox.width(), 400);
    deepEqual(env1.divBox.height(), 400);
  });
};
