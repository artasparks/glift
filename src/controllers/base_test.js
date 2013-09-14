glift.controllers.baseTest = function() {
  module("Base Controller Tests");
  test("Successful build a Base Controller", function() {
    var genCont = glift.controllers.base();
    ok(genCont !== undefined, "must successfully init the controller");
  });
};
