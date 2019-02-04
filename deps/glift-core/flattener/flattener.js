goog.provide('glift.flattener');

/**
 * Helps flatten a go board into a diagram definition. The flattened go board is
 * useful for all sorts of go-board rendering, be it print-rendering or a
 * dynamic UI.
 */
glift.flattener = {};

/**
 * Flattener Options
 *
 * Some notes about the parameters:
 *
 * Optional parameters:
 *  - goban: used for extracting all the inital stones.
 *  - nextMovesPath.  Defaults to [].  This is typically only used for
 *    printed diagrams.
 *  - initPosition.  Defaults to undefined. If not defined, we rely on the
 *    initial position provided by the movetree.
 *  - startingMoveNum.  Optionally override the move number. If not set, it's
 *    automatically determined based on whether the position is on the
 *    mainpath or a variation.
 *
 *  Optional cropping params.
 *  - boardRegion: indicates what region to crop on.
 *  - autoBoxCropOnNextMoves. If set, will automatically crop based on the
 *    nextmoves path.
 *  - regionRestrictions. Array of allowed boardRegions. If the calculated
 *    region is not an member of this set, default to using 'ALL'.
 *  - autoBoxCropOnNextMoves. Whether or not to perform auto-box cropping.
 *
 *  Options for marks
 *  - showNextVariationsType: Whether or not to show variations.
 *  - markLastMove: Whether or not to put a special mark on the last move
 *  - markKo: Whether or not to show the Ko location with a mark.
 *  - clearMarks: Whether to clear all the marks from the diagram. Note: this
 *    only affects marks and labels that are in the SGF and doesn't affect
 *    next-move-path labels (since that's the whole point of a next-moves-path.)
 *  - ignoreLabels: Whether to ignore any label-mark suggestions. This has the
 *    effect of clearing all labels
 *
 *  Options for problems
 *  - problemConditions: determine how to evaluate whether or not a position is
 *    considered 'correct'. Obviously, only useful for problems. Currently only
 *    for showing correct/incorrect moves in the explorer.
 *
 * @typedef {{
 *  goban: (!glift.rules.Goban|undefined),
 *  initPosition: (!glift.rules.Treepath|string|!Array<number>|undefined),
 *  nextMovesPath: (!glift.rules.Treepath|string|!Array<number>|undefined),
 *  startingMoveNum: (number|undefined),
 *  boardRegion: (glift.enums.boardRegions|undefined),
 *  autoRotateCropPrefs: (!glift.orientation.AutoRotateCropPrefs|undefined),
 *  regionRestrictions: (!Array<glift.enums.boardRegions>|undefined),
 *  showNextVariationsType: (glift.enums.showVariations|undefined),
 *  markLastMove: (boolean|undefined),
 *  selectedNextMove: (?glift.rules.Move|undefined),
 *  showKoLocation: (boolean|undefined),
 *  problemConditions: (!glift.rules.ProblemConditions|undefined),
 *  clearMarks: (boolean|undefined),
 *  ignoreLabels: (boolean|undefined)
 * }}
 */
glift.flattener.Options;


/**
 * This data is meant to be used like the following:
 *    '<color> <mvnum> at <collisionStoneColor> <label>'
 * as in this example:
 *    'Black 13 at White 2'
 *
 * Description:
 *  {
 *    color: <color of the move to be played>,
 *    mvnum: <move number>,
 *    label: <label where the collision occured>,
 *    collisionStoneColor: <color of the stone under the label>
 *  }
 *
 * @typedef {{
 *  color: glift.enums.states,
 *  mvnum: number,
 *  label: (string|undefined),
 *  collisionStoneColor: (glift.enums.states|undefined)
 * }}
 */
glift.flattener.Collision;

/**
 * Flatten the combination of movetree, goban, cropping, and treepath into an
 * array (really a 2D array) of symbols, (a Flattened object).
 *
 * @param {!glift.rules.MoveTree} movetreeInitial The movetree is used for
 *    extracting:
 *    -> The marks
 *    -> The next moves
 *    -> The previous move
 *    -> subsequent stones, if a nextMovesPath is present.  These are
 *    given labels.
 * @param {!glift.flattener.Options=} opt_options
 *
 * @return {!glift.flattener.Flattened}
 */
