(function() {
/*
 * Intersection Data is the precise set of information necessary to display the
 * Go Board, which is to say, it is the set of stones and display information.
 *
 * The IntersectionData is just an object containing intersection information, of
 * the form:
 *
 *   {
 *     points: [
 *       pthash: {stone: "BLACK" , TRIANGLE: true, point: pt},
 *       pthash: {stone: "WHITE", point: pt},
 *       pthash: {LABEL: "A", point: pt}
 *     ],
 *     comment: "This is a good move",
 *   }
 *
 * In the points array, each must object contain a point, and each should contain a
 * mark or a stone.  There can only be a maximum of one stone and one mark
 * (glift.enums.marks).
 */

glift.rules.intersections = {
  propertiesToMarks: {
    CR: glift.enums.marks.CIRCLE,
    LB: glift.enums.marks.LABEL,
    MA: glift.enums.marks.XMARK,
    SQ: glift.enums.marks.SQUARE,
    TR: glift.enums.marks.TRIANGLE
  },

  /**
   * Intersection data is a object, containing all the intersection data.  So,
   *
   *  {
   *    points: {
   *      "1,2" : {
   *        point: {1, 2},
   *        stone: "WHITE"
   *      }
   *      ... etc ...
   *    }
   *    comment : "foo",
   *    lastMove : { color: <color>, point: <point> }
   *  }
   */
  getFullBoardData: function(movetree, goban) {
    var out = {},
        pointsObj = {},
        gobanStones = goban.getAllPlacedStones();
    // First, set the stones.
    for (var i = 0; i < gobanStones.length; i++) {
      var pt = gobanStones[i].point;
      var sobj = {};
      sobj.point = pt;
      sobj.stone = gobanStones[i].color;
      pointsObj[pt.hash()] = sobj;
    }
    out.lastMove = movetree.getLastMove();

    pointsObj = this.addCurrentMarks(pointsObj, movetree);
    out.points = pointsObj;
    if (movetree.getProperties().getComment() !== glift.util.none) {
      out.comment = movetree.getProperties().getComment();
    }
    return out;
  },

  // TODO(kashomon): Add a way to send back only what has changed
  getChangeData: function(movetree, captures, extra) {
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   */
  addCurrentMarks: function(pointsObj, movetree) {
    for (var prop in glift.rules.intersections.propertiesToMarks) {
      var mark = glift.rules.intersections.propertiesToMarks[prop];
      if (movetree.getProperties().contains(prop)) {
        var data = movetree.getProperties().get(prop);
        for (var i = 0; i < data.length; i++) {
          var pt = {}, value = true;
          if (prop === glift.sgf.allProperties.LB) {
            var conv = glift.sgf.convertFromLabelData(data[i]);
            pt = conv.point;
            value = conv.value
          } else {
            var pt = glift.sgf.sgfCoordToPoint(data[i]);
          }

          var ptHash = pt.hash();
          if (pointsObj[ptHash] === undefined) {
            pointsObj[ptHash] = {point: pt};
          }
          pointsObj[ptHash][mark] = value;
        }
      }
    }
    return pointsObj;
  }
};

})();
