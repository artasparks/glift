/**
 * Create a game info object. Takes a array of game info data.
 *
 * Note: Key bindings are set in the base_widget.
 */
glift.displays.statusbar._StatusBar.prototype.gameInfo =
    function(gameInfoArr, captureCount) {
  var wrapperDivId = this.widget.wrapperDivId,
      suffix = '_gameinfo',
      newDivId = wrapperDivId + suffix + '_wrapper',
      wrapperDivEl = glift.dom.elem(wrapperDivId),
      gameInfoTheme = this.theme.statusBar.gameInfo,
      fullBox = this.positioning.fullWidgetBbox();

  var newDiv = glift.dom.absBboxDiv(fullBox, newDivId);
  newDiv.css({'z-index': 100}); //

  var textDiv = glift.dom.newDiv(wrapperDivId + suffix + '_textdiv');
  var textDivCss = glift.obj.flatMerge({
      position: 'relative',
      margin: '0px',
      padding: '0px',
      'overflow-y': 'auto',
      height: fullBox.height() + 'px',
      width: fullBox.width() + 'px',
      MozBoxSizing: 'border-box',
      boxSizing: 'border-box'
    }, gameInfoTheme.textDiv);

  textDiv.css(textDivCss);

  var exitScreen = function() {
    newDiv.remove();
  };
  if (glift.platform.isMobile()) {
    textDiv.on('touchend', exitScreen);
  } else {
    textDiv.on('click', exitScreen);
  }

  var instanceId = this.widget.manager.id;
  var oldEscAction = glift.keyMappings.getFuncOrIcon(instanceId, 'ESCAPE');
  glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', function() {
    exitScreen();
    if (oldEscAction) {
      glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', oldEscAction);
    }
  });

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

  textDiv
    .append(glift.dom.newElem('h3')
      .appendText('Game Info')
      .css(glift.obj.flatMerge(gameInfoTheme.textTitle, gameInfoTheme.text)))
    .append(glift.dom.convertText(textArray.join('\n'),
          glift.obj.flatMerge(gameInfoTheme.textBody, gameInfoTheme.text)))
    .css({ padding: '10px'})
  newDiv.append(textDiv);
  wrapperDivEl.prepend(newDiv);
};
