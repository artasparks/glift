glift.displays.cropboxTest = function() {
module("Cropbox Tests");
  var displays = glift.displays,
      boardRegions = glift.enums.boardRegions,
      overf = displays.cropbox.OVERFLOW,
      util = glift.util;
  test("For 19x19", function() {
    var box = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    deepEqual(box.cbox().topLeft().x, 0, "topLeft.x must be 0, for ALL");
    deepEqual(box.cbox().topLeft().y, 0, "topLeft.y must be 0, for ALL");
    deepEqual(box.cbox().botRight().x, 18, "botRight.x must be 18, for ALL");
    deepEqual(box.cbox().botRight().y, 18, "botRight.y must be 18, for ALL");
  });

  test("For half boards", function() {
    var lbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var rbox = displays.cropbox.getFromRegion(boardRegions.RIGHT, 19);
    var tbox = displays.cropbox.getFromRegion(boardRegions.TOP, 19);
    var bbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM, 19);
    deepEqual(lbox.cbox().botRight().x, 10, "right coord for LEFT");
    deepEqual(lbox.widthMod(), 10.5 + overf, "width ext for LEFT");
    deepEqual(lbox.heightMod(), 18 + overf, "height for LEFT");

    deepEqual(rbox.cbox().topLeft().x, 8, "left coord for RIGHT");
    deepEqual(rbox.widthMod(), 10.5 + overf, "width for RIGHT");
    deepEqual(rbox.heightMod(), 18 + overf, "height for RIGHT");

    deepEqual(tbox.cbox().botRight().y, 10, "bottom coord for TOP");
    deepEqual(tbox.heightMod(), 10.5 + overf, "height for TOP");
    deepEqual(tbox.widthMod(), 18 + overf, "width for TOP");

    deepEqual(bbox.cbox().topLeft().y, 8, "top coord for BOTTOM");
    deepEqual(bbox.heightMod(), 10.5 + overf, "height for BOTTOM");
    deepEqual(bbox.widthMod(), 18 + overf, "width for BOTTOM");
  });

  test("Cropbox tests for quarter boards", function() {
    var tlbox = displays.cropbox.getFromRegion(boardRegions.TOP_LEFT, 19);
    var trbox = displays.cropbox.getFromRegion(boardRegions.TOP_RIGHT, 19);
    var blbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_LEFT, 19);
    var brbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_RIGHT, 19);
    deepEqual(tlbox.cbox().botRight().x, 11, "right coord for TOP LEFT");
    deepEqual(tlbox.cbox().botRight().y, 10, "bottom coord for TOP LEFT");
    deepEqual(tlbox.widthMod(), 11.5 + overf, "width for TOP LEFT");
    deepEqual(tlbox.heightMod(), 10.5 + overf, "height for TOP LEFT");

    deepEqual(trbox.cbox().topLeft().x, 7, "left coord for TOP RIGHT");
    deepEqual(trbox.cbox().botRight().y, 10, "bottom coord for TOP RIGHT");
    deepEqual(trbox.widthMod(), 11.5 + overf, "width for TOP RIGHT");
    deepEqual(trbox.heightMod(), 10.5 + overf, "height for TOP RIGHT");

    deepEqual(blbox.cbox().botRight().x, 11, "right coord for BOTTOM LEFT");
    deepEqual(blbox.cbox().topLeft().y, 8, "top coord for BOTTOM LEFT");
    deepEqual(blbox.widthMod(), 11.5 + overf, "width for BOTTOM LEFT");
    deepEqual(blbox.heightMod(), 10.5 + overf, "height for BOTTOP LEFT");

    deepEqual(brbox.cbox().topLeft().x, 7, "left coord for BOTTOM RIGHT");
    deepEqual(brbox.cbox().topLeft().y, 8, "top coord for BOTTOM RIGHT");
    deepEqual(brbox.widthMod(), 11.5 + overf, "width for BOTTOM RIGHT");
    deepEqual(brbox.heightMod(), 10.5 + overf, "height for BOTTOP RIGHT");
  });

  test("Test get CropDimensions: LEFT", function() {
    var cropbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var outDims = displays.cropbox.getCropDimensions(120, 60, cropbox);
    deepEqual(Math.round(outDims.height / outDims.width),
        Math.round(cropbox.heightMod() /  cropbox.widthMod()),
        "CropBox Ratio and dim ration must be the same");
  });

  test("Test get CropDimensions: ALL must make dims square", function() {
    var cropbox = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    var outDims = displays.cropbox.getCropDimensions(120, 60, cropbox);
    deepEqual(outDims.height, outDims.width, "Width and height must be equal");
  });
};
