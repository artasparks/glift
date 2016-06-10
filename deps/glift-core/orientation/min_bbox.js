/**
 * Get the minimal bounding box for set of stones and marks for the movetree.
 *
 * There are there cases;
 * 1. nextMovesPath is not defined. Recurse over the entire tree. Don't use
 *    marks for cropping consideration.
 * 2. nextMovesPath is an empty array. Calculate for the current position. Use
 *    marks for cropping consideration
 * 3. nextMovesPath is a non empty array. Treat the nextMovesPath as a
 *    variations tree path and traverse just the path. Really 2., is a special
 *    case of 3.
 *
 * To calculate the minimalBoundingBox for just the current position
 *
 * @param {!glift.rules.MoveTree} movetree
 * @param {(!glift.rules.Treepath|string)=} opt_nextMovesPath
 *    Optional next moves path for cropping along a specific path.
 * @return {!glift.orientation.BoundingBox}
 */
glift.orientation.minimalBoundingBox = function(movetree, opt_nextMovesPath) {
  var point = glift.util.point;
  var bbox = glift.orientation.bbox.fromPts;

  var ints = movetree.getIntersections() - 1;

  /** @type {!glift.rules.Treepath|undefined} */
  var nextMovesPath = undefined;
  if (opt_nextMovesPath && glift.util.typeOf(opt_nextMovesPath) === 'string') {
    nextMovesPath = glift.rules.treepath.parseFragment(opt_nextMovesPath);
  } else if (opt_nextMovesPath && glift.util.typeOf(opt_nextMovesPath) === 'array') {
    nextMovesPath = /** @type {!glift.rules.Treepath} */ (opt_nextMovesPath);
  }
  var pts = glift.orientation.getDisplayPts_(movetree, nextMovesPath);

  // Return a full board when there are no points.
  if (pts.length === 0) {
    return bbox(point(0,0), point(ints, ints));
  }

  // Return a bbox with one point.
  var bboxInstance = bbox(pts[0], pts[0]);
  for (var i = 1; i < pts.length; i++) {
    var pt = pts[i];
    if (!bboxInstance.contains(pt)) {
      bboxInstance = bboxInstance.expandToContain(pt);
    }
  }
  return bboxInstance;
};

/**
 * Gets all the display points associated with a movetree:
 *
 * There are there cases;
 * 1. nextMovesPath is not defined. Recurse over the entire tree. Don't use
 *    marks for cropping consideration.
 * 2. nextMovesPath is an empty array. Calculate for the current position. Use
 *    marks for cropping consideration
 * 3. nextMovesPath is a non empty array. Treat the nextMovesPath as a
 *    variations tree path and traverse just the path. Really 2., is a special
 *    case of 3.
 *
 * @private
 *
 * @param {!glift.rules.MoveTree} movetree
 *    Optional next moves path for cropping along a specific path.
 * @param {!glift.rules.Treepath=} opt_nextMovesPath
 *    Optional next moves path for cropping along a specific path.
 *
 * @return {!Array<!glift.Point>}
 */
glift.orientation.getDisplayPts_ = function(movetree, opt_nextMovesPath) {
  // Ensure we aren't changing the parent movetree's state.
  movetree = movetree.newTreeRef();
  var pts = [];
  /**
   * This hands objects that look like:
   * { StringKey: Array of objs that contain pts }.
   *
   * Ex.
   * {
   *  BLACK: [{point: {10, 16}, color: 'BLACK'}]
   *  TEXTLABEL: [{point: {13, 5}, value: '12'}]
   * }
   */
  var capturePoints = function(ptsObj) {
    for (var key in ptsObj) {
      var moveArr = ptsObj[key];
      for (var i = 0; i < moveArr.length; i++) {
        var item = moveArr[i];
        if (moveArr[i].point) {
          pts.push(moveArr[i].point);
        }
      }
    }
  };

  if (!opt_nextMovesPath) {
    movetree.recurseFromRoot(function(mt) {
      capturePoints(mt.properties().getAllStones());
    });
  } else if (opt_nextMovesPath) {
    // Case 3. Traverse the next moves path.
    for (var i = 0; i < opt_nextMovesPath.length; i++) {
      movetree.moveDown(opt_nextMovesPath[i]);
      capturePoints(movetree.properties().getAllStones());
    }
    // Case 2. Traverse the next moves path.
    if (opt_nextMovesPath.length === 0) {
      capturePoints(movetree.properties().getAllStones());
    }
    capturePoints(movetree.properties().getAllMarks());
  }
  return pts;
};
