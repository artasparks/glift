glift.testUtil = {
  ptlistToMap: function(list) {
    var outMap = {};
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.value !== undefined) {
        outMap[item.point.hash()] = item; // LABEL
      } else {
        outMap[item.hash()] = item; // point
      }
    }
    return outMap;
  },

  assertFullDiv: function(divId) {
    ok(d3.selectAll('#' + divId + ' svg')[0].length !== 0,
        "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    deepEqual(d3.selectAll('#' + divId + ' svg')[0].length, 0 ,
        "Div should not contain contents");
  }
};
