glift.rules.treepathTest = function() {
  var parse = glift.rules.treepath.parseInitPosition;
  var flatten = glift.rules.treepath.flattenMoveTree;

  test("--------Init Position Test--------", function() { ok(true); });

  test("Test undefined", function() {
    deepEqual(parse(undefined), [], "Should return empty array for undefined");
  });

  test("Test object", function() {
    deepEqual(parse({}), [], "Should return empty array for object type");
  });

  test("Number", function() {
    deepEqual(parse(3), [0,0,0], "Should parse correctly");
  });

  test("Test root case", function() {
    deepEqual(parse("0"), [], "Should produce empty array for root init");
  });

  test("Test simple cases", function() {
    deepEqual(parse("1"), [0], "Should parse correctly");
    deepEqual(parse("3"), [0,0,0], "Should parse correctly");
    deepEqual(parse("10"), [0,0,0,0,0,0,0,0,0,0], "Should parse correctly");
  });

  test("Test one variation", function() {
    deepEqual(parse("2.0"), [0,0,0], "Should parse correctly");
    deepEqual(parse("2.1"), [0,0,1], "Should parse correctly");
    deepEqual(parse("3.10"), [0,0,0,10], "Should parse correctly");
  });

  test("Complex tests", function() {
    deepEqual(parse("2.1-5.7"), [0,0,1,0,0,7], "Should parse correctly");
    deepEqual(parse("0.0.0.0-6.7"), [0,0,0,0,0,0,7], "Should parse correctly");
    deepEqual(parse("1.1-3.2-6.7"), [0,1,0,2,0,0,7], "Should parse correctly");
  });

  test("Flatten Movetree", function() {
    var mt = glift.rules.movetree.getInstance();
    mt.addNewNode() .addNewNode() .addNewNode() .addNewNode()
                    .moveUp()     .moveUp()     .moveUp()
                    .addNewNode() .addNewNode()
      .moveToRoot()
      .addNewNode() .addNewNode();
    mt.moveToRoot();
    var out = flatten(mt);
    ok(true, "foo");
    deepEqual(out, [[0,0,0,0], [0,1,0], [1,0]], "Must flatten correctly");
    mt.moveDown();
    var out2 = flatten(mt);
    deepEqual(out2, [[0,0,0], [1,0]], "Must flatten correctly after moveDown");
  });
};
