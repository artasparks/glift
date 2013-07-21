glift.rules.propertiesTest = function() {
  module("Properties Test");
  var properties = glift.rules.properties,
      point = glift.util.point;

  test("--------Properties Test--------", function() { ok(true); });

  test("Test for GetAllStones", function() {
    var props = properties(),
        p1 = point(0, 0),
        p2 = point(18, 18);
    props.add('AB', p1.toSgfCoord()).add('AB', p2.toSgfCoord());
    deepEqual(props.get('AB').length, 2, "Must have 2 elems");
    var allStones = props.getAllStones();
    deepEqual(allStones.BLACK[0].toString(), "0,0");
    deepEqual(allStones.BLACK[1].toString(), "18,18");
  })
};
