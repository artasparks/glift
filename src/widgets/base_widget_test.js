(function() {
  module('glift.widgets.baseWidgetTests');
  var divId = 'zed';
  var defaultSgfOptions = new glift.api.SgfOptions();
  var manager = glift.api.createNoDraw(defaultSgfOptions);
  var baseWidget = manager.createWidget(defaultSgfOptions);

  test('Create widget', function() {
    ok(baseWidget, 'must be defined');
  });

  test('Remove ui components', function() {
    var uic = glift.enums.boardComponents;
    var comp = baseWidget.getUiComponents_(defaultSgfOptions)
    deepEqual(defaultSgfOptions.uiComponents, [
      uic.BOARD,
      uic.COMMENT_BOX,
      uic.STATUS_BAR,
      uic.ICONBAR,
    ]);

    var comp = baseWidget.getUiComponents_(new glift.api.SgfOptions({
      disableCommentBox: true
    }));
    deepEqual([uic.BOARD, uic.STATUS_BAR, uic.ICONBAR], comp);

    var comp = baseWidget.getUiComponents_(new glift.api.SgfOptions({
      disableIconBar: true
    }));
    deepEqual([uic.BOARD, uic.COMMENT_BOX, uic.STATUS_BAR], comp);

    var comp = baseWidget.getUiComponents_(new glift.api.SgfOptions({
      disableStatusBar: true
    }));
    deepEqual([uic.BOARD, uic.COMMENT_BOX, uic.ICONBAR], comp);
  });
})();
