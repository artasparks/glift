// Util functions for running QUnit Tests
var testUtil = {
  ptlistToMap: function(list) {
    var outMap = {};
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.value !== undefined) {
        outMap[item.point.toString()] = item; // LABEL
      } else {
        outMap[item.toString()] = item; // point
      }
    }
    return outMap;
  },

  assertFullDiv: function(divId) {
    // really this is just non-empty...
    ok(glift.dom.elem(divId).html().length > 0, "Div should contain contents."
       + "  Was: " + glift.dom.elem(divId).html());
  },

  assertEmptyDiv: function(divId) {
    var contents = glift.dom.elem(divId).html();
    ok(contents.toString().length === 0,
        'Div should not contain contents. Instead was [' + contents + ']');
  }
};
