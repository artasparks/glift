glift.displays.position.widgetPositionerTest = function() {
  module('Widget Positioner Tests');
  var point = glift.util.point;
  var components = glift.enums.boardComponents;
  var construct = function(options) {
    var options = options || {};
    return new glift.displays.position.positionWidget(
      options.divBox || glift.displays.bboxFromPts(point(0,0), point(300, 300)),
      options.boardRegion || glift.enums.boardRegion.ALL,
      options.intersections || 19,
      options.componentsToUse || [
        components.BOARD,
        components.COMMENT_BOX,
        components.ICONBAR,
        components.STATUS_BAR
      ],
      options.oneColumnSplits || { first: [
          { component: 'STATUS_BAR',   ratio: 0.05 },
          { component: 'BOARD',       ratio: 0.67 },
          { component: 'COMMENT_BOX', ratio: 0.18 },
          { component: 'ICONBAR',     ratio: 0.10 }
      ]},
      options.twoColumnSplits || { first: [
          { component: 'BOARD', ratio: 1 }
        ],
        second: [
          { component: 'STATUS_BAR',     ratio: 0.05 },
          { component: 'COMMENT_BOX',   ratio: 0.80 },
          { component: 'ICONBAR',       ratio: 0.15 }
      ]}
    );
  };

  test('Must construct', function() {
    var positioner = construct();
    ok(positioner !== undefined);
  });
};
