/**
 * Autonumber a movetree.
 *
 * NOTE! This removes all numeric labels and replaces them with the labels
 * constructed here, but that's sort of the point.
 *
 * @param {!glift.rules.MoveTree} movetree The movetree to autonumber.
 */
glift.rules.autonumber = function(movetree) {
  var digitregex = /\d+/;
  var singledigit = /0\d/;
  movetree.recurseFromRoot(function(mt) {
    if (!mt.properties().getComment()) {
      return; // Nothing to do.  We only autonumber on comments.
    }
    // First, clear all numeric labels
    var labels = mt.properties().getAllValues(glift.rules.prop.LB);
    /**
     * Map from SGF point to string label.
     * @type {!Object<!glift.PtStr, string>}
     */
    var lblMap = {};
    for (var i = 0; labels && i < labels.length; i++) {
      var lblData = labels[i].split(':')
      if (digitregex.test(lblData[1])) {
        // Clear out digits
      } else {
        lblMap[lblData[0]] = lblData[1];
      }
    }

    var pathOut = glift.rules.treepath.findNextMovesPath(mt);
    var newMt = pathOut.movetree;
    var goban = glift.rules.goban.getFromMoveTree(newMt).goban;

    var mvnum = mt.onMainline() ?
        newMt.node().getNodeNum() + 1:
        newMt.movesToMainline() + 1;
    var applied = glift.rules.treepath.applyNextMoves(
        newMt, goban, pathOut.nextMoves);

    var seen = 0;
    for (var i = 0, st = applied.stones; i < st.length; i++) {
      var stone = st[i];
      if (!stone.collision) {
        var sgfPoint = stone.point.toSgfCoord();
        lblMap[sgfPoint] = (mvnum + seen) + '';
        seen++;
      }
    }

    var newlabels = [];
    for (var sgfpt in lblMap) {
      var l = lblMap[sgfpt];
      if (l.length > 2) {
        var subl = l.substring(l.length - 2, l.length);
        if (subl !== '00') {
          l = subl;
        }
        if (l.length === 2 && singledigit.test(l)) {
          l = l.charAt(l.length - 1);
        }
      }
      newlabels.push(sgfpt + ':' + l);
    }

    if (newlabels.length === 0) {
      mt.properties().remove(glift.rules.prop.LB);
    } else {
      mt.properties().set(glift.rules.prop.LB, newlabels);
    }

    glift.rules.removeCollidingLabels(mt, lblMap);
  });
};

/**
 * Remove the colliding labels from the label map.
 *
 * @param {!glift.rules.MoveTree} mt The movetree
 * @param {!Object<string>} lblMap Map of SGF Point string to label.
 * @package
 */
glift.rules.removeCollidingLabels = function(mt, lblMap) {
  var toConsider = ['TR', 'SQ'];
  for (var i = 0; i < toConsider.length; i++) {
    var key = toConsider[i];
    if (mt.properties().contains(key)) {
      var lbls = mt.properties().getAllValues(key);
      var newLbls = [];
      for (var j = 0; j < lbls.length; j++) {
        var sgfCoord = lbls[j];
        if (lblMap[sgfCoord]) {
          // do nothing.  This is a collision.
        } else {
          newLbls.push(sgfCoord);
        }
      }
      if (newLbls.length === 0) {
        mt.properties().remove(key);
      } else {
        mt.properties().set(key, newLbls);
      }
    }
  }
};
