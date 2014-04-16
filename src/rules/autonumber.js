/**
 * Autonumber the shit out of the movetree.
 *
 * NOTE! This removes all numeric labels and replaces them with.
 *
 * Modifies the current movtree
 */
glift.rules.autonumber = function(movetree) {
  var digitregxex = /\d\+/;
  movetree.recurseFromRoot(function(mt) {
    if (!mt.properties().contains('C') ||
        mt.properties().getOneValue('C') === '') {
      return; // Nothing to do.  We only autonumber on comments.
    }
    // First, clear all numeric labels
    var labels = mt.properties().getAllValues('LB');
    var lblMap = {}; // map from SGF point to label
    for (var i = 0; labels && i < labels.length; i++) {
      var lblData = labels[i].split(':')
      if (digitregxex.test(lblData[1])) {
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
        lblMap[sgfPoint] = mvnum + seen;
        seen++;
      }
    }

    var newlabels = [];
    for (var sgfpt in lblMap) {
      newlabels.push(sgfpt + ':' + lblMap[sgfpt]);
    }
    mt.properties().set('LB', newlabels);
  });
};
