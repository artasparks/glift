glift.widgets.optionsProcessingTest = function() {
  module('glift.widgets.optionsProcessingTest');
  var createNoDraw = glift.widgets.createNoDraw;

  test('Test sgf and sgfList: Should throw an error', function() {
    throws(function() {
      var mgr = createNoDraw({
        sgfCollection:  ['foo','bar'],
        sgf:  'Zam'
      }, Error)
    });
  });

  test('Test basic sgf collection', function() {
    var mgr = createNoDraw({
      sgfCollection: [{
        sgf: 'foo'
      },{
        sgf: 'bar'
      }]
    });
    deepEqual(mgr.sgfCollection.length, 2);
  });

  test('Test processing editor options', function() {
    var mgr = createNoDraw({
      sgf: {},
      divId: 'glift_display1',
      sgfDefaults: { widgetType: 'BOARD_EDITOR' },
      display: {
        theme: 'DEPTH',
        goBoardBackground: '../themes/assets/bambootile_warm.jpg'
      }
    });
    deepEqual(mgr.divId, 'glift_display1');
    deepEqual(mgr.sgfDefaults.widgetType, 'BOARD_EDITOR');
    deepEqual(mgr.displayOptions.theme, 'DEPTH');
    deepEqual(mgr.displayOptions.goBoardBackground,
        '../themes/assets/bambootile_warm.jpg');
  });
};
