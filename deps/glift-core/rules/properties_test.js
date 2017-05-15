(function() {
  module('glift.rules.propertiesTest');
  var properties = glift.rules.properties,
      point = glift.util.point;

  test('Test for GetAllStones', function() {
    var props = properties(),
        p1 = point(0, 0),
        p2 = point(18, 18);
    props.add('AB', p1.toSgfCoord()).add('AB', p2.toSgfCoord());
    ok(props.contains('AB'))
    deepEqual(props.getAllValues('AB').length, 2, 'Must have 2 elems');
    var allStones = props.getAllStones();
    deepEqual(allStones.BLACK[0].point.toString(), '0,0');
    deepEqual(allStones.BLACK[1].point.toString(), '18,18');
  })

  test('Matches and not Matches', function() {
    var props = properties();
    var p1 = point(0, 0);
    props.add('B', p1.toSgfCoord()).add('GB', '1').add('C', 'foo');
    ok(props.matches({GB: []}), 'Match for GB');

    props = properties();
    props.add('B', p1.toSgfCoord()).add('C', 'foo');
    ok(!props.matches({GB: []}), 'No Match for nonexistent property');

    props = properties();
    props.add('B', p1.toSgfCoord()).add('C', 'foo');
    ok(!props.matches({GBA: []}), 'No Match for property typo');

    props = properties();
    props.add('B', p1.toSgfCoord()).add('C', 'This is correct');
    ok(props.matches({C: ['is correct']}), 'Match for comment substring');

    props = properties();
    props.add('B', p1.toSgfCoord()).add('C', 'This is correct').add('GB', '1');
    ok(props.matches({GB: [], C: ['is zog']}), 'Complex matcher');
  });

  test('Remove propeties and values', function() {
    var props = properties();
    props.add('SQ', 'ab').add('SQ', 'ac');
    deepEqual(props.getAllValues('SQ'), ['ab', 'ac']);
    props.remove('SQ');
    deepEqual(props.getAllValues('SQ'), null);

    props.add('TR', 'aa');
    deepEqual(props.getOneValue('TR'), 'aa');
    props.add('TR', 'bb').add('TR', 'cc');
    deepEqual(props.getOneValue('TR', 1), 'bb');
    deepEqual(props.getAllValues('TR'), ['aa', 'bb', 'cc']);
    props.removeOneValue('TR', 'bb');
    deepEqual(props.getAllValues('TR'), ['aa', 'cc']);
  });

  // This is now done in the parser
  // test('Test preprocess', function() {
    // var props = properties();
    // props.add('C', '[8k\\] Zed');
    // deepEqual(props.getOneValue('C'), '[8k] Zed')

    // props.remove('C');
    // props.add('C', '[8k] Dob');
    // deepEqual(props.getOneValue('C'), '[8k] Dob')

    // props.remove('C');
    // props.add('C', '[8k] Zed');
    // deepEqual(props.getOneValue('C'), '[8k] Zed')

    // props.set('C', '[8k\\] Zod [9k\\] bod');
    // deepEqual(props.getOneValue('C'), '[8k] Zod [9k] bod')

    // props.set('C', '[8k] Zod');
    // deepEqual(props.getOneValue('C'), '[8k] Zod')
  // });

  test('Test game info: simple', function() {
    var props = properties();
    props.add('GN', 'Zod').add('PW', 'Rod').add('PB', 'Zod');
    deepEqual(props.getGameInfo(), [
      { prop: 'PW', displayName: 'White Player', value: 'Rod'},
      { prop: 'PB', displayName: 'Black Player', value: 'Zod'},
      { prop: 'GN', displayName: 'Game Name', value: 'Zod'}
    ]);
  });

  test('Test game info: rank && player', function() {
    var props = properties();
    props.add('PW', 'Rod').add('PB', 'Zod')
        .add('BR', '9d').add('WR', '7d');
    deepEqual(props.getGameInfo(), [
      { prop: 'PW', displayName: 'White Player', value: 'Rod [7d]'},
      { prop: 'PB', displayName: 'Black Player', value: 'Zod [9d]'},
    ]);
  });

  test('Test game info: komi', function() {
    var props = properties().add('KM', '0.00');
    deepEqual(props.getGameInfo(),
        [{ prop: 'KM', displayName: 'Komi', value: '0'}]);
    props.set('KM', '7.5');
    deepEqual(props.getGameInfo(),
        [{ prop: 'KM', displayName: 'Komi', value: '7.5'}]);
    props.set('KM', '1.50');
    ok(props.getGameInfo()[0].value, '1.5')
    ok(props.getGameInfo()[0].value, '1.50');
    props.set('KM', '3.25');
    deepEqual(props.getGameInfo()[0].value, '3.25');
  });

  test('Test rotation: basic', function() {
    var rotations = glift.enums.rotations;
    var pt = glift.util.point;
    var props = properties().add('B', 'cb');
    deepEqual(props.getAsPoint('B'),  pt(2, 1));

    props.rotate('B', 19, rotations.NO_ROTATION);
    deepEqual(props.getAsPoint('B'),  pt(2, 1));

    props.rotate('B', 19, rotations.CLOCKWISE_90);
    deepEqual(props.getAsPoint('B'),  pt(17, 2));

    props.set('B', 'cb');
    props.rotate('B', 19, rotations.CLOCKWISE_180);
    deepEqual(props.getAsPoint('B'),  pt(16, 17));

    props.set('B', 'cb');
    props.rotate('B', 19, rotations.CLOCKWISE_270);
    deepEqual(props.getAsPoint('B'),  pt(1, 16));

    props.add('C', 'Some Comment');
    props.rotate('C', 19, rotations.CLOCKWISE_270);
    deepEqual(props.getOneValue('C'), 'Some Comment');
  });

  test('Test rotation: labels', function() {
    var rotations = glift.enums.rotations;
    var pt = glift.util.point;
    var props = properties().add('LB', 'cb:Z');

    props.rotate('LB', 19, rotations.NO_ROTATION);
    deepEqual(props.getOneValue('LB'),  pt(2, 1).toSgfCoord() + ':Z');

    props.rotate('LB', 19, rotations.CLOCKWISE_90);
    deepEqual(props.getOneValue('LB'),  pt(17, 2).toSgfCoord() + ':Z');

    props.set('LB', 'cb:Z');
    props.rotate('LB', 19, rotations.CLOCKWISE_180);
    deepEqual(props.getOneValue('LB'),  pt(16, 17).toSgfCoord() + ':Z');

    props.set('LB', 'cb:Z');
    props.rotate('LB', 19, rotations.CLOCKWISE_270);
    deepEqual(props.getOneValue('LB'),  pt(1, 16).toSgfCoord() + ':Z');

    props.set('LB', 'cb:ab');
    props.rotate('LB', 19, rotations.CLOCKWISE_90);
    deepEqual(props.getOneValue('LB'),  pt(17, 2).toSgfCoord() + ':ab');

  });

  test('Test flip', function() {
    var pt = glift.util.point;

    var props = properties().add('LB', 'cb:Z');

    props.flipHorz('LB', 19);
    deepEqual(props.getOneValue('LB'), pt(16, 1).toSgfCoord() + ':Z');
    props.flipHorz('LB', 19);
    deepEqual(props.getOneValue('LB'), pt(2, 1).toSgfCoord() + ':Z');

    var props = props.add('B', 'dc');
    props.flipVert('B', 19);
    deepEqual(props.getOneValue('B'), pt(3, 16).toSgfCoord());
    props.flipVert('B', 19);
    deepEqual(props.getOneValue('B'), pt(3, 2).toSgfCoord());
  });

  test('getAllMarks', function() {
    var pt = glift.util.pointFromSgfCoord;
    var defaultProps = properties();
    deepEqual(defaultProps.getAllMarks(), {});

    var props = properties()
        .add('LB', 'cb:Z')
        .add('LB', 'cf:A')
        .add('SQ', 'da')
        .add('SQ', 'db')
        .add('SQ', 'dc:dd'); // point rectangle
    var marks = props.getAllMarks();
    deepEqual(marks.SQUARE.length, 4);
    deepEqual(marks.LABEL.length, 2);
    deepEqual(marks.SQUARE, [
      {point: pt('da')},
      {point: pt('db')},
      {point: pt('dc')},
      {point: pt('dd')}
    ]);
    deepEqual(marks.LABEL, [
      {point: pt('cb'), value: 'Z'},
      {point: pt('cf'), value: 'A'}
    ]);
  });

  test('Getting clear locations', function() {
    var sgfPt = glift.util.pointFromSgfCoord;
    var props = properties()
      .add('AE', 'ab')
      .add('AE', 'ac');
    deepEqual(props.getClearLocationsAsPoints(), [sgfPt('ab'), sgfPt('ac')]);

    props = properties();
    deepEqual(props.getClearLocationsAsPoints(), []);
  });
})();
