goog.provide('glift.rules.AppliedTreepath');
goog.provide('glift.rules.Treepath');
goog.provide('glift.rules.treepath');

/**
 * @typedef {!Array<number>}
 */
glift.rules.Treepath;

/**
 * The result of a treepath applied to a movetree.
 *
 * @typedef {{
 *  movetree: !glift.rules.MoveTree,
 *  stones: !Array<!glift.rules.Move>
 * }}
 */
glift.rules.AppliedTreepath;

/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem. This implies that the treepaths discussed below
 * are initial treepaths.
 *
 * Note: Both moves and and variations are 0 indexed.
 *
 * Some examples:
 * 0         - Start at the 0th move (the root node)
 * 53        - Start at the 53rd move, taking the primary path
 * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
 * 3         - Start at the 3rd move
 * 2.0       - Start at the 3rd move
 * 0.0.0.0   - Start at the 3rd move
 * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by traveling
 *             through the 3rd varition of the 2nd move
 *
 * Note: '+' is a special symbol which means "go to the end via the first
 * variation." This is implemented with a by appending 500 0s to the path array.
 * This is a hack, but in practice games don't go over 500 moves.
 *
 * The init position returned is an array of variation numbers traversed through.
 * The move number is precisely the length of the array.
 *
 * So:
 * 0       becomes []
 * 1       becomes [0]
 * 0.1     becomes [1]
 * 53      becomes [0,0,0,...,0] (53 times)
 * 2.3     becomes [0,0,3]
 * 0.0.0.0 becomes [0,0,0]
 * 2.3-4.1 becomes [0,0,3,0,1]
 * 1+      becomes [0,0,...(500 times)]
 * 0.1+    becomes [1,0,...(500 times)]
 * 0.2.6+  becomes [2,6,0,...(500 times)]
 *
 * Treepath Fragments
 *
 * In contrast to initial treepaths, treepaths can also be fragments that say
 * how to get from position n to position m.  Thus treepath fragments only
 * allow variation numbers and disallow the 3-10 syntax.
 *
 * This is how fragment strings are parsed:
 * 0       becomes [0]
 * 1       becomes [1]
 * 53      becomes [53]
 * 2.3     becomes [2,3]
 * 0.0.0.0 becomes [0,0,0]
 * 1+      becomes [1,0...(500 times)]
 */
