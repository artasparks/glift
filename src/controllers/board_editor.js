glift.controllers.boardEditor = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  glift.util.setMethods(baseController, ctrl.BoardEditorMethods);
  glift.util.setMethods(baseController, ctrl.BoardEditorMethods);
  baseController.initOptions(sgfOptions);
  return baseController;
};

glift.controllers.BoardEditorMethods = {
  /**
   * Called during initialization, after the goban/movetree have been
   * initializied.
   */
  extraOptions: function(sgfOptions) {
    this._initLabelTrackers();
  },

  /**
   * Initialize the label trackers.  Thus should be called after every move up
   * or down, so that the labels are synced with the current position.
   */
  _initLabelTrackers: function() {
    var LB = glift.sgf.allProperties.LB;
    var numericLabelMap = {};
    var alphaLabelMap = {};
    for (var i = 0; i < 100; i++) {
      numericLabelMap['' + (i + 1)] = true;
    }
    for (var i = 0; i < 26; i++) {
      var label = '' + String.fromCharCode('A'.charCodeAt(0) + i);
      alphaLabelMap[label] = true;
    }

    var mtLabels = this.movetree.properties().getAllValues(LB);
    if (mtLabels) {
      for (var i = 0; i < mtLabels.length; i++) {
        var lbl = mtLabels[i].split(':')[1];
        if (numericLabelMap[lbl]) { delete numericLabelMap[lbl]; }
        if (alphaLabelMap[lbl]) { delete alphaLabelMap[lbl]; }
      }
    }
    this.alphaLabels = this._convertLabelMap(alphaLabelMap);
    this.numericLabels = this._convertLabelMap(numericLabelMap);
  },

  _convertLabelMap: function(map) {
    var base = [];
    var digitRegex = /^\d+$/;
    for (var key in map) {
      if (digitRegex.test(key)) {
        base.push(parseInt(key));;
      } else {
        base.push(key);
      }
    }
    if (base.length > 0 && glift.util.typeOf(base[0]) === 'number') {
      base.sort(function(a, b) { return a - b });
    } else {
      base.sort();
    }
    return base;
  },

  /** Retrieve the current alpha mark. */
  currentAlphaMark: function() { return this.alphaLabels[0]; },

  /** Retrieve the current numeric mark. */
  currentNumericMark: function() { return this.numericLabels[0]; },

  /**
   * Add a stone.
   */
  addStone: function(point, color) {
    console.log(point);
    console.log(color);
    console.log(mark);
  },

  addMark: function(point, mark) {
    this.movetree.node()
  },

  /**
   * Add a stone placement.  These are properties indicated by AW and AB.  They
   * do not indicate a change in move number.
   */
  addPlacement: function(point, color) {
  },

  pass: function() { throw new Error("Not implemented"); },
  clearMark: function() { throw new Error("Not implemented"); },
  clearStone: function() { throw new Error("Not implemented"); }
};
