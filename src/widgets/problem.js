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
    widget.sgfString = widget.sgfStringList[widget.sgfIndex];
    widget.draw();
  } else if (options.sgfUrlList.length > 0) {
    var url = widget.sgfUrlList[widget.sgfIndex]
    glift.widgets.loadWithAjax(url, function(data) {
      widget.sgfString = data;
      widget.draw();
    });
  } else {
    // assume sgfString is defined
    widget.draw();
  }
  // May be in a drawn or un-drawn state at this point, due to the asynchronous
  // nature of loading the SGFs.
  return widget;
};
