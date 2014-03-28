glift.widgets.optionsProcessingTest = function() {
  module('Options processing tests');
  var createNoDraw = glift.widgets.createNoDraw;

  test('Test sgf and sgfList: Should throw an error', function() {
    throws(function() {
      var mgr = createNoDraw({
        sgfList:  ['foo','bar'],
        sgf:  'Zam'
      }, Error)
    });
  });

  test('Test processing book data', function() {
    var mgr = createNoDraw({
      sgfList: [{
        sgf: 'foo',
        bookData: {
          chapterTitle: 'Foo chapter',
          diagramSize: 'large'
        }
      },{
        sgf: 'bar',
        bookData: {
          chapterTitle: 'Bar chapter',
          diagramSize: 'small'
        }
      }],
      globalBookData: {
        title: 'My book',
        author: 'Kashomon'
      }
    });
    deepEqual(mgr.sgfList.length, 2);
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
