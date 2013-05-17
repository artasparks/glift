glift.displays.raphaelTest = function() {
  module("Raphael Tests");
  var util = glift.util,
      enums = glift.enums,
      DEFAULT = 'DEFAULT'
      boardRegions = glift.enums.boardRegions,
      raphael = glift.displays.raphael,
      env = glift.displays.environment.get({}), // Default divId: glift_display.
      display = raphael.create(env, DEFAULT).init();

  test("Create/Destory base board box", function() {
    var board = display.createBoardBase().draw();
    ok(board.rect !== undefined);
    var id = board.rect.id;
    board.destroy();
    var elems = getAllElements(board.paper);
    deepEqual(elems.length, 0);
  });

  test("Remove Paper", function() {
    ok($('#glift_display').text() !== '');
    display.destroy();
    deepEqual($('#glift_display').text(), '');
  });

  var getAllElements = function(paper) {
    var list = []
    paper.forEach(function (el) {
      list.push(el);
    });
    return list;
  }
};
