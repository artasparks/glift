glift.rules.movetreeTest = function() {
  module("Movetree Tests");
  var movetree = glift.rules.movetree;
  var sgfs = testdata.sgfs;
  var util = glift.util;
  test("that parsing works", function() {
    movetree.getFromSgf(sgfs.veryeasy)
    ok(true, "shouldn't throw an exception (a significant test!)");
  });

  test("that property retrieval works", function() {
    var mt = movetree.getFromSgf(sgfs.veryeasy);
    deepEqual(mt.node().getNodeNum(), 0, 'movenum');
    var prop = mt.properties().getOneValue("FF");
    ok(mt.properties().contains("FF"),
        "should return true for an existing prop");
    deepEqual(prop, "4", "should get an existing property");

    ok(!mt.properties().contains("ZZ"),
        "should return false for non-real prop");
    deepEqual(mt.properties().getAllValues("ZZ"), null,
        "should return nothing for a non-real prop");

    ok(!mt.properties().contains("B"),
        "should return false for non-existent prop");
    deepEqual(mt.properties().getAllValues("B"), null,
        "should return nothing for a non-existent prop");
  });

  test("Test that property retrieval for multiple props works", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.properties().getAllValues("AB")[1], "qa",
        "Should get the second property");
    deepEqual(mt.properties().getAllValues("AW").toString(),
        ["pa", "pb", "sb", "pc", "qc", "sc", "qd","rd", "sd"].toString(),
        "should get a list of values");
  });

  test("that sgf point conversion works", function() {
    var pt = glift.util.pointFromSgfCoord("ac");
    deepEqual(pt.x(), 0, "pt.x");
    deepEqual(pt.y(), 2, "pt.y");
    deepEqual(glift.sgf.pointToSgfCoord(pt), "ac", "pt to sgf coord");
  });

  test("that moving up / down works correctly", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.node().getNodeNum(), 0, 'move num beg');
    deepEqual(mt.node().getVarNum(), 0, 'var num beg');
    deepEqual(mt.node().numChildren(), 3, 'next nodes beg');

    mt.moveDown();
    deepEqual(mt.node().getNodeNum(), 1, 'move num md_1');
    deepEqual(mt.node().getVarNum(), 0, 'var num md_1');
    deepEqual(mt.node().numChildren(), 1, 'next nodes md_1');
    deepEqual(mt.properties().getOneValue("B"), "sa", "stoneMove");

    mt.moveUp();
    deepEqual(mt.node().getNodeNum(), 0, 'move num');
    deepEqual(mt.node().getVarNum(), 0, 'var num');
    deepEqual(mt.node().numChildren(), 3, 'next nodes');

    mt.moveDown(1);
    deepEqual(mt.node().getNodeNum(), 1, 'move num');
    deepEqual(mt.node().getVarNum(), 1, 'var num');
    deepEqual(mt.node().numChildren(), 1, 'next nodes');
    deepEqual(mt.properties().getOneValue("B"), "ra", "stoneMove");
  });

  test("that edge case of moving up: only one move left - works."
      + "In other words, don't remove the last move", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    mt.moveUp();
    deepEqual(mt.node().getNodeNum(), 0, 'move num');
    deepEqual(mt.node().getVarNum(), 0, 'var num');
    deepEqual(mt.node().numChildren(), 3, 'next nodes');
  });

  test("Test that deleting a property works", function() {
    var mt = movetree.getFromSgf(sgfs.veryeasy);
    deepEqual(mt.properties().getOneValue("AP"), "CGoban:3",
        "should get the AP prop");
    deepEqual(mt.properties().remove("AP")[0],
        "CGoban:3", "should delete the prop");
    ok(!mt.properties().contains("AP"), "Prop shouldn't exist anymore");
  });

  test("Test that adding properties works", function() {
    var movt = movetree.getFromSgf(sgfs.veryeasy);
    movt.properties()
        .set("C", "foo")
        .add("EV", "tourny");
    deepEqual(movt.properties().getOneValue("C"), "foo",
        "Should get the correct comment");
    deepEqual(movt.properties().getOneValue("EV"), "tourny",
        "Chaining should work");
  });

  test("Adding Nodes Works", function() {
    var movt = movetree.getInstance();
    movt.properties()
        .add("C", "0th")
        .add("EV", "AOEU");
    movt.addNode()
        .properties().add("C", "1.0");
    movt.moveUp()
        .addNode()
        .properties().add("C", "1.1");
    movt.moveToRoot();

    deepEqual(movt.properties().getOneValue("C"), "0th",
        "Should get the correct comment");
    deepEqual(movt.node().getNodeNum(), 0, "Should get the move num");
    deepEqual(movt.node().getVarNum(), 0, "Should get the var num");

    movt.moveDown()
    deepEqual(movt.properties().getOneValue("C"), "1.0",
        "Should get the correct comment");
    deepEqual(movt.node().getNodeNum(), 1, "Should get the move num");
    deepEqual(movt.node().getVarNum(), 0, "Should get the var num");

    movt.moveUp()
    movt.moveDown(1)
    deepEqual(movt.properties().getOneValue("C"), "1.1",
        "Should get the correct comment");
    deepEqual(movt.node().getNodeNum(), 1,
        "Should get the move num");
    deepEqual(movt.node().getVarNum(), 1,
        "Should get the var num");
  });

  test("Get Property as a Point", function() {
    var movt = movetree.getInstance();
    movt.properties()
        .add("C", "0th")
        .add("EV", "AOEU");
    movt.addNode().properties()
        .add("B", "pb");
    deepEqual(movt.properties().getAsPoint("B").x(), 15,
        "Should get and covert the x coord correctly");
    deepEqual(movt.properties().getAsPoint("B").y(), 1,
        "Should get and covert the y coord correctly");
  });

  test("Recursing through the nodes works", function() {
    var movt = movetree.getInstance(),
        conv = glift.util.pointFromSgfCoord,
        expected = [
            'b_' + conv('pb'),
            'w_' + conv('nc'),
            'b_' + conv('cc'),
            'b_' + conv('dd')],
        output = [];

    movt.properties().add("C", "0th").add("EV", "AOEU");
    movt.addNode().properties().add("B", "pb");
    movt.addNode().properties().add("W", "nc");
    movt.addNode().properties().add("B", "cc");
    movt.moveToRoot()
        .addNode().properties().add("B", "dd");
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

  test("Next Moves", function() {
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

  test("Convert to SGF! (No exceptions)", function() {
    var sgf = glift.rules.movetree.getFromSgf(sgfs.complexproblem).toSgf();
    ok(sgf !== undefined);
  });

  test("Convert to SGF - comment", function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('C','Comment');
    deepEqual(mt.toSgf(), '(;C[Comment])');
  });

  test("Convert to SGF - multi prop", function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('AW', ['ab','bb']);
    deepEqual(mt.toSgf(), '(;AW[ab][bb])');
  });

  test("Convert to SGF - variation", function() {
    var mt = glift.rules.movetree.getInstance();
    mt.properties().add('C', 'Foo');
    mt.node().addChild();
    mt.moveDown(0).properties().add('B', 'ab');
    mt.moveUp();
    mt.node().addChild();
    mt.moveDown(1).properties().add('B', 'bb');
    deepEqual(mt.toSgf(), '(;C[Foo]\n(;B[ab])\n(;B[bb]))');
  });

  test("getCurrentPlayer Complex", function() {
    var states = glift.enums.states
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
};
