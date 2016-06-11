(function() {
  module('glift.api.widgetopt');

  // List of supported widget types in the Options rewrite.
  var supportedList = [
    glift.WidgetType.BOARD_EDITOR,
    glift.WidgetType.CORRECT_VARIATIONS_PROBLEM,
    glift.WidgetType.EXAMPLE,
    glift.WidgetType.GAME_VIEWER,
    glift.WidgetType.REDUCED_GAME_VIEWER,
    glift.WidgetType.STANDARD_PROBLEM,
  ];

  var keys = [
   'controllerFunc',
   'enableMousewheel',
   'icons',
   'keyMappings',
   'markLastMove',
   'problemConditions',
   'showVariations',
   'statusBarIcons',
   'stoneClick',
   'stoneMouseout',
   'stoneMouseover',
  ];

  test('widgetopt: Testing availability', function() {
    for (var i = 0; i < supportedList.length; i++) {
      var widgetType = supportedList[i];
      var wfn = glift.api.widgetopt[widgetType];
      ok(wfn, 'fn must be defined:' + widgetType);
      var w = wfn();
      ok(w, 'type must be defined:' + widgetType);
      for (var j = 0; j < keys.length; j++) {
        ok(keys[j] in w, 'key not present:' + keys[j]);
      }
    }
  });
})();
