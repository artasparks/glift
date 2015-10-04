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
 */
glift.orientation.minimalBoundingBox = function(movetree, nextMovesPath) {
  var point = glift.util.point;
  var bbox = glift.displays.bbox.fromPts;
  var pts = glift.orientation._getDisplayPts(movetree, nextMovesPath);

  var ints = movetree.getIntersections() - 1;
  if (nextMovesPath && glift.util.typeOf(nextMovesPath) === 'string') {
    nextMovesPath = glift.rules.treepath.parseFragment(nextMovesPath);
  }

  // Return a full board when there are no points.
  if (pts.length === 0) {
    return bbox(point(0,0), point(ints, ints));
  }

  // Return a bbox with one point.
  var bbox = bbox(pts[0], pts[0]);
  for (var i = 1; i < pts.length; i++) {
    var pt = pts[i];
    if (!bbox.contains(pt)) {
      bbox = bbox.expandToContain(pt);
    }
  }
  return bbox;
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
 */
glift.orientation._getDisplayPts = function(movetree, nextMovesPath) {
  // Ensure we aren't changing the parent movetree's state.
  var movetree = movetree.newTreeRef();
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

  if (!nextMovesPath) {
    movetree.recurseFromRoot(function(mt) {
      capturePoints(mt.properties().getAllStones());
    });
  } else if (nextMovesPath) {
    // Case 3. Traverse the next moves path.
    for (var i = 0; i < nextMovesPath.length; i++) {
      movetree.moveDown(nextMovesPath[i]);
      capturePoints(movetree.properties().getAllStones());
    }
    // Case 2. Traverse the next moves path.
    if (nextMovesPath.length === 0) {
      capturePoints(movetree.properties().getAllStones());
    }
    capturePoints(movetree.properties().getAllMarks());
  }
  return pts;
};
