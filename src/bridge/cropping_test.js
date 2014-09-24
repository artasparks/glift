glift.bridge.croppingTest = function() {
  module('glift.bridge.croppingTest');
  var boardRegions = glift.enums.boardRegions;

  // a = 0; i = 9; s = 18
  test('GetCropRegion: TOP_LEFT', function() {
    var mt = glift.rules.movetree.getInstance(19),
        point = glift.util.point,
        getCropRegion = glift.bridge.getCropFromMovetree;
    mt.properties().add('B', point(0,0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP_LEFT, 'Must be TOP_LEFT');
  });

  test('GetCropRegion: TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT', function() {
    var mt = glift.rules.movetree.getInstance(19),
        point = glift.util.point,
        getCropRegion = glift.bridge.getCropFromMovetree,
        props = mt.properties();
    props.add('AB', point(17, 0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP_RIGHT, 'Must be TOP_RIGHT');
    props.remove('AB');
    props.add('AB', point(18, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.BOTTOM_RIGHT,
        'Must be BOTTOM_RIGHT');
    props.remove('AB');
    props.add('AB', point(0, 18).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.BOTTOM_LEFT,
        'Must be BOTTOM_LEFT');
  });

  test('GetCropRegion: TOP, BOTTOM, LEFT, RIGHT', function() {
    var mt = glift.rules.movetree.getInstance(19),
        point = glift.util.point,
        getCropRegion = glift.bridge.getCropFromMovetree,
        props = mt.properties();
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

  test('Get Crop Region: 9x9, 13x13', function() {
    var getCropRegion = glift.bridge.getCropFromMovetree;
    var point = glift.util.point;
    var mt = glift.rules.movetree.getInstance(13);
    // 0,0 Normally causes the board to be top left
    mt.properties().add('AB', point(0,0));
    deepEqual(getCropRegion(mt), boardRegions.ALL, '13x13 => ALL');

    mt = glift.rules.movetree.getInstance(9);
    // 0,0 Normally causes the board to be top left
    mt.properties().add('AB', point(0,0));
    deepEqual(getCropRegion(mt), boardRegions.ALL, '9x9 => ALL');
  });
};
