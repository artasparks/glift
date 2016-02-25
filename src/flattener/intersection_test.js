(function() {
  module('glift.flattener.intersectionTest');
  var pt = glift.util.point;
  var BLACK = glift.enums.states.BLACK;
  var WHITE = glift.enums.states.WHITE;
  var sym = glift.flattener.symbols;
  var create = function(opts) {
    opts = opts || {};
    return glift.flattener.intersection.create(
      opts.pt || pt(0,0),
      opts.stoneColor || BLACK,
      opts.mark || undefined,
      opts.textLabel|| undefined,
      opts.ints || 19);
  };

  test('Full create', function() {
    var int = glift.flattener.intersection.create(
        pt(9,9), WHITE, sym.TEXTLABEL, '1', 19);
    deepEqual(int.base(), sym.CENTER_STARPOINT);
    deepEqual(int.stone(), sym.WSTONE);
    deepEqual(int.mark(), sym.TEXTLABEL);
    deepEqual(int.textLabel(), '1');
  });

  test('Create - top left, wstone', function() {
    var int = create({stoneColor: WHITE});
    deepEqual(int.base(), sym.TL_CORNER);
    deepEqual(int.stone(), sym.WSTONE);
    deepEqual(int.mark(), sym.EMPTY);
    deepEqual(int.textLabel(), null);
  });

  test('Create - top right, bstone', function() {
    var int = create({pt: pt(18, 0)})
    deepEqual(int.base(), sym.TR_CORNER);
    deepEqual(int.stone(), sym.BSTONE);
  });

  test('Create - bot right', function() {
    deepEqual(create({pt: pt(18, 18)}).base(), sym.BR_CORNER);
  });

  test('Create - bot left', function() {
    deepEqual(create({pt: pt(0, 18)}).base(), sym.BL_CORNER);
  });

  test('Create - top', function() {
    deepEqual(create({pt: pt(7, 0)}).base(), sym.TOP_EDGE);
  });

  test('Create - bot', function() {
    deepEqual(create({pt: pt(3, 18)}).base(), sym.BOT_EDGE);
  });

  test('Create - center', function() {
    deepEqual(create({pt: pt(7, 7)}).base(), sym.CENTER);
  });

  test('Create - starpoints - 19x19', function() {
    deepEqual(create({pt: pt(3, 3)}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(3, 9)}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(15, 9)}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(15, 15)}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(3, 15)}).base(), sym.CENTER_STARPOINT);
  });

  test('Create - starpoints - 13x13', function() {
    deepEqual(create({pt: pt(3, 3), ints: 13}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(3, 9), ints: 13}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(9, 3), ints: 13}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(9, 9), ints: 13}).base(), sym.CENTER_STARPOINT);
    deepEqual(create({pt: pt(6, 6), ints: 13}).base(), sym.CENTER_STARPOINT);
  });

  test('Create - starpoints - 9x9', function() {
    deepEqual(create({pt: pt(2, 2), ints: 9}).base(), sym.CENTER);
    deepEqual(create({pt: pt(2, 6), ints: 9}).base(), sym.CENTER);
    deepEqual(create({pt: pt(6, 2), ints: 9}).base(), sym.CENTER);
    deepEqual(create({pt: pt(6, 6), ints: 9}).base(), sym.CENTER);
    deepEqual(create({pt: pt(4, 4), ints: 9}).base(), sym.CENTER_STARPOINT);
  });

  test('Setting marks', function() {
    deepEqual(create().setMark(sym.SQUARE).mark(), sym.SQUARE);
    deepEqual(create().setMark(sym.CIRCLE).mark(), sym.CIRCLE);
    deepEqual(create().setMark(sym.TRIANGLE).mark(), sym.TRIANGLE);
  });

  test('Setting text label', function() {
    deepEqual(create().setTextLabel('z').textLabel(), 'z');
  });

  test('Setting text marks', function() {
    var int1 = create().setMark(sym.TEXTLABEL);
    deepEqual(int1.mark(), sym.TEXTLABEL);

    var int1 = create().setMark(sym.NEXTVARIATION);
    deepEqual(int1.mark(), sym.NEXTVARIATION);
  });

  test('That equals works', function() {
    var int1 = create();
    var int2 = create();
    ok(int1.equals(int2), 'Intersections must be equal');

    var diff = create({pt: pt(1, 1)});
    ok(!int1.equals(diff), 'Intersections must be not equal');

    diff = create({stoneColor: WHITE});
    ok(!int1.equals(diff), 'Color changes: Ints must be not equal');

    diff = create({mark: sym.SQUARE});
    ok(!int1.equals(diff), 'Mark changes: Ints must be not equal');

    diff = create({textLabel: 'foo'});
    ok(!int1.equals(diff), 'Label changes: Ints must be not equal');
  });
})();
