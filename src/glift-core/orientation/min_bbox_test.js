(function() {
  module('glift.orientation.minBboxTest');
  var pt = glift.util.point;
  var bbox = glift.orientation.bbox.fromPts;
  var minBbox = glift.orientation.minimalBoundingBox

  // a = 0; i = 9; s = 18
  test('Minimal cropping', function() {
    var mt = glift.rules.movetree.getInstance(19);
    mt.properties().add('B', pt(0,0).toSgfCoord());
    deepEqual(minBbox(mt).toString(), bbox(pt(0,0), pt(0,0)).toString());
  });

  test('Minimal cropping: 3 pts', function() {
    var mt = glift.rules.movetree.getInstance(19);
    mt.properties()
        .add('AB', pt(1,1).toSgfCoord())
        .add('AB', pt(2,2).toSgfCoord())
        .add('AB', pt(3,4).toSgfCoord());
    deepEqual(minBbox(mt).toString(), bbox(pt(1,1), pt(3,4)).toString());
  });

  test('Minimal cropping: huge spread', function() {
    var mt = glift.rules.movetree.getInstance(19);
    mt.properties()
        .add('AB', pt(17, 1).toSgfCoord())
        .add('AB', pt(2,2).toSgfCoord())
        .add('AB', pt(3,4).toSgfCoord());
    deepEqual(minBbox(mt).toString(), bbox(pt(2,1), pt(17,4)).toString());
  });

  test('Minimal cropping: next moves path', function() {
    var mt = glift.rules.movetree.getInstance(19);

    mt.properties()
        .add('AB', pt(1,1).toSgfCoord())
        .add('AB', pt(2,2).toSgfCoord());
    mt.addNode()
        .properties().add('B', pt(3,4).toSgfCoord());
    mt.addNode()
        .properties().add('W', pt(5,5).toSgfCoord());

    mt = mt.getTreeFromRoot();
    deepEqual(minBbox(mt, [0, 0]).toString(), bbox(pt(3,4), pt(5,5)).toString());
    deepEqual(minBbox(mt, []).toString(), bbox(pt(1,1), pt(2,2)).toString());
  });
})();
