glift.displays.position.widgetBoxesTest = function() {
  module('glift.displays.position.widgetBoxesTest');
  var make = function(opts) {
    return new glift.displays.position.WidgetBoxes();
  };

  test('Must construct boxes', function() {
    var b = make({});
    deepEqual(b._first, undefined);
    deepEqual(b._second, undefined);
  });

  // TODO(kashomon): Write tests for
  // - boxes map
  // - boxes fullWidgetBbox
  // - boxes getBbox
  // - column ordering fn
  // - column setColumnOrdering
};
