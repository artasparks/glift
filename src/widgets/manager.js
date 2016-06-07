goog.provide('glift.widgets.WidgetManager');

/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 *
 * @param {glift.api.Options} options Options Template for Glift API Options.
 *
 * @constructor @final @struct
 */
glift.widgets.WidgetManager = function(options) {

  /**
   * Globally unique ID, at least across all glift instances in the current
   * page. In theory, the divId should be globally unique, but might as well be
   * absolutely sure.
   * @type {string}
   */
  this.id = options.divId + '-glift-' + glift.widgets.idGenerator.next();

  // Register the instance. Maybe should be its own method.
  glift.global.instanceRegistry[this.id] = this;

  // Set as active, if the active instance hasn't already been set. You can only
  // have one Glift instance per page that's active.
  !glift.global.activeInstanceId && this.setActive();

  /**
   * The original div id.
   * @type {string}
   */
  this.divId = options.divId;

  /**
   * The fullscreen div id. Only set via the fullscreen button. Necessary to
   * have for problem collections.
   * @type {?string}
   */
  this.fullscreenDivId = null;
  /**
   * The fullscreen div will always be at the top. So we jump up to the top
   * during fullscreen and jump back afterwards.
   * @type {?number}
   */
  this.prevScrollTop = null;
  /**
   * If we set the window resize (done, for ex. in the case of full-screening),
   * we track the window-resizing function.
   * @type {?function(?Event)}
   */
  this.oldWindowResize = null;

  /**
   * Note: At creation time of the manager, The param sgfCollection may either
   * be an array or a string representing a URL.  If the sgfCollection is a
   * string, then the JSON is requsted at draw-time and passed to
   * this.sgfCollection
   *
   * @type {!Array<!glift.api.SgfOptions|string>}
   */
  this.sgfCollection = [];

  /**
   * URL for getting the entire SGF collection.
   * @type {?string}
   */
  this.sgfCollectionUrl = null;

  // Performs collection initialization (pre ajax-loading).
  this.initSgfCollection_(options);

  /**
   * Cache of SGFs.  Useful for reducing the number AJAX calls.
   * Map from SGF name to String contents.
   *
   * @type {!Object<string, string>}
   */
  this.sgfCache = options.sgfMapping;

  /**
   * Index into the SGF Collection, if it exists.
   * @type {number}
   */
  this.sgfColIndex = options.initialIndex;

  /** @type {boolean} */
  this.allowWrapAround = options.allowWrapAround

  /**
   * The SGF Defaults template.
   * @type {!glift.api.SgfOptions}
   */
  this.sgfDefaults = options.sgfDefaults;
  /**
   * Display options
   * @type {!glift.api.DisplayOptions}
   */
  this.displayOptions = options.display;

  /**
   * Actions for the Icons
   * @type {!glift.api.IconActions}
   */
  this.iconActions = options.iconActions;

  /**
   * Actions for the Stones
   * @type {!glift.api.StoneActions}
   */
  this.stoneActions = options.stoneActions;

  /**
   * Whether to load SGFs in the background.
   * @type {boolean}
   */
  this.loadColInBack = options.loadCollectionInBackground;
  /**
   * Whether or not the background loading has begun.
   * @type {boolean}
   */
  this.initBackgroundLoading = false;

  /**
   * The main workhorse: The base glift widget. This is the object that handles
   * all the relevant SGF, controller, and display state.
   * @type {!glift.widgets.BaseWidget|undefined}
   */
  this.currentWidget = undefined;
  /**
   * Sometimes it's useful to create a temporary widget and hide the current
   * widget. The usecase for this is problems, where we define a temporary
   * results window.
   * @type {!glift.widgets.BaseWidget|undefined}
   */
  this.temporaryWidget = undefined

  /**
   * Global metadata for this manager instance.
   * @type {!Object|undefined}
   */
  this.metadata = options.metadata;

  /**
   * External hooks provided by users.
   *
   * A map of hook-name to hook-function.
   * @type {!glift.api.HookOptions}
   */
  this.hooks = options.hooks;
};

