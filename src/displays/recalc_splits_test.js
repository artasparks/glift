glift.displays.recalcSplitsTest = function() {
  module("Recalc Splits Test");

  // Data for recalculating splits tests
  var recalcSplits = glift.displays.recalcSplits;
  var oneColumnSplits = {
    first: [
      {component: 'TITLE_BAR', ratio: 0.08},
      {component: 'BOARD', ratio: 0.7},
      {component: 'COMMENT_BOX', ratio: 0.1},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };

  test('recalcSplits, oneCol, BOARD', function() {
    var compsToUseSet = { BOARD: true };
    var out = recalcSplits(compsToUseSet, oneColumnSplits);
    ok(out !== undefined);
    ok(out.first !== undefined, 'should have a first');
    deepEqual(out.first.length, 1, 'should only have one entry');
    var part = out.first[0];

    deepEqual(part.component, 'BOARD', 'should only use board');
    deepEqual(part.ratio, 1, 'Should be the entire thing');
  });

  test('recalcSplits, oneCol, BOARD, ICONs', function() {
    var compsToUseSet = { BOARD: true, ICONBAR: true };
    var out = recalcSplits(compsToUseSet, oneColumnSplits);
    deepEqual(out.first.length, 2, 'should have two entries');
    var part = out.first[0];
    deepEqual(part.component, 'BOARD', 'Board should be first');
    ok(glift.math.mostlyEqual(part.ratio, 0.79, 0.00001), 'should be 0.79');;

    part = out.first[1];
    deepEqual(part.component, 'ICONBAR', 'Board should be first');
    ok(glift.math.mostlyEqual(part.ratio, 0.21, 0.00001), 'should be 0.21');;
  });

  var twoColumnSplits = {
    first: [
      {component: 'BOARD', ratio: 1}
    ],
    second: [
      {component: 'TITLE_BAR', ratio: 0.08},
      {component: 'COMMENT_BOX', ratio: 0.8},
      {component: 'ICONBAR', ratio: 0.12}
    ]
  };

  test('recalcSplits, twoCol, BOARD, COMMENT_BOX', function() {
    var compsToUseSet = { BOARD: true, COMMENT_BOX: true };
    var out = recalcSplits(compsToUseSet, twoColumnSplits);
    deepEqual(out.first.length, 1);
    var part1  = out.first[0];
    deepEqual(part1.component, 'BOARD');
    deepEqual(part1.ratio, 1, 'Should be the entire thing');

    var part2 = out.second[0];
    deepEqual(part2.component, 'COMMENT_BOX');
    deepEqual(part2.ratio, 1, 'Should be the entire thing');
  });

  test('recalcSplits, twoCol, BOARD, COMMENT_BOX, ICONBAR', function() {
    var compsToUseSet = { BOARD: true, COMMENT_BOX: true, ICONBAR: true };
    var out = recalcSplits(compsToUseSet, twoColumnSplits);
    deepEqual(out.first.length, 1);
    deepEqual(out.second.length, 2);

    var part1 = out.second[0];
    deepEqual(part1.component, 'COMMENT_BOX');
    ok(glift.math.mostlyEqual(part1.ratio, 0.84, 0.00001));

    var part2 = out.second[1];
    deepEqual(part2.component, 'ICONBAR');
    ok(glift.math.mostlyEqual(part2.ratio, 0.16, 0.00001));
  });
};
