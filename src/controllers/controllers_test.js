glift.controllers.controllersTest = function() {
  module("Controllers Test");
  test("Must be able te create a controller", function() {
    var controller = glift.controllers.create(
        glift.enums.controllerTypes.STATIC_PROBLEM_STUDY,
        {} /* options */);
    ok(controller !== undefined, "Must me defined");
  });
};