glift.flattener.flatten = function(movetreeInitial, opt_options) {
  // Create a new ref to avoid changing original tree ref.
  var mt = movetreeInitial.newTreeRef();
  var options = opt_options || {};

  if (options.initPosition !== undefined) {
    var initPos = glift.rules.treepath.parseInitialPath(options.initPosition || '');
    mt = mt.getTreeFromRoot(initPos);
  }

  // Use the provided goban, or reclaculate it.  This is somewhat inefficient,
  // so it's recommended that the goban be provided.
  var goban = options.goban || glift.rules.goban.getFromMoveTree(
      mt.getTreeFromRoot(), mt.treepathToHere()).goban;
  var showVars =
      options.showNextVariationsType  || glift.enums.showVariations.NEVER;

  // Note: NMTP is always defined and will, at the very least, be an empty
  // array.
  var nmtp = glift.rules.treepath.parseFragment(options.nextMovesPath || '');

  var optStartingMoveNum = options.startingMoveNum || null;
  // Find the starting move number before applying the next move path.
  if (optStartingMoveNum === null) {
    optStartingMoveNum = glift.flattener.findStartingMoveNum_(mt, nmtp);
  }

  // Starting move num must be defined, so let's get the types right.
  var startingMoveNum = /** @type {number} */ (optStartingMoveNum);

  var boardRegion = glift.flattener.getBoardRegion_(mt, nmtp, options);
  var cropping = glift.orientation.cropbox.get(
      boardRegion, mt.getIntersections());


  // The move number before applying the next move path.
  var baseMoveNum = mt.node().getNodeNum();

  // The move number of the first mainline move in the parent-chain.
  var mainlineMoveNum = mt.getMainlineNode().getNodeNum();

  // Like the above, except in stne format. In other words: {color: <color>,
  // point: <pt>}. null if at the root (or due to weirdness like placements).
  var mainlineMove = mt.getMainlineNode().properties().getMove();

  // We also grab the next mainline move. For variations (for display), we
  // usually want to reference the _next_ move rather than the parent mainline
  // move. As with the mainline move above, the next move can be null.
  var nextMainlineMove = null;
  var nextMainlineNode = mt.getMainlineNode().getChild(0);
  if (nextMainlineNode) {
    nextMainlineMove = nextMainlineNode.properties().getMove();
  }

  // Initial move number -- used to calculate the ending move number.
  var initNodeNumber = mt.node().getNodeNum();

  // Map of ptString to move.
  var applied = glift.rules.treepath.applyNextMoves(mt, goban, nmtp);

  // Map of ptString to stone obj.
  var stoneMap = glift.flattener.stoneMap_(goban, applied.stones);

  // Replace the movetree reference with the new position.  This movetree
  // should be equivalent to applying the initial treepath and then applying
  // the nextmoves treepath.
  mt = applied.movetree;

  // Calculate the ending move number. Since starting move num is only used
  // in conjunction with next moves paths, we can just look at the next moves
  // path array.
  var endingMoveNum = startingMoveNum + nmtp.length - 1;
  if (endingMoveNum < startingMoveNum) {
    // This can occur if we haven't move anywhere. In that case, we won't be
    // using the starting / ending move numbers for labeling the next moves,
    // but it's nice to keep the starting/ending moves coherent.
    endingMoveNum = startingMoveNum;
  }

  var correctNextMoves = glift.flattener.getCorrectNextMoves_(
      mt, options.problemConditions);

  // Get the marks at the current position
  var markMap = glift.flattener.markMap_(mt, options.clearMarks);

  // Optionally update the labels with labels used to indicate variations.
  var sv = glift.enums.showVariations
  if (showVars === sv.ALWAYS || (
      showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
    glift.flattener.updateLabelsWithVariations_(
        mt, markMap, correctNextMoves, options.selectedNextMove);
  }

  // Calculate the collision stones and update the marks / labels maps if
  // necessary.
  var collisions = glift.flattener.createStoneLabels_(
      applied.stones, stoneMap, markMap, startingMoveNum);

  // Optionally mark the last move played. Existing labels get preference.
  if (options.markLastMove) {
    glift.flattener.markLastMove_(markMap, mt.getLastMove());
  }

  if (options.markKo && !nmtp.length) {
    // We don't mark Ko for when the nextMovesPath (nmtp) is specified. If
    // there's a Ko & nmtp is defined, then stones will be captured but the
    // stones will be left on the board. So there's no point in putting a mark
    // or indicator at that location.
    glift.flattener.markKo_(markMap, goban.getKo());
  }

  // Optionally clear all the labels in the map.
  if (options.ignoreLabels) {
    glift.flattener.clearLabels_(markMap);
  }

  // Finally! Generate the intersections double-array.
  var board = glift.flattener.board.create(cropping, stoneMap, markMap);

  var comment = mt.properties().getComment() || '';

  return new glift.flattener.Flattened({
      board: board,
      collisions: collisions,
      comment: comment,
      isOnMainPath: mt.onMainline(),
      baseMoveNum: baseMoveNum,
      startingMoveNum: startingMoveNum,
      endMoveNum: endingMoveNum,
      mainlineMoveNum: mainlineMoveNum,
      mainlineMove: mainlineMove,
      nextMainlineMove: nextMainlineMove,
      stoneMap: stoneMap,
      markMap: markMap,
      // ProblemSpecific fields.
      correctNextMoves: correctNextMoves,
      // TODO(kashomon): Add support directly in the flattener params.
      problemResult: null,
  });
};


/**
 * Returns the board region for a movetree. Relevant configurability:
 *
 * mt: The movetree at the relevant position.
 * nmtp: The next moves treepath.
 *
 * options vars:
 * options.autoBoxCropOnNextMoves: auto-crop based on the just the nextmoves
 *    rather than the whole tree.
 * options.regionRestrictions: AN array
 *
 * This is probably too configurable at the moment.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.Treepath} nmtp
 * @param {!glift.flattener.Options} options
 *
 * @return {glift.enums.boardRegions} The board region.
 */
glift.flattener.getBoardRegion_ = function(mt, nmtp, options) {
  var boardRegion =
      options.boardRegion || glift.enums.boardRegions.ALL;
  var autoBoxCropOnNextMoves = options.autoBoxCropOnNextMoves || false;
  if (autoBoxCropOnNextMoves) {
    boardRegion = glift.orientation.getQuadCropFromMovetree(mt, nmtp);
  }
  if (boardRegion === glift.enums.boardRegions.AUTO) {
    boardRegion = glift.orientation.getQuadCropFromMovetree(mt);
  }
  var regionRestrictions = options.regionRestrictions || null;

  if (regionRestrictions) {
    if (glift.util.typeOf(regionRestrictions) !== 'array') {
      throw new Error('Invalid type for options.regionRestrictions: ' +
          'Must be array; was: ' + glift.util.typeOf(regionRestrictions));
    }
    // The user has decided to manuall specify a set of region restrictions.
    for (var i = 0; i < regionRestrictions.length; i++) {
      // We return the first region that matches. The order of the array
      // should give the preference of regions.
      if (boardRegion.indexOf(regionRestrictions[i]) > -1) {
        return regionRestrictions[i];
      }
    }
    return glift.enums.boardRegions.ALL;
  }
  return boardRegion;
};


/**
 * Note: This contains ALL stones for a given position.
 *
 * @param {!glift.rules.Goban} goban The current-state of the goban.
 * @param {!Array<glift.rules.Move>} nextStones that are the result of applying
 *    a next-moves path.
 * @return {!Object<!glift.PtStr, !glift.rules.Move>} Map from point string to stone.
 * @private
 */
glift.flattener.stoneMap_ = function(goban, nextStones) {
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
};


/**
 * Tracker for labels and symbols overlayed on stones
 *
 * Example value:
 * {
 *  marks: {
 *    "12,5": 13
 *    "12,3": 23
 *  },
 *  labels: {
 *    "12,3": "A"
 *    "12,4": "B"
 *  }
 * }
 *
 * @typedef{{
 *  marks: !Object<!glift.PtStr, !glift.flattener.symbols>,
 *  labels: !Object<!glift.PtStr, string>
 * }}
 */
glift.flattener.MarkMap;

/**
 * Get the relevant marks.  Returns an object containing two fields: marks,
 * which is a map from ptString to Symbol ID. and labels, which is a map
 * from ptString to text label.
 *
 * If there are two marks on the same intersection specified, the behavior is
 * undefined. Either mark might succeed in being placed. We consider this to be
 * an incorrectly specified SGF/movetree.
 *
 * @param {glift.rules.MoveTree} movetree
 * @param {(boolean|undefined)} clearMarks Whether or not to clear the marks
 *    from the board.
 * @return {!glift.flattener.MarkMap}
 * @private
 */
glift.flattener.markMap_ = function(movetree, clearMarks) {
  /** @type {!glift.flattener.MarkMap} */
  var out = { marks: {}, labels: {} };
  if (clearMarks) {
    return out;
  }
  var symbols = glift.flattener.symbols;
  /** @type {!Object<glift.rules.prop, !glift.flattener.symbols>} */
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
        if (prop === glift.rules.prop.LB) {
          var lblPt = glift.sgf.convertFromLabelData(data[i]);
          var key = lblPt.point.toString();
          out.marks[key] = symbol;
          out.labels[key] = lblPt.value;
        } else {
          var newPts = glift.util.pointArrFromSgfProp(data[i])
          for (var j = 0; j < newPts.length; j++) {
            out.marks[newPts[j].toString()] = symbol;
          }
        }
      }
    }
  }
  return out;
};

