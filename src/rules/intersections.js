(function() {
var enums = glift.enums;
/*
 * Intersection Data is the precise set of information necessary to display the
 * Go Board, which is to say, it is the set of stones and display information.
 *
 * The IntersectionData is just an object containing intersection information, of
 * the form:
 *
 *   {
 *     points: [
 *       pthash: {STONE: "BLACK" , TRIANGLE: true, point: pt},
 *       pthash: {STONE: "WHITE", point: pt},
 *       pthash: {LETTER: "A", point: pt}
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
    CR: enums.marks.CIRCLE,
    LB: enums.marks.LETTER,
    MA: enums.marks.XMARK,
    SQ: enums.marks.SQUARE,
    TR: enums.marks.TRIANGLE
  },

  /**
   * Intersection data is a object, containing all the intersection data.  So,
   *  {
   *    points: {
   *      "1,2" : {
   *        point: {1, 2},
   *        STONE: "WHITE"
   *      }
   *      ... etc ...
   *    }
   *    comment : "foo"
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
      sobj["point"] = pt;
      sobj[enums.marks.STONE] = gobanStones[i].color;
      pointsObj[pt.hash()] = sobj;
    }

    pointsObj = this.addCurrentMarks(pointsObj, movetree);
    out.points = pointsObj;
    if (movetree.getProperties().getComment() !== glift.util.none) {
      out.comment = movetree.getProperties().getComment();
    }
    return out;
  },

  // TODO: Add a way to send back only what has changed
  getChangeData: function(movetree, captures, extra) {
  },

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
