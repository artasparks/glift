(function() {
  module('glift.orientation.croppingTest');
  var boardRegions = glift.enums.boardRegions;
  var getCropRegion = glift.orientation.getQuadCropFromMovetree;
  var pt = glift.util.point;
  var bbox = glift.orientation.bbox.fromPts;

  // a = 0; i = 9; s = 18
  test('GetCropRegion: TOP_LEFT', function() {
    var mt = glift.rules.movetree.getInstance(19),
        point = glift.util.point;
    mt.properties().add('B', point(0,0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.TOP_LEFT, 'Must be TOP_LEFT');
  });

  test('GetCropRegion: TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT', function() {
    var mt = glift.rules.movetree.getInstance(19),
        point = glift.util.point,
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
    var point = glift.util.point;
    var mt = glift.rules.movetree.getInstance(13);
    // 0,0 Normally causes the board to be top left
    mt.properties().add('AB', point(0,0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.ALL, '13x13 => ALL');

    mt = glift.rules.movetree.getInstance(9);
    // 0,0 Normally causes the board to be top left
    mt.properties().add('AB', point(0,0).toSgfCoord());
    deepEqual(getCropRegion(mt), boardRegions.ALL, '9x9 => ALL');
  });

  test('Cropping on out-of-bounds stone', function() {
    var mt = glift.rules.movetree.getFromSgf('(;AB[rr];W[cc])');
    deepEqual(getCropRegion(mt), boardRegions.ALL);
  });

  //////////////////////////////
  // Next Moves Path cropping //
  //////////////////////////////
  //
  // Notes:
  // - for SGF cords, a: 1, s: 19. ss: 19,19

  test('Next moves path cropping: TL', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[bb];W[cc];B[dd];W[ee])',
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(getCropRegion(mt, [0,0]), boardRegions.TOP_LEFT);
  });

  test('Next moves path cropping: Top', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc]' + // where we start
        ';B[re];W[ee])', // where we end
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(mt.properties().getOneValue('W'), 'cc');
    deepEqual(getCropRegion(mt, [0,0]), boardRegions.TOP);
  });

  test('Next moves path cropping: Top, Labels', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc]' + // where we start
        ';B[re]SQ[ee])', // where we end
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(mt.properties().getOneValue('W'), 'cc');
    deepEqual(getCropRegion(mt, [0]), boardRegions.TOP);
  });

  test('Next moves path cropping: All', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc]' + // where we start (cc)
        ';B[rs];W[ee])', // where we end. note different from above: rs vs re
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(mt.properties().getOneValue('W'), 'cc');
    deepEqual(getCropRegion(mt, [0,0]), boardRegions.ALL);
  });

  test('Next moves path: Edge (overlap)', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc];B[je];W[jf])',
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(getCropRegion(mt, [0,0]), boardRegions.TOP);
  });

  test('Next moves path: Very middle (overlap)', function() {
    var mt = glift.rules.movetree.getFromSgf(
        '(;GM[1]AB[aa][as][sa][ss]' +
        ';B[rr];W[cc];B[ii];W[jj])',
        [0,0]);
    deepEqual(mt.node().getNodeNum(), 2);
    deepEqual(getCropRegion(mt, [0,0]), boardRegions.ALL);
  });
})();
