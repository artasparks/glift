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

  test("checkArgsDefined", function() {
    var errm = "";
    try {
      (function(a, b, c) {
        util.checkArgsDefined(arguments, 3);
      })("a", "b");
    } catch(err) {
      var errmsg = err;
    }
    ok(/Argument 2/.test(errmsg), "Must find arg 2 in error message: " + errm);
  });

  test("defined tests", function() {
    ok(util.defined("Foo", "Bar"));
    ok(util.defined());
    ok(util.defined("Foo", {}, [], 0, 1));
    ok(!util.defined("Foo", undefined, [], 0, 1));
    ok(!util.defined("Foo", {}.print, 1));
  });
};
