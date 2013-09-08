glift.utilTest = function() {
  module("Util Test Suite");
  var util = glift.util;
  test("typeOf test", function() {
    equal(util.typeOf({}), "object", "expect object");
  });

  test("inbounds", function() {
    ok(util.inBounds(5, 19), "5 should be between 0 and 19");
  });

  test("inbounds", function() {
    ok(!util.inBounds(22, 19), "22 should not be between 0 and 19");
  });

  test("outbounds", function() {
    ok(util.outBounds(19, 19), "Is 19 is out of bounds (inclusive)");
  });

  test("outbounds", function() {
    ok(!util.outBounds(2, 19), "2 is within bounds");
  });
};
