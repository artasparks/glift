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
 * Options for finding findNextMovesPath.
 *
 * initTreepath: The initial treepath. If not specified or undefined, use the
 *    current location in the movetree
 * minusMovesOverride: Force findNextMoves to to return a
 *    nextMovesPath of this length, starting from the init treepath.  The
 *    actual nextMovesPath can be shorter if there's a break, but this sets an
 *    upper limit.
 * breakOnComment: Whether or not to break on comments on the main variation.
 *    Defaults to true if unspecified.
 *
 * @typedef {{
 *  initTreepath: (!glift.rules.Treepath|undefined),
 *  minusMovesOverride: (number|undefined),
 *  breakOnComment: (boolean|undefined),
 * }}
 */
glift.rules.NextMovesPathOptions;

/**
 * # Treepath
 *
 * A treepath is a list of variations that says how to travel through a tree of
 * moves. So,
 *
 *    [0,1,0]
 *
 * Means we will first take the 0th variation, then we will take the 1ist
 * variation, and lastly we will take the 0th variation again. For
 * convenience, the treepath can also be specified by a string, which is where
 * the fun begins. At it's simpliest,
 *
 *    [0,0,0] becomes 0.0.0
 *
 * but there are a couple different short-hands that make using treepaths a
 * little easier
 *
 *    0.1+    Take the 0th variation, then the 1st variation, then go to the end
 *    0.1:2   Take the 0th variation, then repeat taking the 1st varation twice
 *
 * There are two types of treepaths discussed below -- A *treepath fragment*
 * (which is what we have been describing) and an *initial treepath*.
 *
 * ## Treepath Fragments
 *
 * Treepaths say how to get from position n to position m.  Thus the numbers are
 * always variations except in the case of AxB syntax, where B is a multiplier
 * for a variation.
 *
 * This is how fragment strings are parsed:
 *
 *    0             becomes [0]
 *    1             becomes [1]
 *    53            becomes [53] (the 53rd variation)
 *    2.3           becomes [2,3]
 *    0.0.0.0       becomes [0,0,0]
 *    0:4           becomes [0,0,0,0]
 *    1+            becomes [1,0...(500 times)]
 *    1:4           becomes [1,1,1,1]
 *    1.2:1.0.2:3'  becomes [1,2,0,2,2,2]
 *
 * ## Initial tree paths.
 *
 * The initial treepath always treats the first number as a 'move number'
 * instead of a variation. Thus
 *
 *    3.1.0
 *
 * means start at move 3 (always taking the 0th variation path) and then take
 * the path fragment [1,0].
 *
 * Some examples:
 *
 *    0         - Start at the 0th move (the root node)
 *    53        - Start at the 53rd move (taking the 0th variation)
 *    2.3       - Start at the 3rd variation on move 2 (actually move 3)
 *    3         - Start at the 3rd move
 *    2.0       - Start at the 3rd move
 *    0.0.0.0   - Start at the 3rd move
 *    0.0:3     - Start at the 3rd move
 *
 * As with fragments, the init position returned is an array of variation
 * numbers traversed through.  The move number is precisely the length of the
 * array.
 *
 * So, for parsing
 *
 *    0         becomes []
 *    1         becomes [0]
 *    0.1       becomes [1]
 *    53        becomes [0,0,0,...,0] (53 times)
 *    2.3       becomes [0,0,3]
 *    0.0.0.0   becomes [0,0,0]
 *    1+        becomes [0,0,...(500 times)]
 *    0.1+      becomes [1,0,...(500 times)]
 *    0.2.6+    becomes [2,6,0,...(500 times)]
 *    0.0:3.1x3 becomes [0,0,0,1,1,1]
 *
 * As mentioned before, '+' is a special symbol which means "go to the end via
 * the first variation." This is implemented with a by appending 500 0s to the
 * path array.  This is a hack, but in practice games don't go over 500 moves.
 *
 * Obsolete syntax:
 *    2.3-4.1 becomes [0,0,3,0,1]
 */
