(function() {
glift.rules.movenode = function(properties, children) {
  return new MoveNode(properties, children);
};

var MoveNode = function(properties, children) {
  this._properties = properties || glift.rules.properties();
  this.children = children || [];
  // TODO(kashomon): NodeId should be (probably) be assignable on creation.
  this._nodeId = { nodeNum: 0, varNum: 0 };
};

MoveNode.prototype = {
  /** Get properties */
  properties:  function() {
    return this._properties;
  },

  /**
   * Set the NodeId. Each node has an ID based on the depth and variation
   * number.
   *
   * Great caution should be exercised when using this method.  If you
   * don't adjust the surrounding nodes, the movetree will get into a funky
   * state.
   */
  _setNodeId: function(nodeNum, varNum) {
    this._nodeId = { nodeNum: nodeNum, varNum: varNum };
    return this;
  },

  /**
   * Get the node number (i.e., the depth number).  For our purposes, we
   * consider passes to be moves, but this is a special enough case that it
   * shouldn't matter for most situations.
   */
  getNodeNum: function() {
    return this._nodeId.nodeNum
  },

  /**
   * Get the variation number.
   */
  getVarNum: function() {
    return this._nodeId.varNum
  },

  /**
   * Get the number of children.  This the same semantically as the number of
   * variations.
   */
  numChildren: function() {
    return this.children.length;
  },

  /**
   * Add a new child node.
   */
  addChild: function() {
    this.children.push(glift.rules.movenode()._setNodeId(
        this.getNodeNum() + 1, this.numChildren()));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * movetree.
   */
  getChild: function(variationNum) {
    if (variationNum === undefined) {
      return this.children[0];
    } else {
      return this.children[variationNum];
    }
  },

  /**
   * Renumber the nodes.  Useful for when nodes are deleted during SGF editing.
   */
  renumber: function() {
    numberMoves(this, this._nodeId.nodeNum, this._nodeId.varNum);
    return this;
  }
};

// Private number moves function
var numberMoves = function(move, nodeNum, varNum) {
  move._setNodeId(nodeNum, varNum);
  for (var i = 0; i < move.children.length; i++) {
    var next = move.children[i];
    numberMoves(next, nodeNum + 1, i);
  }
  return move;
};

})();
