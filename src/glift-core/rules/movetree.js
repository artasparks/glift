goog.provide('glift.rules.MoveTree');
goog.provide('glift.rules.movetree');

/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 * currentNode_
 * rootNode_
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
  /**
   * Create an empty MoveTree.
   *
   * @param {number=} opt_intersections Optional intersections. Defaults to 19.
   * @return {!glift.rules.MoveTree} New movetree instance.
   */
  getInstance: function(opt_intersections) {
    var mt = new glift.rules.MoveTree(glift.rules.movenode());
    if (opt_intersections !== undefined) {
      mt.setIntersections_(opt_intersections);
    }
    return mt;
  },

  /**
   * Create a MoveTree from an SGF.
   * Note: initPosition and parseType are both optional.
   *
   * @param {string} sgfString
   * @param {(string|number|!Array<number>)=} opt_initPosition
   * @param {glift.parse.parseType=} opt_parseType
   * @return {!glift.rules.MoveTree}
   */
  getFromSgf: function(sgfString, opt_initPosition, opt_parseType) {
    var initPosition = opt_initPosition || []; // treepath.
    var parseType = parseType || glift.parse.parseType.SGF;

    if (glift.util.typeOf(initPosition) === 'string' ||
        glift.util.typeOf(initPosition) === 'number') {
      initPosition = glift.rules.treepath.parseInitialPath(initPosition);
    }

    var initTreepath = /** @type {!glift.rules.Treepath} */ (initPosition);

    if (sgfString === undefined || sgfString === '') {
      return glift.rules.movetree.getInstance(19);
    }

    var mt = glift.parse.fromString(sgfString, parseType);

    mt = mt.getTreeFromRoot(initTreepath);

    return mt;
  },

  /**
   * Seach nodes with a Depth First Search.
   * @param {!glift.rules.MoveTree} moveTree
   * @param {function(!glift.rules.MoveTree)} func
   */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      var mtz = moveTree.newTreeRef();
      glift.rules.movetree.searchMoveTreeDFS(mtz.moveDown(i), func);
    }
  },

  /**
   * Convenience method for setting the root properties in a standard way
   * @param {!glift.rules.MoveTree} mt
   * @return {!glift.rules.MoveTree} The initialized movetree.
   */
  initRootProperties: function(mt) {
    var root = mt.getTreeFromRoot();
    var props = root.properties();
    var prop = glift.rules.prop;
    if (!props.contains(prop.GM)) {
      props.add(prop.GM, '1');
    }
    if (!props.contains(prop.FF)) {
      props.add(prop.FF, '4');
    }
    if (!props.contains(prop.CA)) {
      props.add(prop.CA, 'UTF-8');
    }
    if (!props.contains(prop.AP)) {
      // The glift.global.version is the ui-version. Use this version, if it
      // exists. Otherwise, rely on the core version rules.
      var version = glift.global.version;
      if (version) {
        props.add(prop.AP, 'Glift:' + glift.global.version);
      } else {
        props.add(prop.AP, 'Glift-core:' + glift.global['core-version']);
      }
    }
    if (!props.contains(prop.KM)) {
      props.add(prop.KM, '0.00');
    }
    if (!props.contains(prop.RU)) {
      props.add(prop.RU, 'Japanese');
    }
    if (!props.contains(prop.SZ)) {
      props.add(prop.SZ, '19');
    }
    if (!props.contains(prop.PB)) {
      props.add(prop.PB, 'Black');
    }
    if (!props.contains(prop.PW)) {
      props.add(prop.PW, 'White');
    }
    // Note: we don't set ST because it's a dumb option. (Style of
    // variation-showing).
    return mt;
  }
};

/**
 * A MoveTree is a tree of movenodes played.  The movetree is (usually) a
 * processed parsed SGF, but could be created organically.
 *
 * Semantically, a MoveTree can be thought of as a game, but could also be a
 * problem, demonstration, or example.  Thus, this is the place where such moves
 * as currentPlayer or lastMove.
 *
 * @param {!glift.rules.MoveNode} rootNode
 * @param {!glift.rules.MoveNode=} opt_currentNode
 * @param {Object=} opt_metadata
 *
 * @constructor @final @struct
 */
