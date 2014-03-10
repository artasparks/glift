/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 */
glift.widgets.WidgetManager = function(
    sgfList, sgfListIndex, allowWrapAround, sgfDefaults, displayOptions) {
  this.sgfList = sgfList;
  this.sgfListIndex = sgfListIndex;
  this.allowWrapAround = allowWrapAround
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;

  // Defined on draw
  this.currentWidget = undefined;

  // Cache of SGFs.  Useful for reducing the number AJAX calls.
  // Map from SGF name to String contents.
  this.sgfCache = {};
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    var curObj = this.getCurrentSgfObj();
    this.getSgfString(curObj, function(sgfObj) {
      // Prevent flickering by destroying the widget _after_ loading the SGF.
      that.destroy();
      that.currentWidget = that.createWidget(sgfObj).draw();
    });
    return this;
  },

  getCurrentWidget: function() {
    return this.currentWidget;
  },

  /**
   * Get the current SGF Object from the SGF List.
   */
  getCurrentSgfObj: function() {
    return this.getSgfObj(this.sgfListIndex);
  },

  /**
   * Modify the SgfOptions by resetting the icons settings.
   */
  _resetIcons: function(processedObj) {
    if (this.sgfList.length > 1) {
      if (this.allowWrapAround) {
        processedObj.icons.push(this.displayOptions.nextSgfIcon);
        processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
      } else {
        if (this.sgfListIndex === 0) {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
        } else if (this.sgfListIndex === this.sgfList.length - 1) {
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        } else {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        }
      }
    }
    return processedObj;
  },

  /**
   * Get the SGF Object from the sgfList.
   */
  getSgfObj: function(index) {
    if (index < 0 || index > this.sgfList.length) {
      throw new Error("Index [" + index +  " ] out of bounds."
          + " List size was " + this.sgfList.length);
    }
    var curSgfObj = this.sgfList[index];
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
    return this._resetIcons(processedObj);
  },

  /**
   * Get the SGF string.  Since these can be loaded with ajax, the data needs to
   * be returned with a callback.
   */
  getSgfString: function(sgfObj, callback) {
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
    if (this.allowWrapAround) {
      this.sgfListIndex = (this.sgfListIndex + indexChange + this.sgfList.length)
          % this.sgfList.length;
    } else {
      this.sgfListIndex = this.sgfListIndex + indexChange;
      if (this.sgfListIndex < 0) {
        this.sgfListIndex = 0;
      } else if (this.sgfListIndex >= this.sgfList.length) {
        this.sgfListIndex = this.sgfList.length - 1;
      }
    }
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
   * Clear out the SGF Cache.
   */
  clearSgfCache: function() {
    this.sgfCache = {};
  },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    if (url && this.sgfCache[url]) {
      sgfObj.sgfString = this.sgfCache[url];
      callback(sgfObj);
    } else {
      var that = this;
      $.ajax({
        url: url,
        dataType: 'text',
        cache: false,
        success: function(data) {
          that.sgfCache[url] = data;
          sgfObj.sgfString = data;
          callback(sgfObj);
        }
      });
    }
  },

  /**
   * Prepopulate the SGF Cache.
   */
  prepopulateCache: function(callback) {
    var done = 0;
    for (var i = 0; i < this.sgfList.length; i++) {
      var curObj = this.getSgfObj(i);
      this.getSgfString(curObj, function() {
        done += 1;
      });
    }

    var that = this;
    var checkDone = function(val) {
      if (val > 0 && done < that.sgfList.length) {
        window.setTimeout(function() {
          checkDone(val - 1);
        }, 500); // 500ms
      } else {
        callback();
      }
    };

    checkDone(3); // Check that we're finished prepopulating (3 checks)
  },

  /**
   * Undraw the most recent widget and remove references to it.
   */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    return this;
  }
};
