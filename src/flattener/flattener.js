/**
 * Helps flatten a go board into a diagram definition.
 */
glift.flattener = {
  /**
   * Flatten the combination of movetree, goban, cropping, and treepath into an
   * array (really a 2D array) of symbols, (a Flattened object).
   *
   * Some notes about the parameters:
   *
   * Required parameters:
   *  - The movetree is used for extracting:
   *    -> The marks
   *    -> The next moves
   *    -> The previous move
   *    -> subsequent stones, if a nextMovesTreepath is present.  These are
   *    given labels.
   *
   * Optional parameters:
   *  - goban: used for extracting all the inital stones.
   *  - boardRegion: indicates what region to crop on.
   *  - nextMovesTreepath.  Defaults to [].  This is typically only used for
   *    printed diagrams.
   *  - startingMoveNum.  Optionally override the move number. Usually used for
   *  variations.
   */
  flatten: function(movetreeInitial, options) {
    // create a new ref to avoid changing original tree ref.
    var mt = movetreeInitial.newTreeRef();
    options = options || {};

    // Use the provided goban, or reclaculate it.  This is somewhat inefficient,
    // so it's recommended that the goban be provided.
    var goban = options.goban || glift.rules.goban.getFromMoveTree(
        mt.getTreeFromRoot(), mt.treepathToHere()).goban;
    var boardRegion =
        options.boardRegion || glift.enums.boardRegions.ALL;
    var showVars =
        options.showNextVariationsType  || glift.enums.showVariations.NEVER;
    var nmtp = options.nextMovesTreepath || [];
    var startingMoveNum = options.startingMoveNum || 1;

    // Calculate the board region.
    if (boardRegion === glift.enums.boardRegions.AUTO) {
      boardRegion = glift.bridge.getCropFromMovetree(mt);
    }
    var cropping = glift.displays.cropbox.getFromRegion(
        boardRegion, mt.getIntersections());

    // Map of ptString to move.
    var applied = glift.rules.treepath.applyNextMoves(mt, goban, nmtp);
    // Map of ptString to stone obj.
    var stoneMap = glift.flattener._stoneMap(goban, applied.stones);

    // Replace the movetree reference with the new position
    mt = applied.movetree;

    // Get the marks at the current position
    var mksOut = glift.flattener._markMap(mt);
    var labels = mksOut.labels; // map of ptstr to label str
    var marks = mksOut.marks; // map of ptstr to symbol

    // Optionally update the labels with labels used to indicate variations.
    var sv = glift.enums.showVariations
    if (showVars === sv.ALWAYS || (
        showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
      glift.flattener._updateLabelsWithVariations(mt, marks, labels);
    }

    // Calculate the collision stones and update the marks / labels maps if
    // necessary.
    var collisions = glift.flattener._createStoneLabels(
        applied.stones, marks, labels, startingMoveNum);

    // Finally! Generate the intersections double-array.
    var board = glift.flattener.board.create(
        cropping.cbox(), stoneMap, marks, labels, mt.getIntersections());

    var comment = mt.properties().getComment() || '';
    return new glift.flattener.Flattened(board, collisions, comment, boardRegion);
  },

  /**
   * Get map from pt string to stone {point: <point>, color: <color>}.
   * goban: a glift.rules.goban instance.
   * nextStones: array of stone objects -- {point: <pt>, color: <color>}
   *    that are a result of applying a next-moves-treepath.
   */
  _stoneMap: function(goban, nextStones) {
    var out = {};
    // Array of {color: <color>, point: <point>}
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      out[stone.point.toString()] = stone;
    }

    for (var i = 0; i < nextStones.length; i++) {
      var stone = nextStones[i];
      var mv = { point: stone.point, color: stone.color };
      var ptstr = mv.point.toString();
      if (!out[ptstr]) {
        out[ptstr] = mv;
      }
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
    var symbols = glift.flattener.symbols;
    var propertiesToSymbols = {
      CR: symbols.CIRCLE,
      LB: symbols.TEXTLABEL,
      MA: symbols.XMARK,
      SQ: symbols.SQUARE,
      TR: symbols.TRIANGLE
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
  // TODO(kashomon): Guard this with a autoLabelMoves flag.
  _createStoneLabels: function(stones, marks, labels, startingMoveNum) {
    if (!stones || stones.length === 0) {
      return []; // Don't perform relabeling if no stones are found.
    }
    // Collision labels, for when stone.collision = null.
    var extraLabs = 'abcdefghijklmnopqrstuvwxyz';
    var labsIdx = 0;
    var symb = glift.flattener.symbols;
    var collisions = []; // {color: <color>, num: <number>, label: <lbl>}

    // Remove any number labels currently existing in the marks map.  This
    // method also numbers stones.
    var digitRegex = /[0-9]/;
    for (var ptstr in labels) {
      if (digitRegex.test(labels[ptstr])) {
        delete labels[ptstr];
        delete marks[ptstr];
      }
    }

    // Create labels for each stone in the 'next-stones'.
    for (var i = 0; i < stones.length; i++) {
      var stone = stones[i];
      var ptStr = stone.point.toString();

      // This is a collision stone. Perform collision labeling.
      if (stone.hasOwnProperty('collision')) {
        var col = {
          color: stone.color,
          mvnum: (i + startingMoveNum) + '',
          label: undefined
        };
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

      // This is not a collision stone. Perform standard move-labeling.
      } else {
        // Create new labels for our move number.
        marks[ptStr] = symb.TEXTLABEL; // Override labels.
        labels[ptStr] = (i + startingMoveNum) + ''
      }
    }
    return collisions;
  },

  /**
   * Update the labels with variations numbers. This is an optional step and
   * usually isn't done for diagrams-for-print.
   */
  _updateLabelsWithVariations: function(mt, marks, labels) {
    for (var i = 0; i < mt.node().numChildren(); i++) {
      var move = mt.node().getChild(i).properties().getMove();
      if (move && move.point) {
        var pt = move.point;
        var ptStr = pt.toString();
        if (labels[ptStr] === undefined) {
          labels[ptStr] = '' + (i + 1);
        }
        marks[ptStr] = glift.flattener.symbols.NEXTVARIATION;
      }
    }
  }
};
