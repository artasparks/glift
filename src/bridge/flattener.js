/**
 * Helps flatten a go board into a diagram definition.
 */
glift.bridge.flattener = {
  symbols: {
    //----------------------------------------//
    // First Layer Symbols (lines and stones) //
    //----------------------------------------//
    // Base board marks
    TL_CORNER: 1,
    TR_CORNER: 2,
    BL_CORNER: 3,
    BR_CORNER: 4,
    TOP_EDGE: 5,
    BOT_EDGE: 6,
    LEFT_EDGE: 7,
    RIGHT_EDGE: 8,
    CENTER: 9,
    // Center + starpoint
    CENTER_STARPOINT: 10,
    // Stones
    BSTONE: 11,
    WSTONE: 12,

    // A dummy symbol so we can create dense arrays of mark symbols.  Also used
    // for removed the first layer when we wish to add text labels.
    EMPTY: 13,

    //-----------------------------------------//
    // Second Layer Symbols (labels and marks) //
    //-----------------------------------------//
    // Marks and StoneMarks
    TRIANGLE: 14,
    SQUARE: 15,
    CIRCLE: 16,
    XMARK: 17,
    // Text Labeling (numbers or letters)
    TEXTLABEL: 18,
    // Extra marks, used for display.  These are not specified by the SGF
    // specification, but they are often useful.
    LASTMOVE: 19, // Should probably never be used, but is useful
    // It's useful to destinguish between standard TEXTLABELs and NEXTVARIATION
    // labels.
    NEXTVARIATION: 20
  },

  symbolFromEnum: function(value) {
    if (glift.bridge.flattener._reverseSymbol !== undefined) {
      return glift.bridge.flattener._reverseSymbol[value];
    }
    var reverse = {};
    var symb = glift.bridge.flattener.symbols;
    for (var key in glift.bridge.flattener.symbols) {
      reverse[symb[key]] = key;
    }
    glift.bridge.flattener._reverseSymbol = reverse;
    return glift.bridge.flattener._reverseSymbol[value];
  },

  /**
   * Flatten the combination of movetree, goban, cropping, and treepath into an
   * array (really a 2D array) of symbols, (a _Flattened object).
   *
   * Some notes about the parameters:
   *  - The goban is used for extracting all the inital stones.
   *  - The movetree is used for extracting:
   *    -> The marks
   *    -> The next moves
   *    -> The previous move
   *    -> subsequent stones, if a nextMovesTreepath is present.  These are
   *    given labels.
   *  - The boardRegion indicates how big to make the board (i.e., the 2D array)
   *
   * Optional parameters:
   *  - nextMovesTreepath.  Defaults to [].  This is typically only used for
   *    printed diagrams.
   *  - Cropping.  Defaults to nextMovesCropping
   */
  flatten: function(
      movetreeInitial,
      goban,
      boardRegion,
      showNextVariationsType,
      nextMovesTreepath,
      startingMoveNum) {
    var s = glift.bridge.flattener.symbols;
    var mt = movetreeInitial.newTreeRef();
    var showVars = showNextVariationsType || glift.enums.showVariations.NEVER;
    var nmtp = nextMovesTreepath || [];
    var startingMoveNum = startingMoveNum || 1;
    var boardRegion = boardRegion || glift.enums.boardRegions.ALL;
    if (boardRegion === glift.enums.boardRegions.AUTO) {
      boardRegion = glift.bridge.getCropFromMovetree(mt);
    }
    var cropping = glift.displays.cropbox.getFromRegion(
        boardRegion, mt.getIntersections());

    // Map of ptString to move.
    var stoneMap = glift.bridge.flattener._stoneMap(goban);
    var applied = glift.rules.treepath.applyNextMoves(mt, goban, nmtp);
    mt = applied.movetree;

    for (var i = 0; i < applied.stones.length; i++) {
      var stone = applied.stones[i];
      var mv = { point: stone.point, color: stone.color };
      var ptstr = mv.point.toString();
      if (!stoneMap[ptstr]) {
        stoneMap[ptstr] = mv;
      }
    }

    var mksOut = glift.bridge.flattener._markMap(mt);
    var labels = mksOut.labels; // map of ptstr to label str
    var marks = mksOut.marks; // map of ptstr to symbol int

    var collisions = glift.bridge.flattener._labelForCollisions(
        applied.stones, marks, labels, startingMoveNum);

    var sv = glift.enums.showVariations
    if (showVars === sv.ALWAYS ||
        (showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
      for (var i = 0; i < mt.node().numChildren(); i++) {
        var move = mt.node().getChild(i).properties().getMove();
        if (move && move.point) {
          var pt = move.point;
          var ptStr = pt.toString();
          if (labels[ptStr] === undefined) {
            labels[ptStr] = "" + (i + 1);
          }
          marks[ptStr] = s.NEXTVARIATION;
        }
      }
    }

    // Finally! Generate the symbols array.
    var symbolPairs = glift.bridge.flattener._generateSymbolArr(
        cropping, stoneMap, marks, mt.getIntersections());

    var comment = mt.properties().getComment() || '';
    return new glift.bridge._Flattened(
        symbolPairs, labels, collisions, comment, boardRegion, cropping);
  },

  /**
   * Get map from pt string to stone {point: <point>, color: <color>}.
   */
  _stoneMap: function(goban) {
    var out = {};
    // Array of {color: <color>, point: <point>}
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      out[stone.point.toString()] = stone;
    }
    return out;
  },

  /**
   * Get the relevant marks.  Returns an object containing two fields: marks,
   * which is a map from ptString to Symbol ID. and labels, which is a map
   * from ptString to text label.
   *
   * If there are two marks on the same intersection specified, the behavior is
   * undefined.  Either mark might succeed in being placed.
   *
   * Example return value:
   * {
   *  marks: {
   *    "12.5": 13
   *    "12.3": 23
   *  },
   *  labels: {
   *    "12,3": "A"
   *    "12,4": "B"
   *  }
   * }
   */
  _markMap: function(movetree) {
    var out = { marks: {}, labels: {} };
    var s = glift.bridge.flattener.symbols;
    var propertiesToSymbols = {
      CR: s.CIRCLE,
      LB: s.TEXTLABEL,
      MA: s.XMARK,
      SQ: s.SQUARE,
      TR: s.TRIANGLE
    };
    for (var prop in propertiesToSymbols) {
      var symbol = propertiesToSymbols[prop];
      if (movetree.properties().contains(prop)) {
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.sgf.allProperties.LB) {
            var lblPt = glift.sgf.convertFromLabelData(data[i]);
            var key = lblPt.point.toString();
            out.marks[key] = symbol;
            out.labels[key] = lblPt.value;
          } else {
            var pt = glift.util.pointFromSgfCoord(data[i]);
            out.marks[pt.toString()] = symbol;
          }
        }
      }
    }
    return out;
  },

  /**
   * Create or apply labels to identify collisions that occurred during apply
   *
   * stones: stones
   * marks: map from ptstring to Mark symbol int.
   *    see -- glift.bridg.flattener.symbols.
   * labels: map from ptstring to label string.
   * startingMoveNum: The number at which to start creating labels
   *
   * returns: an array of collision objects:
   *
   *  {
   *    color: <color of the move to be played>,
   *    mvnum: <move number>,
   *    label: <label>
   *  }
   *
   * This data is meant to be used like the following:
   *    '<color> <mvnum> at <label>'
   * as in this example:
   *    'Black 13 at 2'
   *
   * Sadly, this has has the side effect of altering the marks / labels maps.
   */
  _labelForCollisions: function(stones, marks, labels, startingMoveNum) {
    if (!stones || stones.length === 0) {
      return []; // Don't perform relabeling if no stones are found.
    }
    // Collision labels, for when stone.collision = null.
    var extraLabs = 'abcdefghijklmnopqrstuvwxyz';
    var labsIdx = 0;
    var symb = glift.bridge.flattener.symbols;
    var collisions = []; // {color: <color>, num: <number>, label: <lbl>}

    // Remove any number labels currently existing in the marks map
    var digitRegex = /[0-9]/;
    for (var ptstr in labels) {
      if (digitRegex.test(labels[ptstr])) {
        delete labels[ptstr];
        delete marks[ptstr];
      }
    }

    for (var i = 0; i < stones.length; i++) {
      var stone = stones[i];
      var ptStr = stone.point.toString();
      if (stone.hasOwnProperty('collision')) {
        var col = {color: stone.color, mvnum: (i + startingMoveNum) + ''};
        if (labels[ptStr]) { // First see if there are any available labels.
          col.label = labels[ptStr];
        } else if (glift.util.typeOf(stone.collision) === 'number') {
          col.label = (stone.collision + startingMoveNum) + ''; // label is idx.
        } else { // should be null
          var lbl = extraLabs.charAt(labsIdx);
          labsIdx++;
          col.label = lbl;
          marks[ptStr] = symb.TEXTLABEL;
          labels[ptStr] = lbl;
        }
        collisions.push(col);
      } else {
        // Create new labels for our move number (should this be flag
        // controlled?).
        marks[ptStr] = symb.TEXTLABEL; // Override labels.
        labels[ptStr] = (i + startingMoveNum) + ''
      }
    }
    return collisions;
  },

  /**
   * Returns:
   *  [
   *    [
   *      {base: 3, mark: 20},
   *      ...
   *    ],
   *    [...],
   *    ...
   * ]
   *
   */
  _generateSymbolArr: function(cropping, stoneMap, marks, ints) {
    var cb = cropping.cbox();
    var point = glift.util.point;
    var symbols = [];
    for (var y = cb.top(); y <= cb.bottom(); y++) {
      var row = [];
      for (var x = cb.left(); x <= cb.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var mark = marks[ptStr];
        row.push(this._getSymbolPair(pt, stone, mark, ints));
      }
      symbols.push(row);
    }
    return symbols;
  },

  /**
   * pt: Point of interest.
   * stone: {point: <point>, color: <color>} or undefined,
   */
  _getSymbolPair: function(pt, stone, mark, intersections) {
    var s = glift.bridge.flattener.symbols;
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    var EMPTY = glift.enums.states.EMPTY;
    var base = undefined;
    var outMark = s.EMPTY;
    if (mark !== undefined) {
      var color = EMPTY
      if (stone !== undefined) { color = stone.color; }
      switch(mark) {
        case s.TRIANGLE: outMark = s.TRIANGLE; break;
        case s.SQUARE: outMark = s.SQUARE; break;
        case s.CIRCLE: outMark = s.CIRCLE; break;
        case s.XMARK: outMark = s.XMARK; break;
        case s.LASTMOVE: outMark = s.LASTMOVE; break;
        case s.TEXTLABEL:
          outMark = s.TEXTLABEL;
          if (color === EMPTY) {
            base = s.EMPTY;
          }
          break;
        case s.NEXTVARIATION:
          outMark = s.NEXTVARIATION;
          if (color === EMPTY) {
            base = s.EMPTY;
          }
          break;
      }
    }
    var ints = intersections - 1;
    if (base === s.EMPTY) {
      // Do nothing.
    } else if (stone !== undefined && stone.color === BLACK) {
      base = s.BSTONE;
    } else if (stone !== undefined && stone.color === WHITE) {
      base = s.WSTONE;
    } else if (pt.x() === 0 && pt.y() === 0) {
      base = s.TL_CORNER;
    } else if (pt.x() === 0 && pt.y() === ints) {
      base = s.BL_CORNER;
    } else if (pt.x() === ints && pt.y() === 0) {
      base = s.TR_CORNER;
    } else if (pt.x() === ints && pt.y() === ints) {
      base = s.BR_CORNER;
    } else if (pt.y() === 0) {
      base = s.TOP_EDGE;
    } else if (pt.x() === 0) {
      base = s.LEFT_EDGE;
    } else if (pt.x() === ints) {
      base = s.RIGHT_EDGE;
    } else if (pt.y() === ints) {
      base = s.BOT_EDGE;
    } else if (this._isStarpoint(pt, intersections)) {
      base = s.CENTER_STARPOINT;
    } else {
      base = s.CENTER;
    }
    return {base: base, mark: outMark};
  },

  _starPointSets: {
    9 : [{2:true, 6:true}, {4:true}],
    13 : [{3:true, 9:true}, {6:true}],
    19 : [{3:true, 9:true, 15:true}]
  },

  /**
   * Determine whether a pt is a starpoint.  Intersections is 1-indexed, but the
   * pt is 0-indexed.
   */
  _isStarpoint: function(pt, intersections) {
    var starPointSets = glift.bridge.flattener._starPointSets[intersections];
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
 * Data used to populate either a display or diagram.
 */
glift.bridge._Flattened = function(
    symbolPairs, lblData, coll, comment, boardRegion, cropping) {
  /**
   * Dense two level array designating what the base layer of the board looks like.
   * Example:
   *  [
   *    [
   *      {mark: EMPTY, base: TR_CORNER},
   *      {mark: EMPTY, base: BSTONE},
   *      {mark: TRIANGLE, base: WSTONE},
   *      ...
   *    ], [
   *      ...
   *    ]
   *    ...
   *  ]
   */
  this.symbolPairs = symbolPairs;

  /**
   * Map from ptstring to label data.
   * Example:
   *  {
   *    "12,3": "A",
   *    ...
   *  }
   */
  this.labelData = lblData;

  /**
   * Array of collisions objects.  In other words, we record stones that
   * couldn't be placed on the board.
   *
   * Each object in the collisions array looks like:
   * {color: <color>, mvnum: <number>, label: <label>}
   */
  this.collisions = coll;

  /** Comment string. */
  this.comment = comment;

  /** The board region this flattened representation is meant to display. */
  this.boardRegion = boardRegion;

  /** The cropping object. */
  // TODO(kashomon): Describe this.
  this.cropping = cropping;
};

glift.bridge._Flattened.prototype = {
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant symbol.
   * Note, this uses the SGF indexing as opposed to the indexing in the array,
   * so if the cropping is provided
   */
  getSymbolPairIntPt: function(pt) {
    var row = this.symbolPairs[pt.y() - this.cropping.cbox().top()];
    if (row === undefined) { return row; }
    return row[pt.x() - this.cropping.cbox().left()];
  },

  /**
   * Get a symbol from a the symbol pair table.
   */
  getSymbolPair: function(pt) {
    var row = this.symbolPairs[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /**
   * Get a Int pt Label Point, using an integer point.
   */
  getLabelIntPt: function(pt) {
    return this.labelData[pt.toString()];
  },

  /*
   * Get a Int pt Label Point
   */
  getLabel: function(pt) {
    return this.getLabelIntPt(this.ptToIntpt(pt));
  },

  /**
   * Turn a 0 indexed pt to an intersection point.
   */
  ptToIntpt: function(pt) {
    return glift.util.point(
        pt.x() + this.cropping.cbox().left(),
        pt.y() + this.cropping.cbox().top());
  }
};
