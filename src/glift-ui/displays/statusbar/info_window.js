goog.provide('glift.displays.statusbar.InfoWindow');

/**
 * Creates an info window.  This isn't super useful on its own -- it's meant to
 * be populated with data.
 */
glift.displays.statusbar.infoWindow = function(
    wrapperDivId, bbox, theme, instanceId) {
  var suffix = '_info_window',
      newDivId = wrapperDivId + suffix + '_wrapper',
      wrapperDivEl = glift.dom.elem(wrapperDivId),
      fullBox = bbox;

  var newDiv = glift.dom.absBboxDiv(fullBox, newDivId);
  newDiv.css({'z-index': 100}); // ensure on top.

  var textDiv = glift.dom.newDiv(wrapperDivId + suffix + '_textdiv');
  var textDivCss = glift.util.obj.flatMerge({
      position: 'relative',
      margin: '0px',
      padding: '0px',
      'overflow-y': 'auto',
      height: fullBox.height() + 'px',
      width: fullBox.width() + 'px',
      MozBoxSizing: 'border-box',
      boxSizing: 'border-box'
    }, theme.textDiv);
  textDiv.css(textDivCss);

  var exitScreen = function() {
    newDiv.remove();
  };

  if (glift.platform.isMobile()) {
    textDiv.on('touchend', exitScreen);
  } else {
    textDiv.on('click', exitScreen);
  }

  var oldEscAction = glift.keyMappings.getFuncOrIcon(instanceId, 'ESCAPE');
  glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', function() {
    exitScreen();
    if (oldEscAction) {
      glift.keyMappings.registerKeyAction(instanceId, 'ESCAPE', oldEscAction);
    }
  });
  return new glift.displays.statusbar.InfoWindow(wrapperDivEl, newDiv, textDiv);
};

/**
 * Info Window wrapper class.
 *
 * @package
 * @constructor @final @struct
 */
glift.displays.statusbar.InfoWindow = function(
    wrapperDiv, baseStatusDiv, textDiv) {
  /**
   * Div that wraps both the baseDiv and the Text Div
   */
  this.wrapperDiv_ = wrapperDiv;

  /**
   * Div that defines all the dimensions and z-index
   */
  this.baseStatusDiv_ = baseStatusDiv;

  /**
   * Div where users are expected to put centent.
   */
  this.textDiv = textDiv;
};

glift.displays.statusbar.InfoWindow.prototype = {
  /** Finishes the Info Window by attaching all the elements. */
  finish: function() {
    this.baseStatusDiv_.append(this.textDiv);
    this.wrapperDiv_.prepend(this.baseStatusDiv_);
  }
};


