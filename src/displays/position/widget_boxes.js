/**
 * Container for the widget boxes. Everything starts undefined,
 */
glift.displays.position.WidgetBoxes = function() {
  this._first = undefined;
  this._second = undefined;
};

glift.displays.position.WidgetBoxes.prototype = {
  /** Init or get the first column. */
  first: function(f) {
    if (f) {
      this._first = f;
    } else {
      return this._first;
    }
  },

  /** Init or get the second column. */
  second: function(f) {
    if (f) {
      this._second = f;
    } else {
      return this._second;
    }
  },

  /** Get a component by ID. */
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
    var colKeys = ['_first', '_second'];
    for (var i = 0; i < colKeys.length; i++) {
      var col = this[colKeys[i]];
      if (col !== undefined) {
        var ordering = col.ordering;
        for (var j = 0; j < ordering.length; j++) {
          var key = ordering[j];
          fn(key, col.mapping[key]);
        }
      }
    }
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
      return glift.displays.bboxFromPts(
          glift.util.point(left, top), glift.util.point(right, bottom));
    } else  {
      return null;
    }
  }
};

/**
 * Data container for information about how the widegt is positioned.
 */
glift.displays.position.WidgetColumn = function() {
  /** Mapping from component from map to box. */
  this.mapping = {};

  /** This ordering of the components. */
  this.ordering = [];
};

glift.displays.position.WidgetColumn.prototype = {
  /** Set a mapping from from component to bounding box. */
  setComponent: function(component, box) {
    if (!glift.enums.boardComponents[component]) {
      throw new Error('Unknown component: ' + component);
    }
    this.mapping[component] = box;
  },

  /** Get the boinding box of a component or return null*/
  getBbox: function(component) {
    return this.mapping[component] || null;
  },

  /** Set the column from an ordering. */
  setColumnOrdering: function(column) {
    var ordering = [];
    for (var i = 0; i < column.length; i++) {
      ordering.push(column[i].component);
    }
    this.ordering = ordering;
  },

  /** An ordering function. */
  orderFn: function(fn) {
    for (var i = 0; i < this.ordering.length; i++) {
      fn(this.ordering[i]);
    }
  }
};
