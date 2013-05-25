glift.controllers.controllersTest = function() {
  module("Controllers Test");

  test("Process options", function() {
    var options = glift.controllers.processOptions({});
    deepEqual(options.sgfString, '');

    var options = glift.controllers.processOptions({
      sgfString: "foo"
    });
    deepEqual(options.sgfString, "foo");
  });

  test("Must be able te create a controller", function() {
    var controller = glift.controllers.create({
        controllerType: glift.enums.controllerTypes.STATIC_PROBLEM_STUDY
    });
    ok(controller !== undefined, "Must me defined");
  });

  test("Must create a controller with non-empty string", function() {
    var controller = glift.controllers.create({
        controllerType: glift.enums.controllerTypes.STATIC_PROBLEM_STUDY,
        sgfString: testdata.sgfs.trivialproblem
    });
    ok(controller.sgfString !== undefined, "Must not be undefined");
    ok(controller.sgfString !== "", "Must not be empty");
  });
};
