(function() {
  module('glift.controllers.controllersTest');

  test("Must be able te create a controller", function() {
    throws(function() {
      var controller = glift.controllers.staticProblem();
    }, /not defined/);
  });

  test("Must create a controller with non-empty string", function() {
    var controller = glift.controllers.staticProblem({
        sgfString: testdata.sgfs.trivialproblem
    });
    ok(controller.sgfString !== undefined, "Must not be undefined");
    ok(controller.sgfString !== "", "Must not be empty");
  });
})();
