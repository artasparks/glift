/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 */
glift.widgets.WidgetManager = function(sgfList, sgfListIndex, widgetOptions) {
  this.sgfList = sgfList;
  this.sgfListIndex = sgfListIndex;

  /**
   * Immptable widget options.
   */
  this.widgetOptions = widgetOptions;

  // Defined on draw
  this.currentWidget = undefined;
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    this.destroy();
    var that = this;
    this.getSgfString(function(sgfObj) {
      this.currentWidget = that.createWidget(sgfObj).draw();
    });
    return this;
  },

  /**
   * Get the current SGF Object from the SGF List.
   */
  getCurrentSgfObj: function() {
    var curSgfObj = this.sgfList[this.sgfListIndex];
    if (glift.util.typeOf(curSgfObj) === 'string') {
      var out = {};
      if (/^\s*\(;/.test(curSgfObj)) {
        // This is a standard SGF String.
        out.sgfString = curSgfObj;
      } else {
        // assume a URL.
        out.url = curSgfObj
      }
      curSgfObj = out;
    }
    var processedObj = glift.widgets.options.setSgfOptionDefaults(
        curSgfObj, this.widgetOptions);
    if (this.sgfList.length > 1) {
      processedObj.icons.push(this.widgetOptions.nextSgfIcon);
      processedObj.icons.splice(0, 0, this.widgetOptions.previousSgfIcon);
    }
    return processedObj;
  },

  /**
   * Get the SGF string.  Since these can be loaded with ajax, the data needs to
   * be returned with a callback.
   */
  getSgfString: function(callback) {
    var sgfObj = this.getCurrentSgfObj();
    if (sgfObj.url) {
      loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      callback(sgfObj);
    }
  },

  /**
   * Create a Sgf Widget.
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(sgfObj, this.widgetOptions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(options) {

  },

  _nextSgfInternal: function(index) {

  },

  nextSgf: function() { this._nextSgfInternal(1); },

  prevSgf: function() { this._nextSgfInternal(-1); },

  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
  },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    $.ajax({
      url: url,
      dataType: 'text',
      cache: false,
      success: function(data) {
        sgfObj.sgfString = data;
        callback(sgfObj);
      }
    });
  }
};
