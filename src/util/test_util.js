glift.testUtil = {
  assertFullDiv: function(divId) {
    ok(d3.selectAll('#' + divId + ' svg')[0].length !== 0,
        "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    deepEqual(d3.selectAll('#' + divId + ' svg')[0].length, 0 ,
        "Div should not contain contents");
  }
};