glift.rules.treepath = {
  /**
   * Parse a treepath
   *
   * @param {number|string|!Array<number>|undefined} initPos The initial
   *    position, which can be defined as a variety of types.
   * @return {!glift.rules.Treepath}
   */
  parsePath: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = '' + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return /** @type {glift.rules.Treepath} */ (initPos);
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      return glift.rules.treepath.toEnd_();
    }

    var out = [];
    var lastNum = 0;
    // "2.3-4.1+"
    var sect = initPos.split('-');
    // [2.3, 4.1+]
    for (var i = 0; i < sect.length; i++) {
      // 4.1 => [4,1+]
      var v = sect[i].split('\.');
      // Handle the first number (e.g., 4); We necessitate this to be a move
      // number, so we push 0s until we get to the move number.
      var firstNum = parseInt(v[0], 10)
      for (var j = 0; j < firstNum - lastNum; j++) {
        out.push(0);
      }

      // If there's only one number, we add 500 those zeroes and break.
      if (/\+/.test(v[0])) {
        if (v.length !== 1 || i !== sect.length - 1) {
          throw new Error('Improper use of + at ' + v[0] + 
              ':  The + character can only occur at the end.');
        }
        out = out.concat(glift.rules.treepath.toEnd_());
        return out;
      }

      lastNum = firstNum;
      // Handle the rest of the numbers. These must be variations.
      for (var j = 1; j < v.length; j++) {
        var testNum = v[j];
        // Handle the last number. 1+
        if (testNum.charAt(testNum.length - 1) === '+') {
          testNum = testNum.slice(0, testNum.length - 1);
          out.push(parseInt(testNum, 10));
          // + must be the last character.
          out = out.concat(glift.rules.treepath.toEnd_());
          return out;
        } else {
          out.push(parseInt(testNum, 10));
        }
        lastNum++;
      }
    }
    return out;
  },

  /**
   * Path fragments are like path strings except that path fragments only allow
   * the 0.0.1.0 or [0,0,1,0] syntax. Also, paths like 3.2.1 are transformed
   * into [3,2,1] rather than [0,0,0,2,1].
   *
   * @param {!Array<number>|string} pathStr An initial path.
   * @return {!glift.rules.Treepath} The parsed treepath.
   */
  parseFragment: function(pathStr) {
    if (!pathStr) {
      pathStr = [];
    }
    var vartype = glift.util.typeOf(pathStr);
    if (vartype === 'array') {
      // Assume the array is in the correct format
      return /** @type {glift.rules.Treepath} */ (pathStr);
    }
    if (vartype !== 'string') {
      throw new Error('When parsing fragments, type should be string. was: ' + 
          vartype);
    }
    var splat = pathStr.split('.');
    var out = [];
    for (var i = 0; i < splat.length; i++) {
      var num = splat[i];
      if (num.charAt(num.length - 1) === '+') {
        num = num.slice(0, num.length - 1);
        out.push(parseInt(num, 10))
        out = out.concat(glift.rules.treepath.toEnd_());
      } else {
        out.push(parseInt(num, 10));
      }
    }
    return out;
  },

  /**
   * Converts a treepath fragement back to a string.  In other words:
   *    [2,0,1,2,6] => 2.0.1.2.6
   *
   * @param {!glift.rules.Treepath} path A treepath fragment.
   * @return {string} A fragment string.
   */
  toFragmentString: function(path) {
    if (glift.util.typeOf(path) !== 'array') {
      return path.toString();
    }
    return path.join('.');
  },

  /**
   * Converts a treepath back to an initial path string. This is like the
   * toFragmentString, except that long strings of -initial- zeroes are
   * converted to move numbers.
   *
   * I.e,
   *   0,0,0 => 3
   *   0,0,0.1 => 3.1
   *
   * Note: Once we're on a variation, we don't collapse the path
   *
   * @param {!glift.rules.Treepath} path A full treepath from the root.
   * @return {string} A full path string.
   */
  toInitPathString: function(path) {
    var out = [];
    var onMainLine = true;
    for (var i = 0; i < path.length; i++) {
      var elem = path[i];
      if (elem === 0) {
        if (onMainLine && i === path.length - 1) {
          out.push(i + 1);
        } else if (!onMainLine) {
          out.push(elem);
        }
        // ignore otherwise
      } else if (elem > 0) {
        // Since elem is non-zero, it's a variation indicator.
        if (onMainLine) {
          onMainLine = false;
          // Note: We only want to push the initial-move-number part *once*
          out.push(i);
        }
        out.push(elem);
      }
    }
    return out.join('.');
  },

  /**
   * Lazily computed treepath value.
   * @private {?glift.rules.Treepath}
   */
  storedToEnd_: null,

  /**
   * Return an array of 500 0-th variations.  This is sort of a hack, but
   * changing this would involve rethinking what a treepath is.
   *
   * @private
   * @return {!glift.rules.Treepath}
   */
  toEnd_: function() {
    if (glift.rules.treepath.storedToEnd_ != null) {
      return glift.rules.treepath.storedToEnd_;
    }
    var storedToEnd = []
    for (var i = 0; i < 500; i++) {
      storedToEnd.push(0);
    }
    glift.rules.treepath.storedToEnd_ = storedToEnd;
    return glift.rules.treepath.storedToEnd_;
  },

  /**
   * Use some heuristics to find a nextMovesTreepath.  This is used for
   * automatically adding move numbers.
   *
   * Note: The movetree should be in _final position_. The algorithm below works
   * backwards, continually updating a next-moves path as it goes. It finally
   * terminates when it reaches one of three conditions
   *  - There's a comment.
   *  - We go from variation to main branch.
   *  - We exceed minus-moves-override.
   *
   * _Important Note_ on starting moves: the resulting movetree has the
   * property that the initial position of the movetree should not be considered
   * for diagram purposes. I.e., the first move to be diagramed should be the
   * first element of the nextMoves path. So movetree+nextMoves[0] should be
   * the first move.
   *
   * @param {glift.rules.MoveTree} movetree A movetree, of course.
   * @param {glift.rules.Treepath=} opt_initTreepath The initial treepath. If not
   *    specified or undefined, use the current location in the movetree.
   * @param {number=} opt_minusMovesOverride: Force findNextMoves to to return a
   *    nextMovesTreepath of this length, starting from the init treepath.  The
   *    actual nextMovesTreepath can be shorter. (Note: This option should be
   *    deleted).
   * @param {boolean=} opt_breakOnComment Whether or not to break on comments on the
   *    main variation.  Defaults to true
   *
   * @return {{
   *  movetree: !glift.rules.MoveTree,
   *  treepath: !glift.rules.Treepath,
   *  nextMoves: !glift.rules.Treepath
   * }} An object with the following properties:
   *
   * - movetree: An updated movetree
   * - treepath: A new treepath that says how to get to this position
   * - nextMoves: A nextMovesTreepath, used to apply for the purpose of
   *    crafting moveNumbers.
   */
  findNextMovesPath: function(
      movetree, opt_initTreepath, opt_minusMovesOverride, opt_breakOnComment) {
    var initTreepath = opt_initTreepath || movetree.treepathToHere();
    var breakOnComment = opt_breakOnComment === false ? false : true;
    var mt = movetree.getTreeFromRoot(initTreepath);
    var minusMoves = opt_minusMovesOverride || 1000;
    var nextMovesTreepath = [];
    var startMainline = mt.onMainline();
    for (var i = 0; mt.node().getParent() && i < minusMoves; i++) {
      var varnum = mt.node().getVarNum();
      nextMovesTreepath.push(varnum);
      mt.moveUp();
      if (breakOnComment &&
          mt.properties().getOneValue(glift.rules.prop.C)) {
        break;
      }

      if (!startMainline && mt.onMainline()) {
        break; // Break if we've moved to the mainline from a variation
      }
    }
    nextMovesTreepath.reverse();
    return {
      movetree: mt,
      treepath: mt.treepathToHere(),
      nextMoves: nextMovesTreepath
    };
  },

  /**
   * Apply the nextmoves and find the collisions.
   *
   * augmented stone objects take the form:
   *    {point: <point>, color: <color>}
   * or
   *    {point: <point>, color: <color>, collision:<idx>}
   *
   * where idx is an index into the stones object. If idx is null, the stone
   * conflicts with a stone added elsewhere (i.e., in the goban).  This should
   * be a reasonably common case.
   *
   * @param {!glift.rules.MoveTree} movetree A rules.movetree.
   * @param {!glift.rules.Goban} goban A rules.goban array.
   * @param {!glift.rules.Treepath} nextMoves A next-moves treepath (fragment).
   *
   * @return {!glift.rules.AppliedTreepath} The result of applying the treepath
   *
   * - movetree: The updated movetree after applying the nextmoves
   * - stones: Array of 'augmented' stone objects
   */
  applyNextMoves: function(movetree, goban, nextMoves) {
    var colors = glift.enums.states;
    var mt = movetree.newTreeRef();
    var stones = [];
    var placedMap = {}; // map from ptstring to idx
    for (var i = 0; i < nextMoves.length; i++) {
      mt.moveDown(nextMoves[i]);
      var move = mt.properties().getMove();
      if (move && move.point && move.color) {
        var ptString = move.point.toString();
        var gcolor = goban.getStone(move.point);
        if (gcolor !== colors.EMPTY) {
          move.collision = null;
        } else if (placedMap[ptString] !== undefined) {
          move.collision = placedMap[ptString];
        }
        stones.push(move);
        placedMap[ptString] = i;
      }
    }
    return {
      movetree: mt,
      stones: stones
    };
  },

  /**
   * Flatten the move tree variations into a list of lists, where the sublists
   * are each a treepath.
   *
   * @param {!glift.rules.MoveTree} movetree The current movetree to flatten.
   * return {!Array<glift.rules.Treepath>} treepath An array of all possible
   *    treepaths.
   */
  flattenMoveTree: function(movetree) {
    var out = [];
    movetree = movetree.newTreeRef();
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i);
      var result = glift.rules.treepath._flattenMoveTree(movetree, []);
      movetree.moveUp();
      for (var j = 0; j < result.length; j++) {
        out.push(result[j])
      }
    }
    return out;
  },

  /**
   * @param {!glift.rules.MoveTree} movetree The movetree.
   * @param {!glift.rules.Treepath} pathToHere A treepath to here.
   * @private
   */
  _flattenMoveTree: function(movetree, pathToHere) {
    if (pathToHere === undefined) pathToHere = [];
    pathToHere.push(movetree.node().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i)
      var thisout = glift.rules.treepath._flattenMoveTree(
          movetree, pathToHere.slice());
      out = out.concat(thisout)
      movetree.moveUp()
    }
    if (out.length == 0) out.push(pathToHere);
    return out;
  }
};
