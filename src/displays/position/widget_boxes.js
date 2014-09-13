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

  /** Iterate through all the boxes */
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
