(function() {
  module('glift.rules.movetreeTest');
  var movetree = glift.rules.movetree;
  var sgfs = testdata.sgfs;
  var util = glift.util;

  test('that parsing works', function() {
    movetree.getFromSgf(sgfs.veryeasy)
    ok(true, 'should not throw an exception (a significant test!)');
  });

  test('Init basic properties works', function() {
    var m = movetree.getFromSgf('(;C[zed])')
    var p = m.properties();
    deepEqual(p.getOneValue('C'), 'zed');
    deepEqual(p.getOneValue('GM'), '1');
    deepEqual(p.getOneValue('FF'), '4');
    deepEqual(p.getOneValue('CA'), 'UTF-8');
    deepEqual(p.getOneValue('KM'), '0.00');
    deepEqual(p.getOneValue('RU'), 'Japanese');
    deepEqual(p.getOneValue('SZ'), '19');
    deepEqual(p.getOneValue('PW'), 'White');
    deepEqual(p.getOneValue('PB'), 'Black');

    // Note: This changes based on whether Glift is being used as Glift-ui or
    // Glift core, so we need to make the test resiliant to these changes.
    ok(/Glift/.test(p.getOneValue('AP')));
  });

  test('that property retrieval works', function() {
    var mt = movetree.getFromSgf(sgfs.veryeasy);
    deepEqual(mt.node().getNodeNum(), 0, 'movenum');
    var prop = mt.properties().getOneValue('FF');
    ok(mt.properties().contains('FF'),
        'should return true for an existing prop');
    deepEqual(prop, '4', 'should get an existing property');

    ok(!mt.properties().contains('ZZ'),
        'should return false for non-real prop');
    deepEqual(mt.properties().getAllValues('ZZ'), null,
        'should return nothing for a non-real prop');

    ok(!mt.properties().contains('B'),
        'should return false for non-existent prop');
    deepEqual(mt.properties().getAllValues('B'), null,
        'should return nothing for a non-existent prop');
  });

  test('Test that property retrieval for multiple props works', function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.properties().getAllValues('AB')[1], 'qa',
        'Should get the second property');
    deepEqual(mt.properties().getAllValues('AW').toString(),
        ['pa', 'pb', 'sb', 'pc', 'qc', 'sc', 'qd','rd', 'sd'].toString(),
        'should get a list of values');
  });

  test('Sgf point conversion works', function() {
    var pt = glift.util.pointFromSgfCoord('ac');
    deepEqual(pt.x(), 0, 'pt.x');
    deepEqual(pt.y(), 2, 'pt.y');
    deepEqual(pt.toSgfCoord(), 'ac', 'pt to sgf coord');
  });

  test('Moving up / down works correctly', function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.node().getNodeNum(), 0, 'move num beg');
    deepEqual(mt.node().getVarNum(), 0, 'var num beg');
    deepEqual(mt.node().numChildren(), 3, 'next nodes beg');

    mt.moveDown();
    deepEqual(mt.node().getNodeNum(), 1, 'move num md_1');
    deepEqual(mt.node().getVarNum(), 0, 'var num md_1');
    deepEqual(mt.node().numChildren(), 1, 'next nodes md_1');
    deepEqual(mt.properties().getOneValue('B'), 'sa', 'stoneMove');

    mt.moveUp();
    deepEqual(mt.node().getNodeNum(), 0, 'move num');
    deepEqual(mt.node().getVarNum(), 0, 'var num');
    deepEqual(mt.node().numChildren(), 3, 'next nodes');

    mt.moveDown(1);
    deepEqual(mt.node().getNodeNum(), 1, 'move num');
    deepEqual(mt.node().getVarNum(), 1, 'var num');
    deepEqual(mt.node().numChildren(), 1, 'next nodes');
    deepEqual(mt.properties().getOneValue('B'), 'ra', 'stoneMove');
  });

  test('Edge case of moving up: only one move left - works.'
      + 'In other words, dont remove the last move', function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    mt.moveUp();
    deepEqual(mt.node().getNodeNum(), 0, 'move num');
    deepEqual(mt.node().getVarNum(), 0, 'var num');
    deepEqual(mt.node().numChildren(), 3, 'next nodes');
  });

  test('Test that deleting a property works', function() {
    var mt = movetree.getFromSgf(sgfs.veryeasy);
    deepEqual(mt.properties().getOneValue('AP'), 'CGoban:3',
        'should get the AP prop');
    deepEqual(mt.properties().remove('AP')[0],
        'CGoban:3', 'should delete the prop');
    ok(!mt.properties().contains('AP'), 'Prop shouldnt exist anymore');
  });

  test('Test that adding properties works', function() {
    var movt = movetree.getFromSgf(sgfs.veryeasy);
    movt.properties()
        .set('C', 'foo')
        .add('EV', 'tourny');
    deepEqual(movt.properties().getOneValue('C'), 'foo',
        'Should get the correct comment');
    deepEqual(movt.properties().getOneValue('EV'), 'tourny',
        'Chaining should work');
  });

  test('Adding Nodes Works', function() {
    var movt = movetree.getInstance();
    movt.properties()
        .add('C', '0th')
        .add('EV', 'AOEU');
    movt.addNode()
        .properties().add('C', '1.0');
    movt.moveUp()
        .addNode()
        .properties().add('C', '1.1');
    movt = movt.getTreeFromRoot();

    deepEqual(movt.properties().getOneValue('C'), '0th',
        'Should get the correct comment');
    deepEqual(movt.node().getNodeNum(), 0, 'Should get the move num');
    deepEqual(movt.node().getVarNum(), 0, 'Should get the var num');

    movt.moveDown()
    deepEqual(movt.properties().getOneValue('C'), '1.0',
        'Should get the correct comment');
    deepEqual(movt.node().getNodeNum(), 1, 'Should get the move num');
    deepEqual(movt.node().getVarNum(), 0, 'Should get the var num');

    movt.moveUp()
    movt.moveDown(1)
    deepEqual(movt.properties().getOneValue('C'), '1.1',
        'Should get the correct comment');
    deepEqual(movt.node().getNodeNum(), 1,
        'Should get the move num');
    deepEqual(movt.node().getVarNum(), 1,
        'Should get the var num');
  });

  test('Get Property as a Point', function() {
    var movt = movetree.getInstance();
    movt.properties()
        .add('C', '0th')
        .add('EV', 'AOEU');
    movt.addNode().properties()
        .add('B', 'pb');
    deepEqual(movt.properties().getAsPoint('B').x(), 15,
        'Should get and covert the x coord correctly');
    deepEqual(movt.properties().getAsPoint('B').y(), 1,
        'Should get and covert the y coord correctly');
  });

  test('Recursing through the nodes works', function() {
    var movt = movetree.getInstance(),
        conv = glift.util.pointFromSgfCoord,
        expected = [
            'b_' + conv('pb'),
            'w_' + conv('nc'),
            'b_' + conv('cc'),
            'b_' + conv('dd')],
        output = [];

    movt.properties().add('C', '0th').add('EV', 'AOEU');
    movt.addNode().properties().add('B', 'pb');
    movt.addNode().properties().add('W', 'nc');
    movt.addNode().properties().add('B', 'cc');

    movt = movt.getTreeFromRoot();
    movt.addNode().properties().add('B', 'dd');

    movt.recurseFromRoot(function(mt) {
      var buff = '';
      if (mt.properties().contains('B')) {
        buff = 'b_' + mt.properties().getAsPoint('B');
      } else if (mt.properties().contains('W')) {
        buff = 'w_' + mt.properties().getAsPoint('W');
      }
      if (buff !== '') output.push(buff);
    });
    deepEqual(output.toString(), expected.toString(),
        'simple DFS recursing should work');
  });

  test('Next Moves', function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.complexproblem);
    var states = glift.enums.states;
    var next = movt.nextMoves();
    var expected = [
      {color: states.BLACK, point: glift.util.pointFromSgfCoord('mc') },
      {color: states.BLACK, point: glift.util.pointFromSgfCoord('ma') },
      {color: states.BLACK, point: glift.util.pointFromSgfCoord('nc') },
      {color: states.BLACK} // PASS
    ];
    deepEqual(next, expected, 'Next Moves');

    movt.moveDown(1);
    var next = movt.nextMoves();
    var expected = [
      {color: states.WHITE, point: glift.util.pointFromSgfCoord('oa') },
      {color: states.WHITE, point: glift.util.pointFromSgfCoord('mc') },
      {color: states.WHITE, point: glift.util.pointFromSgfCoord('nd') }
    ];
    deepEqual(next, expected, 'Next Moves');
  });

  test('onMainline', function() {
    var main1 = [0,0,0,0];
    var main2 = [0,0,0,0,0,0,0];
    var main3 = [0,0,0,0,0,0,0,0];
    var nonMain1 = [0,0,0,0,0,0,1];
    var nonMain2 = [0,0,0,0,0,0,1,0];
    var sgf = '(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af]' +
        '(;B[ag];W[ah];B[ai];W[aj])' +
        '(;B[ah];W[ai];B[aj];W[ak]))';
    var mt = glift.rules.movetree.getFromSgf(sgf);
    ok(mt.getTreeFromRoot(main1).onMainline(), 'main1');
    ok(mt.getTreeFromRoot(main2).onMainline(), 'main2');
    ok(mt.getTreeFromRoot(main3).onMainline(), 'main3');
    ok(!mt.getTreeFromRoot(nonMain1).onMainline(), 'non-main1');
    ok(!mt.getTreeFromRoot(nonMain2).onMainline(), 'non-main2');
  });

  test('Convert to SGF! (No exceptions)', function() {
    var sgf = glift.rules.movetree.getFromSgf(sgfs.complexproblem).toSgf();
    ok(sgf !== undefined);
  });

  test('Convert to SGF - comment', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('C','Comment');
    deepEqual(mt.toSgf(), '(;C[Comment])');
  });

  test('Convert to SGF - multi prop', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('AW', ['ab','bb']);
    deepEqual(mt.toSgf(), '(;AW[ab][bb])');
  });

  test('Convert to SGF - variation', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('C', 'Foo');
    mt.node().addChild();
    mt.moveDown(0).properties().add('B', 'ab');
    mt.moveUp();
    mt.node().addChild();
    mt.moveDown(1).properties().add('B', 'bb');
    deepEqual(mt.toSgf(), '(;C[Foo]\n(;B[ab])\n(;B[bb]))');
  });

  test('Convert to SGF - escaped bracket', function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('C', '[8k]] Foo');
    deepEqual(mt.toSgf(), '(;C[[8k\\]\\] Foo])');
  });

  test('getCurrentPlayer -- complex problem', function() {
    var states = glift.enums.states
    var mt = glift.rules.movetree.getFromSgf(
        testdata.sgfs.complexproblem);
    deepEqual(mt.getCurrentPlayer(), states.BLACK);
  });

  test('getCurrentPlayer passing example', function() {
    var states = glift.enums.states;
    var movetree = glift.rules.movetree.getFromSgf(
        testdata.sgfs.passingExample,  [0,0]);
    deepEqual(movetree.getCurrentPlayer(), states.WHITE);
    deepEqual(movetree.node().getNodeNum(), 2);
    movetree.moveUp();
    deepEqual(movetree.getCurrentPlayer(), states.WHITE);
    deepEqual(movetree.node().getNodeNum(), 1);
    movetree.moveUp();
    deepEqual(movetree.getCurrentPlayer(), states.BLACK);
    deepEqual(movetree.node().getNodeNum(), 0);
  });

  test('treepathToHere', function() {
    var initPos = [0,0,0,0,0,0,1,0];
    var sgf = '(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af]' +
        '(;B[ag];W[ah];B[ai];W[aj])' +
        '(;B[ah];W[ai];B[aj];W[ak]))';
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.treepathToHere(), initPos);

    initPos = [];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.treepathToHere(), initPos);

    initPos = [0,0,0];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.treepathToHere(), initPos);
  });

  test('movesToMainline', function() {
    var initPos = [0,0,0,0,0,0,1,0,0];
    var sgf = '(;GM[1];B[aa];W[ab];B[ac];W[ad];B[ae];W[af]' +
        '(;B[ag];W[ah];B[ai];W[aj])' +
        '(;B[ah];W[ai];B[aj];W[ak]))';
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.movesToMainline(), 3);

    initPos = [];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.movesToMainline(), 0);

    initPos = [0,0,0];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.movesToMainline(), 0);

    initPos =  [0,0,0,0,0,0,1];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.movesToMainline(), 1);

    initPos =  [0,0,0,0,0,0,1,0,0];
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(mt.movesToMainline(), 3);
  });

  test('Rebase Test', function() {
    var initPos = [0];
    var sgf = '(;GM[1]AW[jj][jk][jl]AB[kk][kl]C[foo];' +
        'B[aa]C[bar];W[ab];B[ac];W[ad];B[ae];W[af]C[zed]' +
        '(;B[ag];W[ah];B[ai];W[aj])' +
        '(;B[ah];W[ai];B[aj];W[ak]))';
    var mt = glift.rules.movetree.getFromSgf(sgf, initPos);
    deepEqual(initPos, mt.treepathToHere());

    var newmt = mt.rebase();
    deepEqual(newmt.node().getNodeNum(), 0);
    deepEqual(newmt.node().getVarNum(), 0);
    deepEqual(newmt.properties().getAllValues('AW'), ['jj', 'jk' ,'jl']);
    deepEqual(newmt.properties().getAllValues('AB'), ['kk', 'kl' ,'aa']);
    deepEqual(newmt.properties().getOneValue('C'), 'bar');
    deepEqual(newmt.moveDown().properties().getOneValue('W'), 'ab');
    deepEqual(newmt.node().getNodeNum(), 1);
    deepEqual(newmt.node().getVarNum(), 0);

    newmt.moveDown()  // ac
        .moveDown()   // ad
        .moveDown()   // ae
        .moveDown()   // af
    deepEqual(newmt.properties().getOneValue('W'), 'af');
    deepEqual(newmt.properties().getOneValue('C'), 'zed');
    deepEqual(newmt.node().children.length, 2);
    deepEqual(newmt.node().getNodeNum(), 5);
  });

  test('Rebase Test: player set', function() {
    var mt = glift.rules.movetree.getFromSgf(testdata.sgfs.passingExample, 2);
    deepEqual(mt.getCurrentPlayer(), 'WHITE');
    mt = mt.rebase();
    deepEqual(mt.getCurrentPlayer(), 'WHITE');
  });

  test('Mainline Move Number', function() {
    var sgf = '(;GM[1];B[aa];W[bb](;B[cc];W[dd])(;B[cd];W[de]))'
    var mt = glift.rules.movetree.getFromSgf(sgf, '2');
    deepEqual(mt.properties().getOneValue('W'), 'bb');
    deepEqual(mt.getMainlineNode().getNodeNum(), 2)

    var mt = glift.rules.movetree.getFromSgf(sgf, [0,0,1,0]);
    deepEqual(mt.properties().getOneValue('W'), 'de');
    deepEqual(mt.getMainlineNode().getNodeNum(), 2)

    var mt = glift.rules.movetree.getFromSgf(sgf, [0,0,0]);
    deepEqual(mt.getMainlineNode().getNodeNum(), 3)

    // more examples....
    var simpleSgf = '(;GB[1];B[aa];W[bb])';
    mt = glift.rules.movetree.getFromSgf(sgf, '2');
    deepEqual(mt.getMainlineNode().getNodeNum(), 2);

    var mainpathSgf = '(;GB[1];B[aa];W[bb];B[cc];W[dd];B[ee];W[ff])';
    mt = glift.rules.movetree.getFromSgf(mainpathSgf, '1');
  });
})();
