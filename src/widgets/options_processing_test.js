(function() {
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

  test('Test processing metadata ', function() {
    var mgr = createNoDraw({
      sgf: {},
      divId: 'glift_display1',
    })
    deepEqual(mgr.metadata, undefined);
    deepEqual(mgr.getCurrentSgfObj().metadata, undefined);

    var mgr = createNoDraw({
      sgf: { metadata: 'zed' },
      divId: 'glift_display1',
      metadata: { foo: 'bar'}
    })
    deepEqual(mgr.metadata, {foo: 'bar'});
    deepEqual(mgr.getCurrentSgfObj().metadata, 'zed');
  });

  test('Test processing SGF mapping', function() {
    var testSgf = '(;GM[1]C[foo])';
    var mgr = createNoDraw({
      sgf: {
        alias: 'zed'
      },
      divId: 'glift_display1',
      sgfMapping: {
        zed: testSgf
      }
    });
    deepEqual(mgr.sgfCache['zed'], testSgf);
    mgr.loadSgfString(mgr.getSgfObj(0), function(obj) {
      deepEqual(obj.sgfString, testSgf);
    });
  })

  test('Test processing nextMovesPath', function() {
    var mgr = createNoDraw({
      sgf: {
        sgfString: '(;GM[1])',
        nextMovesPath: '0.0.0'
      }
    });
    var obj = mgr.getSgfObj(0);
    deepEqual(obj.nextMovesPath, '0.0.0');
  });
})();
