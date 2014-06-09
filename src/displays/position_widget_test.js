glift.displays.positionWidgetTest = function() {
  module("Position Widget Test");
  var point = glift.util.point;
  var bboxFromPts = glift.displays.bboxFromPts;
  var displays = glift.displays;
  var cropbox = glift.displays.cropbox;
  var boardRegions = glift.enums.boardRegions;
  var comps = glift.enums.boardComponents;
  var positionWidgetHorz = glift.displays.positionWidgetHorz;
  var positionWidgetVert = glift.displays.positionWidgetVert;
  var ints = 19;
  var defaultCompMap = {
    BOARD: true,
    COMMENT_BOX: true,
    ICONBAR: true
  };
  var horzBbox = displays.bbox(point(100, 300), 300, 100);
  var vertBbox = displays.bbox(point(100, 300), 100, 300);
  var squareBbox = displays.bbox(point(100, 300), 200, 200);
  var possBoxes = {
    'horzBox' : horzBbox,
    'vertBox' : vertBbox,
    'squareBox' : squareBbox
  };
  var baseCropbox = cropbox.getFromRegion(boardRegions.TOP_RIGHT, ints);

  var oneColumnSplits = {
    first: [
      {component: 'TITLE_BAR', ratio: 0.08},
      {component: 'BOARD', ratio: 0.7},
      {component: 'COMMENT_BOX', ratio: 0.1},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };
  var twoColumnSplits = {
    first: [
      {component: 'BOARD', ratio: 1}
    ],
    second: [
      {component: 'TITLE_BAR', ratio: 0.08},
      {component: 'COMMENT_BOX', ratio: 0.8},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };

  test("Check no exceptions: horz positioning", function() {
    var obj = glift.displays.positionWidgetHorz(
        horzBbox, baseCropbox, defaultCompMap, twoColumnSplits);
    ok(obj !== undefined, 'obj');
    ok(obj.boardBox !== undefined, 'boardBox');
    ok(obj.commentBox !== undefined, 'commentBox');
    ok(obj.iconBarBox !== undefined, 'iconBarBox');
    ok(obj.rightSide !== undefined, 'rightSide');
    ok(obj.leftSide!== undefined, 'leftSide');
  });

  test("Check no exceptions: horz positioning", function() {
    var obj = glift.displays.positionWidgetVert(
        horzBbox, baseCropbox, defaultCompMap, oneColumnSplits);
    ok(obj !== undefined, 'obj');
    ok(obj.boardBox !== undefined, 'boardBox');
    ok(obj.commentBox !== undefined, 'commentBox');
    ok(obj.iconBarBox !== undefined, 'iconBarBox');
  });

  test("Check for properties: horz positioning horzBox", function() {
    for (var key in possBoxes) {
      var positioning = glift.displays.positionWidgetHorz(
          possBoxes[key], baseCropbox, defaultCompMap, twoColumnSplits);
      ok(positioning !== undefined, "must not be undefined, " + key);
      deepEqual(positioning.boardBox.right(), positioning.commentBox.left(),
          "commentBox Left, for: " + key);
      deepEqual(positioning.boardBox.right(), positioning.iconBarBox.left(),
          "iconBar Left, for horzBox: " + key);
      deepEqual(positioning.commentBox.bottom(), positioning.iconBarBox.top(),
          "iconBar top / commentBar bottom, for horzBox: " + key);
      deepEqual(positioning.boardBox.top(), positioning.commentBox.top(),
          "CommentBox Top, for horzBox: " + key);
      deepEqual(positioning.boardBox.bottom(), positioning.iconBarBox.bottom(),
          "CommentBox Bottom, for horzBox: " + key);
      deepEqual(
          Math.round(positioning.rightSide.width()),
          Math.round(positioning.leftSide.width() *
              positioning.commentBoxPercentage),
          "BoardBox width: " + key);
      deepEqual(
          Math.round(positioning.commentBox.width()),
          Math.round(positioning.boardBox.width() *
              positioning.commentBoxPercentage),
          "CommentBox width, for horzBox: " + key);
    }
  });

  test("Check for properties: vert positioning", function() {
    for (var key in possBoxes) {
      var positioning = glift.displays.positionWidgetVert(
          possBoxes[key], baseCropbox, defaultCompMap, oneColumnSplits);
      ok(positioning !== undefined, "must not be undefined, " + key);
      deepEqual(positioning.boardBox.width(),
          positioning.commentBox.width(), "BoardBox -> CommentBox width");
      deepEqual(positioning.boardBox.width(),
          positioning.iconBarBox.width(), "BoardBox -> IconBarBox width");
      deepEqual(positioning.boardBox.bottom(),
          positioning.commentBox.top(), "BoardBox bottom -> CommentBox top");
      deepEqual(positioning.commentBox.bottom(),
          positioning.iconBarBox.top(), "CommentBox bottom -> IconBar top");
    }
  });

  test("Check for positioning after positionWidget", function() {
    for (var key in possBoxes) {
      var pos = glift.displays.positionWidget(
          possBoxes[key],
          boardRegions.TOP_RIGHT,
          19,
          [comps.BOARD, comps.COMMENT_BOX, comps.ICONBAR],
          oneColumnSplits,
          twoColumnSplits);
      ok(pos, "Must not be undefined, " + key);
      ok(pos.boardBox, "boardbox.width, " + key);
      ok(pos.boardBox && pos.boardBox.width(),
          "boardbox.width, " + key);
      ok(pos.commentBox, "commentBox, " + key);
      ok(pos.commentBox && pos.commentBox.width() !== undefined,
          "commentBox.width, " + key);
      ok(pos.iconBarBox, "iconBarBox, " + key);
      ok(pos.iconBarBox && pos.iconBarBox.width() !== undefined,
          "iconBarBox.width, " + key);
      if (key === 'horzBox') {
        ok(pos.leftSide, 'leftSide: ' + key);
      } else if (key === 'vertBox') {
        ok(pos.left === undefined, 'left: ' + key);
      } else if (key === 'squareBox') {
        ok(pos.left === undefined, 'left: ' + key);
      }
    }
  });
};
