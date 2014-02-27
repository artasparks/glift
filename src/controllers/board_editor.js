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
    // _initLabelTrackers creates:
    //
    // this.alphaLabels: An array of available alphabetic labels.
    // this.numericLabels: An array of available numeric labels.
    // this.labelMap: A map from pt (string) to label.  This is so we can ensure
    // that there is only ever one label per point.
    this._initLabelTrackers();
  },

  /**
   * Initialize the label trackers.  Thus should be called after every move up
   * or down, so that the labels are synced with the current position.
   *
   * Specifically, initializes:
   * this.alphaLabels: An array of available alphabetic labels.
   * this.numericLabels: An array of available numeric labels.
   * this.labelMap: A map from pt (string) to label.
   */
  _initLabelTrackers: function() {
    var LB = glift.sgf.allProperties.LB;
    var numericLabelMap = {}; // number to 'true'
    var alphaLabelMap = {}; // alphabetic label to 'true'
    this.labelMap  = {}; // pt string to label
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
        var splat = mtLabels[i].split(':');
        var lbl = splat[1];
        var markType = glift.sgf.markToProperty
        var pt = glift.util.pointFromSgfCoord(splat[0]);
        this.labelMap[pt.toString()];
        if (numericLabelMap[lbl]) { delete numericLabelMap[lbl]; }
        if (alphaLabelMap[lbl]) { delete alphaLabelMap[lbl]; }
      }
    }
    //
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

  /**
   * Retrieve the current alphabetic mark. Returns null if there are no more
   * labels available.
   */
  currentAlphaMark: function() {
    return this.alphaLabels.length > 0 ? this.alphaLabels[0] : null;
  },

  /** Retrieve the current numeric mark. */
  currentNumericMark: function() {
    return this.numericLabels.length > 0 ? this.numericLabels[0] : null;
  },

  /**
   * Use the current alpha mark. This removes the mark frome the available
   * alphabetic labels. Returns null if no mark is available.
   */
  _useCurrentAlphaMark: function() {
    var mark = this.currentAlphaMark();
    if (mark) {
      this.alphaLabels = this.alphaLabels.slice(1);
    }
    return mark;
  },

  /**
   * Use the current numeric mark. This removes the mark frome the available
   * numeric labels. Returns null if no mark is available.
   */
  _useCurrentNumericMark: function() {
    var mark = this.currentNumericMark();
    if (mark) {
      this.numericLabels = this.numericLabels.slice(1);
    }
    return mark;
  },

  /**
   * Add a stone.
   */
  addStone: function(point, color) {
    console.log(point);
    console.log(color);
  },

  /**
   * Determine whether a mark is supported for adding. As you would expect,
   * returns true or false in the obvious way.
   */
  isSupportedMark: function(mark) {
    var supportedMap = {
      LABEL_ALPHA: true,
      LABEL_NUMERIC: true,
      SQUARE: true,
      TRIANGLE: true
    };
    return supportedMap[mark] || false;
  },

  /**
   * Add a mark to the Go board.
   */
  addMark: function(point, mark) {
    var marks = glift.enums.marks;
    var curProps = this.movetree.node().properties();
    if (!this.isSupportedMark(mark)) { return null; }

    var data = null;
    if (mark === marks.LABEL_NUMERIC) {
      data = this._useCurrentAlphaMark();
    } else if (mark === marks.LABEL_ALPHA) {
      data = this._useCurrentNumericMark();
    }

    var prop = glift.sgf.markToProperty(mark);
    if (data && mark) {
      curProps.add(prop, point.toSgfCoord() + ':' + data);
    } else if (mark) {
      curProps.add(prop, point.toSgfCoord());
    }
    return this.getNextBoardState();
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
