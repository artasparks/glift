glift.widgets.optionsProcessingTest = function() {
  module("Options processing tests");
  var createNoDraw = glift.widgets.createNoDraw;

  test("Test sgf and sgfList: Should throw an error", function() {
    throws(function() {
      var mgr = createNoDraw({
        sgfList:  ["foo","bar"],
        sgf:  "Zam"
      }, Error)
    });
  });
};