/**
 * Automatically finds the starting move number given a movetree position. This
 * is meant to be for well-formed variation paths.  That is, if we are
 * currently on the main path, we expect the next move paths will immediately
 * start on the variation or stay on the main path.
 *
 * Given this, there are three cases to consider:
 *    1. The movetree is on the mainpath and the next moves path stays on the
 *    main path:  Return the nodenum + 1 (this is the
 *    2. The movetere is on the mainpath, but the next move puts us on a
 *    variation. Return 1 (start over)
 *    3.  The movetree starts on a variation.  Count the number of moves since
 *    the mainpath branch.
 *
 * Note: The starting move is only interesting in the case where there's a
 * next-moves-path. If there's no next-moves-path specified, this number is
 * effectively unused.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.Treepath} nextMovesPath
 * @return {number}
 * @private
 */
glift.flattener.findStartingMoveNum_ = function(mt, nextMovesPath) {
  mt = mt.newTreeRef();
  if (mt.onMainline()) {
    if (nextMovesPath.length > 0 && nextMovesPath[0] > 0) {
      return 1;
    } else {
      return mt.node().getNodeNum() + 1;
    }
  }
  var mvnum = 1;
  while (!mt.onMainline()) {
    mvnum++;
    mt.moveUp();
  }
  return mvnum;
};