glift.rules.treepath = {
  /**
   * Parse an initial treepath
   *
   * @param {number|string|!Array<number>|undefined} initPos The initial
   *    position, which can be defined as a variety of types.
   * @return {!glift.rules.Treepath}
   */
  parseInitialPath: function(initPos) {
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = parseInt(initPos, 10) + '';
    } else if (glift.util.typeOf(initPos) === 'array') {
      return /** @type {glift.rules.Treepath} */ (initPos);
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      // Should this syntax even be allowed?
      return glift.rules.treepath.toEnd_();
    }

    var out = [];
    var firstNum = parseInt(initPos, 10);
    for (var j = 0; j < firstNum; j++) {
      out.push(0);
    }

    // The only valid next characters are . or +.
    var rest = initPos.replace(firstNum + '', '');
    if (rest == '') {
      return out;
    }

    var next = rest.charAt(0);
    if (next === '.') {
      return out.concat(glift.rules.treepath.parseFragment(rest.substring(1)));
    } else if (next === '+') {
      return out.concat(glift.rules.treepath.toEnd_());
    } else {
      throw new Error('Unexpected token [' + next + '] for path ' + initPos)
    }
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
      // Assume the array is in the correct format.
      return /** @type {glift.rules.Treepath} */ (pathStr);
    }
    if (vartype !== 'string') {
      throw new Error('When parsing fragments, type should be string. was: ' + 
          vartype);
    }
    var splat = pathStr.split(/([\.:+])/);
    var numre = /^\d+$/;
    var out = [];

    var states = {
      VARIATION: 1,
      SEPARATOR: 2,
      MULTIPLIER: 3,
    };
    var curstate = states.VARIATION;
    var prevVariation = null;
    for (var i = 0; i < splat.length; i++) {
      var token = splat[i];
      if (curstate === states.SEPARATOR) {
        if (token === '.') {
          curstate = states.VARIATION;
        } else if (token === ':') {
          curstate = states.MULTIPLIER;
        } else if (token === '+') {
          // There could be more characters after this. Maybe throw an error.
          return out.concat(glift.rules.treepath.toEnd_());
        } else {
          throw new Error('Unexpected token ' + token + ' for path ' + pathStr);
        }
      } else {
        if (!numre.test(token)) {
          throw new Error('Was expecting number but found ' + token
              + ' for path: ' + pathStr);
        }
        var num = parseInt(token, 10);
        if (curstate === states.VARIATION) {
          out.push(num);
          prevVariation = num;
          curstate = states.SEPARATOR;
        } else if (curstate === states.MULTIPLIER) {
          if (prevVariation === null) {
            throw new Error('Error using variation multiplier for path: '
                + pathStr);
          }
          // We should have already added the variation once, so we add num-1
          // more times. This has the side effect that 0:0 is equivalent to 0:1
          // and also equivalent to just 0. Probably ok.
          for (var j = 0; j < num - 1; j++) {
            out.push(prevVariation);
          }
          prevVariation = null;
          curstate = states.SEPARATOR;
        }
      }
    }
    return out;
  },

  /**
   * Converts a treepath fragement back to a string.  In other words:
   *    [2,0,1,2,6] => 2.0.1.2.6
   *    [0,0,0,0] => 0:4
   *    [0,0,0,0,1,1,1] => 0:4.1:3
   * If the treepath is empty, returns an empty string.
   *
   * @param {!glift.rules.Treepath} path A treepath fragment.
   * @return {string} A fragment string.
   */
  toFragmentString: function(path) {
    if (glift.util.typeOf(path) !== 'array') {
      // This is probably unnecessary, but exists for safety.
      return path.toString();
    }
    if (path.length === 0) {
      return '';
    }
    var last = null;
    var next = null;
    var repeated = 0;
    var out = null;

    var flush = function() {
      var component = '';
      if (repeated < 2) {
        component = last + '';
      } else {
        component = last + ':' + repeated;
      }
      if (out === null) {
        out = component;
      } else {
        out += '.' + component;
      }
      repeated = 1;
    }

    for (var i = 0; i < path.length; i++) {
      next = path[i];
      if (last === null) {
        last = next;
      }
      if (next === last) {
        repeated++;
      } else {
        flush();
      }
      last = next;
    }
    flush();
    return out;
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
    if (glift.util.typeOf(path) !== 'array') {
      return path.toString();
    }
    if (path.length === 0) {
      return '0';
    }

    var out = [];
    var onMainLine = true;
    var firstNumber = 0;
    for (var i = 0; i < path.length; i++) {
      var elem = path[i];
      if (elem !== 0) {
        break;
      } else {
        firstNumber = i + 1;
      }
    }
    var component = glift.rules.treepath.toFragmentString(path.slice(firstNumber));
    if (component) {
      return firstNumber + '.' + component;
    } else {
      return firstNumber + '';
    }
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
   * Use some heuristics to find a nextMovesPath.  This is used for
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
   * @param {glift.rules.NextMovesPathOptions=} opt_options options
   *
   * @return {{
   *  movetree: !glift.rules.MoveTree,
   *  treepath: !glift.rules.Treepath,
   *  nextMoves: !glift.rules.Treepath
   * }} An object with the following properties:
   *
   * - movetree: An updated movetree
   * - treepath: A new treepath that says how to get to this position
   * - nextMoves: A nextMovesPath, used to apply for the purpose of
   *    crafting moveNumbers.
   */
  findNextMovesPath: function(movetree, opt_options) {
    var opt = opt_options || {};
    var initTreepath = opt.initTreepath || movetree.treepathToHere();
    var breakOnComment = opt.breakOnComment === undefined ? true : !!opt.breakOnComment;
    var mt = movetree.getTreeFromRoot(initTreepath);
    var minusMoves = opt.minusMovesOverride || 1000;
    var nextMovesPath = [];
    var startMainline = mt.onMainline();
    for (var i = 0; mt.node().getParent() && i < minusMoves; i++) {
      var varnum = mt.node().getVarNum();
      nextMovesPath.push(varnum);
      mt.moveUp();
      if (breakOnComment &&
          mt.properties().getOneValue(glift.rules.prop.C)) {
        break;
      }

      if (!startMainline && mt.onMainline()) {
        break; // Break if we've moved to the mainline from a variation
      }
    }
    nextMovesPath.reverse();
    return {
      movetree: mt,
      treepath: mt.treepathToHere(),
      nextMoves: nextMovesPath
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
