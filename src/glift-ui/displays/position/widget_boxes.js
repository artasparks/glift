goog.provide('glift.displays.position.WidgetBoxes');
goog.provide('glift.displays.position.WidgetColumn');

/**
 * Container for the widget boxes. Everything starts undefined,
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetBoxes = function() {
  /** @private {glift.displays.position.WidgetColumn} */
  this._first = null;
  /** @private {glift.displays.position.WidgetColumn} */
  this._second = null;
};

glift.displays.position.WidgetBoxes.prototype = {
  /** @param {!glift.displays.position.WidgetColumn} col */
  setFirst: function(col) {
    this._first = col;
  },

  /** @param {!glift.displays.position.WidgetColumn} col */
  setSecond: function(col) {
    this._second = col;
  },

  /** @return {glift.displays.position.WidgetColumn} First column */
  first: function() {
    return this._first;
  },

  /** @return {glift.displays.position.WidgetColumn} Second column */
  second: function(col) {
    return this._second;
  },

  /**
   * Get a component by ID.
   * @param {glift.BoardComponent} key Component key
   * @return {?glift.orientation.BoundingBox} A bounding box or null.
   */
  getBbox: function(key) {
    if (this._first && this._first.mapping[key]) {
      return this._first.mapping[key]
    }
    if (this._second && this._second.mapping[key]) {
      return this._second.mapping[key]
    }
    return null;
  },

  /**
   * Get the bbox of a component or throw an exception
   *
   * @param {glift.BoardComponent} key Component key
   * @return {!glift.orientation.BoundingBox}.
   */
  mustGetBbox: function(key) {
    var bbox = this.getBbox(key);
    if (bbox == null) {
      throw new Error('Column was null for component: ' + key);
    }
    return bbox;
  },

  /**
   * Iterate through all the bboxes.
   *
   * This method passes both the component name and the relevant to the fn.
   * Another way to say this is fn has the form:
   *
   * fn(<component-name>, bbox>);
   */
  map: function(fn) {
    if (glift.util.typeOf(fn) !== 'function') {
      return;
    }
    var applyOrdering = (function(col, inFn) {
      var ordering = col.ordering;
      for (var j = 0; j < ordering.length; j++) {
        var key = ordering[j];
        inFn(key, col.mapping[key]);
      }
    }).bind(this);
    this._first && applyOrdering(this._first, fn.bind(this));
    this._second && applyOrdering(this._second, fn.bind(this));
  },

  /**
   * Get the bounding box for the whole widget. Useful for creating temporary
   * divs.  Note: Returns a new bounding box everytime, since it's calculated
   * based on the existing bboxes.
   */
  fullWidgetBbox: function() {
    var top = null;
    var left = null;
    var bottom = null;
    var right = null;
    this.map(function(compName, bbox) {
      if (top === null) {
        top = bbox.top();
        left = bbox.left();
        bottom = bbox.bottom();
        right = bbox.right();
        return;
      }
      if (bbox.top() < top) { top = bbox.top(); }
      if (bbox.left () < left) { left = bbox.left(); }
      if (bbox.bottom() > bottom) { bottom = bbox.bottom(); }
      if (bbox.right() > right) { right = bbox.right(); }
    });
    if (top !== null && left !== null && bottom !== null && right !== null) {
      return glift.orientation.bbox.fromPts(
          glift.util.point(left, top),
          glift.util.point(right, bottom));
    } else  {
      return null;
    }
  }
};

/**
 * Data container for information about how the widegt is positioned.
 *
 * @constructor @final @struct
 */
glift.displays.position.WidgetColumn = function() {
  /** Mapping from component from map to box. */
  this.mapping = {};

  /** This ordering of the components. */
  this.ordering = [];
};

glift.displays.position.WidgetColumn.prototype = {
  /** Set a mapping from from component to bounding box. */
  setComponent: function(component, bbox) {
    if (!glift.BoardComponent[component]) {
      throw new Error('Unknown component: ' + component);
    }
    this.mapping[component] = bbox;
    return this;
  },

  /**
   * Get the bbox of a component or return null.
   *
   * @param {glift.BoardComponent} component Component key
   * @return {?glift.orientation.BoundingBox} A bounding box or null.
   */
  getBbox: function(component) {
    return this.mapping[component] || null;
  },

  /**
   * Get the bbox of a component or throw an exception.
   *
   * @param {glift.BoardComponent} component Component key
   * @return {!glift.orientation.BoundingBox}
   */
  mustGetBbox: function(component) {
    var bbox = this.getBbox(component);
    if (bbox == null) {
      throw new Error('Bbox was null for component: ' + component);
    }
    return bbox;
  },

  /**
   * Set the column from an ordering. Recall that ratio arrays have the
   * following format:
   * [
   *  { component: BOARD, ratio: 0.3}
   *  { component: COMMENT_BOX, ratio: 0.6}
   *  ...
   * ].
   *
   * This is typically set before setting components.
   */
  setOrderingFromRatioArray: function(column) {
    var ordering = [];
    for (var i = 0; i < column.length; i++) {
      var item = column[i];
      if (item && item.component) {
          ordering.push(item.component);
      }
    }
    this.ordering = ordering;
    return this;
  },

  /**
   * An ordering function. Expects the fn to take a component name.
   */
  orderFn: function(fn) {
    for (var i = 0; i < this.ordering.length; i++) {
      fn(this.ordering[i]);
    }
  }
};
