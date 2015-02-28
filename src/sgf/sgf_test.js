(function() {
  module('glift.sgf.sgfTest');
  var sgf = glift.sgf;

  test('markToProperty', function() {
    deepEqual(sgf.markToProperty('LABEL_ALPHA'), 'LB');
    deepEqual(sgf.markToProperty('LABEL_NUMERIC'), 'LB');
    deepEqual(sgf.markToProperty('LABEL'), 'LB');
    deepEqual(sgf.markToProperty('TRIANGLE'), 'TR');
    deepEqual(sgf.markToProperty('SQUARE'), 'SQ');
    deepEqual(sgf.markToProperty('FOO'), null);
  });

  test('propertyToMark', function() {
    deepEqual(sgf.propertyToMark('LB'), 'LABEL');
    deepEqual(sgf.propertyToMark('CR'), 'CIRCLE');
    deepEqual(sgf.propertyToMark('SQ'), 'SQUARE');
    deepEqual(sgf.propertyToMark('TR'), 'TRIANGLE');
    deepEqual(sgf.propertyToMark('FOO'), null);
  });

  test('allSgfCoordsToPoints', function() {
    var point = glift.util.point;
    deepEqual(
        sgf.allSgfCoordsToPoints(['ab','ac', 'bb']),
        [point(0,1), point(0,2), point(1,1)]);
    deepEqual(sgf.allSgfCoordsToPoints([]), []);
    deepEqual(sgf.allSgfCoordsToPoints(null), []);
  });
})();
