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

  // Flatten the move tree variations into a list of lists, where the sublists
  // are each a treepath.
  //
  // TODO(kashomon): Why does this exist?
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
