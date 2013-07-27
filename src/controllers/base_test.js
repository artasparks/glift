glift.controllers.baseTest = function() {
  module("Base Controller Tests");
  test("Successful create the Base Controller", function() {
    var genCont = glift.controllers.createBase();
    ok(genCont !== undefined, "must successfully init the controller");
  });
};
