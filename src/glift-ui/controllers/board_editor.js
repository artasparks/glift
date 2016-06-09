goog.provide('glift.controllers.BoardEditor');

goog.require('glift.controllers.BaseController');

/**
 * Creates a BoardEditor controller.
 *
 * @type {!glift.controllers.ControllerFunc}
 */
glift.controllers.boardEditor = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  glift.util.setMethods(baseController, ctrl.BoardEditor.prototype);
  if (!sgfOptions) {
    throw new Error('Sgf Options was not defined, but must be defined');
  }
  baseController.initOptions(sgfOptions);
  return baseController;
};

/**
 * Stub class to be used for inheritance.
 *
 * @extends {glift.controllers.BaseController}
 * @constructor
 */
glift.controllers.BoardEditor = function() {
};

glift.controllers.BoardEditor.prototype = {
  /**
   * Called during initialization, after the goban/movetree have been
   * initializied.
   */
  extraOptions: function() {
    // _initLabelTrackers creates:
    //
    // this._alphaLabels: An array of available alphabetic labels.
    // this._numericLabels: An array of available numeric labels.
    // this._ptTolabelMap: A map from pt (string) to label.  This is so we can ensure
    // that there is only ever one label per point.
    this._initLabelTrackers();

    // Note: it's unnecessary to initialize the stones, since they are
    // initialized into the built-in initialize method.
  },

  /**
   * Initialize the label trackers.  Thus should be called after every move up
   * or down, so that the labels are synced with the current position.
   *
   * Specifically, initializes:
   * this._alphaLabels: An array of available alphabetic labels.
   * this._numericLabels: An array of available numeric labels (as numbers).
   * this._ptTolabelMap: A map from pt (string) to {label + optional data}.
   */
  _initLabelTrackers: function() {
    var prop = glift.rules.prop;
    var marks = glift.enums.marks;
    var numericLabelMap = {}; // number-string to 'true'
    var alphaLabelMap = {}; // alphabetic label to 'true'
    this._ptTolabelMap = {}; // pt string to {label + optional data}
    for (var i = 0; i < 100; i++) {
      numericLabelMap[(i + 1)] = true;
    }
    for (var i = 0; i < 26; i++) {
      var label = '' + String.fromCharCode('A'.charCodeAt(0) + i);
      alphaLabelMap[label] = true;
    }

    var marksToExamine = [
      marks.CIRCLE,
      marks.LABEL,
      marks.SQUARE,
      marks.TRIANGLE,
      marks.XMARK
    ];
    var alphaRegex = /^[A-Z]$/;
    var digitRegex = /^\d*$/;

    for (var i = 0; i < marksToExamine.length; i++) {
      var curMark = marksToExamine[i];
      var sgfProp = glift.sgf.markToProperty(curMark);
      var mtLabels = this.movetree.properties().getAllValues(sgfProp);
      if (mtLabels) {
        for (var j = 0; j < mtLabels.length; j++) {
          var splat = mtLabels[j].split(':');
          var markData = { mark: curMark };
          var lbl = null;
          if (splat.length > 1) {
            lbl = splat[1];
            markData.data = lbl;
            if (alphaRegex.test(lbl)) {
              markData.mark = marks.LABEL_ALPHA;
            } else if (digitRegex.test(lbl)) {
              lbl = parseInt(lbl, 10);
              markData.mark = marks.LABEL_NUMERIC;
            }
          }
          var pt = glift.util.pointFromSgfCoord(splat[0]);
          this._ptTolabelMap[pt.toString()] = markData;
          if (numericLabelMap[lbl]) { delete numericLabelMap[lbl]; }
          if (alphaLabelMap[lbl]) { delete alphaLabelMap[lbl]; }
        }
      }
    }
    //
    this._alphaLabels = this._convertLabelMap(alphaLabelMap);
    this._numericLabels = this._convertLabelMap(numericLabelMap);
  },

  /**
   * Convert either the numericLabelMap or alphaLabelMap.  Recall that these are
   * maps from either number => true or alpha char => true, where the keys
   * represent unused labels.
   */
  _convertLabelMap: function(map) {
    var base = [];
    var digitRegex = /^\d+$/;
    for (var key in map) {
      if (digitRegex.test(key)) {
        base.push(parseInt(key, 10));
      } else {
        base.push(key);
      }
    }
    if (base.length > 0 && glift.util.typeOf(base[0]) === 'number') {
      base.sort(function(a, b) { return a - b });
      base.reverse();
    } else {
      base.sort().reverse();
    }
    return base;
  },

  /**
   * Retrieve the current alphabetic mark. Returns null if there are no more
   * labels available.
   */
  currentAlphaMark: function() {
    return this._alphaLabels.length > 0 ?
        this._alphaLabels[this._alphaLabels.length - 1] : null;
  },

  /** Retrieve the current numeric mark as a string. */
  currentNumericMark: function() {
    return this._numericLabels.length > 0 ?
        this._numericLabels[this._numericLabels.length - 1] + '': null;
  },

  /**
   * Get a mark if a mark exists at a point on the board. Returns
   *
   *  For a label:
   *    { mark:<markstring>, data:<label> }
   *  For a triangle, circle, square, or xmark:
   *    { mark:<markstring> }
   *  If there's no mark at the point:
   *    null
   */
  getMark: function(pt) {
    return this._ptTolabelMap[pt.toString()] || null;
  },

  /**
   * Use the current alpha mark (as a string). This removes the mark frome the
   * available alphabetic labels. Returns null if no mark is available.
   */
  _useCurrentAlphaMark: function() {
    var label = this._alphaLabels.pop();
    if (!label) { return null; }
    return label;
  },

  /**
   * Use the current numeric mark (as a string). This removes the mark from the
   * available numeric labels. Returns null if no mark is available.
   */
  _useCurrentNumericMark: function() {
    var label = this._numericLabels.pop() + ''; // Ensure a string.
    if (!label) { return null; }
    return label;
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

    // Remove the mark instead, since the point already has a mark.
    if (this.getMark(point)) { return this.removeMark(point); }

    var markData = { mark: mark };
    var data = null;
    if (mark === marks.LABEL_NUMERIC) {
      data = this._useCurrentNumericMark();
      markData.data = data;
    } else if (mark === marks.LABEL_ALPHA) {
      data = this._useCurrentAlphaMark();
      markData.data = data;
    }

    var prop = glift.sgf.markToProperty(mark);
    if (data && mark) {
      curProps.add(prop, point.toSgfCoord() + ':' + data);
    } else if (mark) {
      curProps.add(prop, point.toSgfCoord());
    }
    this._ptTolabelMap[point.toString()] = markData;
    return this.flattenedState();
  },

  /** Remove a mark from the board. */
  removeMark: function(point) {
    var marks = glift.enums.marks;
    var markData = this.getMark(point);
    if (!markData) { return null; }

    delete this._ptTolabelMap[point.toString()];
    var sgfProp = glift.sgf.markToProperty(markData.mark);
    if (markData.mark === marks.LABEL_NUMERIC) {
      this._numericLabels.push(parseInt(markData.data, 10));
      this._numericLabels.sort(function(a, b) { return a - b }).reverse();
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord() + ':' + markData.data);
    } else if (markData.mark === marks.LABEL_ALPHA) {
      this._alphaLabels.push(markData.data);
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord() + ':' + markData.data);
      this._alphaLabels.sort().reverse();
    } else {
      this.movetree.properties()
          .removeOneValue(sgfProp, point.toSgfCoord());
    }
    return this.flattenedState();
  },

  /**
   * Add a stone.
   *
   * Returns: partial data to apply
   */
  addStone: function(point, color) {
    if (!this.canAddStone(point, color)) {
      return null;
    }

    // TODO(kashomon): Use the addResult
    var addResult = this.goban.addStone(point, color);

    this.movetree.addNode();
    this.movetree.properties().add(
        glift.sgf.colorToToken(color),
        point.toSgfCoord());
    return this.flattenedState();
  },

  /**
   * Add a stone placement.  These are properties indicated by AW and AB.  They
   * do not indicate a change in move number.
   */
  addPlacement: function(point, color) {
    var prop = glift.sgf.colorToPlacement(color);
    var oppColor = glift.util.colors.oppositeColor(color);
    var oppProp = glift.sgf.colorToPlacement(oppColor);
    var result = this.goban.addStone(point, color);
    if (result.successful) {
      this.movetree.properties().add(prop, point.toSgfCoord());
      for (var i = 0; i < result.captures.length; i++) {
        this.movetree.properties().removeOneValue(
            oppProp, result.captures[i].toSgfCoord());
      }
      var captures = {};
      captures[oppColor] = result.captures;
      return this.flattenedState();
    }
    return this.flattenedState();
  },

  pass: function() { throw new Error('Not implemented'); },
  clearStone: function() { throw new Error('Not implemented'); }
};
