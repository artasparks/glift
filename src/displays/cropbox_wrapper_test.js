(function() {
module('glift.displays.cropboxTest');
  var displays = glift.displays,
      boardRegions = glift.enums.boardRegions,
      overf = displays.cropbox.OVERFLOW,
      util = glift.util;
  test('For 19x19', function() {
    var box = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    deepEqual(box.bbox().topLeft().x(), 0, 'topLeft.x() must be 0, for ALL');
    deepEqual(box.bbox().topLeft().y(), 0, 'topLeft.y() must be 0, for ALL');
    deepEqual(box.bbox().botRight().x(), 18, 'botRight.x() must be 18, for ALL');
    deepEqual(box.bbox().botRight().y(), 18, 'botRight.y() must be 18, for ALL');
    deepEqual(box.maxBoardSize(), 19);
  });

  test('For half boards', function() {
    var lbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var rbox = displays.cropbox.getFromRegion(boardRegions.RIGHT, 19);
    var tbox = displays.cropbox.getFromRegion(boardRegions.TOP, 19);
    var bbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM, 19);
    deepEqual(lbox.bbox().botRight().x(), 10, 'right coord for LEFT');
    deepEqual(lbox.widthMod(), 10.5 + overf, 'width ext for LEFT');
    deepEqual(lbox.heightMod(), 18 + overf, 'height for LEFT');
    deepEqual(lbox.maxBoardSize(), 19);

    deepEqual(rbox.bbox().topLeft().x(), 8, 'left coord for RIGHT');
    deepEqual(rbox.widthMod(), 10.5 + overf, 'width for RIGHT');
    deepEqual(rbox.heightMod(), 18 + overf, 'height for RIGHT');
    deepEqual(rbox.maxBoardSize(), 19);

    deepEqual(tbox.bbox().botRight().y(), 10, 'bottom coord for TOP');
    deepEqual(tbox.heightMod(), 10.5 + overf, 'height for TOP');
    deepEqual(tbox.widthMod(), 18 + overf, 'width for TOP');
    deepEqual(tbox.maxBoardSize(), 19);

    deepEqual(bbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM');
    deepEqual(bbox.heightMod(), 10.5 + overf, 'height for BOTTOM');
    deepEqual(bbox.widthMod(), 18 + overf, 'width for BOTTOM');
    deepEqual(bbox.maxBoardSize(), 19);
  });

  test('Cropbox tests for quarter boards', function() {
    var tlbox = displays.cropbox.getFromRegion(boardRegions.TOP_LEFT, 19);
    var trbox = displays.cropbox.getFromRegion(boardRegions.TOP_RIGHT, 19);
    var blbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_LEFT, 19);
    var brbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_RIGHT, 19);
    deepEqual(tlbox.bbox().botRight().x(), 11, 'right coord for TOP LEFT');
    deepEqual(tlbox.bbox().botRight().y(), 10, 'bottom coord for TOP LEFT');
    deepEqual(tlbox.widthMod(), 11.5 + overf, 'width for TOP LEFT');
    deepEqual(tlbox.heightMod(), 10.5 + overf, 'height for TOP LEFT');

    deepEqual(trbox.bbox().topLeft().x(), 7, 'left coord for TOP RIGHT');
    deepEqual(trbox.bbox().botRight().y(), 10, 'bottom coord for TOP RIGHT');
    deepEqual(trbox.widthMod(), 11.5 + overf, 'width for TOP RIGHT');
    deepEqual(trbox.heightMod(), 10.5 + overf, 'height for TOP RIGHT');

    deepEqual(blbox.bbox().botRight().x(), 11, 'right coord for BOTTOM LEFT');
    deepEqual(blbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM LEFT');
    deepEqual(blbox.widthMod(), 11.5 + overf, 'width for BOTTOM LEFT');
    deepEqual(blbox.heightMod(), 10.5 + overf, 'height for BOTTOP LEFT');

    deepEqual(brbox.bbox().topLeft().x(), 7, 'left coord for BOTTOM RIGHT');
    deepEqual(brbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM RIGHT');
    deepEqual(brbox.widthMod(), 11.5 + overf, 'width for BOTTOM RIGHT');
    deepEqual(brbox.heightMod(), 10.5 + overf, 'height for BOTTOP RIGHT');
  });
})();
