/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem.
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
 * variation."
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
 */
glift.rules.treepath = {
  parseInitPosition: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = "" + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return initPos;
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      return this.toEnd();
    }

    var out = [];
    var lastNum = 0;
    // "2.3-4.1+"
    var sect = initPos.split('-');
    // [2.3, 4.1+]
    for (var i = 0; i < sect.length; i++) {
      // 4.1 => [4,1+]
      var v = sect[i].split('\.');
      // Handle the first number (e.g., 4);
      for (var j = 0; j < v[0] - lastNum; j++) {
        out.push(0);
      }
      var lastNum = v[0];
      // Handle the rest of the numbers (e.g., 1+)
      for (var j = 1; j < v.length; j++) {
        // Handle the last number. 1+
        var testNum = v[j];
        if (testNum.charAt(testNum.length - 1) === '+') {
          testNum = testNum.slice(0, testNum.length - 1);
          out.push(parseInt(testNum));
          // + must be the last character.
          out = out.concat(glift.rules.treepath.toEnd());
          return out;
        } else {
          out.push(parseInt(testNum));
        }
        lastNum++;
      }
    }
    return out;
  },

  /**
   * Return an array of 500 0-th variations.  This is sort of a hack, but
   * changing this would involve rethinking what a treepath is.
   */
  toEnd: function() {
    if (glift.rules.treepath._storedToEnd !== undefined) {
      return glift.rules.treepath._storedToEnd;
    }
    var storedToEnd = []
    for (var i = 0; i < 500; i++) {
      storedToEnd.push(0);
    }
    glift.rules.treepath._storedToEnd = storedToEnd;
    return glift.rules.treepath._storedToEnd;
  },

  /**
   * Use some heuristics to find a nextMovesTreepath.  This is used for
   * automatically adding move numbers.
   *
   * movetree: a movetree, of course.
   * initTreepath [optional]: the initial treepath. If not specified or
   *    undefined, use the current location in the movetree.
   * minusMovesOverride: force findNextMoves to to return a nextMovesTreepath of
   *    this length, starting from the init treepath.  The actually
   *    nextMovesTreepath can be shorter
   *
   * returns: on object with two keys
   *    movetree: an update movetree
   *    treepath: a new treepath that says how to get to this position
   *    nextMoves: A nextMovesTreepath, used to apply for the purpose of
   *        crafting moveNumbers.
   *    breakOnMainComment: Whether or not to break on comments on the main
   *        variation.
   */
  findNextMoves: function(
      movetree, initTreepath, minusMovesOverride, breakOnMainComment) {
    var initTreepath = initTreepath || movetree.treepathToHere();
    var mt = movetree.getTreeFromRoot(initTreepath);
    var minusMoves = minusMovesOverride || 40;
    var nextMovesTreepath = [];
    var startMainline = mt.onMainline();
    for (var i = 0; mt.node().getParent() && i < minusMoves; i++) {
      var varnum = mt.node().getVarNum();
      nextMovesTreepath.push(varnum);
      mt.moveUp();
      if (breakOnMainComment &&
          startMainline &&
          mt.properties().getOneValue('C')) {
        break;
      }

      // Break if we've moved to the mainline.
      if (!startMainline && mt.onMainline() && !minusMovesOverride) {
        break;
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
   * movetree: a rules.movetree.
   * goban: a rules.goban array.
   * nextMoves:  A next-moves treepath. See findNextMoves.
   *
   * returns: An object with three keys:
   *    movetree: the updated movetree after applying the nextmoves
   *    stones: arrayof 'augmented' stone objects
   *
   * augmented stone objects take the form:
   *    {point: <point>, color: <color>}
   * or
   *    {point: <point>, color: <color>, collision:<idx>}
   *
   * where idx is an index into the stones object.  If idx is null, the stone
   * conflicts with a stone added elsewhere (i.e., in the goban).  This should
   * be a reasonably common case.
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
   * TODO(kashomon): This is only used by the problem.js file.  Maybe move it in
   * there.
   */
  flattenMoveTree: function(movetree) {
    var out = [];
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

  _flattenMoveTree: function(movetree, pathToHere) {
    if (pathToHere === undefined) pathToHere = [];
    pathToHere.push(movetree.node().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i)
      var thisout = glift.rules.treepath._flattenMoveTree(
          movetree, pathToHere.slice());
      out = out.concat(thisout)
      movetree.moveUp(i)
    }
    if (out.length == 0) out.push(pathToHere);
    return out;
  }
};
