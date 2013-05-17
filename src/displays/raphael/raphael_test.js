glift.displays.raphaelTest = function() {
  module("Raphael Tests");
  var util = glift.util,
      enums = glift.enums,
      none = util.none,
      DEFAULT = 'DEFAULT'
      boardRegions = glift.enums.boardRegions,
      raphael = glift.displays.raphael,
      env = glift.displays.environment.get({}), // divId: glift_display.
      display = raphael.create(env, DEFAULT).init(),
      displayPaper = display.paper(),

      // Utility methods
      getAllElements = function(paper) {
        var list = [];
        paper.forEach(function (el) {
          list.push(el);
        });
        return list;
      },
      assertEmptyPaper = function() {
        var elems = getAllElements(displayPaper);
        deepEqual(elems.length, 0, "Paper should have been emptied");
      };

  test("Create/Destroy base board box", function() {
    var board = display.createBoardBase();
    ok(board.rect !== none);
    board.destroy();
    assertEmptyPaper();
  });

  test("Create/Destroy board lines", function() {
    var lines = display.createBoardLines();
    ok(lines.horzSet !== none);
    ok(lines.horzSet !== undefined);
    ok(lines.vertSet !== none);
    ok(lines.vertSet !== undefined);
    lines.destroy();
    assertEmptyPaper();
  });

  // test("Create/Destroy stones", function() {
    // // Contents
  // });

  test("Create/Destroy star points", function() {
    var starPoints = display.createBoardLines();
    ok(starPoints.starSet !== none);
    starPoints.destroy();
    assertEmptyPaper();
  });

  test("Remove Paper", function() {
    ok($('#glift_display').text() !== '');
    display.destroy();
    deepEqual($('#glift_display').text(), '');
  });
};
