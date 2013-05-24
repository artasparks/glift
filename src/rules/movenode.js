(function() {
glift.rules.movenode = function(properties, children) {
  return new MoveNode(properties, children);
};

var MoveNode = function(properties, children) {
  this.properties = properties || glift.rules.properties();
  this.children = children || [];
  this.nodeId = {nodeNum: 0, varNum: 0};
};

MoveNode.prototype = {
  setNodeId: function(nodeNum, varNum) {
    this.nodeId = {
        nodeNum: nodeNum,
        varNum: varNum
    }
    return this;
  },

  getNodeNum: function() {
    return this.nodeId.nodeNum
  },

  getVarNum: function() {
    return this.nodeId.varNum
  },

  numChildren: function() {
    return this.children.length;
  },

  addChild: function() {
    this.children.push(glift.rules.movenode().setNodeId(
        this.getNodeNum() + 1, this.numChildren()));
    return this;
  },

  getNext: function(variationNum) {
    if (variationNum === undefined) {
      return this.children[0];
    } else {
      return this.children[variationNum];
    }
  },

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
