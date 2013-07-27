glift.displays.gui.splitTest = function() {
  module("Split TestTests");
  var divId = 'split_div_id'
  var splitDiv = glift.displays.gui.splitDiv;
  var baseWidth = 300;
  var baseHeight = 400;
  var startup = function() {
    $('body').append('<div id = "' + divId + '"></div>')
    $('#' + divId).css({
        'position': 'relative',
        'height': baseHeight + 'px',
        'width': baseWidth + 'px',
        'float': 'left',
        'top': 0
      });
  };

  var teardown = function() {
    d3.select('#' + divId).remove();
  };

  test("Test Simple Horizontal Split", function() {
    startup();
    var out = splitDiv(divId, [.5], 'horizontal');
    deepEqual(out.length, 2, 'number of divs return');
    deepEqual(out[0].length, baseHeight / 2);
    deepEqual(out[0].start, 0);
    deepEqual(out[1].length, baseHeight / 2);
    deepEqual(out[1].start, baseHeight / 2);
    deepEqual($('#' + out[0].id).height(), out[0].length);
    deepEqual($('#' + out[1].id).height(), out[1].length);
    teardown();
  });

  test("Test Simple Horizontal Split: .5, .25, .25", function() {
    startup();
    var out = splitDiv(divId, [.5, .25], 'horizontal');
    deepEqual(out.length, 3, 'number of divs return');
    deepEqual(out[0].length, baseHeight / 2);
    deepEqual(out[0].start, 0);
    deepEqual(out[1].length, baseHeight / 4);
    deepEqual(out[1].start, baseHeight / 2);
    deepEqual(out[2].length, baseHeight / 4);
    deepEqual(out[2].start, baseHeight * 3/4);
    deepEqual($('#' + out[0].id).height(), out[0].length);
    deepEqual($('#' + out[1].id).height(), out[1].length);
    deepEqual($('#' + out[2].id).height(), out[2].length);
    teardown();
  });

  test("Test Simple Vertical Split: .5, .5", function() {
    startup();
    var out = splitDiv(divId, [.5], 'vertical');
    deepEqual(out.length, 2, 'number of divs return');
    deepEqual(out[0].length, baseWidth / 2);
    deepEqual(out[0].start, 0);
    deepEqual(out[1].length, baseWidth / 2);
    deepEqual(out[1].start, baseWidth / 2);
    deepEqual($('#' + out[0].id).width(), out[0].length);
    deepEqual($('#' + out[1].id).width(), out[1].length);
  });
};
