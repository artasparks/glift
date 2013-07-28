(function() {
glift.rules.movenode = function(properties, children) {
  return new MoveNode(properties, children);
};

var MoveNode = function(properties, children) {
  this.properties = properties || glift.rules.properties();
  this.children = children || [];
  this.nodeId = { nodeNum: 0, varNum: 0 };
};

MoveNode.prototype = {
  /**
   * Set the NodeId. Each node has an ID based on the depth and variation
   * number.
   *
   * Note: Great caution should be exercised when using this method.  If you
   * don't adjust the surrounding nodes, the movetree will get into a funky
   * state.
   *
   * TODO(kashomon): Maybe remove this or mark as private?
   */
  setNodeId: function(nodeNum, varNum) {
    this.nodeId = {
        nodeNum: nodeNum,
        varNum: varNum
    }
    return this;
  },

  /**
   * Get the node number (i.e., the depth number).
   */
  getNodeNum: function() {
    return this.nodeId.nodeNum
  },

  /**
   * Get the variation number.
   */
  getVarNum: function() {
    return this.nodeId.varNum
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
    this.children.push(glift.rules.movenode().setNodeId(
        this.getNodeNum() + 1, this.numChildren()));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * move tree.
   */
  getNext: function(variationNum) {
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
    numberMoves(this, this.nodeId.nodeNum, this.nodeId.varNum);
    return this;
  }
};

// Private number moves function
var numberMoves = function(move, nodeNum, varNum) {
  move.setNodeId(nodeNum, varNum);
  for (var i = 0; i < move.children.length; i++) {
    var next = move.children[i];
    numberMoves(next, nodeNum + 1, i);
  }
  return move;
};

})();
