(function() {
  module('glift.displays.position.widgetPositionerTest');
  var point = glift.util.point;
  var components = glift.BoardComponent;
  var horzBbox = glift.orientation.bbox.fromSides(point(100, 300), 300, 100);
  var vertBbox = glift.orientation.bbox.fromSides(point(100, 300), 100, 300);
  var squareBbox = glift.orientation.bbox.fromSides(point(100, 300), 200, 200);
  var oneColSplits = {
    first: [
      {component: 'STATUS_BAR', ratio: 0.08},
      {component: 'BOARD', ratio: 0.7},
      {component: 'COMMENT_BOX', ratio: 0.1},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };
  var twoColSplits = {
    first: [
      {component: 'BOARD', ratio: 1}
    ],
    second: [
      {component: 'STATUS_BAR', ratio: 0.08},
      {component: 'COMMENT_BOX', ratio: 0.8},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };

  // Helper constructor function that has a bunch of defaults.
  var construct = function(options) {
    var options = options || {};
    return new glift.displays.position.positioner(
      options.divBox || squareBbox,
      options.boardRegion || glift.enums.boardRegions.ALL,
      options.intersections || 19,
      options.componentsToUse || [
        components.BOARD,
        components.COMMENT_BOX,
        components.ICONBAR,
        components.STATUS_BAR
      ],
      options.oneColSplits || oneColSplits,
      options.twoColSplits || twoColSplits
    );
  };

  var floatsEqual = function(f1, f2, sigs) {
    if (!sigs)
        throw new Error('Sigs must be defined. was: ' + sigs);
    if (typeof f1 !== 'number')
        throw new Error('First arg must be number. was: ' + f1);
    if (typeof f2 !== 'number')
        throw new Error('Second arg must be number. was: ' + f2);
    var tens = 1;
    for (var i = 0; i < sigs; i++) { tens = tens * 10; }
    var left = Math.round(f1 * tens) / tens;
    var right = Math.round(f2 * tens) / tens;
    deepEqual(left, right);
  };

  test('floats equal', function() {
    floatsEqual(100, 100, 1);
    floatsEqual(100, 100, 3);
    floatsEqual(100.00002, 100.00003, 3);
  });

  test('Must construct', function() {
    var p = construct();
    ok(p);
    ok(p.divBox);
    ok(p.ints);
    ok(p.compsToUse);
    ok(p.oneColSplits);
    ok(p.twoColSplits);
  });

  test('Orientations', function() {
    ok(!construct().useHorzOrientation(), 'square');
    ok(construct({divBox: horzBbox}).useHorzOrientation(), 'horz');
    ok(!construct({divBox: vertBbox}).useHorzOrientation(), 'vert');
  });

  test('Recalc Splits: one col, no change', function() {
    var positioner = construct();
    var out = positioner.recalcSplits(positioner.oneColSplits);
    var before = positioner.oneColSplits.first;
    var after = out.first;
    floatsEqual(before[0].ratio, after[0].ratio, 7);
    floatsEqual(before[1].ratio, after[1].ratio, 7);
    floatsEqual(before[2].ratio, after[2].ratio, 7);
    floatsEqual(before[3].ratio, after[3].ratio, 7);
  });

  test('Recalc Splits: two cols, no change', function() {
    var positioner = construct();
    var before = positioner.twoColSplits;
    var after = positioner.recalcSplits(positioner.twoColSplits);
    deepEqual(before.first[0].component, 'BOARD');
    deepEqual(before.first[0].ratio, 1);

    floatsEqual(before.second[0].ratio, after.second[0].ratio, 7);
    floatsEqual(before.second[1].ratio, after.second[1].ratio, 7);
    floatsEqual(before.second[2].ratio, after.second[2].ratio, 7);
  });

  test('Recalc Splits: one col, only one comp', function() {
    var positioner = construct({
      componentsToUse: [ components.COMMENT_BOX ]
    });
    var after = positioner.recalcSplits(positioner.oneColSplits).first;
    deepEqual(after.length, 1);
    deepEqual(after[0].component, 'COMMENT_BOX');
    deepEqual(after[0].ratio, 1);
  });

  test('Recalc Splits: one col, -one comp', function() {
    var positioner = construct({
      componentsToUse: [
        components.BOARD, components.ICONBAR, components.COMMENT_BOX
      ],
      oneColSplits: {
        first: [
          {component: 'STATUS_BAR', ratio: 0.4},
          {component: 'BOARD', ratio: 0.4},
          {component: 'COMMENT_BOX', ratio: 0.1},
          {component: 'ICONBAR', ratio: 0.1}
        ]
      }
    });
    var out = positioner.recalcSplits(positioner.oneColSplits);
    var after = out.first;
    ok(after !== undefined);
    deepEqual(after.length, 3);

    deepEqual(after[0].component, 'BOARD');
    floatsEqual(after[0].ratio, 0.666667, 5);
    deepEqual(after[1].component, 'COMMENT_BOX');
    floatsEqual(after[1].ratio, 0.166667, 5);
    deepEqual(after[2].component, 'ICONBAR');
    floatsEqual(after[2].ratio, 0.166667, 5);
  });

  test('Recalc Splits: one col, -two comps', function() {
    var positioner = construct({
      componentsToUse: [
        components.BOARD, components.COMMENT_BOX
      ],
      oneColSplits: {
        first: [
          {component: 'STATUS_BAR', ratio: 0.4},
          {component: 'BOARD', ratio: 0.4},
          {component: 'COMMENT_BOX', ratio: 0.1},
          {component: 'ICONBAR', ratio: 0.1}
        ]
      }
    });
    var after = positioner.recalcSplits(positioner.oneColSplits).first;
    deepEqual(after.length, 2);
    deepEqual(after[0].component, 'BOARD');
    floatsEqual(after[0].ratio, 0.8, 5);
    deepEqual(after[1].component, 'COMMENT_BOX');
    floatsEqual(after[1].ratio, 0.2, 5);
  });

  test('Recalc Splits: two cols, -one comp', function() {
    var positioner = construct({
      componentsToUse: [
        components.BOARD, components.ICONBAR, components.COMMENT_BOX
      ],
      twoColSplits: {
        first: [
          {component: 'BOARD', ratio: 1},
        ],
        second: [
          {component: 'STATUS_BAR', ratio: 0.6},
          {component: 'COMMENT_BOX', ratio: 0.3},
          {component: 'ICONBAR', ratio: 0.1}
        ]
      }
    });
    var out = positioner.recalcSplits(positioner.twoColSplits);
    deepEqual(out.first.length, 1);
    deepEqual(out.first[0].component, 'BOARD');
    deepEqual(out.first[0].ratio, 1);

    deepEqual(out.second.length, 2);
    deepEqual(out.second[0].component, 'COMMENT_BOX');
    floatsEqual(out.second[0].ratio, 0.75, 5);
    deepEqual(out.second[1].component, 'ICONBAR');
    floatsEqual(out.second[1].ratio, 0.25, 5);
  });

  test('Position widget vertically', function() {
    var boxes = construct().calcVertPositioning();
    ok(boxes !== undefined);
    ok(boxes.first() !== undefined);
    deepEqual(boxes.first().ordering.length, 4);
    deepEqual(boxes.first().ordering,
        ['STATUS_BAR', 'BOARD', 'COMMENT_BOX', 'ICONBAR']);

    ok(boxes.first().mapping.STATUS_BAR !== undefined);
    ok(boxes.first().mapping.BOARD !== undefined);
    ok(boxes.first().mapping.COMMENT_BOX !== undefined);
    ok(boxes.first().mapping.ICONBAR !== undefined);
  });

  test('Position widget vertically, map', function() {
    var boxes = construct().calcVertPositioning();
    var boxList = [];
    boxes.map(function(key, bbox) {
      ok(glift.BoardComponent[key] !== undefined, key);
      ok(bbox.width() > 0, bbox);
      boxList.push(key);
    });
    deepEqual(boxList, ['STATUS_BAR', 'BOARD', 'COMMENT_BOX', 'ICONBAR'])
  });

  test('Position widget vertically', function() {
    var boxes = construct().calcHorzPositioning();
    ok(boxes !== undefined);
    ok(boxes.first() !== undefined);
    deepEqual(boxes.first().ordering.length, 1);
    deepEqual(boxes.first().ordering, ['BOARD']);
    ok(boxes.first().mapping.BOARD);

    ok(boxes.second() !== undefined);
    deepEqual(boxes.second().ordering.length, 3);
    deepEqual(boxes.second().ordering, ['STATUS_BAR', 'COMMENT_BOX', 'ICONBAR']);
    ok(boxes.second().mapping.STATUS_BAR);
    ok(boxes.second().mapping.COMMENT_BOX);
    ok(boxes.second().mapping.ICONBAR);
  });

  test('Position widget horz, map', function() {
    var boxes = construct().calcHorzPositioning();
    ok(boxes._first, 'first');
    ok(boxes._second, 'second');
    var boxList = [];
    boxes.map(function(key, bbox) {
      ok(glift.BoardComponent[key] !== undefined, key);
      ok(bbox.width() > 0, bbox);
      boxList.push(key);
    });
    deepEqual(boxList, ['BOARD', 'STATUS_BAR', 'COMMENT_BOX', 'ICONBAR'])
  });
})();
