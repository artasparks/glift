/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 * _currentNode
 * _rootNode
 *}
 *
 * And where a MoveNode looks like the following:
 * MoveNode: {
 *    nodeId: { ... },
 *    properties: Properties,
 *    children: [MoveNode, MoveNode, MoveNode],
 *    parent: MoveNode
 *  }
 *}
 *
 * Additionally, each node in the movetree has an ID property that looks like:
 *
 * node : {
 *  nodeId : <num>,  // The vertical position in the tree.
 *  varId  : <num>,  // The variation number, which is identical to the position
 *                   // in the 'nodes' array.  Also, the 'horizontal' position .
 * }
 *
 * If you are familiar with the SGF format, this should look very similar to the
 * actual SGF format, and is easily converted back to a SGF. And so, The
 * MoveTree is a simple wrapper around the parsed SGF.
 *
 * Each move is an object with two properties: tokens and nodes, the
 * latter of which is a list to capture the idea of multiple variations.
 */
glift.rules.movetree = {
  /** Create an empty MoveTree */
  getInstance: function(intersections) {
    var mt = new glift.rules._MoveTree(glift.rules.movenode());
    if (intersections !== undefined) {
      mt._setIntersections(intersections);
    }
    return mt;
  },

  /** Create a MoveTree from an SGF. */
  getFromSgf: function(sgfString, initPosition) {
    initPosition = initPosition || []; // treepath.
    if (glift.util.typeOf(initPosition) === 'string' ||
        glift.util.typeOf(initPosition) === 'number') {
      initPosition = glift.rules.treepath.parsePath(initPosition);
    }
    if (sgfString === undefined || sgfString === '') {
      return glift.rules.movetree.getInstance(19);
    }
    glift.util.majorPerfLog('Before SGF parsing in movetree');
    var mt = glift.sgf.parse(sgfString);

    glift.util.majorPerfLog('After SGF parsing in movetree');
    for (var i = 0; i < initPosition.length; i++) {
      mt.moveDown(initPosition[i]);
    }
    return mt;
  },

  /**
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   */
  getFromNode: function(node) {
    return new glift.rules._MoveTree(node);
  },

  /** Seach nodes with a Depth First Search. */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      glift.rules.movetree.searchMoveTreeDFS(moveTree.moveDown(i), func);
    }
    moveTree.moveUp();
  }
};

/**
 * A MoveTree is a tree of movenodes played.  The movetree is (usually) a
 * processed parsed SGF, but could be created organically.
 *
 * Semantically, a MoveTree can be thought of as a game, but could also be a
 * problem, demonstration, or example.  Thus, this is the place where such moves
 * as currentPlayer or lastMove.
 */
glift.rules._MoveTree = function(rootNode, currentNode) {
  this._rootNode = rootNode;
  this._currentNode = currentNode || rootNode;
  this._markedMainline = false;
};

