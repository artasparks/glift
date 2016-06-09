(function() {
  module('glift.displays.position.widgetBoxesTest');
  var defaultBbox1 = glift.orientation.bbox.fromPts(
      glift.util.point(0, 0),
      glift.util.point(100, 100));
  var defaultBbox2 = glift.orientation.bbox.fromPts(
      glift.util.point(10, 10),
      glift.util.point(200, 200));
  var defaultBbox3 = glift.orientation.bbox.fromPts(
      glift.util.point(10, 10),
      glift.util.point(150, 300));
  var comps = glift.BoardComponent;

  var make = function(opts) {
    return new glift.displays.position.WidgetBoxes();
  };

  test('Widget Column construction', function() {
    var w = new glift.displays.position.WidgetColumn();
    deepEqual(w.mapping, {});
    deepEqual(w.ordering, []);
  });

  test('Widget Column: set/get', function() {
    var w = new glift.displays.position.WidgetColumn();
    w.setComponent(comps.BOARD, defaultBbox1);
    w.setComponent(comps.COMMENT_BOX, defaultBbox2);
    ok(w.getBbox(comps.BOARD) === defaultBbox1);
    ok(w.getBbox(comps.COMMENT_BOX) === defaultBbox2);
  });

  test('Widget Column: ordering: set/orderfn', function() {
    var w = new glift.displays.position.WidgetColumn();
    w.setOrderingFromRatioArray([
      {component: 'BOARD', ratio: 0.2},
      {component: 'COMMENT_BOX', ratio: 0.3},
      {component: 'ICONBAR', ratio: 0.4}
    ]);
    var out = [];
    w.orderFn(function(compName) {
      out.push(compName);
    });
    deepEqual(out, ['BOARD', 'COMMENT_BOX', 'ICONBAR']);
  });

  test('Must construct Widget boxes', function() {
    var b = make({});
    deepEqual(b._first, null);
    deepEqual(b._second, null);
  });

  test('Widget Boxes: map', function() {
    var wboxes = new glift.displays.position.WidgetBoxes();
    wboxes.setFirst(new glift.displays.position.WidgetColumn()
      .setOrderingFromRatioArray([
        {component: 'BOARD', ratio: 1}
      ])
      .setComponent('BOARD', defaultBbox1));
    wboxes.setSecond(new glift.displays.position.WidgetColumn()
      .setOrderingFromRatioArray([
        {component: 'STATUS_BAR', ratio: 0.3},
        {component: 'COMMENT_BOX', ratio: 0.3},
        {component: 'ICONBAR', ratio: 0.4}
      ])
      .setComponent('STATUS_BAR', defaultBbox1)
      .setComponent('COMMENT_BOX', defaultBbox2)
      .setComponent('ICONBAR', defaultBbox3));
    var comps = [];
    var bboxes = [];
    wboxes.map(function(comp, bbox) {
      comps.push(comp);
      bboxes.push(bbox)
    });
    deepEqual(comps, ['BOARD', 'STATUS_BAR', 'COMMENT_BOX', 'ICONBAR']);
    deepEqual(bboxes, [defaultBbox1, defaultBbox1, defaultBbox2, defaultBbox3]);

    var pt = glift.util.point;
    deepEqual(wboxes.fullWidgetBbox(),
        glift.orientation.bbox.fromPts(pt(0, 0), pt(200, 300)));
  });
})();
