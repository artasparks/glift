(function() {
module('glift.displays.cropboxTest');
  var displays = glift.displays,
      boardRegions = glift.enums.boardRegions,
      overf = displays.cropbox.OVERFLOW,
      ragp = displays.cropbox.CROP_PAD,
      util = glift.util;

  test('For 19x19', function() {
    var box = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    deepEqual(box.bbox().topLeft().x(), 0, 'topLeft.x() must be 0, for ALL');
    deepEqual(box.bbox().topLeft().y(), 0, 'topLeft.y() must be 0, for ALL');
    deepEqual(box.bbox().botRight().x(), 18, 'botRight.x() must be 18, for ALL');
    deepEqual(box.bbox().botRight().y(), 18, 'botRight.y() must be 18, for ALL');
  });

  test('For half boards', function() {
    var lbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var rbox = displays.cropbox.getFromRegion(boardRegions.RIGHT, 19);
    var tbox = displays.cropbox.getFromRegion(boardRegions.TOP, 19);
    var bbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM, 19);
    deepEqual(lbox.bbox().botRight().x(), 10, 'right coord for LEFT');
    deepEqual(lbox.widthIntersections(), 11 + overf + ragp, 'width ext for LEFT');
    deepEqual(lbox.heightIntersections(), 19 + overf, 'height for LEFT');

    deepEqual(rbox.bbox().topLeft().x(), 8, 'left coord for RIGHT');
    deepEqual(rbox.widthIntersections(), 11 + overf + ragp, 'width for RIGHT');
    deepEqual(rbox.heightIntersections(), 19 + overf, 'height for RIGHT');

    deepEqual(tbox.bbox().botRight().y(), 10, 'bottom coord for TOP');
    deepEqual(tbox.heightIntersections(), 11 + overf + ragp, 'height for TOP');
    deepEqual(tbox.widthIntersections(), 19 + overf, 'width for TOP');

    deepEqual(bbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM');
    deepEqual(bbox.heightIntersections(), 11 + overf + ragp, 'height for BOTTOM');
    deepEqual(bbox.widthIntersections(), 19 + overf, 'width for BOTTOM');
  });

  test('Cropbox tests for quarter boards', function() {
    var tlbox = displays.cropbox.getFromRegion(boardRegions.TOP_LEFT, 19);
    var trbox = displays.cropbox.getFromRegion(boardRegions.TOP_RIGHT, 19);
    var blbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_LEFT, 19);
    var brbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_RIGHT, 19);
    deepEqual(tlbox.bbox().botRight().x(), 11, 'right coord for TOP LEFT');
    deepEqual(tlbox.bbox().botRight().y(), 10, 'bottom coord for TOP LEFT');
    deepEqual(tlbox.widthIntersections(), 12 + overf + ragp, 'width for TOP LEFT');
    deepEqual(tlbox.heightIntersections(), 11 + overf + ragp, 'height for TOP LEFT');

    deepEqual(trbox.bbox().topLeft().x(), 7, 'left coord for TOP RIGHT');
    deepEqual(trbox.bbox().botRight().y(), 10, 'bottom coord for TOP RIGHT');
    deepEqual(trbox.widthIntersections(), 12 + overf + ragp, 'width for TOP RIGHT');
    deepEqual(trbox.heightIntersections(), 11 + overf + ragp, 'height for TOP RIGHT');

    deepEqual(blbox.bbox().botRight().x(), 11, 'right coord for BOTTOM LEFT');
    deepEqual(blbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM LEFT');
    deepEqual(blbox.widthIntersections(), 12 + overf + ragp, 'width for BOTTOM LEFT');
    deepEqual(blbox.heightIntersections(), 11 + overf + ragp, 'height for BOTTOM LEFT');

    deepEqual(brbox.bbox().topLeft().x(), 7, 'left coord for BOTTOM RIGHT');
    deepEqual(brbox.bbox().topLeft().y(), 8, 'top coord for BOTTOM RIGHT');
    deepEqual(brbox.widthIntersections(), 12 + overf + ragp, 'width for BOTTOM RIGHT');
    deepEqual(brbox.heightIntersections(), 11 + overf + ragp, 'height for BOTTOM RIGHT');
  });
})();
