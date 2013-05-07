glift.gliftTest = function() {
module("Glift API Test Suite");
  test("Assert exists", function() {
    ok(glift !== undefined);
  });

  test("Test Create: No Options", function() {
    var glift_instance = glift.create({});
    ok(glift_instance !== undefined);
    ok(glift_instance.divId() !== undefined);
    ok(glift_instance.theme() !== undefined);
    ok(glift_instance.intersections() !== undefined);
    deepEqual(glift_instance.divId(), 'glift_display');
    deepEqual(glift_instance.theme(), 'DEFAULT');
    deepEqual(glift_instance.intersections(), 19);
  });

  test("Test Create with Basic Options", function() {
    var glift_instance = glift.create({
        intersections: 19,
        divId: 'glift_display1'
    });
    ok(glift_instance !== undefined);
    ok(glift_instance.divId() !== undefined);
    ok(glift_instance.theme() !== undefined);
    ok(glift_instance.intersections() !== undefined);
  });
};
