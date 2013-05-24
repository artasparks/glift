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
    deepEqual(mt.getNode().getNodeNum(), 0, 'movenum');
    var prop = mt.getProperties().getDatum("FF");
    ok(mt.getProperties().contains("FF"),
        "should return true for an existing prop");
    deepEqual(prop, "4", "should get an existing property");

    ok(!mt.getProperties().contains("ZZ"),
        "should return false for non-real prop");
    deepEqual(mt.getProperties().get("ZZ"), util.none,
        "should return nothing for a non-real prop");

    ok(!mt.getProperties().contains("B"),
        "should return false for non-existent prop");
    deepEqual(mt.getProperties().get("B"), util.none,
        "should return nothing for a non-existent prop");
  });

  test("Test that property retrieval for multiple props works", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.getProperties().get("AB")[1], "qa",
        "Should get the second property");
    deepEqual(mt.getProperties().get("AW").toString(),
        ["pa", "pb", "sb", "pc", "qc", "sc", "qd","rd", "sd"].toString(),
        "should get a list of values");
  });

  test("that sgf point conversion works", function() {
    var pt = glift.sgf.sgfCoordToPoint("ac");
    deepEqual(pt.x(), 0, "pt.x");
    deepEqual(pt.y(), 2, "pt.y");
    deepEqual(glift.sgf.pointToSgfCoord(pt), "ac", "pt to sgf coord");
  });

  test("that moving up / down works correctly", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    deepEqual(mt.getNode().getNodeNum(), 0, 'move num');
    deepEqual(mt.getNode().getVarNum(), 0, 'var num');
    deepEqual(mt.getNode().numChildren(), 3, 'next nodes');

    mt.moveDown();
    deepEqual(mt.getNode().getNodeNum(), 1, 'move num');
    deepEqual(mt.getNode().getVarNum(), 0, 'var num');
    deepEqual(mt.getNode().numChildren(), 1, 'next nodes');
    deepEqual(mt.getProperties().getDatum("B"), "sa", "stoneMove");

    mt.moveUp();
    deepEqual(mt.getNode().getNodeNum(), 0, 'move num');
    deepEqual(mt.getNode().getVarNum(), 0, 'var num');
    deepEqual(mt.getNode().numChildren(), 3, 'next nodes');

    mt.moveDown(1);
    deepEqual(mt.getNode().getNodeNum(), 1, 'move num');
    deepEqual(mt.getNode().getVarNum(), 1, 'var num');
    deepEqual(mt.getNode().numChildren(), 1, 'next nodes');
    deepEqual(mt.getProperties().getDatum("B"), "ra", "stoneMove");
  });

  test("that edge case of moving up: only one move left - works."
      + "In other words, don't remove the last move", function() {
    var mt = movetree.getFromSgf(sgfs.easy);
    mt.moveUp();
    deepEqual(mt.getNode().getNodeNum(), 0, 'move num');
    deepEqual(mt.getNode().getVarNum(), 0, 'var num');
    deepEqual(mt.getNode().numChildren(), 3, 'next nodes');
  });

  test("Test that deleting a property works", function() {
    var mt = movetree.getFromSgf(sgfs.veryeasy);
    deepEqual(mt.getProperties().getDatum("AP"), "CGoban:3",
        "should get the AP prop");
    deepEqual(mt.getProperties().remove("AP")[0],
        "CGoban:3", "should delete the prop");
    ok(!mt.getProperties().contains("AP"), "Prop shouldn't exist anymore");
  });

  test("Test that adding properties works", function() {
    var movt = movetree.getFromSgf(sgfs.veryeasy);
    movt.getProperties()
        .add("C", "foo")
        .add("EV", "tourny");
    deepEqual(movt.getProperties().getDatum("C"), "foo",
        "Should get the correct comment");
    deepEqual(movt.getProperties().getDatum("EV"), "tourny",
        "Chaining should work");
  });

  test("Adding Nodes Works", function() {
    var movt = movetree.getInstance();
    movt.getProperties()
        .add("C", "0th")
        .add("EV", "AOEU");
    movt.addNewNode()
        .getProperties().add("C", "1.0");
    movt.moveUp()
        .addNewNode()
        .getProperties().add("C", "1.1");
    movt.moveToRoot();

    deepEqual(movt.getProperties().getDatum("C"), "0th",
        "Should get the correct comment");
    deepEqual(movt.getNode().getNodeNum(), 0, "Should get the move num");
    deepEqual(movt.getNode().getVarNum(), 0, "Should get the var num");

    movt.moveDown()
    deepEqual(movt.getProperties().getDatum("C"), "1.0",
        "Should get the correct comment");
    deepEqual(movt.getNode().getNodeNum(), 1, "Should get the move num");
    deepEqual(movt.getNode().getVarNum(), 0, "Should get the var num");

    movt.moveUp()
    movt.moveDown(1)
    deepEqual(movt.getProperties().getDatum("C"), "1.1",
        "Should get the correct comment");
    deepEqual(movt.getNode().getNodeNum(), 1,
        "Should get the move num");
    deepEqual(movt.getNode().getVarNum(), 1,
        "Should get the var num");
  });

  test("Get Property as a Point", function() {
    var movt = movetree.getInstance();
    movt.getProperties()
        .add("C", "0th")
        .add("EV", "AOEU");
    movt.addNewNode().getProperties()
        .add("B", "pb");
    deepEqual(movt.getProperties().getAsPoint("B").x(), 15,
        "Should get and covert the x coord correctly");
    deepEqual(movt.getProperties().getAsPoint("B").y(), 1,
        "Should get and covert the y coord correctly");
  });

  test("Recursing through the nodes works", function() {
    var movt = movetree.getInstance(),
        conv = glift.sgf.sgfCoordToPoint,
        expected = [
            'b_' + conv('pb'),
            'w_' + conv('nc'),
            'b_' + conv('cc'),
            'b_' + conv('dd')],
        output = [];

    movt.getProperties().add("C", "0th").add("EV", "AOEU");
    movt.addNewNode().getProperties().add("B", "pb");
    movt.addNewNode().getProperties().add("W", "nc");
    movt.addNewNode().getProperties().add("B", "cc");
    movt.moveToRoot()
        .addNewNode().getProperties().add("B", "dd");
    movt.recurseFromRoot(function(mt) {
      var buff = '';
      if (mt.getProperties().contains('B')) {
        buff = 'b_' + mt.getProperties().getAsPoint('B');
      } else if (mt.getProperties().contains('W')) {
        buff = 'w_' + mt.getProperties().getAsPoint('W');
      }
      if (buff !== '') output.push(buff);
    });
    deepEqual(output.toString(), expected.toString(),
        'simple DFS recursing should work');
  });

  test("IsCorrectPosition: trivial correctness", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.trivialproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(movt.isCorrectPosition(), problemResults.CORRECT,
        "Starting position must be correct");
  });

  test("IsCorrectPosition: Make sure it works for simple cases", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    movt.moveDown(0);
    deepEqual(movt.isCorrectPosition(), problemResults.INCORRECT,
        "Must return incorrect");
    movt.moveUp().moveDown(1);
    deepEqual(movt.isCorrectPosition(), problemResults.CORRECT,
        "Must return correct if a move is correct");
  });

  test("IsCorrectPosition: Indeterminate first position", function() {
    var movt = glift.rules.movetree.getFromSgf(sgfs.realproblem),
        problemResults = glift.enums.problemResults;
    deepEqual(movt.isCorrectPosition(), problemResults.INDETERMINATE,
        "Starting position must be indeterminate");
  });
};
