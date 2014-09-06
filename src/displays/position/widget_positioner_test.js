glift.displays.widgetPositionerTest = function() {
  module('Widget Positioner Tests');
  var point = glift.util.point;
  var construct = function(options) {
    return new glift.displays.position.positionWidget(
      options.divBox || glift.displays.bboxFromPts(point(0,0), point(300, 300)),
      options.boardRegion || glift.enums.boardRegion.ALL
    );
  };

  test('Use Horzorientation', function() {
    deepEqual(1, 1, '1 should equal 1');
  });
};
