goog.require('glift.displays.statusbar.StatusBar');

/**
 * Create a game info object. Takes a array of game info data.
 *
 * Note: Key bindings are set in the base_widget.
 */
// TODO(kashomon): Make into a first-class class.
glift.displays.statusbar.StatusBar.prototype.gameInfo =
    function(gameInfoArr, captureCount) {
  var infoWindow = glift.displays.statusbar.infoWindow(
      this.widget.wrapperDivId,
      this.positioning.fullWidgetBbox(),
      this.theme.statusBar.gameInfo,
      this.widget.manager.id);

  // This is a hack until a better solution for captures can be crafted for
  // displaying captured stones.
  var captureArr = [
    {displayName: 'Captured White Stones', value: captureCount.WHITE},
    {displayName: 'Captured Black Stones', value: captureCount.BLACK}
  ];

  gameInfoArr = captureArr.concat(gameInfoArr);

  var textArray = [];
  for (var i = 0; i < gameInfoArr.length; i++) {
    var obj = gameInfoArr[i];
    textArray.push('<strong>' + obj.displayName + ': </strong>' + obj.value);
  }

  var gameInfoTheme = this.theme.statusBar.gameInfo;
  infoWindow.textDiv
    .append(glift.dom.newElem('h3')
      .appendText('Game Info')
      .css(glift.util.obj.flatMerge(gameInfoTheme.textTitle, gameInfoTheme.text)))
    .append(glift.dom.convertText(textArray.join('\n'),
          false, /* useMarkdown */
          glift.util.obj.flatMerge(gameInfoTheme.textBody, gameInfoTheme.text)))
    .css({ padding: '10px'})
  infoWindow.finish()
};
