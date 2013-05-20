glift.testUtil = {
  getAllElements: function(paper) {
    var list = [];
    paper.forEach(function (el) {
      list.push(el);
    });
    return list;
  },

  assertEmptyPaper: function(paper) {
    var elems = glift.testUtil.getAllElements(paper);
    deepEqual(elems.length, 0, "Paper should have been emptied");
  },

  assertFullDiv: function(divId) {
    ok($('#' + divId).text() !== '', "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    deepEqual($('#' + divId ).text(), '', "Div should not contain contents");
  }
};
