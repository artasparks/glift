glift.flattener.intersection = {

  /**
   * Creates an intersection obj.
   *
   * pt: A glift point. 0-indexed and bounded by the number of intersections.
   *    Thus, typically between 0 and 18. Note, the zero for this point is the
   *    top-left rather than the more traditional bottom-right, as it is for
   *    kifus.
   * stoneColor: A stone state. Member of glift.enums.states.
   * mark: Mark element from glift.flattener.symbols.
   * textLabel: text label for the stone.
   * maxInts: The maximum number of intersections on the board.
   */
  create: function(pt, stoneColor, mark, textLabel, maxInts) {
    var sym = glift.flattener.symbols;
    var int = new glift.flattener._Intersection(pt);

    if (pt.x() < 0 || pt.y() < 0 ||
        pt.x() >= maxInts || pt.y() >= maxInts) {
      throw new Error('Pt (' + pt.x() + ',' + pt.y() + ')' + ' is out of bounds.');
    }

    var intz = maxInts - 1;
    var baseSymb = sym.EMPTY;
    if (pt.x() === 0 && pt.y() === 0) {
      baseSymb = sym.TL_CORNER;
    } else if (pt.x() === 0 && pt.y() === intz) {
      baseSymb = sym.BL_CORNER;
    } else if (pt.x() === intz && pt.y() === 0) {
      baseSymb = sym.TR_CORNER;
    } else if (pt.x() === intz && pt.y() === intz) {
      baseSymb = sym.BR_CORNER;
    } else if (pt.y() === 0) {
      baseSymb = sym.TOP_EDGE;
    } else if (pt.x() === 0) {
      baseSymb = sym.LEFT_EDGE;
    } else if (pt.x() === intz) {
      baseSymb = sym.RIGHT_EDGE;
    } else if (pt.y() === intz) {
      baseSymb = sym.BOT_EDGE;
    } else if (this._isStarpoint(pt, maxInts)) {
      baseSymb = sym.CENTER_STARPOINT;
    } else {
      baseSymb = sym.CENTER;
    }
    int.base(baseSymb);

    if (stoneColor === glift.enums.states.BLACK) {
      int.stone(sym.BSTONE);
    } else if (stoneColor === glift.enums.states.WHITE) {
      int.stone(sym.WSTONE);
    }

    if (mark !== undefined) {
      int.mark(mark);
    }

    if (textLabel !== undefined) {
      int.textLabel(textLabel);
    }

    return int;
  },

  // TODO(kashomon): Should arbitrary sized go boards be supported?
  _starPointSets: {
    9 : [{4:true}],
    13 : [{3:true, 9:true}, {6:true}],
    19 : [{3:true, 9:true, 15:true}]
  },

  /**
   * Determine whether a pt is a starpoint.  Intersections is 1-indexed, but the
   * pt is 0-indexed.
   */
  _isStarpoint: function(pt, maxInts) {
    var starPointSets = glift.flattener.intersection._starPointSets[maxInts];
    for (var i = 0; i < starPointSets.length; i++) {
      var set = starPointSets[i];
      if (set[pt.x()] && set[pt.y()]) {
        return true;
      }
    }
    return false;
  }
};

/**
 * Represents a flattened intersection. Separated into 3 layers: 
 *  - Base layer (intersection abels)
 *  - Stone layer (black, white, or empty)
 *  - Mark layer (shapes, text labels, etc.)
 *
 * Shouldn't be constructed directly outside of this file.
 */
glift.flattener._Intersection = function(pt) {
  var EMPTY = glift.flattener.symbols.EMPTY;
  this._pt = pt;
  this._baseLayer = EMPTY;
  this._stoneLayer = EMPTY;
  this._markLayer = EMPTY;

  // Optional text label. Should only be set when the mark layer symbol is some
  // sort of text-symbol (e.g., TEXTLABEL, NEXTVARIATION)
  this._textLabel = null;
};

glift.flattener._Intersection.prototype = {
  _validateSymbol: function(s, layer) {
    var sym = glift.flattener.symbols;
    var layerMapping = {
      base: {
        EMPTY: true, TL_CORNER: true, TR_CORNER: true, BL_CORNER: true,
        BR_CORNER: true, TOP_EDGE: true, BOT_EDGE: true, LEFT_EDGE: true,
        RIGHT_EDGE: true, CENTER: true, CENTER_STARPOINT: true
      },
      stone: {
        EMPTY: true, BSTONE: true, WSTONE: true
      },
      mark: {
        EMPTY: true, TRIANGLE: true, SQUARE: true, CIRCLE: true, XMARK: true,
        TEXTLABEL: true, LASTMOVE: true, NEXTVARIATION: true
      }
    };
    if (!glift.flattener.symbolStr(s)) {
      throw new Error('Symbol Val: ' + s + ' is not a defined symbol.');
    }
    var str = glift.flattener.symbolStr(s);
    if (!layerMapping[layer][str]) {
      throw new Error('Incorrect layer for: ' + str + ',' + s +
          '. Layer was ' + layer);
    }
    return s;
  },

  /** Sets or gets the base layer. */
  base: function(s) {
    if (s !== undefined) {
      this._baseLayer = this._validateSymbol(s, 'base');
      return this;
    } else {
      return this._baseLayer;
    }
  },

  /** Sets or gets the stone layer. */
  stone: function(s) {
    if (s !== undefined) {
      this._stoneLayer = this._validateSymbol(s, 'stone');
      return this;
    } else {
      return this._stoneLayer;
    }
  },

  /** Sets or gets the mark layer. */
  mark: function(s) {
    if (s !== undefined) {
      this._markLayer = this._validateSymbol(s, 'mark');
      return this;
    } else {
      return this._markLayer;
    }
  },

  /** Sets or gets the text label. */
  textLabel: function(t) {
    if (t != null) {
      this._textLabel = t + '';
      return this;
    } else {
      return this._textLabel;
    }
  },

  /** Clear the text label */
  clearTextLabel: function() {
    this._textLabel = null;
    return this;
  }
};
