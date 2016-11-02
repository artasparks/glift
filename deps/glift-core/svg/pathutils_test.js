(function() {
  module("glift.svg.pathUtilsTest");
  var path = glift.svg.pathutils;
  var pt = glift.util.point(3, 5);

  test("Test path move", function() {
    deepEqual(path.move(pt.x(), pt.y()), "M3 5");
  });

  test("Test path movePt", function() {
    deepEqual(path.movePt(pt), "M3 5");
  });

  test("Test path lineRel", function() {
    deepEqual(path.lineRel(pt.x(), pt.y()), "l3 5");
  });

  test("Test path lineRelPt", function() {
    deepEqual(path.lineRelPt(pt), "l3 5");
  });

  test("Test path lineAbs", function() {
    deepEqual(path.lineAbs(pt.x(), pt.y()), "L3 5");
  });

  test("Test path lineAbsPt", function() {
    deepEqual(path.lineAbsPt(pt), "L3 5");
  });
})();
