/**
 * Get the minimal bounding box for set of stones and marks for the movetree.
 *
 * There are there ccases to consider:
 * 1. nextMovesPath is not defined. Recurse over the entire tree. Don't use
 *    marks for cropping consideration.
 * 2. nextMovesPath is an empty array. Calculate for the current position. Use
 *    marks for cropping consideration
 * 3. nextMovesPath is a non empty array. Treat the nextMovesPath as a
 *    variations tree path and traverse just the path.
 *
 * To calculate the minimalBoundingBox for just the current position
 */
glift.orientation.minimalBoundingBox  = function(movetree, nextMovesPath) {
  // Ensure we aren't changing the parent movetree's state.
  var movetree = movetree.newTreeRef();

};

/**
 * Takes a movetree and returns the optimal BoardRegion-Quad for cropping purposes.
 *
 * This isn't a minimal cropping: we split the board into 4 quadrants.
 * Then, we use the quad as part of the final quad-output. 
 *
 * Optionally, we allow a nextMovesPath so that we can 'optimally' crop just a
 * variation.
 *
 * Note: that we only allow convex shapes for obvious reasons.  Thus, these
 * aren't allowed (where the X's are quad-regions)
 * .X     X.
 * X. and XX
 */
glift.orientation.getQuadCropFromMovetree = function(movetree, nextMovesPath) {
  var bbox = glift.displays.bbox.fromPts;
  var pt = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Ensure we aren't changing the parent movetree's state.
  var movetree = movetree.newTreeRef();

  // Tracker is a map from quad-key to array of points.
  var tracker = {};

  // It's not clear to me if we should be cropping boards smaller than 19.  It
  // usually looks pretty weird, so hence this override.
  if (movetree.getIntersections() !== 19) {
    return boardRegions.ALL;
  }

  var quads = {};
  quads[boardRegions.TOP_LEFT] = bbox(pt(0, 0), pt(middle, middle));
  quads[boardRegions.TOP_RIGHT] = bbox(pt(middle, 0), pt(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] = bbox(pt(0, middle), pt(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] = bbox(pt(middle, middle), pt(ints, ints));

  if (nextMovesPath && glift.util.typeOf(nextMovesPath) === 'string') {
    nextMovesPath = glift.rules.treepath.parseFragment(nextMovesPath);
  }

  // Tracker uses the movetree that's passed in to add items to the tracker.
  // It's goal is to create a box that contains all the points. Then, we use the
  // quad regions to fine a minimal covering.
  var trackerFn = function(mt) {
    var displayPoints = mt.properties().getAllDisplayPts();
    var middlePoints = [];
    for (var key in displayPoints) {
      var points = displayPoints[key];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i].point;
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (middle === pt.x() || middle === pt.y()) {
            // This is a trick situation.  The point is right on the middle.
            // Look at all the other points first; Then, we'll come back and
            // address these points.
            middlePoints.push(pt);
          } else if (box.contains(pt)) {
            if (tracker[quadkey] === undefined) tracker[quadkey] = [];
            tracker[quadkey].push(pt);
          } else {
            // Not sure what's going on here. Maybe the point is out of bounds.
          }
        }
      }
    }
  };

  if (nextMovesPath && nextMovesPath.length) {
    // About next-moves-path boundaries -- the movetree should be right before
    // the variation.  I.e., it the first move we want to consider is when the
    // movetree + the first variation in the nextMovesPath.
    for (var i = 0; i < nextMovesPath.length; i++) {
      movetree.moveDown(nextMovesPath[i]);
      trackerFn(movetree);
    }
  } else {
    movetree.recurseFromRoot(trackerFn);
  }
  return glift.orientation._getRegionFromTracker(tracker);
};

glift.orientation._getRegionFromTracker = function(tracker) {
  var regions = [], br = glift.enums.boardRegions;
  for (var quadkey in tracker) {
    var quadlist = tracker[quadkey];
    regions.push(quadkey);
  }
  if (regions.length === 1) {
    return regions[0];
  }
  if (regions.length !== 2) {
    return glift.enums.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.enums.boardRegions.ALL;
};

