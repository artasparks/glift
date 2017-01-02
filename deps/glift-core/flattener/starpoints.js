goog.provide('glift.flattener.starpoints');

glift.flattener.starpoints = {
  /**
   * @const {!Object<number, !Array<!Array<number>>>}
   * @private
   */
  pts_: {
    9: [[4,4]],
    13: [
          [3,3], [3,9],
             [6,6],
          [9,3], [9,9],
        ],
    19: [
          [3,3],  [3,9],  [3,15],
          [9,3],  [9,9],  [9,15],
          [15,3], [15,9], [15,15],
        ],
  },

  /**
   * Lookup map for pts.
   * @private {!Object<number, !Object<glift.PtStr, boolean>>}
   */
  map_: {},

  /**
   * @param {glift.Point} pt
   * @param {number} size
   * @return {boolean} Whether the point is a starpoint.
   */
  isPt: function(pt, size) {
    var map = glift.flattener.starpoints.map_[size];
    if (!map) {
      var newmap = {};
      var allPts = glift.flattener.starpoints.allPts(size);
      for (var i = 0; i < allPts.length; i++) {
        newmap[allPts[i].toString()] = true;
      }
      glift.flattener.starpoints.map_[size] = newmap;
      map = newmap;
    }
    return !!map[pt.toString()];
  },

  /**
   * @param {number} size
   * @return {!Array<!glift.Point>} All the points that should be considered
   * starpoints.
   */
  allPts: function(size) {
    /** @type {!Array<glift.Point>} */
    var out = [];
    var ptz = glift.flattener.starpoints.pts_[size] || [];
    for (var i = 0; i < ptz.length; i++) {
      var p = ptz[i];
      out.push(new glift.Point(p[0], p[1]));
    }
    return out;
  },
};
