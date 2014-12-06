glift.rules.propertiesTest = function() {
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
    deepEqual(allStones.BLACK[0].toString(), '0,0');
    deepEqual(allStones.BLACK[1].toString(), '18,18');
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

  test('Test preprocess', function() {
    var props = properties();
    props.add('C', '[8k\\] Zed');
    deepEqual(props.getOneValue('C'), '[8k] Zed')

    props.remove('C');
    props.add('C', '[8k] Dob');
    deepEqual(props.getOneValue('C'), '[8k] Dob')

    props.remove('C');
    props.add('C', '[8k] Zed');
    deepEqual(props.getOneValue('C'), '[8k] Zed')

    props.set('C', '[8k\\] Zod [9k\\] bod');
    deepEqual(props.getOneValue('C'), '[8k] Zod [9k] bod')

    props.set('C', '[8k] Zod');
    deepEqual(props.getOneValue('C'), '[8k] Zod')
  });

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
};
