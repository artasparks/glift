goog.provide('glift.rules.MoveNode');

/**
 * Id for a particular node. Note: The ID is not guaranteed to be unique, due to
 * pranching up the tree. However, it does uniquely identify a child of a
 * parent.
 *
 * @typedef {{
 *  nodeNum: number,
 *  varNum: number
 * }}
 */
glift.rules.NodeId

/**
 * Creates a new MoveNode.
 *
 * @param {!glift.rules.Properties=} opt_properties
 * @param {!Array<!glift.rules.MoveNode>=} opt_children
 * @param {!glift.rules.NodeId=} opt_nodeId
 * @param {!glift.rules.MoveNode=} opt_parentNode
 *
 */
glift.rules.movenode = function(
    opt_properties, opt_children, opt_nodeId, opt_parentNode) {
  return new glift.rules.MoveNode(
       opt_properties, opt_children, opt_nodeId, opt_parentNode);
};

/**
 * A Node in the MoveTree.
 *
 * @param {!glift.rules.Properties=} opt_properties
 * @param {!Array<!glift.rules.MoveNode>=} opt_children
 * @param {!glift.rules.NodeId=} opt_nodeId
 * @param {!glift.rules.MoveNode=} opt_parentNode
 *
 * @package
 * @constructor @final @struct
 */
glift.rules.MoveNode = function(
    opt_properties, opt_children, opt_nodeId, opt_parentNode) {
  /** @private {!glift.rules.Properties} */
  this.properties_ = opt_properties || glift.rules.properties();
  /** @type {!Array<!glift.rules.MoveNode>} */
  this.children = opt_children || [];
  /** @private {!glift.rules.NodeId} */
  this.nodeId_ = opt_nodeId || { nodeNum: 0, varNum: 0 };
  /** @type {?glift.rules.MoveNode} */
  this.parentNode_ = opt_parentNode || null;

  /**
   * Marker for determining mainline.  Should ONLY be used by onMainline from
   * the movetree.
   * @package {boolean}
   */
  this.mainline_ = false;
};

glift.rules.MoveNode.prototype = {
  /**
   * Returns the properties.
   * @return {!glift.rules.Properties}
   */
  properties: function() { return this.properties_; },

  /**
   * Set the NodeId. Each node has an ID based on the depth and variation
   * number.
   *
   * Great caution should be exercised when using this method.  If you
   * don't adjust the surrounding nodes, the movetree will get into a funky
   * state.
   * @param {number} nodeNum
   * @param {number} varNum
   * @private
   */
  setNodeId_: function(nodeNum, varNum) {
    this.nodeId_ = { nodeNum: nodeNum, varNum: varNum };
    return this;
  },

  /**
   * Get the node number (i.e., the depth number). We consider passes and nodes
   * without non-stone data to be 'moves', although this is relatively rare.
   * @return {number}
   */
  getNodeNum: function() { return this.nodeId_.nodeNum; },

  /**
   * Gets the variation number.
   * @return {number}
   */
  getVarNum: function() { return this.nodeId_.varNum; },

  /**
   * Gets the number of children.
   * @return {number}
   */
  numChildren: function() { return this.children.length; },

  /**
   * Add a new child node.
   * @return {!glift.rules.MoveNode} this
   * @package
   */
  addChild: function() {
    this.children.push(glift.rules.movenode(
      glift.rules.properties(),
      [], // children
      { nodeNum: this.getNodeNum() + 1, varNum: this.numChildren() },
      this));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * movetree.
   * @return {?glift.rules.MoveNode} The node or null if it doesn't exist.
   */
  getChild: function(variationNum) {
    variationNum = variationNum || 0;
    if (this.children.length > 0) {
      return this.children[variationNum];
    } else {
      return null;
    }
  },

  /**
   * Return the parent node. Returns null if no parent node exists.
   * @return {?glift.rules.MoveNode}
   */
  getParent: function() { return this.parentNode_; },

  /**
   * Renumber the nodes.  Useful for when nodes are deleted during SGF editing.
   * Note: This performs the renumbering recursively
   * @return {!glift.rules.MoveNode} this
   */
  renumber: function() {
    glift.rules.numberMoves_(this, this.nodeId_.nodeNum, this.nodeId_.varNum);
    return this;
  }
};

/**
 * Recursively renumber the nodes
 * @param {!glift.rules.MoveNode} move
 * @param {number} nodeNum
 * @param {number} varNum
 * @private
 */
glift.rules.numberMoves_ = function(move, nodeNum, varNum) {
  move.setNodeId_(nodeNum, varNum);
  for (var i = 0; i < move.children.length; i++) {
    var next = move.children[i];
    glift.rules.numberMoves_(next, nodeNum + 1, i);
  }
  return move;
};
