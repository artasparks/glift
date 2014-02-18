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
   * Called during initialization.
   */
  extraOptions: function(sgfOptions) {
    this.initLabelTrackers();
  },

  initLabelTrackers: function() {
    var LB = glift.sgf.allProperties.LB;
    this.numericLabelMap = {};
    this.alphaLabelMap = {};;
    for (var i = 0; i < 100; i++) {
      this.numericLabelMap['' + (i + 1)] = true;
    }
    for (var i = 0; i < 26; i++) {
      var label = '' + String.fromCharCode('A'.charCodeAt(0) + i);
      this.alphaLabelMap[label] = true;
    }

    var mtLabels = this.movetree.properties().getAllValues(LB);
    if (mtLabels) {
      for (var i = 0; i < mtLabels.length; i++) {
        var lbl = mtLabels[i].split[':'][1];
        if (this.numericLabelMap[lbl]) { delete this.numericLabelMap[lbl]; }
        if (this.alphaLabelMap[lbl]) { delete this.alphaLabelMap[lbl]; }
      }
    }
    this.alphaLabels = this._convertLabelMap(this.alphaLabelMap);
    this.numericLabels = this._convertLabelMap(this.numericLabelMap);
  },

  _convertLabelMap: function(map) {
    var base = [];
    for (var key in map) {
      base.push(key);
    }
    base.sort();
    return base;
  },

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