glift.widgets.WidgetManager.prototype = {
  /**
   * Creates a BaseWidget instance, and calls draw on the base widget.
   * @return {!glift.widgets.WidgetManager} The manager object.
   * @export
   */
  draw: function() {
    var that = this;
    var afterCollectionLoad = function() {
      if (!this.initBackgroundLoading && this.loadColInBack) {
        // Only start background loading once.
        this.initBackgroundLoading = true;
        this.backgroundLoad_();
      }
      var curObj = this.getCurrentSgfObj();
      this.loadSgfString_(curObj, function(sgfObj) {
        // Prevent flickering by destroying the widget after loading the SGF.
        this.destroy();
        this.currentWidget = this.createWidget(sgfObj).draw();
      }.bind(this));
    }.bind(this);

    if (this.sgfCollection.length === 0 && this.sgfCollectionUrl) {
      glift.ajax.get(this.sgfCollectionUrl, function(data) {
        this.sgfCollection = /** @type {!Array<string|!glift.api.SgfOptions>} */ (
            JSON.parse(data));
        afterCollectionLoad();
      }.bind(this));
    } else {
      afterCollectionLoad();
    }
    return this;
  },

  /**
   * Redraws the current widget.
   * @export
   */
  redraw: function() {
    var widget = this.getCurrentWidget()
    if (widget) {
      widget.redraw();
    }
  },

  /**
   * Set as the active widget in the global registry. Used from icons-land
   * @export
   */
  setActive: function() { glift.global.activeInstanceId = this.id; },

  /**
   * Gets the current (active) widget object or undefined if the widget hasn't
   * been created.
   * @return {!glift.widgets.BaseWidget|undefined}
   */
  getCurrentWidget: function() {
    if (this.temporaryWidget) {
      return this.temporaryWidget;
    } else {
      return this.currentWidget;
    }
  },

  /**
   * Initialize the SGF collection / collection URL
   * @param {!glift.api.Options} options The input-options.
   * @private
   */
  initSgfCollection_: function(options) {
    // Process explicitly defined collection arrays.
    if (glift.util.typeOf(options.sgfCollection) === 'array') {
      var coll = /** @type {!Array<!glift.api.SgfOptions|string>} */ (
          options.sgfCollection);
      for (var i = 0; i < coll.length; i++) {
        this.sgfCollection.push(coll[i]);
      }
      if (options.sgf && options.sgfCollection.length > 0) {
        throw new Error('Illegal options configuration: you cannot define both ' +
            'sgf and sgfCollection')
      } else if (options.sgf && options.sgfCollection.length === 0) {
        // Move the single SGF into the SGF collection.
        this.sgfCollection.push(options.sgf);
      } else if (!options.sgf && this.sgfCollection.length === 0) {
        // Allow the possibility of specifying no sgf to indicate a blank SGF.
        this.sgfCollection = [{}];
      }
    } else if (glift.util.typeOf(options.sgfCollection) === 'string') {
      // If it's a string, we assume the SGF collection should be loaded via
      // AJAX.
      this.sgfCollectionUrl = /** @type {string} */ (options.sgfCollection);
    }
  },

  /**
   * Gets the current SGF Object from the SGF collection. 
   */
  getCurrentSgfObj: function() { return this.getSgfObj(this.sgfColIndex); },

  /** @return {boolean} Whether there's a 'next' sgf */
  hasNextSgf: function() {
    if (this.sgfCollection.length &&
        this.sgfColIndex >= 0 &&
        this.sgfColIndex < this.sgfCollection.length - 1) {
      return true;
    } else if (
        this.sgfCollection.length &&
        this.sgfColIndex === this.sgfCollection.length - 1 &&
        this.allowWrapAround) {
      return true;
    } else {
      return false;
    }
  },

  /** @return {boolean} Whether there's a previous sgf */
  hasPrevSgf: function() {
    if (this.sgfCollection.length &&
        this.sgfColIndex > 0 &&
        this.sgfColIndex <= this.sgfCollection.length - 1) {
      return true;
    } else if (
        this.sgfCollection.length &&
        this.sgfColIndex === 0 &&
        this.allowWrapAround) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Get the current SGF Object from the sgfCollection. Note: If the item in the
   * array is a string, then we try to figure out whether we're looking at an
   * SGF or a URL and then we manufacture a simple sgf object.
   *
   * @return {!glift.api.SgfOptions}
   */
  getSgfObj: function(index) {
    if (index < 0 || index > this.sgfCollection.length) {
      throw new Error("Index [" + index +  " ] out of bounds."
          + " List size was " + this.sgfCollection.length);
    }
    var curSgfObj = this.sgfCollection[index];
    if (glift.util.typeOf(curSgfObj) === 'string') {
      var str = /** @type {string} */ (curSgfObj);
      var out = {};
      if (/^\s*\(;/.test(str)) {
        // We assume that this is a standard SGF String.
        out.sgfString = str;
      } else {
        // Assume a URL.
        out.url = str;
      }
      var toProc = out;
    } else {
      var toProc = /** @type {!Object} */ (curSgfObj);
    }
    return this.sgfDefaults.createSgfObj(toProc);
  },

  /**
   * Gets the SGF Object loaded with the SGF string. Since these can be loaded
   * with an XHR request, the data needs to be returned with a callback.
   *
   * @param {!glift.api.SgfOptions} sgfObj
   * @param {!function(glift.api.SgfOptions)} callback
   * @private
   */
  loadSgfString_: function(sgfObj, callback) {
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
   *
   * As a historical note, this was created for GPub, which has an interesting
   * usecase where all SGFs are guaranteed to be in the cache.
   *
   * @param {!glift.api.SgfOptions} sgfObj
   * @return {!glift.api.SgfOptions} Now we ensure that the SGF object has the
   *    sgf finished.
   * @export
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

  /**
   * Get the currentDivId. This is only interesting because it's possible for
   * the current div ID to be the fullscreened div id.
   * @return {string}
   */
  getDivId: function() {
    if (this.fullscreenDivId) {
      return this.fullscreenDivId;
    } else {
      return this.divId;
    }
  },

  /**
   * Create a Sgf Widget that actually does the work of fitting together the
   * board and icons.
   * @param {!glift.api.SgfOptions} sgfObj
   * @return {!glift.widgets.BaseWidget} The construct widget. Note: at this
   *    point, the widget has not yet been 'drawn'.
   * @export
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(
        this.getDivId(), sgfObj, this.displayOptions, this.iconActions,
        this.stoneActions, this, this.hooks);
  },

  /**
   * Temporarily replace the current widget with another widget. Used in the
   * case of the problem viewer. The use case is that it's often useful to, once
   * you want to see an answer, you jump to a separate game viewer widget.
   * @param {!glift.api.SgfOptions} sgfObj
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget && this.currentWidget.destroy();
    var obj = this.sgfDefaults.createSgfObj(sgfObj);
    this.temporaryWidget = this.createWidget(obj).draw();
  },

  /**
   * Returns from the temporary widget to the original widget.
   */
  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /**
   * Internal implementation of nextSgf/previous sgf.
   * @param {number} indexChange
   * @private
   */
  nextSgfInternal_: function(indexChange) {
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

  /**
   * Load the next SGF. Requires that the collection list be non-empty. Note
   * that this returns nothing since it simply changes which SGF is 'active' and
   * then redraws the widget.
   * @export
   */
  nextSgf: function() { this.nextSgfInternal_(1); },

  /**
   * Very similar to nextSgf. Load the previous SGF.
   * @export
   */
  prevSgf: function() { this.nextSgfInternal_(-1); },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   * @param {string} url
   * @param {!glift.api.SgfOptions} sgfObj
   * @param {!function(glift.api.SgfOptions)} callback For when the ajax request
   *    completes.
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
   * @private
   */
  backgroundLoad_: function() {
    var loader = function(idx) {
      if (idx < this.sgfCollection.length) {
        var curObj = this.getSgfObj(idx);
        this.loadSgfString_(curObj, function() {
          setTimeout(function() {
            loader(idx + 1);
          }.bind(this), 250); // 250ms
        });
      }
    }.bind(this);
    loader(this.sgfColIndex + 1);
  },

  /**
   * Whether or not the widget is currently fullscreened.
   * @return {boolean}
   * @export
   */
  isFullscreen: function() {
    return !!this.fullscreenDivId;
  },

  /**
   * Enable auto-resizing of the glift instance, but only in the case that the
   * widget is already fullscreened. This is not meant generally as an API, but
   * is public since it's called from statusbar/fullscreen.js
   *
   * Note: this isn't generally meant as an API since because currently,
   * this only works for one Glift instance, since it binds event function to
   * window.onresize.
   * @export
   */
  enableFullscreenAutoResize: function() {
    // It might be tempting to write check if we're fullscreened, but currently
    // the enableFullscreenAutoResize is called after widget destruction.
    if (window.onresize) { this.oldWindowResize = window.onresize; }
    window.onresize = function() { this.redraw(); }.bind(this);
  },

  /**
   * Disable auto-resizing of the glift instance. Called from the status bar.
   * @export
   */
  disableFullscreenAutoResize: function() {
    window.onresize = this.oldWindowResize;
    this.oldWindowResize = null;
  },

  /**
   * Undraw the most recent widget and remove references to it.
   * @export
   */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    return this;
  }
};
