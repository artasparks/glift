/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameSlice = function(sgfOptions) {
  var ctrl = glift.controllers;
  var baseController = glift.util.beget(ctrl.base());
  var newController = glift.util.setMethods(baseController,
      ctrl.GameSliceMethods);
  newController.drawTo = sgfOptions.drawTo || [];
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.GameSliceMethods = {

  initialize: function(treepath) {
    var rules = glift.rules;
    var initTreepath = treepath || this.initialPosition;
    this.treepath = rules.treepath.parsePath(initTreepath);

    var initialPosition = this.treepath.length; // used later
    var nextTreepath = this.drawTo - this.treepath.length;
    if (this.nextMovesPath.length > 0) {
      nextTreepath = this.nextMovesPath;
    }
    nextTreepath = rules.treepath.parsePath(nextTreepath);
    this.treepath = this.treepath.concat(nextTreepath);

    this.movetree = rules.movetree.getFromSgf(
        this.sgfString, 
        this.treepath,
        this.parseType);
    var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    this.goban = gobanData.goban;

    this.captureHistory = gobanData.captures;

    // calculate marks, by going backwards through the movetree
    var curnode = this.movetree.node();
    var labels = [];
    for (var i = this.treepath.length; i > initialPosition; i--) {
      labels.push(curnode.getIntersection() + ":" + i);
      curnode = curnode.getParent();
    }

    // add marks
    var allProperties = glift.rules.allProperties;
    this.movetree.properties().add(allProperties.LB, labels);

    return this;
  }

};
