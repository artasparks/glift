/**
 * Create a Problem widget.  Optional callback for
 */
glift.widgets.problem = function(options) {
  // First overwrite with problem defaults.
  options = glift.widgets.options.setDefaults(options, 'problem');
  // Then overwrite with problem defaults.
  options = glift.widgets.options.setDefaults(options, 'base');
  if (options.enableFastClick) {
    glift.global.enableFastClick();
  }
  var widget = new glift.widgets._BaseWidget(options);
  if (options.sgfStringList.length > 0) {
    widget.options.sgfString = options.sgfStringList[0];
    widget.draw();
  } else if (options.sgfUrlList.length > 0) {
    $.get(options.sgfUrlList[0], function(data) {
      widget.options.sgfString = data;
      widget.draw();
    });
  }
  // May be in a drawn or un-drawn state at this point, due to the asynchronous
  // nature of loading the SGFs.
  return widget;
};
