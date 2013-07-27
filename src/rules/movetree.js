(function() {
var util = glift.util;
var enums = glift.enums;

/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 *  _history: [MoveNode, MoveNode, ... ]
 *}
 * And where a MoveNode looks like the following:
 * MoveNode: {
 *    nodeId: { ... }
 *    properties: Properties
 *    children: [MoveNode, MoveNode, MoveNode]
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
   * Create an empty MoveTree
   */
  getInstance: function(intersections) {
    var intersections = intersections || 19;
    var mt = new MoveTree(glift.rules.movenode());
    mt.setIntersections(intersections);
    return mt;
  },

  /**
   * Create a MoveTree from an SGF.
   */
  getFromSgf: function(sgfString, initPosition) {
    if (initPosition === undefined) {
      initPosition = []; // Should throw an error?
    }
    if (sgfString === undefined || sgfString === "") {
      return glift.rules.movetree.getInstance(19);
    }
    var mt = new MoveTree(glift.sgf.parser.parse($.trim(sgfString)));
    // Set the initial position
    for (var i = 0; i < initPosition.length; i++) {
      mt.moveDown(initPosition[i]);
    }
    return mt;
  },

  /**
   * TODO(kashomon): This needs some explanation.
   */
  getFromNode: function(node) {
    return new MoveTree(node);
  },

  /**
   * Seach nodes with a Depth First Search.
   */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.getNode().numChildren(); i++) {
      glift.rules.movetree.searchMoveTreeDFS(moveTree.moveDown(i), func);
    }
    moveTree.moveUp();
  }
};

/**
 * A MoveTree is a history (a tree) of the past nodes played.  The movetree is
 * (usually) a processed parsed SGF, but could be created organically.
 *
 * The tree itself is tree structure made out of MoveNodes.
 */
var MoveTree = function(rootNode) {
  // The moveHistory serves two purposes -- it allows travel backwards (i.e.,
  // up the tree), and it gives the current move, which is the last move in the
  // array.
  this._nodeHistory = [];
  this._nodeHistory.push(rootNode);
};

MoveTree.prototype = {
  /**
   * Get a new move tree instance from the node history.  Note, that this still
   * refers to the same movetree -- the current position is just changed.
   */
  getTreeFromRoot: function() {
    return glift.rules.movetree.getFromNode(this._nodeHistory[0]);
  },

  /**
   * Get the current node -- that is, the node at the current position.
   */
  getNode: function() {
    return this._nodeHistory[this._nodeHistory.length - 1];
  },

  /**
   * Get the properties object on the current node.
   */
  getProperties: function() {
    return this.getNode().properties;
  },

  /**
   * Given a point and a color, find the
   */
  findNextMove: function(point, color) {
    var nextNodes = this.getNode().children,
        token = glift.sgf.colorToToken(color),
        ptSet = {};
    for (var i = 0; i < nextNodes.length; i++) {
      var node = nextNodes[i];
      if (node.properties.contains(token)) {
        ptSet[node.properties.getAsPoint(token).hash()] =
          node.getVarNum();
      }
    }
    if (ptSet[point.hash()] !== undefined) {
      return ptSet[point.hash()];
    } else {
      return util.none;
    }
  },

  getCurrentPlayer: function() {
    var move = this.getProperties().getMove();
    if (move === util.none) {
      return enums.states.BLACK;
    } else if (move.color === enums.states.BLACK) {
      return enums.states.WHITE;
    } else if (move.color === enums.states.WHITE) {
      return enums.states.BLACK;
    } else {
      // TODO: This is not the right way to do this.  Really, we need to
      // traverse up the tree until we see a color, and return the opposite. If
      // we reach the root, _then_ we can return BLACK.
      return enums.states.BLACK;
    }
  },

  // Move down, but only if there is an available variation
  // variationNum can be undefined for convenicence.
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.getNode().getNext(num) !== undefined) {
      var next = this.getNode().getNext(num);
      this._nodeHistory.push(next);
    }
    return this;
  },

  // Move up a move, but only if you are not in the intial (0th) move.
  moveUp: function() {
    if (this._nodeHistory.length > 1) {
      this._nodeHistory.pop();
    }
    return this;
  },

  // Move to the root node
  moveToRoot: function() {
    this._nodeHistory = this._nodeHistory.slice(0,1);
    return this;
  },

  addNewNode: function() {
    this.getNode().addChild();
    this.moveDown(this.getNode().numChildren() - 1);
    return this;
  },

  //TODO(nelsonjhk): finish
  deleteCurrentNode: function() {
    var nodeId = glift.rules.movetree.getNodeId();
    VarNum = this.getVarNum();
    this.moveUp();
    var theMoves = this.getAllNextNodes();
    //delete theMoves(nodeId,VarNum); // This is currently a syntax error
    return this;
  },

  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  // TODO (probably will involve the recursion)
  toSgf: function() {
    var out = "";
    for (var propKey in this.getAllProps()) {
      //TODO
    }
  },

  debugLog: function(spaces) {
    if (spaces === undefined) {
      spaces = "  ";
    }
    glift.util.logz(spaces + this.getNode(i).getVarNum() + '-'
        + this.getNode(i).getNodeNum());
    for (var i = 0; i < this.getNode().numChildren(); i++) {
      this.moveDown(i);
      this.debugLog(spaces);
      this.moveUp();
    }
  },

  //---------------------//
  // Convenience methods //
  //---------------------//
  setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (!mt.getProperties().contains(allProperties.SZ)) {
      this.getProperties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (mt.getNode().properties.contains(allProperties.SZ)) {
      return parseInt(mt.getNode().properties.get(allProperties.SZ));
    } else {
      return undefined;
    }
  },

  // Used for Problems.
  // Can return CORRECT, INCORRECT, or INDETERMINATE
  isCorrectPosition: function() {
    var problemResults = glift.enums.problemResults;
    if (this.getProperties().isCorrect()) {
      return problemResults.CORRECT;
    } else {
      var flatPaths = glift.rules.treepath.flattenMoveTree(this);
      var successTracker = {};
      for (var i = 0; i < flatPaths.length; i++) {
        var path = flatPaths[i];
        var newmt = glift.rules.movetree.getFromNode(this.getNode());
        var pathCorrect = false
        for (var j = 0; j < path.length; j++) {
          newmt.moveDown(path[j]);
          if (newmt.getProperties().isCorrect()) {
            pathCorrect = true;
          }
        }
        if (pathCorrect) {
          successTracker[problemResults.CORRECT] = true;
        } else {
          successTracker[problemResults.INCORRECT] = true;
        }
      }
      if (successTracker[problemResults.CORRECT] &&
          !successTracker[problemResults.INCORRECT]) {
        return problemResults.CORRECT;
      } else if (successTracker[problemResults.CORRECT] &&
          successTracker[problemResults.INCORRECT]) {
        return problemResults.INDETERMINATE;
      } else {
        return problemResults.INCORRECT;
      }
    }
  }
};
})();