/**
 * Returns a map of ptstr to correct next moves. Usually used for creating marks
 * or other such display-handling.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.rules.ProblemConditions|undefined} conditions
 * @return {!Object<glift.PtStr, glift.rules.Move>} object of correct next moves.
 * @private
 */
glift.flattener.getCorrectNextMoves_ = function(mt, conditions) {
  var correctNextMap = {};
  if (conditions && !glift.util.obj.isEmpty(conditions)) {
    var correctNextArr = glift.rules.problems.correctNextMoves(mt, conditions);
    for (var i = 0; i < correctNextArr.length; i++) {
      var move = correctNextArr[i];
      if (move.point) {
        correctNextMap[move.point.toString()] = move;
      }
    }
  }
  return correctNextMap;
};

/**
 * Update the labels with variations numbers of the next movez. This is an
 * optional step and usually isn't done for diagrams-for-print.
 *
 * @param {!glift.rules.MoveTree} mt
 * @param {!glift.flattener.MarkMap} markMap
 * @param {!Object<glift.PtStr, glift.rules.Move>} correctNext Map of
 *    point-string to move, where the moves are moves identified as 'correct'
 *    variations. Will be empty unless problemConditions is defined in the input
 *    options.
 * @param {?glift.rules.Move|undefined} selectedNext For UIs: the selected next
 *    move. If defined, we'll mark the selected next move (somehow).
 * @private
 */
glift.flattener.updateLabelsWithVariations_ = function(
    mt, markMap, correctNext, selectedNext) {
  for (var i = 0; i < mt.node().numChildren(); i++) {
    var move = mt.node().getChild(i).properties().getMove();
    if (move && move.point) {
      var pt = move.point;
      var ptStr = pt.toString();
      if (markMap.labels[ptStr] === undefined) {
        var markValue = '' + (i + 1);
        if (selectedNext &&
            selectedNext.point &&
            ptStr == selectedNext.point.toString()) {
          // Mark the 'selected' variation as active.
          markValue += '.';
          //'\u02D9';
          // -- some options
          // '\u02C8' => ˈ simple
          // '\u02D1' => ˑ kinda cool
          // '\u02D9' => ˙ dot above (actually goes to the right)
          // '\u00B4' => ´
          // '\u0332' => underline
        }
        markMap.labels[ptStr] = markValue;
      }
      if (correctNext[ptStr]) {
        markMap.marks[ptStr] = glift.flattener.symbols.CORRECT_VARIATION;
      } else {
        markMap.marks[ptStr] = glift.flattener.symbols.NEXTVARIATION;
      }
    }
  }
};