glift.rules._MoveTree.prototype = {
  /////////////////////////
  // Most common methods //
  /////////////////////////

  /** Get the current node -- that is, the node at the current position. */
  node: function() {
    return this._currentNode;
  },

  /** Get the properties object on the current node. */
  properties: function() {
    return this.node().properties();
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   */
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.node().getChild(num) !== undefined) {
      this._currentNode = this.node().getChild(num);
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not at root move.
   * At the root node, movetree.moveUp().moveUp() == movetree.moveUp();
   */
  moveUp: function() {
    var parent = this._currentNode.getParent();
    if (parent) { this._currentNode = parent; }
    return this;
  },

  /**
   * Get the current player as a color.
   */
  getCurrentPlayer: function() {
    var states = glift.enums.states;
    var tokenMap = {W: 'WHITE', B: 'BLACK'};
    var curNode = this._currentNode;

    // The PL property is a short circuit. Usually only used on the root node.
    if (this.properties().contains('PL')) {
      return tokenMap[this.properties().getOneValue('PL')]
    }

    var move = curNode.properties().getMove();
    while (!move) {
      curNode = curNode.getParent();
      if (!curNode) {
        return states.BLACK;
      }
      move = curNode.properties().getMove();
    }
    if (!move) {
      return states.BLACK;
    } else if (move.color === states.BLACK) {
      return states.WHITE;
    } else if (move.color === states.WHITE) {
      return states.BLACK;
    } else {
      return states.BLACK;
    }
  },

  /**
   * Get a new tree reference.  The underlying tree remains the same, but this
   * is a lightway to create new references so the current node position can be
   * changed.
   */
  newTreeRef: function() {
    return new glift.rules._MoveTree(this._rootNode, this._currentNode);
  },

  /**
   * Get a new move tree instance from the root node.
   *
   * treepath: optionally also apply a treepath to the tree
   */
  getTreeFromRoot: function(treepath) {
    var mt = glift.rules.movetree.getFromNode(this._rootNode);
    if (treepath && glift.util.typeOf(treepath) === 'array') {
      for (var i = 0, len = treepath.length;
           i < len && mt.node().numChildren() > 0; i++) {
        mt.moveDown(treepath[i]);
      }
    }
    return mt;
  },

  ///////////////////////////////////
  // Other methods, in Alpha Order //
  ///////////////////////////////////
  /** Add a new Node to the cur position and move to that position. */
  addNode: function() {
    this.node().addChild();
    this.moveDown(this.node().numChildren() - 1);
    return this;
  },

  /** Delete the current node and move up */
  // TODO(kashomon): Finish this.
  deleteNode: function() { throw "Unfinished"; },

  /**
   * Given a point and a color, find the variation number corresponding to the
   * branch that has the sepceified move.
   *
   * return either the number or null if no such number exists.
   */
  findNextMove: function(point, color) {
    var nextNodes = this.node().children,
        token = glift.sgf.colorToToken(color),
        ptSet = {};
    for (var i = 0; i < nextNodes.length; i++) {
      var node = nextNodes[i];
      if (node.properties().contains(token)) {
        if (node.properties().getOneValue(token) == "") {
          // This is a 'PASS'.  Ignore
        } else {
          ptSet[node.properties().getAsPoint(token).hash()] =
            node.getVarNum();
        }
      }
    }
    if (ptSet[point.hash()] !== undefined) {
      return ptSet[point.hash()];
    } else {
      return null;
    }
  },

  /** Get the intersections number of the go board, by looking at the props. */
  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (mt.properties().contains(allProperties.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(allProperties.SZ));
      return ints;
    } else {
      return 19;
    }
  },

  /**
   * Get the last move ([B] or [W]). This is a convenience method, since it
   * delegates to properties().getMove();
   *
   * Returns a move object: { color:<color point:<point } or null;
   *
   * There are two cases where null can be returned:
   *  - At the root node.
   *  - When, in the middle of the game, stone-placements are added for
   *    illustration (AW,AB).
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * If not on the mainline, returns the appriate 'move number' for a variation,
   * for the current location, which is the number of moves to mainline
   *
   * Returns 0 if on mainline.
   */
  movesToMainline: function() {
    var mt = this.newTreeRef();
    for (var n = 0; !mt.onMainline() && mt.node().getParent(); n++) {
      mt.moveUp();
    }
    return n;
  },

  /**
   * Get the next moves (i.e., nodes with either B or W properties);
   *
   * returns: an array of dicts with the moves, e.g.,
   *    [{color: <Color>, point: point },...]
   *
   * The ordering of the moves is guranteed to be the ordering of the
   *    variations at the time of creation.
   */
  nextMoves: function() {
    var curNode = this.node();
    var nextMoves = [];
    for (var i = 0; i < curNode.numChildren(); i++) {
      var nextNode = curNode.getChild(i);
      var move = nextNode.properties().getMove();
      if (move) {
        nextMoves.push(move);
      }
    }
    return nextMoves;
  },

  /** Returns true if the tree is currently on a mainline variation. */
  onMainline: function() {
    if (!this._markedMainline) {
      var mt = this.getTreeFromRoot();
      mt.node()._mainline = true;
      while (mt.node().numChildren() > 0) {
        mt.moveDown();
        mt.node()._mainline = true;
      }
      this._markedMainline = true;
    }
    return this.node()._mainline;
  },

  /**
   * Construct an entirely new movetree, but add all the previous stones as
   * placements.  If the tree is at the root, it's equivalent to a copy of the
   * movetree.
   */
  rebase: function() {
    var path = this.treepathToHere();
    var oldMt = this.getTreeFromRoot();
    var oldCurrentPlayer = this.getCurrentPlayer();

    var mt = glift.rules.movetree.getInstance();
    var propMap = { 'BLACK': 'AB', 'WHITE': 'AW' };
    for (var i = 0; i <= path.length; i++) {
      var stones = oldMt.properties().getAllStones();
      for (var color in stones) {
        var moves = stones[color];
        var prop = propMap[color];
        for (var j = 0; j < moves.length; j++) {
          var point = moves[j];
          if (point && prop) {
            mt.properties().add(prop, point.toSgfCoord());
          }
        }
      }
      if (i < path.length) {
        oldMt.moveDown(path[i]);
      }
    }

    // Recursive function for copying data.
    var copier = function(oldnode, newnode) {
      for (var prop in oldnode.properties().propMap) {
        if (newnode.getNodeNum() === 0 && (prop === 'AB' || prop === 'AW')) {
          continue; // Ignore. We've already copied stones on the root.
        }
        newnode.properties().set(prop,
            glift.util.simpleClone(oldnode.properties().getAllValues(prop)));
      }
      for (var i = 0; i < oldnode.children.length; i++) {
        var oldChild = oldnode.getChild(i);
        var newChild = newnode.addChild().getChild(i);
        copier(oldChild, newChild);
      }
    }
    copier(oldMt.node(), mt.node());

    // Ensure the current player remains the same.
    var tokenmap = {BLACK: 'B', WHITE: 'W'};
    var mtCurPlayer = mt.getCurrentPlayer();
    if (mtCurPlayer !== oldCurrentPlayer) {
      mt.properties().add('PL', tokenmap[oldCurrentPlayer]);
    }
    return mt;
  },

  /** Recursive over the movetree. func is called on the movetree. */
  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  /** Recursive over the movetree from root. func is called on the movetree. */
  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  /** Convert this movetree to an SGF. */
  toSgf: function() {
    return this._toSgfBuffer(this.getTreeFromRoot().node(), []).join("");
  },

  /**
   * Create a treepath to the current location. This does not change the current
   * movetree.
   *
   * returns: A treepath (an array of variation numbers);
   */
  treepathToHere: function() {
    var newTreepath = [];
    var movetree = this.newTreeRef();
    while (movetree.node().getParent()) {
      newTreepath.push(movetree.node().getVarNum());
      movetree.moveUp();
    }
    return newTreepath.reverse();
  },

  /////////////////////
  // Private Methods //
  /////////////////////
  _debugLog: function(spaces) {
    if (spaces === undefined) {
      spaces = "  ";
    }
    glift.util.logz(spaces + this.node(i).getVarNum() + '-'
        + this.node(i).getNodeNum());
    for (var i = 0; i < this.node().numChildren(); i++) {
      this.moveDown(i);
      this._debugLog(spaces);
      this.moveUp();
    }
  },

  /**
   * Set the intersections property.
   * Note: This is quite dangerous. If the goban and other data structures are
   * not also updated, chaos will ensue
   */
  _setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (!mt.properties().contains(allProperties.SZ)) {
      this.properties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  /**
   * Recursive method to build an SGF into an array of data.
   */
  _toSgfBuffer: function(node, builder) {
    if (node.getParent()) {
      // Don't add a \n if we're at the root node
      builder.push('\n');
    }

    if (!node.getParent() || node.getParent().numChildren() > 1) {
      builder.push("(");
    }

    builder.push(';');
    for (var prop in node.properties().propMap) {
      var values = node.properties().getAllValues(prop);
      var out = prop;
      if (values.length > 0) {
        for (var i = 0; i < values.length; i++) {
          // Ensure a string and escape right brackets.
          var val = values[i].toString().replace(']', '\\]')
          out += '[' + val + ']'
        }
      } else {
        out += '[]';
      }
      builder.push(out);
    }

    for (var i = 0, len = node.numChildren(); i < len; i++) {
      this._toSgfBuffer(node.getChild(i), builder);
    }

    if (!node.getParent() || node.getParent().numChildren() > 1) {
      builder.push(')');
    }
    return builder
  }
};
