goog.provide('glift.flattener.intersection');
goog.provide('glift.flattener.Intersection');

glift.flattener.intersection = {
  /**
   * Creates an intersection obj.
   *
   * @param {!glift.Point} pt 0-indexed and bounded by the number
   *    of intersections.  Thus, typically between 0 and 18. Note, the zero for
   *    this point is the top-left rather than the more traditional
   *    bottom-right, as it is for kifus.
   * @param {glift.enums.states} stoneColor EMPTY here is used to indicate that
   *    we don't want to set the stone.
   * @param {!glift.flattener.symbols} mark Mark for the stone
   * @param {string} textLabel text label for the stone. Should really only be
   *    set when the mark is TEXTLABEL.
   * @param {number} maxInts The maximum number of intersections on the board.
   *    Typically 9, 13 or 19.
   *
   * @return {!glift.flattener.Intersection}
   */
  create: function(pt, stoneColor, mark, textLabel, maxInts) {
    var sym = glift.flattener.symbols;
    var intsect = new glift.flattener.Intersection(pt);

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
    } else if (glift.flattener.starpoints.isPt(pt, maxInts)) {
      baseSymb = sym.CENTER_STARPOINT;
    } else {
      baseSymb = sym.CENTER;
    }
    intsect.setBase(baseSymb);

    if (stoneColor === glift.enums.states.BLACK) {
      intsect.setStone(sym.BSTONE);
    } else if (stoneColor === glift.enums.states.WHITE) {
      intsect.setStone(sym.WSTONE);
    }

    if (mark !== undefined) {
      intsect.setMark(mark);
    }

    if (textLabel !== undefined) {
      intsect.setTextLabel(textLabel);
    }

    return intsect;
  },
};

/**
 * Represents a flattened intersection. Separated into 3 layers: 
 *  - Base layer (intersection abels)
 *  - Stone layer (black, white, or empty)
 *  - Mark layer (shapes, text labels, etc.)
 *
 * Shouldn't be constructed directly outside of this file.
 *
 * @param {!glift.Point} pt
 *
 * @constructor @final @struct
 */
glift.flattener.Intersection = function(pt) {
  var EMPTY = glift.flattener.symbols.EMPTY;

  /** @private {!glift.Point} */
  this.pt_ = pt;
  /** @private {glift.flattener.symbols} */
  this.baseLayer_ = EMPTY;
  /** @private {glift.flattener.symbols} */
  this.stoneLayer_ = EMPTY;
  /** @private {glift.flattener.symbols} */
  this.markLayer_ = EMPTY;

  /**
   * Optional text label. Should only be set when the mark layer symbol is some
   * sort of text-symbol (e.g., TEXTLABEL, NEXTVARIATION)
   * @private {?string}
   */
  this.textLabel_ = null;
};

/**
 * Static maps to evaluate symbol validity.
 */
glift.flattener.intersection.layerMapping = {
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
    TEXTLABEL: true, LASTMOVE: true, NEXTVARIATION: true,
    CORRECT_VARIATION: true, KO_LOCATION: true,
  }
};

glift.flattener.Intersection.prototype = {
  /**
   * @param {glift.flattener.symbols} s Symbol to validate
   * @param {string} layer
   * @private
   */
  validateSymbol_: function(s, layer) {
    var str = glift.flattener.symbolStr(s);
    if (!str) {
      throw new Error('Symbol Val: ' + s + ' is not a defined symbol.');
    }
    if (!glift.flattener.intersection.layerMapping[layer][str]) {
      throw new Error('Incorrect layer for: ' + str + ',' + s +
          '. Layer was ' + layer);
    }
    return s;
  },

  /**
   * Test whether this intersection is equal to another intersection.
   * @param {!Object} thatint
   * @return {boolean}
   */
  equals: function(thatint) {
    if (thatint == null) {
      return false;
    }
    var that = /** @type {!glift.flattener.Intersection} */ (thatint);
    return this.pt_.equals(that.pt_) &&
        this.baseLayer_ === that.baseLayer_ &&
        this.stoneLayer_ === that.stoneLayer_ &&
        this.markLayer_ === that.markLayer_ &&
        this.textLabel_ === that.textLabel_;
  },

  /** @return {glift.flattener.symbols} Returns the base layer. */
  base: function() { return this.baseLayer_; },

  /** @return {glift.flattener.symbols} Returns the stone layer. */
  stone: function() { return this.stoneLayer_; },

  /** @return {glift.flattener.symbols} Returns the mark layer. */
  mark: function() { return this.markLayer_; },

  /** @return {?string} Returns the text label. */
  textLabel: function() { return this.textLabel_; },

  /**
   * Sets the base layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setBase: function(s) {
    this.baseLayer_ = this.validateSymbol_(s, 'base');
    return this;
  },

  /**
   * Sets the stone layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setStone: function(s) {
    this.stoneLayer_ = this.validateSymbol_(s, 'stone');
    return this;
  },

  /**
   * Sets the mark layer.
   * @param {!glift.flattener.symbols} s
   * @return {!glift.flattener.Intersection} this
   */
  setMark: function(s) {
    this.markLayer_ = this.validateSymbol_(s, 'mark');
    return this;
  },

  /**
   * Sets the text label.
   * @param {string} t
   * @return {!glift.flattener.Intersection} this
   */
  setTextLabel: function(t) {
    this.textLabel_ = t + '';
    return this;
  },

  /**
   * Clears the text label
   * @return {!glift.flattener.Intersection} this
   */
  clearTextLabel: function() {
    this.textLabel_ = null;
    return this;
  }
};
