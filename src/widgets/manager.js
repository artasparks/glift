/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 */
glift.widgets.WidgetManager = function(
    sgfList, sgfListIndex, sgfDefaults, displayOptions) {
  this.sgfList = sgfList;
  this.sgfListIndex = sgfListIndex;
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;

  // Defined on draw
  this.currentWidget = undefined;
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    this.getSgfString(function(sgfObj) {
      // Prevent flickering by destroying after loading the SGF.
      that.destroy();
      that.currentWidget = that.createWidget(sgfObj).draw();
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
        curSgfObj, this.sgfDefaults);
    if (this.sgfList.length > 1) {
      processedObj.icons.push(this.displayOptions.nextSgfIcon);
      processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
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
      this.loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      callback(sgfObj);
    }
  },

  /**
   * Create a Sgf Widget.
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(sgfObj, this.displayOptions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget.destroy();
    sgfObj = glift.widgets.options.setSgfOptionDefaults(
        sgfObj, this.sgfDefaults);
    this.temporaryWidget = this.createWidget(sgfObj).draw();
  },

  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /**
   * Internal implementation of nextSgf/previous sgf..
   */
  _nextSgfInternal: function(indexChange) {
    if (!this.sgfList.length > 1) {
      return; // Nothing to do
    }
    this.sgfListIndex = (this.sgfListIndex + indexChange + this.sgfList.length)
        % this.sgfList.length;
    this.draw();
  },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  nextSgf: function() { this._nextSgfInternal(1); },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  prevSgf: function() { this._nextSgfInternal(-1); },

  /**
   * Undraw the most recent widget and remove references to it.
   */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
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
