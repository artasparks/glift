otre.displays.cropboxTest = function() {
  var displays = otre.displays,
      boardRegions = otre.enums.boardRegions,
      overf = displays.cropbox.OVERFLOW,
      util = otre.util;
  test("--------Cropbox Tests--------", function() { ok(true); });

  test("Cropbox tests for 19x19", function() {
    var box = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    deepEqual(box.topLeft.x, 0, "topLeft.x must be 0, for ALL");
    deepEqual(box.topLeft.y, 0, "topLeft.y must be 0, for ALL");
    deepEqual(box.botRight.x, 18, "botRight.x must be 18, for ALL");
    deepEqual(box.botRight.y, 18, "botRight.y must be 18, for ALL");
  });

  test("Cropbox tests for half boards", function() {
    var lbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var rbox = displays.cropbox.getFromRegion(boardRegions.RIGHT, 19);
    var tbox = displays.cropbox.getFromRegion(boardRegions.TOP, 19);
    var bbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM, 19);
    deepEqual(lbox.botRight.x, 10, "right coord for LEFT");
    deepEqual(lbox.width, 10.5 + overf, "width ext for LEFT");
    deepEqual(lbox.height, 18 + overf, "height for LEFT");

    deepEqual(rbox.topLeft.x, 8, "left coord for RIGHT");
    deepEqual(rbox.width, 10.5 + overf, "width for RIGHT");
    deepEqual(rbox.height, 18 + overf, "height for RIGHT");

    deepEqual(tbox.botRight.y, 10, "bottom coord for TOP");
    deepEqual(tbox.height, 10.5 + overf, "height for TOP");
    deepEqual(tbox.width, 18 + overf, "width for TOP");

    deepEqual(bbox.topLeft.y, 8, "top coord for BOTTOM");
    deepEqual(bbox.height, 10.5 + overf, "height for BOTTOM");
    deepEqual(bbox.width, 18 + overf, "width for BOTTOM");
  });

  test("Cropbox tests for quarter boards", function() {
    var tlbox = displays.cropbox.getFromRegion(boardRegions.TOP_LEFT, 19);
    var trbox = displays.cropbox.getFromRegion(boardRegions.TOP_RIGHT, 19);
    var blbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_LEFT, 19);
    var brbox = displays.cropbox.getFromRegion(boardRegions.BOTTOM_RIGHT, 19);
    deepEqual(tlbox.botRight.x, 11, "right coord for TOP LEFT");
    deepEqual(tlbox.botRight.y, 10, "bottom coord for TOP LEFT");
    deepEqual(tlbox.width, 11.5 + overf, "width for TOP LEFT");
    deepEqual(tlbox.height, 10.5 + overf, "height for TOP LEFT");

    deepEqual(trbox.topLeft.x, 7, "left coord for TOP RIGHT");
    deepEqual(trbox.botRight.y, 10, "bottom coord for TOP RIGHT");
    deepEqual(trbox.width, 11.5 + overf, "width for TOP RIGHT");
    deepEqual(trbox.height, 10.5 + overf, "height for TOP RIGHT");

    deepEqual(blbox.botRight.x, 11, "right coord for BOTTOM LEFT");
    deepEqual(blbox.topLeft.y, 8, "top coord for BOTTOM LEFT");
    deepEqual(blbox.width, 11.5 + overf, "width for BOTTOM LEFT");
    deepEqual(blbox.height, 10.5 + overf, "height for BOTTOP LEFT");

    deepEqual(brbox.topLeft.x, 7, "left coord for BOTTOM RIGHT");
    deepEqual(brbox.topLeft.y, 8, "top coord for BOTTOM RIGHT");
    deepEqual(brbox.width, 11.5 + overf, "width for BOTTOM RIGHT");
    deepEqual(brbox.height, 10.5 + overf, "height for BOTTOP RIGHT");
  });

  test("Test get CropDimensions: LEFT", function() {
    var cropbox = displays.cropbox.getFromRegion(boardRegions.LEFT, 19);
    var outDims = displays.cropbox.getCropDimensions(120, 60, cropbox);
    deepEqual(Math.round(outDims.height / outDims.width),
        Math.round(cropbox.height /  cropbox.width),
        "CropBox Ratio and dim ration must be the same");
  });

  test("Test get CropDimensions: ALL must make dims square", function() {
    var cropbox = displays.cropbox.getFromRegion(boardRegions.ALL, 19);
    var outDims = displays.cropbox.getCropDimensions(120, 60, cropbox);
    deepEqual(outDims.height, outDims.width, "Width and height must be equal");
  });

  // a = 0; i = 9; s = 18
  test("GetCropRegion: TOP_LEFT", function() {
    var mt = otre.rules.movetree.getInstance(),
        point = otre.util.point,
        getCropRegion = otre.displays.cropbox.getCropRegion;
    mt.getProperties().add('B', point(0,0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP_LEFT, "Must be TOP_LEFT");
  });

  test("GetCropRegion: TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT", function() {
    var mt = otre.rules.movetree.getInstance(),
        point = otre.util.point,
        getCropRegion = otre.displays.cropbox.getCropRegion,
        props = mt.getProperties();
    props.add('AB', point(17, 0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP_RIGHT, "Must be TOP_RIGHT");
    props.remove('AB');
    props.add('AB', point(18, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.BOTTOM_RIGHT,
        "Must be BOTTOM_RIGHT");
    props.remove('AB');
    props.add('AB', point(0, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.BOTTOM_LEFT,
        "Must be BOTTOM_LEFT");
  });

  test("GetCropRegion: TOP, BOTTOM, LEFT, RIGHT", function() {
    var mt = otre.rules.movetree.getInstance(),
        point = otre.util.point,
        getCropRegion = otre.displays.cropbox.getCropRegion,
        props = mt.getProperties();
    props.add('AB', point(0, 0).toSgfCoord())
        .add('AB', point(18, 0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP);
    props.remove('AB');
    props.add('AB', point(0, 0).toSgfCoord())
        .add('AB', point(0, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.LEFT);
    props.remove('AB');
    props.add('AB', point(18, 0).toSgfCoord())
        .add('AB', point(18, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.RIGHT);
    props.remove('AB');
    props.add('AB', point(0, 18).toSgfCoord())
        .add('AB', point(18, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.BOTTOM);
  });
};
