/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 *
 * divId: the element id of the div without the selector hash (#)
 * sgfCollection: array of sgf objects or a string URL. At creation time of the
 *    manager, The param sgfCollection may either be an array or a string
 *    representing a URL.  If the sgfCollection is a string, then the JSON is
 *    requsted at draw-time and passed to this.sgfCollection.
 * sgfColIndex: numbered index into the sgfCollection.
 * allowWrapAround: true or false.  Whether to allow wrap around in the SGF
 *    manager.
 * sgfDefaults: filled-in sgf default options.  See ./options/base_options.js
 * displayOptions: filled-in display options. See ./options/base_options.js
 * bookData: global book data.
 * actions: combination of stone actions and icon actions.
 */
glift.widgets.WidgetManager = function(divId, sgfCollection, sgfColIndex,
      allowWrapAround, sgfDefaults, displayOptions, bookData, actions) {
  // Globally unique ID, at least across all glift instances in the current
  // page. In theory, the divId should be globally unique, but might as well be
  // absolutely sure.
  this.id = divId + '-glift-' + glift.util.idGenerator.next();

  // Register the instance. Maybe should be its own method.
  glift.global.instanceRegistry[this.id] = this;

  // Set as active, if the active instance hasn't already been set.
  !glift.global.activeInstanceId && this.setActive();

  this.divId = divId;

  // Note: At creation time of the manager, The param sgfCollection may either
  // be an array or a string representing a URL.  If the sgfCollection is a
  // string, then the JSON is requsted at draw-time and passed to
  // this.sgfCollection
  this.sgfCollection = [];
  this.sgfCollectionUrl = null;

  // Suppert either explicit arrays or URLs for fetching JSON.
  if (glift.util.typeOf(sgfCollection) === 'string') { 
    this.sgfCollectionUrl = sgfCollection;
  } else {
    this.sgfCollection = sgfCollection;
  }

  this.sgfColIndex = sgfColIndex;
  this.allowWrapAround = allowWrapAround
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;
  this.bookData = bookData;
  this.actions = actions;

  // Defined on draw
  this.currentWidget = undefined;

  // Cache of SGFs.  Useful for reducing the number AJAX calls.
  // Map from SGF name to String contents.
  this.sgfCache = {};
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    var afterCollectionLoad = function() {
      var curObj = this.getCurrentSgfObj();
      this.getSgfString(curObj, function(sgfObj) {
        // Prevent flickering by destroying the widget after loading the SGF.
        this.destroy();
        this.currentWidget = this.createWidget(sgfObj).draw();
      }.bind(this));
    }.bind(this);

    if (this.sgfCollection.length === 0 && this.sgfCollectionUrl) {
      glift.ajax.get(this.sgfCollectionUrl, function(data) {
        this.sgfCollection = JSON.parse(data);
        afterCollectionLoad();
      }.bind(this));
    } else {
      afterCollectionLoad();
    }
    return this;
  },

  /** Redraws the current widget. */
  redraw: function() {
    this.getCurrentWidget() && this.getCurrentWidget().redraw();
  },

  /** Set as the active widget in the global registry. */
  setActive: function() {glift.global.activeInstanceId = this.id; },

  /** Gets the current widget object. */
  getCurrentWidget: function() { 
    if (this.temporaryWidget) {
      return this.temporaryWidget;
    } else {
      return this.currentWidget; 
    }
  },

  /** Gets the current SGF Object from the SGF collection. */
  getCurrentSgfObj: function() { return this.getSgfObj(this.sgfColIndex); },

  /** Modifies the SgfOptions by resetting the icons settings. */
  _resetIcons: function(processedObj) {
    if (this.sgfCollection.length > 1) {
      if (this.allowWrapAround) {
        processedObj.icons.push(this.displayOptions.nextSgfIcon);
        processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
      } else {
        if (this.sgfColIndex === 0) {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
        } else if (this.sgfColIndex === this.sgfCollection.length - 1) {
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        } else {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        }
      }
    }
    return processedObj;
  },

  /** Get the current SGF Object from the sgfCollection. */
  getSgfObj: function(index) {
    if (index < 0 || index > this.sgfCollection.length) {
      throw new Error("Index [" + index +  " ] out of bounds."
          + " List size was " + this.sgfCollection.length);
    }
    var curSgfObj = this.sgfCollection[index];
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
    var proc = glift.widgets.options.setSgfOptions(curSgfObj, this.sgfDefaults);
    return this._resetIcons(proc);
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

  /** Create a Sgf Widget. */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(
        this.divId, sgfObj, this.displayOptions, this.actions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget && this.currentWidget.destroy();
    sgfObj = glift.widgets.options.setSgfOptions(sgfObj, this.sgfDefaults);
    this.temporaryWidget = this.createWidget(sgfObj).draw();
  },

  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /** Internal implementation of nextSgf/previous sgf. */
  _nextSgfInternal: function(indexChange) {
    if (!this.sgfCollection.length > 1) {
      return; // Nothing to do
    }
    if (this.allowWrapAround) {
      this.sgfColIndex = (this.sgfColIndex + indexChange + this.sgfCollection.length)
          % this.sgfCollection.length;
    } else {
      this.sgfColIndex = this.sgfColIndex + indexChange;
      if (this.sgfColIndex < 0) {
        this.sgfColIndex = 0;
      } else if (this.sgfColIndex >= this.sgfCollection.length) {
        this.sgfColIndex = this.sgfCollection.length - 1;
      }
    }
    this.draw();
  },

  /** Get the next SGF.  Requires that the list be non-empty. */
  nextSgf: function() { this._nextSgfInternal(1); },

  /** Get the next SGF.  Requires that the list be non-empty. */
  prevSgf: function() { this._nextSgfInternal(-1); },

  /** Clear out the SGF Cache. */
  clearSgfCache: function() { this.sgfCache = {}; },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    if (url && this.sgfCache[url]) {
      sgfObj.sgfString = this.sgfCache[url];
      callback(sgfObj);
    } else {
      glift.ajax.get(url, function(data) {
        this.sgfCache[url] = data;
        sgfObj.sgfString = data;
        callback(sgfObj);
      }.bind(this));
    }
  },

  /** Prepopulate the SGF Cache. */
  prepopulateCache: function(callback) {
    var done = 0;
    for (var i = 0; i < this.sgfCollection.length; i++) {
      var curObj = this.getSgfObj(i);
      this.getSgfString(curObj, function() {
        done += 1;
      });
    }

    var checkDone = function(val) {
      if (val > 0 && done < this.sgfCollection.length) {
        window.setTimeout(function() {
          checkDone(val - 1);
        }, 500); // 500ms to try again to see if complete.
      } else {
        callback();
      }
    }.bind(this);
    checkDone(3); // Check that we've finished: (3 checks, 1.5s max time)
  },

  /** Undraw the most recent widget and remove references to it. */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    return this;
  }
};
