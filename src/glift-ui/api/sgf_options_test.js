(function() {
  module('glift.api.SgfOptions');

  test('SgfOption Defaults: no options', function() {
    var o = new glift.api.SgfOptions();
    deepEqual(o, new glift.api.SgfOptions({
      sgfString: undefined,
      url: undefined,
      alias: undefined,
      parseType: glift.parse.parseType.SGF,
      widgetType: glift.WidgetType.GAME_VIEWER,
      initialPosition: '',
      boardRegion: glift.enums.boardRegions.AUTO,
      nextMovesPath: '',
      rotation: glift.enums.rotations.NO_ROTATION,
      problemConditions: {
        GB: [],
        C: ['Correct', 'is correct', 'is the correct']
      },
      keyMappings: {
        ARROW_LEFT: 'iconActions.chevron-left.click',
        ARROW_RIGHT: 'iconActions.chevron-right.click'
      },
      uiComponents: [
        glift.BoardComponent.BOARD,
        glift.BoardComponent.COMMENT_BOX,
        glift.BoardComponent.STATUS_BAR,
        glift.BoardComponent.ICONBAR
      ],
      disableStatusBar: false,
      disableBoard: false,
      disableCommentBox: false,
      disableIconBar: false,
      statusBarIcons: undefined,
      metadata: undefined,
      correctVariationsResetTime: undefined,
      totalCorrectVariationsOverride: undefined,
      showVariations: glift.enums.showVariations.MORE_THAN_ONE,
      markLastMove: true,
      controllerFunc: undefined,
      icons: undefined,
      stoneClick: undefined,
      stoneMouseover: undefined,
      stoneMouseout: undefined,
    }));
  });

  test('Setting an option: board region', function() {
    var expected = new glift.api.SgfOptions();
    expected.boardRegion = glift.enums.boardRegions.TOP_RIGHT;

    var newo = new glift.api.SgfOptions({
      boardRegion: glift.enums.boardRegions.TOP_RIGHT
    });

    deepEqual(newo, expected);
  });
})();
