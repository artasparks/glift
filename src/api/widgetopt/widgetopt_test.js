(function() {
  module('glift.api.widgetopt');

  // List of supported widget types in the Options rewrite.
  var supportedList = [
    glift.enums.widgetTypes.BOARD_EDITOR,
    glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM,
    glift.enums.widgetTypes.EXAMPLE,
    glift.enums.widgetTypes.GAME_VIEWER,
    glift.enums.widgetTypes.REDUCED_GAME_VIEWER,
    glift.enums.widgetTypes.STANDARD_PROBLEM,
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
      var w = glift.api.widgetopt[widgetType];
      ok(w, 'type must be defined:' + widgetType);
      for (var j = 0; j < keys.length; j++) {
        ok(keys[j] in w, 'key not present:' + keys[j]);
      }
    }
  });
})();
