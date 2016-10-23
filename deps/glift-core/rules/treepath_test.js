(function() {
  module('glift.rules.treepathTest');
  var parseInit = glift.rules.treepath.parseInitialPath;
  var flatten = glift.rules.treepath.flattenMoveTree;
  var parseFragment = glift.rules.treepath.parseFragment;

  test('Test undefined', function() {
    deepEqual(parseInit(undefined), [], 'Should return empty array for undefined');
  });

  test('Test object', function() {
    deepEqual(parseInit({}), [], 'Should return empty array for object type');
  });

  test('Number', function() {
    deepEqual(parseInit(3), [0,0,0], 'Should parse correctly');
  });

  test('Test root case', function() {
    deepEqual(parseInit('0'), [], 'Should produce empty array for root init');
  });

  test('Test to end case', function() {
    deepEqual(parseInit('1+'), [0].concat(glift.rules.treepath.toEnd_()),
        'Should go to the end');
  });

  test('Test simple cases', function() {
    deepEqual(parseInit('1'), [0], 'Should parse correctly');
    deepEqual(parseInit('3'), [0,0,0], 'Should parse correctly');
    deepEqual(parseInit('10'), [0,0,0,0,0,0,0,0,0,0], 'Should parse correctly');
  });

  test('Test one variation', function() {
    deepEqual(parseInit('2.0'), [0,0,0], 'Should parse correctly');
    deepEqual(parseInit('2.1'), [0,0,1], 'Should parse correctly');
    deepEqual(parseInit('3.10'), [0,0,0,10], 'Should parse correctly');
  });

  test('Convert back to an init path string', function() {
    var convert  = glift.rules.treepath.toInitPathString;
    deepEqual(convert([]), '0')
    deepEqual(convert([0]), '1')
    deepEqual(convert([0,0,0]), '3')
    deepEqual(convert([0,0,0,0,0,0,0,0,0,0]), '10')
    deepEqual(convert([0,0,0,1]), '3.1')
    deepEqual(convert([0,0,0,1,0]), '3.1.0')
    deepEqual(convert([0,0,0,1,0,0]), '3.1.0:2')
    deepEqual(convert([0,0,0,1,0,0,12,0,5]), '3.1.0:2.12.0.5')
    deepEqual(convert([0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1]), '3.1.0:12.1')
  });

  test('Parse a fragment', function() {
    deepEqual(parseFragment([1,0]), [1,0]);
    deepEqual(parseFragment('1.2.0.2'), [1,2,0,2]);
    deepEqual(
        parseFragment('1.11+'),
        [1,11].concat(glift.rules.treepath.toEnd_()));
  });

  test('Parse a fragment: Multiplier', function() {
    deepEqual(parseFragment('1.2:1.0.2:3'), [1,2,0,2,2,2]);
    deepEqual(parseFragment('0:10'), [0,0,0,0,0,0,0,0,0,0]);
  });

  test('Double wMultiplier: fail', function() {
    try {
      parseFragment('0:10:2');
      ok(false, 'Shouldn\'t get here');
    } catch (e) {
      ok(/Error using variation multiplier/.test(e.message), 'exception message');
    }
  });

  test('Parse a init path: Multiplier', function() {
    deepEqual(parseInit('0.0:3.1:3'), [0,0,0,1,1,1]);
    deepEqual(parseInit('1.2:1.0.2:3'), [0,2,0,2,2,2]);
    deepEqual(parseInit('0.0:10'), [0,0,0,0,0,0,0,0,0,0]);
  });

  test('Parse a init path: Multiplier fail', function() {
    try {
      parseInit('0x10');
      ok(false, 'Shouldn\'t get here');
    } catch (e) {
      ok(/Unexpected token \[x\]/.test(e.message), 'exception message');
    }
  });

  test('Convert back to an path fragment string', function() {
    var convertToString = glift.rules.treepath.toFragmentString;
    deepEqual(convertToString([0,1,0,2,0,0,7]), '0.1.0.2.0:2.7');
    deepEqual(convertToString('0'), '0');
  });

  test('Fragment squashing', function() {
    var convertToString = glift.rules.treepath.toFragmentString;
    deepEqual(convertToString([0,0,0,0]), '0:4');
    deepEqual(convertToString([1,1,1,1]), '1:4');
    deepEqual(convertToString([0,0,0,0,0,0,0,1,1,1,1,2,3,3,3]), '0:7.1:4.2.3:3');
    deepEqual(convertToString([0,1,2.3,4]), '0.1.2.3.4');
  });

  test('Test to end paths', function() {
    deepEqual(parseInit('0.1+'), [1].concat(glift.rules.treepath.toEnd_()));
    deepEqual(parseInit('0.2.3+'), [2,3].concat(glift.rules.treepath.toEnd_()));
  });

  test('Flatten Movetree', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.addNode().addNode().addNode().addNode()
      .moveUp().moveUp().moveUp()
      .addNode().addNode();
    mt.getTreeFromRoot().addNode().addNode();
    mt = mt.getTreeFromRoot();
    var out = flatten(mt);
    ok(true, 'foo');
    deepEqual(out, [[0,0,0,0], [0,1,0], [1,0]], 'Must flatten correctly');
    mt.moveDown();

    var out2 = flatten(mt);
    deepEqual(out2, [[0,0,0], [1,0]], 'Must flatten correctly after moveDown');
  });
})();