glift.rules.MoveTree = function(rootNode, opt_currentNode, opt_metadata) {
  /** @private {!glift.rules.MoveNode} */
  this.rootNode_ = rootNode;
  /** @private {!glift.rules.MoveNode} */
  this.currentNode_ = opt_currentNode || rootNode;
  /** @private {boolean} */
  this.markedMainline_ = false;

  /**
   * Metadata is arbitrary data attached to the node.
   *
   * As a side note, Metadata extraction in Glift happens in the parser and so
   * will not show up in comments.  See the metadataProperty option in
   * options.baseOptions.
   * @private {Object}
   */
  this.metadata_ = opt_metadata || null;
};

glift.rules.MoveTree.prototype = {
  /////////////////////////
  // Most common methods //
  /////////////////////////

  /**
   * Get the current node -- that is, the node at the current position.
   * @return {!glift.rules.MoveNode}
   */
  node: function() {
    return this.currentNode_;
  },

  /**
   * Get the properties object on the current node.
   * @return {!glift.rules.Properties}
   */
  properties: function() {
    return this.node().properties();
  },

  /**
   * Gets global movetree metadata.
   * @return {Object}
   */
  metadata: function() {
    return this.metadata_;
  },

  /**
   * Set the metadata for this Movetree.
   * @param {Object} data
   * @return {!glift.rules.MoveTree} this
   */
  setMetdata: function(data) {
    this.metadata_ = data;
    return this;
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   * @param {number=} opt_variationNum
   * @return {!glift.rules.MoveTree} this
   */
  moveDown: function(opt_variationNum) {
    var num = opt_variationNum || 0;
    var child = this.node().getChild(num);
    if (child != null) {
      this.currentNode_ = child;
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not at root move.
   * At the root node, movetree.moveUp().moveUp() == movetree.moveUp();
   * @return {!glift.rules.MoveTree} this
   */
  moveUp: function() {
    var parent = this.currentNode_.getParent();
    if (parent) { this.currentNode_ = parent; }
    return this;
  },

  /**
   * Get the current player as a color.
   * @return {!glift.enums.states}
   */
  getCurrentPlayer: function() {
    var states = glift.enums.states;
    var tokenMap = {W: 'WHITE', B: 'BLACK'};
    var curNode = this.currentNode_;

    // The PL property is a short circuit. Usually only used on the root node.
    if (this.properties().contains(glift.rules.prop.PL)) {
      return tokenMap[this.properties().getOneValue(glift.rules.prop.PL)];
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
   * @return {!glift.rules.MoveTree}
   */
  newTreeRef: function() {
    return new glift.rules.MoveTree(
        this.rootNode_, this.currentNode_, this.metadata_);
  },

  /**
   * Creates a new Movetree reference from a particular node. The underlying
   * node-tree remains the same.
   *
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   *
   * @param {!glift.rules.MoveNode} node
   * @return {!glift.rules.MoveTree} New movetree reference.
   */
  getFromNode: function(node) {
    return new glift.rules.MoveTree(node, node, this.metadata_);
  },

  /**
   * Gets a new move tree instance from the root node. Important note: this
   * creates a new tree reference. Thus, if you don't assign to a var, nothing
   * will happen.
   *
   * @param {!glift.rules.Treepath=} treepath
   * @return {!glift.rules.MoveTree} New movetree reference.
   */
  getTreeFromRoot: function(treepath) {
    var mt = this.getFromNode(this.rootNode_);
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
  /**
   * Add a new Node to the cur position and move to that position. 
   * @return {!glift.rules.MoveTree} this
   */
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
   * branch that has the specified move. The idea behind this method is that:
   * some player plays a move: does the move currently exist in the movetree?
   *
   * @param {!glift.Point} point Intersection for the move
   * @param {glift.enums.states} color Color of the move.
   * @return {number|null} either the number or null if no such number exists.
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
          ptSet[node.properties().getAsPoint(token).toString()] =
            node.getVarNum();
        }
      }
    }
    if (ptSet[point.toString()] !== undefined) {
      return ptSet[point.toString()];
    } else {
      return null;
    }
  },

  /**
   * Get the intersections number of the go board, by looking at the props. 
   * @return {number}
   */
  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        prop = glift.rules.prop;
    if (mt.properties().contains(prop.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(prop.SZ), 10);
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
   * @return {?glift.rules.Move}
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * If not on the mainline, returns the appriate 'move number' for a variation,
   * for the current location, which is the number of moves to mainline
   *
   * @return {number} The number of moves to get to the mainline branch and 0 if
   *    already on the mainline branch.
   */
  movesToMainline: function() {
    var mt = this.newTreeRef();
    for (var n = 0; !mt.onMainline() && mt.node().getParent(); n++) {
      mt.moveUp();
    }
    return n;
  },

  /**
   * Gets the the first node in the parent chain that is on the mainline.
   *
   * @return {!glift.rules.MoveNode}
   */
  getMainlineNode: function() {
    var mt = this.newTreeRef();
    while (!mt.onMainline()) {
      mt.moveUp();
    }
    return mt.node();
  },

  /**
   * Get the next moves (i.e., nodes with either B or W properties);
   *
   * The ordering of the moves is guaranteed to be the ordering of the
   *    variations at the time of creation.
   *
   * @return {!Array<!glift.rules.Move>}
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

  /**
   * Returns true if the tree is currently on a mainline variation and false
   * otherwise.
   * @return {boolean}
   */
  onMainline: function() {
    if (!this.markedMainline_) {
      var mt = this.getTreeFromRoot();
      mt.node().mainline_ = true;
      while (mt.node().numChildren() > 0) {
        mt.moveDown();
        mt.node().mainline_ = true;
      }
      this.markedMainline_ = true;
    }
    return this.node().mainline_;
  },

  /**
   * Construct an entirely new movetree, but add all the previous stones as
   * placements.  If the tree is at the root, it's equivalent to a copy of the
   * movetree.
   *
   * @return {!glift.rules.MoveTree} Entirely new movetree.
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
          var point = moves[j].point;
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
      mt.properties().add(glift.rules.prop.PL, tokenmap[oldCurrentPlayer]);
    }
    return mt;
  },

  /**
   * Recursive over the movetree. func is called on the movetree.
   * @param {function(glift.rules.MoveTree)} func
   */
  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  /**
   * Recursive over the movetree from root. func is called on the movetree. 
   * @param {function(glift.rules.MoveTree)} func
   */
  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  /**
   * Convert this movetree to an SGF.
   * @return {string}
   */
  toSgf: function() {
    return this.toSgfBuffer_(this.getTreeFromRoot().node(), []).join("");
  },

  /**
   * Create a treepath to the current location. This does not change the current
   * movetree.
   *
   * @return {!glift.rules.Treepath} A treepath (an array of variation numbers);
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

  /**
   * Set the intersections property.
   * Note: This is quite dangerous. If the goban and other data structures are
   * not also updated, chaos will ensue
   *
   * @param {number} intersections
   * @return {glift.rules.MoveTree} this object.
   * @private
   */
  setIntersections_: function(intersections) {
    var mt = this.getTreeFromRoot(),
        prop = glift.rules.prop;
    if (!mt.properties().contains(prop.SZ)) {
      this.properties().add(prop.SZ, intersections + "");
    }
    return this;
  },

  /**
   * Recursive method to build an SGF into an array of data.
   * @param {!glift.rules.MoveNode} node A MoveNode instance.
   * @param {!Array<string>} builder String buffer
   * @return {!Array<string>} the built buffer
   * @private
   */
  toSgfBuffer_: function(node, builder) {
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
          var val = glift.parse.sgfEscape(values[i]);
          out += '[' + val + ']'
        }
      } else {
        out += '[]';
      }
      builder.push(out);
    }

    for (var i = 0, len = node.numChildren(); i < len; i++) {
      var child = node.getChild(i);
      if (child) {
        // Child should never be null here since we're iterating over the
        // children, but the method can return null.
        this.toSgfBuffer_(child, builder);
      }
    }

    if (!node.getParent() || node.getParent().numChildren() > 1) {
      builder.push(')');
    }
    return builder
  }
};
