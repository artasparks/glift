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
  var tracker = function(mt) {
    var displayPoints = mt.properties().getAllDisplayPts();
    for (var key in displayPoints) {
      var points = displayPoints[key];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i].point;
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (middle === pt.x() || middle === pt.y()) {
            // Ignore points right on the middle.  It shouldn't make a different
            // for cropping, anyway.
            // TODO(kashomon): After thinking about it more, I think it may make
            // a difference. Needs to be considered more carefully.
          } else if (box.contains(pt)) {
            if (tracker[quadkey] === undefined) tracker[quadkey] = [];
            tracker[quadkey].push(pt);
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
      tracker(movetree);
    }
  } else {
    movetree.recurseFromRoot(tracker);
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

