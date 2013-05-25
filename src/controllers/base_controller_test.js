glift.controllers.baseControllerTest = function() {
  module("Base Controller Tests");
  var cont = glift.controllers;
  var sgfs = testdata.sgfs;

  test("Successful create the Base Controller", function() {
    var genCont = cont.createBaseController();
    ok(genCont !== undefined, "must successfully init the controller");
  });
};
