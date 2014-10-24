/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 *
 * divId: the element id of the div without the selector hash (#)
 * sgfCollection: array of sgf objects or a string URL. At creation time of the
 *    manager, The param sgfCollection may either be an array or a string
 *    representing a URL.  If the sgfCollection is a string, then the JSON is
 *    requsted at draw-time and passed to this.sgfCollection.
 * sgfCache: An initial setup for the SGF cache.
 * sgfColIndex: numbered index into the sgfCollection.
 * allowWrapAround: true or false.  Whether to allow wrap around in the SGF
 *    manager.
 * loadColInBack: true or false. Whether or to load the SGFs in the background.
 * sgfDefaults: filled-in sgf default options.  See ./options/base_options.js
 * displayOptions: filled-in display options. See ./options/base_options.js
 * actions: combination of stone actions and icon actions.
 * metadata: metadata about the this instance of glift.
 */
glift.widgets.WidgetManager = function(divId, sgfCollection, sgfMapping,
    sgfColIndex, allowWrapAround, loadColInBack, sgfDefaults, displayOptions,
    actions, metadata) {
  // Globally unique ID, at least across all glift instances in the current
  // page. In theory, the divId should be globally unique, but might as well be
  // absolutely sure.
  this.id = divId + '-glift-' + glift.util.idGenerator.next();

  // Register the instance. Maybe should be its own method.
  glift.global.instanceRegistry[this.id] = this;

  // Set as active, if the active instance hasn't already been set.
  !glift.global.activeInstanceId && this.setActive();

  // The original div id.
  this.divId = divId;

  // The fullscreen div id. Only set via the fullscreen button. Necessary to
  // have for problem collections.
  this.fullscreenDivId = null;
  // The fullscreen div will always be at the top. So we jump up to the top
  // during fullscreen and jump back afterwards.
  this.prevScrollTop = null;
  // If we set the window resize (done, for ex. in the case of full-screening),
  // we track the window-resizing function.
  this.oldWindowResize = null;

  // Note: At creation time of the manager, The param sgfCollection may either
  // be an array or a string representing a URL.  If the sgfCollection is a
  // string, then the JSON is requsted at draw-time and passed to
  // this.sgfCollection
  this.sgfCollection = [];

  // Cache of SGFs.  Useful for reducing the number AJAX calls.
  // Map from SGF name to String contents.
  this.sgfCache = sgfMapping || {};

  // URL for getting the entire SGF collection.
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
  this.actions = actions;

  // True or false. Whether to load SGFs in the background.
  this.loadColInBack = loadColInBack;
  this.initBackgroundLoading = false;

  // Defined on draw
  this.currentWidget = undefined;

  /**
   * Global metadata for this manager instance.
   */
  this.metadata = metadata || undefined;
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    var afterCollectionLoad = function() {
      if (!this.initBackgroundLoading && this.loadColInBack) {
        // Only start background loading once.
        this.initBackgroundLoading = true;
        this.backgroundLoad();
      }
      var curObj = this.getCurrentSgfObj();
      this.loadSgfString(curObj, function(sgfObj) {
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
    if (this.getCurrentWidget()) {
      this.getCurrentWidget().redraw();
    }
  },

  /** Set as the active widget in the global registry. */
  setActive: function() { glift.global.activeInstanceId = this.id; },

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

  /**
   * Get the current SGF Object from the sgfCollection. Note: If the item in the
   * array is a string, then we try to figure out whether we're looking at an
   * SGF or a URL and then we manufacture a simple sgf object.
   */
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
   *
   * sgfObj: A standard SGF Object.
   */
  loadSgfString: function(sgfObj, callback) {
    var alias = sgfObj.alias;
    var url = sgfObj.url;
    if (alias && this.sgfCache[alias]) {
      // First, check the cache for aliases.
      sgfObj.sgfString = this.sgfCache[alias];
      callback(sgfObj);
    } else if (url && this.sgfCache[url]) {
      // Next, check the cache for urls.
      sgfObj.sgfString = this.sgfCache[url];
      callback(sgfObj);
    } else if (sgfObj.url) {
      // Check if we need to do an AJAX request.
      this.loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      // Lastly: Just send the SGF object back.  Typically, this will be because
      // either:
      //  1. The SGF has been aliased.
      //  2. We want to start with a blank state (i.e., in the case of the
      //     editor).
      if (sgfObj.alias && sgfObj.sgfString) {
        // Create a new cache entry.
        this.sgfCache[sgfObj.alias] = sgfObj.sgfString;
      }
      callback(sgfObj);
    }
  },

  /**
   * Like the above function, but doesn't do XHR -- returns the input SGF object
   * if no SGF exists in the sgf cache. Convenient for contexts where you are
   * certain that the SGF has already been loaded.
   */
  loadSgfStringSync: function(sgfObj) {
    var alias = sgfObj.alias;
    var url = sgfObj.url;
    if (alias && this.sgfCache[alias]) {
      // First, check the cache for aliases.
      sgfObj.sgfString = this.sgfCache[alias];
      return sgfObj;
    } else if (url && this.sgfCache[url]) {
      // Next, check the cache for urls.
      sgfObj.sgfString = this.sgfCache[url];
      return sgfObj;
    } else {
      return sgfObj;
    }
  },

  /** Get the currentDivId */
  getDivId: function() {
    if (this.fullscreenDivId) {
      return this.fullscreenDivId;
    } else {
      return this.divId;
    }
  },

  /** Create a Sgf Widget. */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(
        this.getDivId(), sgfObj, this.displayOptions, this.actions, this);
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

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    glift.ajax.get(url, function(data) {
      this.sgfCache[url] = data;
      sgfObj.sgfString = data;
      callback(sgfObj);
    }.bind(this));
  },

  /**
   * Load the SGFs in the background.  Try once every 250ms until we get to the
   * end of the SGF collection.
   */
  backgroundLoad: function() {
    var loader = function(idx) {
      if (idx < this.sgfCollection.length) {
        var curObj = this.getSgfObj(idx);
        this.loadSgfString(curObj, function() {
          setTimeout(function() {
            loader(idx + 1);
          }.bind(this), 250); // 250ms
        });
      }
    }.bind(this);
    loader(this.sgfColIndex + 1);
  },

  /** Enable auto-resizing of the glift instance. */
  enableFullscreenAutoResize: function() {
    if (window.onresize) { this.oldWindowResize = window.onresize; }
    window.onresize = function() { this.redraw(); }.bind(this);
  },

  /** Disable auto-resizing of the glift instance. */
  disableFullscreenAutoResize: function() {
    window.onresize = this.oldWindowResize;
    this.oldWindowResize = null;
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