/**
 * Create or apply labels to identify collisions that occurred during apply.
 *
 * labels: map from ptstring to label string.
 * startingMoveNum: The number at which to start creating labels
 *
 * returns: an array of collision objects:
 *
 * Sadly, this has has the side effect of altering the marks / labels maps --
 * not in the underlying movetree, but in the ultimate representation in the
 * board.
 *
 * @param {!Array<!glift.rules.Move>} appliedStones The result of applying the
 *    treepath.
 * @param {!Object<!glift.PtStr, !glift.rules.Move>} stoneMap Map of ptstring
 *    to the move.
 * @param {!glift.flattener.MarkMap} markMap
 * @param {number} startingMoveNum
 *
 * @return {!Array<!glift.flattener.Collision>}
 * @private
 */
glift.flattener.createStoneLabels_ = function(
    appliedStones, stoneMap, markMap, startingMoveNum) {
  if (!appliedStones || appliedStones.length === 0) {
    return []; // Don't perform relabeling if no stones are found.
  }
  // Collision labels, for when stone.collision = null.
  var extraLabs = 'abcdefghijklmnopqrstuvwxyz';
  var labsIdx = 0; // Index into extra labels string above.
  var symb = glift.flattener.symbols;
  var collisions = []; // {color: <color>, mvnum: <number>, label: <lbl>}

  // Remove any number labels currently existing in the marks map.
  var digitRegex = /[0-9]/;
  for (var ptstr in markMap.labels) {
    if (digitRegex.test(markMap.labels[ptstr])) {
      delete markMap.labels[ptstr];
      delete markMap.marks[ptstr];
    }
  }

  // Create labels for each stone in the next moves treepath.  Note -- we only
  // add labels in the case when there's a next moves path.
  for (var i = 0; i < appliedStones.length; i++) {
    var stone = appliedStones[i];
    var ptStr = stone.point.toString();
    var nextMoveNum = i + startingMoveNum;
    var colStone = stoneMap[ptStr];
    // If there's a stone in the stone map (which there _should_ be since
    // there's a collision), then we store that in the collision object
    var colStoneColor = undefined;
    if (colStone && colStone.color) {
      colStoneColor = colStone.color;
    }

    // This is a collision stone. Perform collision labeling.
    if (stone.hasOwnProperty('collision')) {
      var col = {
        color: stone.color,
        mvnum: (nextMoveNum),
        label: undefined,
        collisionStoneColor: colStoneColor
      };
      if (markMap.labels[ptStr]) { // First see if there are any available labels.
        col.label = markMap.labels[ptStr];
      } else if (glift.util.typeOf(stone.collision) === 'number') {
        var collisionNum = stone.collision + startingMoveNum;
        col.label = (collisionNum) + ''; // label is idx.
      } else { // should be null
        var lbl = extraLabs.charAt(labsIdx);
        labsIdx++;
        col.label = lbl;
        markMap.marks[ptStr] = symb.TEXTLABEL;
        markMap.labels[ptStr] = lbl;
      }
      collisions.push(col);

    // This is not a collision stone. Perform standard move-labeling.
    } else {
      // Create new labels for our move number.
      markMap.marks[ptStr] = symb.TEXTLABEL; // Override labels.
      markMap.labels[ptStr] = (nextMoveNum) + ''
    }
  }
  return collisions;
};

/**
 * Update the mark map with the last move if:
 *
 * 0. The last move is defined.
 * 1. There is no existing mark in the markMap at the location.
 *
 * @param {!glift.flattener.MarkMap} markMap
 * @param {?glift.rules.Move} lastMove
 */
glift.flattener.markLastMove_ = function(markMap, lastMove) {
  if (lastMove && lastMove.point) {
    var ptstr = lastMove.point.toString();
    if (!markMap.marks[ptstr]) {
      markMap.marks[ptstr] = glift.flattener.symbols.LASTMOVE;
    }
  }
};

/**
 * Optionally mark the Ko move. This only updates the map if:
 *
 * 0. The ko is defined
 * 1. There is no existing mark in the markMap at the location.
 *
 * @param {!glift.flattener.MarkMap} markMap
 * @param {?glift.Point} koLocation
 */
glift.flattener.markKo_ = function(markMap, koLocation) {
  if (koLocation) {
    var ptstr = koLocation.toString();
    if (!markMap.marks[ptstr]) {
      markMap.marks[ptstr] = glift.flattener.symbols.KO_LOCATION;
    }
  }
};


/**
 * Clear all the labels from a mark map.
 *
 * @param {!glift.flattener.MarkMap} markMap
 * @private
 */
glift.flattener.clearLabels_ = function(markMap) {
  var marks = markMap.marks;
  for (var key in marks) {
    var symbol = marks[key];
    if (symbol === glift.flattener.symbols.TEXTLABEL) {
      delete marks[key];
    }
  }
  markMap.labels = {};
}
