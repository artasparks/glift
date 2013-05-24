(function() {
var msgs = glift.enums.controllerMessages,
    BASE = glift.enums.controllerTypes.BASE;

glift.controllers.baseController = {
  create: function() {
    return new BaseController();
  }
};

glift.controllers.controllerMap[BASE] =
    glift.controllers.baseController.create;

var BaseController = function() {};

BaseController.prototype = {
  // nextSgf doesn't really make sense for playing games. But, oh well. We'll
  // figure out what to do then in the (probably distant) future.
  //
  // Really this shouldn't be nextSgf either -- this ties us to the
  // serialization format (SGF).  But for now, it's probably fine.
  nextSgf: function(callback) {
    throw "Not Implemented";
  },

  addStone: function(callback) {
    throw "Not Implemented";
  },

  initialize: function(sgfString, initPosString, callback) {
    var rules = glift.rules;
    this.initPosition = rules.treepath.parseInitPosition(initPosString);
    this.movetree = rules.movetree.getFromSgf(sgfString, this.initPosition);
    // glift.sgf.parseInitPosition handles an undefined initPosition
    this.goban = rules.goban.getFromMoveTree(this.movetree, this.initPosition);
    // return the entire boardState
    this.getEntireBoardState(callback);
  },

  getEntireBoardState: function(callback) {
    var ints = glift.rules.intersections,
        intersectionData = ints.getFullBoardData(this.movetree, this.goban);
    callback({
      message: msgs.CONTINUE,
      data: intersectionData
    });
  },

  canAddStone: function(point, color, callback) {
    if (this.goban.placeable(point,color)) {
      callback({message: msgs.CONTINUE});
    } else {
      callback({message: msgs.FAILURE});
    }
  },

  // Returns a State (either BLACK or WHITE). Needs to be fast since it's used
  // to display the hover-color in the display, so the assumption is that a
  // callback won't be necessary.
  //
  // This will be undefined until initialize is called, so the clients of the
  // controller must make sure to always initialize the board position
  // first.
  getCurrentPlayer: function(callback) {
    return this.movetree.getCurrentPlayer();
  },

  // Returns the number of intersections.  Should be known at load time, so no
  // callback required.
  getIntersections: function(callback) {
    return this.movetree.getIntersections();
  }
};
})();
