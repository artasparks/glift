(function() {
  module('glift.rules.autonumberTest');
  var autonumber = glift.rules.autonumber;

  test('Testing simple autonumber', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('AW', 'aa');
    mt.node().addChild();
    mt.moveDown();
    mt.properties().add('B', 'ab');
    mt.properties().add('C', 'Foo');
    mt = mt.getTreeFromRoot();

    autonumber(mt);
    mt.moveDown();
    ok(mt.node().getNodeNum(), 1);

    ok(mt.properties().hasValue('B', 'ab'), 'stone');
    ok(mt.properties().hasValue('C', 'Foo'), 'comment');
    ok(mt.properties().hasValue('LB', 'ab:1'), 'must have a label');
  });

  test('Testing complex autonumber', function() {
    var sgf = '(;GM[1];B[aa]C[Foo]TR[aa];W[ab];B[ac];W[ad];B[ae];W[af]C[BAR]' +
        '(;B[ag]C[Biff];W[ah];B[ai];W[aj])' +
        '(;B[ah]C[Blarg];W[ai];B[aj]C[Flag];W[ak]))';
    var mt = glift.rules.movetree.getFromSgf(sgf, []);
    autonumber(mt);

    var initPos = [0];
    var mt = mt.getTreeFromRoot(initPos);
    ok(mt.properties().hasValue('B', 'aa'), 'stone');
    ok(mt.properties().hasValue('C', 'Foo'), 'comment');
    ok(mt.properties().hasValue('LB', 'aa:1'), 'must have a label');
    ok(!mt.properties().contains('TR'), 'must have removed triangles label');

    initPos = [0,0,0,0,0,0];
    var mt = mt.getTreeFromRoot(initPos);
    deepEqual(mt.properties().getOneValue('C'), 'BAR', 'comment');
    deepEqual(mt.properties().getAllValues('LB'),
        ['ab:2','ac:3','ad:4','ae:5','af:6'], 'complex comments');

    initPos = [0,0,0,0,0,0,1];
    var mt = mt.getTreeFromRoot(initPos);
    deepEqual(mt.properties().getOneValue('C'), 'Blarg', 'comment');
    deepEqual(mt.properties().getAllValues('LB'),
        ['ah:1'], 'variation comments');

    var initPos = [0,0,0,0,0,0,1,0,0];
    var mt = mt.getTreeFromRoot(initPos);
    ok(mt.node().getParent() !== null);
    deepEqual(mt.properties().getOneValue('C'), 'Flag', 'comment');
    deepEqual(mt.properties().getAllValues('LB'),
        ['ai:2', 'aj:3'], 'variation comments');
    ok(true);
  });
})();
