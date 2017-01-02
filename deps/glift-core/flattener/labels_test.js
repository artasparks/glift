(function() {
  module('glift.flattener.labelsTest');

  test('ReplaceInline', function() {
    var label = 'Black then played at Black A and then White 32 and Black (133).';
    var out = glift.flattener.labels.replaceInline(
        label, function(full, player, label) {
          var p = '';
          if (player === 'Black') {
            p = 'b'
          } else if (player === 'White') {
            p = 'w';
          }
          return p + '-' + label;
        });
    deepEqual(out, 'Black then played at b-A and then w-32 and b-133.');
  });

  test('label for collisions', function() {
    var coll = [
      {color: 'BLACK', mvnum: '1', label: 'a', collisionStoneColor: 'BLACK'},
      {color: 'WHITE', mvnum: '10', label: 'x', collisionStoneColor: 'WHITE'}
    ];
    deepEqual(
        glift.flattener.labels.labelFromCollisions(coll),
        'Black 1 at Black (a),\nWhite 10 at White (x).');
  });

  test('label for collisions: two stones/label', function() {
    var coll = [
      {color: 'BLACK', mvnum: '1', label: '1'},
      {color: 'WHITE', mvnum: '2', label: '1', collisionStoneColor: 'BLACK'},
      {color: 'WHITE', mvnum: '10', label: 'x'}
    ];
    deepEqual(
        glift.flattener.labels.labelFromCollisions(coll),
        'Black 1, White 2 at Black 1,\nWhite 10 at White (x).');
  });

  test('label for collisions: two stones/label + moves', function() {
    var coll = [
      {color: 'BLACK', mvnum: '1', label: 'a', collisionStoneColor: 'BLACK'},
      {color: 'WHITE', mvnum: '2', label: 'a', collisionStoneColor: 'BLACK'},
      {color: 'WHITE', mvnum: '10', label: 'x', collisionStoneColor: 'BLACK'}
    ];
    deepEqual(
        glift.flattener.labels.fullLabelFromCollisions(coll, true, 1, 10),
        '(Moves: 1-10)\n' +
        'Black 1, White 2 at Black (a),\nWhite 10 at Black (x).');
    deepEqual(
        glift.flattener.labels.labelFromCollisions(coll),
        'Black 1, White 2 at Black (a),\nWhite 10 at Black (x).');
  });

  test('label for collisions: compactify', function() {
    var rows = [
      'Black 1, White 2 at Black (a)',
      'White 10 at Black (x)',
      'Black 1, White 2 at Black (a)',
      'White 10 at Black (x)',
      'White 10 at Black (x)',
      'Black 1, White 2, Black 3 at Black (a)'
    ];
    var l = glift.flattener.labels.compactifyLabels_(rows);
    deepEqual(l.length, 4);
  });
})();
